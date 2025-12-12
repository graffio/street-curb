// ABOUTME: Shared AST traversal utilities for style validator rules
// ABOUTME: Provides reusable traverseAST function to avoid duplication across rules

/**
 * Process child node in AST traversal
 * @sig processChildNode :: (Any, (ASTNode) -> Void) -> Void
 */
const processChildNode = (child, visitor) => {
    if (Array.isArray(child)) {
        child.forEach(item => traverseAST(item, visitor))
        return
    }
    if (child && typeof child === 'object' && child.type) traverseAST(child, visitor)
}

/**
 * Traverse AST node and visit all child nodes
 * @sig traverseAST :: (ASTNode, (ASTNode) -> Void) -> Void
 */
const traverseAST = (node, visitor) => {
    if (!node || typeof node !== 'object') return

    visitor(node)

    Object.values(node).forEach(child => processChildNode(child, visitor))
}

/**
 * Check if a node represents a function
 * @sig isFunctionNode :: ASTNode -> Boolean
 */
const isFunctionNode = node =>
    node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression'

export { traverseAST, isFunctionNode }
