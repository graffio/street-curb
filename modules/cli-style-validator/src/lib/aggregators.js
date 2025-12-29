// ABOUTME: Shared AST traversal/aggregation utilities for style validator rules
// ABOUTME: Provides reusable traverseAST function to collect/visit nodes

import { isFunctionNode } from './predicates.js'

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

const A = { traverseAST }

// Re-export isFunctionNode for backward compatibility with existing imports
export { traverseAST, isFunctionNode, A }
