// ABOUTME: Rule to suggest extracting repeated property chains into variables
// ABOUTME: Flags when base.* appears 3+ times and suggests const { props } = base
// COMPLEXITY: cohesion-structure — Functional style requires more small functions
// COMPLEXITY: functions — Functional style requires more small functions
// COMPLEXITY: chain-extraction — Rule files naturally access AST properties repeatedly

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const THRESHOLD = 3
const PRIORITY = 1

const P = {
    // Check if node is the outermost in a chain (not nested in another MemberExpression)
    // @sig isOutermostMemberExpression :: ASTNode -> Boolean
    isOutermostMemberExpression: node => {
        const { parent } = node
        if (!parent || !ASTNode.MemberExpression.is(parent)) return true
        return !parent.base?.isSameAs(node)
    },

    // Check if node is on left side of assignment
    // @sig isAssignmentTarget :: ASTNode -> Boolean
    isAssignmentTarget: node => {
        const { parent } = node
        if (!parent || !ASTNode.AssignmentExpression.is(parent)) return false
        return parent.target?.isSameAs(node)
    },

    // Check if base is a namespace import (PS, AS, etc.)
    // @sig isNamespaceImport :: (String, Set<String>) -> Boolean
    isNamespaceImport: (base, namespaces) => namespaces.has(base.split('.')[0]),

    // Check if node is being called as a method
    // @sig isMethodCall :: ASTNode -> Boolean
    isMethodCall: node => {
        const { parent } = node
        if (!parent || !ASTNode.CallExpression.is(parent)) return false
        return parent.target?.isSameAs(node)
    },

    // Recursively find first function ancestor, return true if it's NOT targetFunc
    // @sig findFirstFunctionAncestor :: (ASTNode?, ASTNode) -> Boolean
    findFirstFunctionAncestor: (current, targetFunc) => {
        if (!current) return false
        if (PS.isFunctionNode(current)) return !current.isSameAs(targetFunc)
        return P.findFirstFunctionAncestor(current.parent, targetFunc)
    },
}

const T = {
    // Collect property names in a chain (a.b.c -> ['a', 'b', 'c'])
    // @sig toChainParts :: ASTNode -> [String]
    toChainParts: node => {
        if (!node) return []
        if (ASTNode.Identifier.is(node)) return [node.name]
        if (!ASTNode.MemberExpression.is(node) || node.isComputed) return []
        const prop = node.member
        if (!prop || !ASTNode.Identifier.is(prop)) return []
        return [...T.toChainParts(node.base), prop.name]
    },

    // Convert member expression to { base, property, line } for tracking
    // @sig toAccess :: ASTNode -> { base: String, property: String, line: Number }?
    toAccess: node => {
        const target = P.isMethodCall(node) ? node.base : node
        if (!target || !ASTNode.MemberExpression.is(target) || target.isComputed) return null

        const prop = target.member
        if (!prop || !ASTNode.Identifier.is(prop)) return null

        const obj = target.base
        if (!obj) return null

        if (ASTNode.Identifier.is(obj)) return { base: obj.name, property: prop.name, line: node.line }

        const parts = T.toChainParts(obj)
        if (parts.length === 0) return null
        return { base: parts.join('.'), property: prop.name, line: node.line }
    },

    // Add an access to a groups object, mutating in place (used in reduce)
    // @sig toUpdatedGroups :: (Object, { base, property, line }) -> Object
    toUpdatedGroups: (groups, { base, property, line }) => {
        const existing = groups[base]
        if (existing) {
            existing.count++
            existing.properties.add(property)
        } else {
            groups[base] = { count: 1, line, properties: new Set([property]) }
        }
        return groups
    },

    // Group accesses by base, aggregating count and properties
    // @sig toGroupedBases :: [{ base, property, line }] -> Object<String, { count, line, properties }>
    toGroupedBases: accesses => accesses.reduce(T.toUpdatedGroups, {}),
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
    // Collect all namespace import identifiers (import * as X)
    // @sig collectNamespaceImports :: AST -> Set<String>
    collectNamespaceImports: ast =>
        new Set(
            AST.topLevelStatements(ast)
                .filter(ASTNode.ImportDeclaration.is)
                .flatMap(node => (node.esTree.specifiers || []).map(s => ASTNode.wrap(s, node)))
                .filter(ASTNode.ImportNamespaceSpecifier.is)
                .map(spec => spec.esTree.local.name),
        ),

    // Collect all property accesses within a function's scope (excluding nested functions)
    // @sig collectAccessesInScope :: ASTNode -> [{ base: String, property: String, line: Number }]
    collectAccessesInScope: funcNode =>
        AST.descendants(funcNode)
            .filter(node => ASTNode.MemberExpression.is(node))
            .filter(node => !P.findFirstFunctionAncestor(node.parent, funcNode))
            .filter(P.isOutermostMemberExpression)
            .filter(node => !P.isAssignmentTarget(node))
            .map(T.toAccess)
            .filter(Boolean),

    // Convert grouped bases to suggestions, filtering by threshold and namespace imports
    // @sig collectSuggestionsFromGroups :: (Object, Set<String>) -> [Violation]
    collectSuggestionsFromGroups: (groups, namespaces) =>
        Object.entries(groups)
            .filter(([base, { count }]) => count >= THRESHOLD)
            .filter(([base]) => !P.isNamespaceImport(base, namespaces))
            .map(([base, { line, properties }]) => F.createSuggestion(line, base, [...properties].sort())),

    // Analyze a function node and return suggestions for extractable chains
    // @sig collectSuggestionsForFunction :: (ASTNode, Set<String>) -> [Violation]
    collectSuggestionsForFunction: (funcNode, namespaces) => {
        const accesses = A.collectAccessesInScope(funcNode)
        const groups = T.toGroupedBases(accesses)
        return A.collectSuggestionsFromGroups(groups, namespaces)
    },

    // Process all functions in AST and return extraction suggestions
    // @sig collectFunctionSuggestions :: (AST, Set<String>) -> [Violation]
    collectFunctionSuggestions: (ast, namespaces) =>
        AST.from(ast)
            .filter(PS.isFunctionNode)
            .flatMap(funcNode => A.collectSuggestionsForFunction(funcNode, namespaces)),
}

const checkChainExtraction = FS.withExemptions('chain-extraction', V.check)
const ChainExtraction = { checkChainExtraction }
export { ChainExtraction }
