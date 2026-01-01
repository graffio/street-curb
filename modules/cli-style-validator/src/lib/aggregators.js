// ABOUTME: Shared AST traversal/aggregation utilities for style validator rules
// ABOUTME: Provides traverseAST and child node utilities for rule implementations
// COMPLEXITY: Shared module consolidating utilities from multiple rules

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

    // Recursively visit all nodes in an AST with optional parent context
    // @sig traverseAST :: (ASTNode, (ASTNode, ASTNode?) -> Void, ASTNode?) -> Void
    traverseAST: (node, visitor, parent = null) => {
        if (!node || typeof node !== 'object') return
        visitor(node, parent)
        AS.getChildNodes(node).forEach(child => AS.traverseAST(child, visitor, node))
    },

    // Get the name of a function from its AST node
    // @sig getFunctionName :: ASTNode -> String
    getFunctionName: node => {
        if (node.type === 'FunctionDeclaration') return node.id?.name || '<anonymous>'
        if (node.type === 'VariableDeclarator') return node.id?.name || '<anonymous>'
        return '<anonymous>'
    },

    // Collect all nodes in an AST into a flat array (enables filter/map chains)
    // @sig collectNodes :: ASTNode -> [ASTNode]
    collectNodes: node => {
        const nodes = []
        AS.traverseAST(node, n => nodes.push(n))
        return nodes
    },

    // Collect all nodes with their parent context
    // @sig collectNodesWithParent :: ASTNode -> [{node: ASTNode, parent: ASTNode?}]
    collectNodesWithParent: node => {
        const pairs = []
        AS.traverseAST(node, (n, parent) => pairs.push({ node: n, parent }))
        return pairs
    },

    // Check if a function node should count toward complexity
    // Named functions, variable-assigned functions, and multiline anonymous functions count
    // @sig isCountableFunction :: {node: ASTNode, parent: ASTNode?} -> Boolean
    isCountableFunction: ({ node: n, parent }) => {
        if (!PS.isFunctionNode(n)) return false
        if (n.id?.name) return true
        if (parent?.type === 'VariableDeclarator' && parent.init === n) return true
        return PS.isMultilineNode(n)
    },

    // Count complex functions in an AST subtree (excludes single-line anonymous callbacks)
    // @sig countFunctions :: ASTNode -> Number
    countFunctions: node => AS.collectNodesWithParent(node).filter(AS.isCountableFunction).length,

    // Check if node is in an arguments array context
    // @sig isArgumentsContext :: (String, [Any], ASTNode) -> Boolean
    isArgumentsContext: (key, child, node) => key === 'arguments' && child.includes(node),

    // Check if node is in a callback context (callee or non-declarator init)
    // @sig isCallbackContext :: (String, ASTNode) -> Boolean
    isCallbackContext: (key, searchNode) => {
        if (key !== 'callee' && key !== 'init') return false
        if (key === 'init' && searchNode.type === 'VariableDeclarator') return false
        return true
    },

    // Check a single [key, child] pair for callback context
    // @sig checkEntryForCallback :: (ASTNode, ASTNode, { isCallback: Boolean }) -> ([String, Any]) -> Boolean
    checkEntryForCallback:
        (searchNode, node, tracker) =>
        ([key, child]) => {
            if (Array.isArray(child) && AS.isArgumentsContext(key, child, node)) return (tracker.isCallback = true)
            if (Array.isArray(child)) return (child.forEach(i => AS.searchCallbackContext(i, node, tracker)), false)
            if (child === node && AS.isCallbackContext(key, searchNode)) tracker.isCallback = true
            if (child && typeof child === 'object') AS.searchCallbackContext(child, node, tracker)
            return false
        },

    // Recursively search AST to find if node is in callback context
    // @sig searchCallbackContext :: (ASTNode, ASTNode, { isCallback: Boolean }) -> Void
    searchCallbackContext: (searchNode, node, tracker) => {
        if (!searchNode || typeof searchNode !== 'object') return
        Object.entries(searchNode).some(AS.checkEntryForCallback(searchNode, node, tracker))
    },

    // Find whether a function is used as a callback in the AST
    // @sig isCallbackFunction :: (ASTNode, ASTNode) -> Boolean
    isCallbackFunction: (node, rootNode) => {
        if (node.type === 'FunctionDeclaration') return false
        const tracker = { isCallback: false }
        AS.searchCallbackContext(rootNode, node, tracker)
        return tracker.isCallback
    },
}

export { AS }
