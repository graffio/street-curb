// ABOUTME: Rule to suggest extracting repeated property chains into variables
// ABOUTME: Flags when base.* appears 3+ times and suggests const { props } = base
// COMPLEXITY-TODO: lines — Chain tracking requires scope-aware traversal (expires 2026-01-03)
// COMPLEXITY-TODO: functions — Chain tracking requires scope-aware traversal (expires 2026-01-03)
// COMPLEXITY-TODO: cohesion-structure — Scope tracking requires many helpers (expires 2026-01-03)

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const THRESHOLD = 3
const PRIORITY = 1

const P = {
    // Check if node is the outermost in a chain (not nested)
    // @sig isOutermostMemberExpression :: (ASTNode, ASTNode?) -> Boolean
    isOutermostMemberExpression: (node, parent) => {
        if (!parent || !ASTNode.MemberExpression.is(parent)) return true
        return !parent.base?.isSameAs(node)
    },

    // Check if node is on left side of assignment
    // @sig isAssignmentTarget :: (ASTNode, ASTNode?) -> Boolean
    isAssignmentTarget: (node, parent) => {
        if (!parent || !ASTNode.AssignmentExpression.is(parent)) return false
        return parent.target?.isSameAs(node)
    },

    // Check if base is a namespace import (PS, AS, etc.)
    // @sig isNamespaceImport :: (String, Set<String>) -> Boolean
    isNamespaceImport: (base, namespaces) => namespaces.has(base.split('.')[0]),

    // Check if node is being called as a method
    // @sig isMethodCall :: (ASTNode, ASTNode?) -> Boolean
    isMethodCall: (node, parent) => {
        if (!parent || !ASTNode.CallExpression.is(parent)) return false
        return parent.target?.isSameAs(node)
    },
}

const T = {
    // Collect property names in a chain (a.b.c -> ['a', 'b', 'c'])
    // @sig collectChainParts :: (ASTNode, [String]) -> [String]
    collectChainParts: (node, parts) => {
        if (!node) return parts
        if (ASTNode.Identifier.is(node)) return [node.name, ...parts]
        if (!ASTNode.MemberExpression.is(node) || node.isComputed) return parts
        const prop = node.member
        if (!prop || !ASTNode.Identifier.is(prop)) return parts
        return T.collectChainParts(node.base, [prop.name, ...parts])
    },

    // Convert nested chain to base and property
    // @sig toNestedChain :: (ASTNode, String) -> { base: String, property: String }?
    toNestedChain: (objNode, propertyName) => {
        const parts = T.collectChainParts(objNode, [])
        if (parts.length === 0) return null
        return { base: parts.join('.'), property: propertyName }
    },

    // Convert member expression to base and property
    // @sig toBaseAndProperty :: ASTNode -> { base: String, property: String }?
    toBaseAndProperty: node => {
        if (!node || !ASTNode.MemberExpression.is(node) || node.isComputed) return null
        const prop = node.member
        if (!prop || !ASTNode.Identifier.is(prop)) return null
        const propName = prop.name

        const obj = node.base
        if (!obj) return null
        if (ASTNode.Identifier.is(obj)) return { base: obj.name, property: propName }
        if (ASTNode.MemberExpression.is(obj)) return T.toNestedChain(obj, propName)
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
        if (!ast || PS.isTestFile(filePath)) return []

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

    // Process a member expression and track its base
    // @sig processMemberExpression :: (Map, ASTNode, ASTNode?) -> Void
    processMemberExpression: (bases, node, parent) => {
        if (!P.isOutermostMemberExpression(node, parent)) return
        if (P.isAssignmentTarget(node, parent)) return

        const target = P.isMethodCall(node, parent) ? node.base : node
        const result = T.toBaseAndProperty(target)
        if (!result) return

        A.addToMap(bases, result.base, result.property, node.line)
    },

    // Process a single node in the function scope traversal
    // @sig processNodeInScope :: (Map, Set, ASTNode, ASTNode) -> Void
    processNodeInScope: (bases, visited, funcNode, node) => {
        // Use line+column+type as identity (nested nodes at same position have different types)
        const nodeId = `${node.startLine}:${node.column}:${node.esTree.type}`
        if (visited.has(nodeId)) return
        visited.add(nodeId)

        if (PS.isFunctionNode(node) && !node.isSameAs(funcNode)) return
        if (ASTNode.MemberExpression.is(node)) A.processMemberExpression(bases, node, node.parent)

        // Use direct children (not all descendants) to respect function boundaries
        AST.children(node).forEach(child => A.processNodeInScope(bases, visited, funcNode, child))
    },

    // Collect all base accesses within a function scope
    // @sig collectBasesInFunction :: ASTNode -> Map<String, { count: Number, line: Number, properties: Set }>
    collectBasesInFunction: funcNode => {
        const bases = new Map()
        const visited = new Set()
        const body = funcNode.body
        if (body) A.processNodeInScope(bases, visited, funcNode, body)
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
