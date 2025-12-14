// ABOUTME: Rule to suggest extracting repeated property chains into variables
// ABOUTME: Flags when base.* appears 3+ times and suggests const { props } = base

import { traverseAST, isFunctionNode } from '../traverse.js'

const THRESHOLD = 3
const PRIORITY = 1

/**
 * Create a chain-extraction suggestion object
 * @sig createSuggestion :: (Number, String, [String]) -> Violation
 */
const createSuggestion = (line, base, properties) => ({
    type: 'chain-extraction',
    line,
    column: 1,
    priority: PRIORITY,
    message:
        `"${base}" accessed ${properties.length} times. ` +
        `FIX: Add \`const { ${properties.join(', ')} } = ${base}\` at the top of the function, ` +
        `then use the destructured names.`,
    rule: 'chain-extraction',
})

/**
 * Collect namespace import identifiers (import * as X from...)
 * @sig collectNamespaceImports :: AST -> Set<String>
 */
const collectNamespaceImports = ast => {
    const namespaces = new Set()
    if (!ast?.body) return namespaces

    ast.body
        .filter(node => node.type === 'ImportDeclaration')
        .flatMap(node => node.specifiers || [])
        .filter(spec => spec.type === 'ImportNamespaceSpecifier')
        .forEach(spec => namespaces.add(spec.local.name))

    return namespaces
}

/**
 * Recursively find the base identifier of a MemberExpression chain
 * @sig findBase :: ASTNode -> ASTNode?
 */
const findBase = node => {
    if (!node) return null
    const { type, object } = node
    if (type === 'Identifier') return node
    if (type === 'MemberExpression') return findBase(object)
    return null
}

/**
 * Recursively collect parts of a MemberExpression chain into an array
 * @sig collectChainParts :: (ASTNode, [String]) -> [String]
 */
const collectChainParts = (node, parts) => {
    const { type, name, computed, object, property } = node
    if (type === 'Identifier') return [name, ...parts]
    if (type !== 'MemberExpression' || computed) return parts
    if (property?.type !== 'Identifier') return parts
    return collectChainParts(object, [property.name, ...parts])
}

/**
 * Handle nested MemberExpression chain (e.g., state.tabLayout.prop)
 * @sig handleNestedChain :: (ASTNode, String) -> { base: String, property: String }?
 */
const handleNestedChain = (object, propertyName) => {
    const baseNode = findBase(object)
    if (!baseNode) return null
    const parts = collectChainParts(object, [])
    if (parts.length === 0) return null
    return { base: parts.join('.'), property: propertyName }
}

/**
 * Get the base and first property from a MemberExpression
 * @sig getBaseAndProperty :: ASTNode -> { base: String, property: String }?
 */
const getBaseAndProperty = node => {
    if (!node || node.type !== 'MemberExpression' || node.computed) return null

    const { object, property } = node
    if (!property || property.type !== 'Identifier') return null

    const { name: propName } = property
    const { type: objType, name: objName } = object

    // Direct property access: obj.prop
    if (objType === 'Identifier') return { base: objName, property: propName }

    // Nested chain: obj.nested.prop - we want "obj.nested" as base
    if (objType === 'MemberExpression') return handleNestedChain(object, propName)

    return null
}

/**
 * Check if this MemberExpression is the outermost in its chain
 * @sig isOutermostMemberExpression :: (ASTNode, ASTNode?) -> Boolean
 */
const isOutermostMemberExpression = (node, parent) => {
    if (parent && parent.type === 'MemberExpression' && parent.object === node) return false
    return true
}

/**
 * Check if a node is an AST child worth traversing
 * @sig isTraversableChild :: Any -> Boolean
 */
const isTraversableChild = child => child && typeof child === 'object' && child.type

/**
 * Extract traversable children from a single AST node value
 * @sig extractChildren :: Any -> [ASTNode]
 */
const extractChildren = value => {
    if (Array.isArray(value)) return value.filter(isTraversableChild)
    if (isTraversableChild(value)) return [value]
    return []
}

/**
 * Get child nodes from an AST node, excluding metadata fields
 * @sig getChildNodes :: ASTNode -> [ASTNode]
 */
