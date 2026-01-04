// ABOUTME: Rule to suggest extracting repeated property chains into variables
// ABOUTME: Flags when base.* appears 3+ times and suggests const { props } = base
// COMPLEXITY-TODO: lines — Chain tracking requires scope-aware traversal (expires 2026-01-03)
// COMPLEXITY-TODO: functions — Chain tracking requires scope-aware traversal (expires 2026-01-03)
// COMPLEXITY-TODO: cohesion-structure — Scope tracking requires many helpers (expires 2026-01-03)

import { AST, ASTNode } from '@graffio/ast'
import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const THRESHOLD = 3
const PRIORITY = 1

const P = {
    // Check if node is the outermost in a chain (not nested)
    // @sig isOutermostMemberExpression :: (ASTNode, ASTNode?) -> Boolean
    isOutermostMemberExpression: (node, parent) => {
        if (parent && AST.hasType(parent, 'MemberExpression') && parent.raw.object === node.raw) return false
        return true
    },

    // Check if node is on left side of assignment
    // @sig isAssignmentTarget :: (ASTNode, ASTNode?) -> Boolean
    isAssignmentTarget: (node, parent) => {
        if (!parent) return false
        if (AST.hasType(parent, 'AssignmentExpression') && parent.raw.left === node.raw) return true
        return false
    },

    // Check if base is a namespace import (PS, AS, etc.)
    // @sig isNamespaceImport :: (String, Set<String>) -> Boolean
    isNamespaceImport: (base, namespaces) => namespaces.has(base.split('.')[0]),

    // Check if node is being called as a method
    // @sig isMethodCall :: (ASTNode, ASTNode?) -> Boolean
    isMethodCall: (node, parent) => parent && AST.hasType(parent, 'CallExpression') && parent.raw.callee === node.raw,
}

const T = {
    // Collect property names in a chain (a.b.c -> ['a', 'b', 'c']) - works on raw nodes
    // @sig collectChainParts :: (ESTreeNode, [String]) -> [String]
    collectChainParts: (rawNode, parts) => {
        const { type, computed, object, property, name } = rawNode
        if (type === 'Identifier') return [name, ...parts]
        if (type !== 'MemberExpression' || computed) return parts
        if (property?.type !== 'Identifier') return parts
        return T.collectChainParts(object, [property.name, ...parts])
    },

    // Convert nested chain to base and property - works on raw nodes
    // @sig toNestedChain :: (ESTreeNode, String) -> { base: String, property: String }?
    toNestedChain: (rawObject, propertyName) => {
        const parts = T.collectChainParts(rawObject, [])
        if (parts.length === 0) return null
        return { base: parts.join('.'), property: propertyName }
    },

    // Convert member expression to base and property - works on raw nodes
    // @sig toBaseAndProperty :: ESTreeNode -> { base: String, property: String }?
    toBaseAndProperty: rawNode => {
        if (!rawNode) return null
        const { type, computed, object, property } = rawNode
        if (type !== 'MemberExpression' || computed) return null
        const propType = property?.type
        const propName = property?.name
        if (propType !== 'Identifier') return null

        const objType = object?.type
        const objName = object?.name
        if (objType === 'Identifier') return { base: objName, property: propName }
        if (objType === 'MemberExpression') return T.toNestedChain(object, propName)
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
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast) return []

        const namespaces = A.collectNamespaceImports(ast)
        return A.collectFunctionSuggestions(ast, namespaces)
    },
}

const A = {
    // Collect suggestions for all functions in AST
    // @sig collectFunctionSuggestions :: (AST, Set<String>) -> [Violation]
    collectFunctionSuggestions: (ast, namespaces) =>
        AST.from(ast)
            .filter(node => PS.isFunctionNode(node))
            .flatMap(node => A.processFunctionNode(node, namespaces)),

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

    // Process a member expression and track its base - works on wrapped nodes
    // @sig processMemberExpression :: (Map, ASTNode, ASTNode?) -> Void
    processMemberExpression: (bases, node, parent) => {
        if (!P.isOutermostMemberExpression(node, parent)) return
        if (P.isAssignmentTarget(node, parent)) return

        const rawTarget = P.isMethodCall(node, parent) ? node.raw.object : node.raw
        const result = T.toBaseAndProperty(rawTarget)
        if (!result) return

        A.addToMap(bases, result.base, result.property, AST.line(node))
    },

    // Process a single raw node in the function scope traversal
    // @sig processNodeInScope :: (Map, Set, ESTreeNode, ESTreeNode, ESTreeNode?) -> Void
    processNodeInScope: (bases, visited, funcRaw, rawNode, rawParent) => {
        if (visited.has(rawNode)) return
        visited.add(rawNode)

        const wrapped = ASTNode.wrap(rawNode)
        const wrappedParent = rawParent ? ASTNode.wrap(rawParent) : null

        if (PS.isFunctionNode(wrapped) && rawNode !== funcRaw) return
        if (rawNode.type === 'MemberExpression') A.processMemberExpression(bases, wrapped, wrappedParent)
        AS.getChildNodes(rawNode).forEach(child => A.processNodeInScope(bases, visited, funcRaw, child, rawNode))
    },

    // Collect all base accesses within a function scope
    // @sig collectBasesInFunction :: ASTNode -> Map<String, { count: Number, line: Number, properties: Set }>
    collectBasesInFunction: funcNode => {
        const bases = new Map()
        const visited = new Set()
        const body = AST.functionBody(funcNode)
        if (body) A.processNodeInScope(bases, visited, funcNode.raw, body, funcNode.raw)
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

const checkChainExtraction = FS.withExemptions('chain-extraction', V.check)
export { checkChainExtraction }
