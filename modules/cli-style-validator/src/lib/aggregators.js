// ABOUTME: Shared AST traversal/aggregation utilities for style validator rules
// ABOUTME: Provides traverseAST and child node utilities for rule implementations

import { PS } from './predicates.js'

const AS = {
    // Check if value is an AST node (has type property)
    // @sig isASTNode :: Any -> Boolean
    isASTNode: child => child && typeof child === 'object' && child.type,

    // Count lines in a function's body (for length checks)
    // @sig countFunctionLines :: ASTNode -> Number
    countFunctionLines: node => {
        if (!node.body?.loc) return 0
        return node.body.loc.end.line - node.body.loc.start.line + 1
    },

    // Extract AST nodes from a value (handles arrays and single nodes)
    // @sig extractChildNodes :: Any -> [ASTNode]
    extractChildNodes: value => {
        if (Array.isArray(value)) return value.filter(AS.isASTNode)
        if (AS.isASTNode(value)) return [value]
        return []
    },

    // Get all child AST nodes from a parent node
    // @sig getChildNodes :: ASTNode -> [ASTNode]
    getChildNodes: node => {
        const skip = new Set(['type', 'loc', 'range', 'start', 'end'])
        return Object.entries(node)
            .filter(([key]) => !skip.has(key))
            .flatMap(([, value]) => AS.extractChildNodes(value))
    },

    // Recursively visit all nodes in an AST
    // @sig traverseAST :: (ASTNode, (ASTNode) -> Void) -> Void
    traverseAST: (node, visitor) => {
        if (!node || typeof node !== 'object') return
        visitor(node)
        AS.getChildNodes(node).forEach(child => AS.traverseAST(child, visitor))
    },

    // Get the name of a function from its AST node
    // @sig getFunctionName :: ASTNode -> String
    getFunctionName: node => {
        if (node.type === 'FunctionDeclaration') return node.id?.name || '<anonymous>'
        if (node.type === 'VariableDeclarator') return node.id?.name || '<anonymous>'
        return '<anonymous>'
    },

    // Count all function nodes in an AST subtree
    // @sig countFunctions :: ASTNode -> Number
    countFunctions: node => {
        let count = 0
        AS.traverseAST(node, n => {
            if (PS.isFunctionNode(n)) count++
        })
        return count
    },
}

export { AS }