const getChildNodes = node => {
    const skip = new Set(['type', 'loc', 'range', 'start', 'end'])
    return Object.entries(node)
        .filter(([key]) => !skip.has(key))
        .flatMap(([, value]) => extractChildren(value))
}

/**
 * Add a base access to the map, tracking count and properties
 * @sig addToMap :: (Map, String, String, Number) -> Void
 */
const addToMap = (map, base, property, line) => {
    if (!base || !property) return
    const existing = map.get(base)
    if (existing) {
        existing.count++
        existing.properties.add(property)
    } else {
        map.set(base, { count: 1, line, properties: new Set([property]) })
    }
}

/**
 * Process a single MemberExpression node and add its base/property to the map
 * @sig processMemberExpression :: (Map, ASTNode, ASTNode?) -> Void
 */
const processMemberExpression = (bases, node, parent) => {
    if (!isOutermostMemberExpression(node, parent)) return

    const isMethodCall = parent && parent.type === 'CallExpression' && parent.callee === node
    const targetNode = isMethodCall ? node.object : node
    const result = getBaseAndProperty(targetNode)
    if (!result) return

    const line = node.loc?.start?.line || 1
    addToMap(bases, result.base, result.property, line)
}

/**
 * Collect base accesses within a function body (not including nested functions)
 * @sig collectBasesInFunction :: ASTNode -> Map<String, { count: Number, line: Number, properties: Set }>
 */
const collectBasesInFunction = funcNode => {
    /**
     * Recursively process nodes, collecting base accesses
     * @sig processNode :: (ASTNode, ASTNode?) -> Void
     */
    const processNode = (node, parent) => {
        if (visited.has(node)) return
        visited.add(node)
        if (isFunctionNode(node) && node !== funcNode) return
        if (node.type === 'MemberExpression') processMemberExpression(bases, node, parent)
        getChildNodes(node).forEach(child => processNode(child, node))
    }

    const bases = new Map()
    const visited = new Set()
    const { body } = funcNode
    if (body) processNode(body, funcNode)

    return bases
}

/**
 * Check if base is a namespace import (should not suggest destructuring)
 * @sig isNamespaceImport :: (String, Set<String>) -> Boolean
 */
const isNamespaceImport = (base, namespaces) => namespaces.has(base.split('.')[0])

/**
 * Convert a base entry to a suggestion if it meets threshold and isn't a namespace import
 * @sig entryToSuggestion :: (String, { count: Number, line: Number, properties: Set }, Set<String>) -> Violation?
 */
const entryToSuggestion = (base, { count, line, properties }, namespaces) => {
    if (count < THRESHOLD) return null
    if (isNamespaceImport(base, namespaces)) return null
    return createSuggestion(line, base, [...properties].sort())
}

/**
 * Generate suggestions for a function based on repeated base accesses
 * @sig generateSuggestions :: (Map<String, BaseData>, Set<String>) -> [Violation]
 *     BaseData = { count: Number, line: Number, properties: Set }
 */
const generateSuggestions = (bases, namespaces) =>
    [...bases.entries()].map(([base, data]) => entryToSuggestion(base, data, namespaces)).filter(Boolean)

/**
 * Process a function node and return its suggestions
 * @sig processFunctionNode :: (ASTNode, Set<String>) -> [Violation]
 */
const processFunctionNode = (node, namespaces) => generateSuggestions(collectBasesInFunction(node), namespaces)

/**
 * Collect suggestions from a function node if it is a function
 * @sig collectFromFunction :: ([Violation], ASTNode, Set<String>) -> Void
 */
const collectFromFunction = (suggestions, node, namespaces) => {
    if (isFunctionNode(node)) suggestions.push(...processFunctionNode(node, namespaces))
}

/**
 * Check for repeated property chains that should be extracted
 * @sig checkChainExtraction :: (AST?, String, String) -> [Violation]
 */
const checkChainExtraction = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const namespaces = collectNamespaceImports(ast)
    const allSuggestions = []
    traverseAST(ast, node => collectFromFunction(allSuggestions, node, namespaces))

    return allSuggestions
}

export { checkChainExtraction }
