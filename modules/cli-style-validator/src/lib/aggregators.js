// ABOUTME: Shared AST traversal/aggregation utilities for style validator rules
// ABOUTME: Provides traverseAST and child node utilities for rule implementations

const AS = {
    // @sig isASTNode :: Any -> Boolean
    isASTNode: child => child && typeof child === 'object' && child.type,

    // @sig countFunctionLines :: ASTNode -> Number
    countFunctionLines: node => {
        if (!node.body?.loc) return 0
        return node.body.loc.end.line - node.body.loc.start.line + 1
    },

    // @sig extractChildNodes :: Any -> [ASTNode]
    extractChildNodes: value => {
        if (Array.isArray(value)) return value.filter(AS.isASTNode)
        if (AS.isASTNode(value)) return [value]
        return []
    },

    // @sig getChildNodes :: ASTNode -> [ASTNode]
    getChildNodes: node => {
        const skip = new Set(['type', 'loc', 'range', 'start', 'end'])
        return Object.entries(node)
            .filter(([key]) => !skip.has(key))
            .flatMap(([, value]) => AS.extractChildNodes(value))
    },

    // @sig traverseAST :: (ASTNode, (ASTNode) -> Void) -> Void
    traverseAST: (node, visitor) => {
        if (!node || typeof node !== 'object') return
        visitor(node)
        AS.getChildNodes(node).forEach(child => AS.traverseAST(child, visitor))
    },
}

export { AS }
