// ABOUTME: Rule to suggest extracting repeated property chains into variables
// ABOUTME: Flags when base.* appears 3+ times and suggests const { props } = base

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

const THRESHOLD = 3
const PRIORITY = 1

const P = {
    // Check if node is the outermost in a chain (not nested)
    // @sig isOutermostMemberExpression :: (ASTNode, ASTNode?) -> Boolean
    isOutermostMemberExpression: (node, parent) => {
        if (parent && parent.type === 'MemberExpression' && parent.object === node) return false
        return true
    },

    // Check if node is on left side of assignment
    // @sig isAssignmentTarget :: (ASTNode, ASTNode?) -> Boolean
    isAssignmentTarget: (node, parent) => {
        if (!parent) return false
        if (parent.type === 'AssignmentExpression' && parent.left === node) return true
        return false
    },

    // Check if base is a namespace import (PS, AS, etc.)
    // @sig isNamespaceImport :: (String, Set<String>) -> Boolean
    isNamespaceImport: (base, namespaces) => namespaces.has(base.split('.')[0]),

    // Check if node is being called as a method
    // @sig isMethodCall :: (ASTNode, ASTNode?) -> Boolean
    isMethodCall: (node, parent) => parent && parent.type === 'CallExpression' && parent.callee === node,
}

const T = {
    // Recursively find the base identifier of a member expression
    // @sig findBase :: ASTNode -> ASTNode?
    findBase: node => {
        if (!node) return null
        if (node.type === 'Identifier') return node
        if (node.type === 'MemberExpression') return T.findBase(node.object)
        return null
    },

    // Collect property names in a chain (a.b.c -> ['a', 'b', 'c'])
    // @sig collectChainParts :: (ASTNode, [String]) -> [String]
    collectChainParts: (node, parts) => {
        if (node.type === 'Identifier') return [node.name, ...parts]
        if (node.type !== 'MemberExpression' || node.computed) return parts
        if (node.property?.type !== 'Identifier') return parts
        return T.collectChainParts(node.object, [node.property.name, ...parts])
    },

    // Get base and property from nested chain
    // @sig getNestedChain :: (ASTNode, String) -> { base: String, property: String }?
    getNestedChain: (object, propertyName) => {
        const baseNode = T.findBase(object)
        if (!baseNode) return null
        const parts = T.collectChainParts(object, [])
        if (parts.length === 0) return null
        return { base: parts.join('.'), property: propertyName }
    },

    // Extract base and property from a member expression
    // @sig getBaseAndProperty :: ASTNode -> { base: String, property: String }?
    getBaseAndProperty: node => {
        if (!node || node.type !== 'MemberExpression' || node.computed) return null
        if (!node.property || node.property.type !== 'Identifier') return null

        const { object, property } = node
        if (object.type === 'Identifier') return { base: object.name, property: property.name }
        if (object.type === 'MemberExpression') return T.getNestedChain(object, property.name)
        return null
    },
}

const F = {
    // Create a suggestion to destructure repeated property access
    // @sig createSuggestion :: (Number, String, [String]) -> Violation
    createSuggestion: (line, base, properties) => ({
        type: 'chain-extraction',
        line,
        column: 1,
        priority: PRIORITY,
        message:
            `"${base}" accessed ${properties.length} times. ` +
            `FIX: Add \`const { ${properties.join(', ')} } = ${base}\` at the top of the function, ` +
            `then use the destructured names.`,
        rule: 'chain-extraction',
    }),
}

const V = {
    // Validate repeated property chains that could be destructured
    // @sig checkChainExtraction :: (AST?, String, String) -> [Violation]
    checkChainExtraction: (ast, sourceCode, filePath) => {
        if (!ast) return []
        if (PS.hasComplexityComment(sourceCode)) return []

        const namespaces = A.collectNamespaceImports(ast)
        const allSuggestions = []
        AS.traverseAST(ast, node => {
            if (PS.isFunctionNode(node)) allSuggestions.push(...A.processFunctionNode(node, namespaces))
        })

        return allSuggestions
    },
}

const A = {
    // Collect all namespace import identifiers (import * as X)
    // @sig collectNamespaceImports :: AST -> Set<String>
    collectNamespaceImports: ast => {
        const namespaces = new Set()
        if (!ast?.body) return namespaces

        ast.body
            .filter(node => node.type === 'ImportDeclaration')
            .flatMap(node => node.specifiers || [])
            .filter(spec => spec.type === 'ImportNamespaceSpecifier')
            .forEach(spec => namespaces.add(spec.local.name))

        return namespaces
    },

    // Add base.property access to tracking map
    // @sig addToMap :: (Map, String, String, Number) -> Void
    addToMap: (map, base, property, line) => {
        if (!base || !property) return
        const existing = map.get(base)
        if (existing) {
            existing.count++
            existing.properties.add(property)
        } else {
            map.set(base, { count: 1, line, properties: new Set([property]) })
        }
    },

    // Process a member expression and track its base
    // @sig processMemberExpression :: (Map, ASTNode, ASTNode?) -> Void
    processMemberExpression: (bases, node, parent) => {
        if (!P.isOutermostMemberExpression(node, parent)) return
        if (P.isAssignmentTarget(node, parent)) return

        const targetNode = P.isMethodCall(node, parent) ? node.object : node
        const result = T.getBaseAndProperty(targetNode)
        if (!result) return

        A.addToMap(bases, result.base, result.property, node.loc?.start?.line || 1)
    },

    // Collect all base accesses within a function scope
    // @sig collectBasesInFunction :: ASTNode -> Map<String, { count: Number, line: Number, properties: Set }>
    collectBasesInFunction: funcNode => {
        const bases = new Map()
        const visited = new Set()

        const processNode = (node, parent) => {
            if (visited.has(node)) return
            visited.add(node)
            if (PS.isFunctionNode(node) && node !== funcNode) return
            if (node.type === 'MemberExpression') A.processMemberExpression(bases, node, parent)
            AS.getChildNodes(node).forEach(child => processNode(child, node))
        }

        if (funcNode.body) processNode(funcNode.body, funcNode)
        return bases
    },

    // Convert a tracked base to a suggestion if threshold met
    // @sig entryToSuggestion :: (String, { count: Number, line: Number, properties: Set }, Set<String>) -> Violation?
    entryToSuggestion: (base, { count, line, properties }, namespaces) => {
        if (count < THRESHOLD) return null
        if (P.isNamespaceImport(base, namespaces)) return null
        return F.createSuggestion(line, base, [...properties].sort())
    },

    // Process a function and return extraction suggestions
    // @sig processFunctionNode :: (ASTNode, Set<String>) -> [Violation]
    processFunctionNode: (node, namespaces) => {
        const bases = A.collectBasesInFunction(node)
        return [...bases.entries()].map(([base, data]) => A.entryToSuggestion(base, data, namespaces)).filter(Boolean)
    },
}

const checkChainExtraction = V.checkChainExtraction
export { checkChainExtraction }
