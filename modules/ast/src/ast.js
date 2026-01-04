// ABOUTME: AST entry points and traversal helpers
// ABOUTME: Wraps raw ESTree from parsers into ASTNode instances

import { ASTNode } from './types/ast-node.js'

// Internal predicates for raw ESTree nodes (used during traversal)
const P = {
    // Check if value is a raw ESTree node
    // @sig isNode :: Any -> Boolean
    isNode: v => v && typeof v === 'object' && v.type,

    // Keys to skip during traversal
    // @sig isMetaKey :: String -> Boolean
    isMetaKey: key => ['type', 'loc', 'range', 'start', 'end'].includes(key),

    // Check if statement declares a function node at top level (raw nodes)
    // @sig isTopLevelDeclarationOf :: (ESTreeNode, ESTreeNode) -> Boolean
    isTopLevelDeclarationOf: (targetNode, statement) =>
        statement === targetNode ||
        (statement.type === 'VariableDeclaration' && statement.declarations.some(d => d.init === targetNode)),

    // Recursively check if raw node contains an await expression
    // @sig containsAwait :: ESTreeNode -> Boolean
    containsAwait: rawNode => {
        if (!rawNode) return false

        const { type, body, expression, declarations, right, callee } = rawNode
        const { arguments: args, object, test, consequent, alternate } = rawNode

        if (type === 'AwaitExpression') return true
        if (type === 'BlockStatement') return body.some(P.containsAwait)
        if (type === 'ExpressionStatement') return P.containsAwait(expression)
        if (type === 'VariableDeclaration') return declarations.some(d => P.containsAwait(d.init))
        if (type === 'AssignmentExpression') return P.containsAwait(right)
        if (type === 'CallExpression') return P.containsAwait(callee) || args.some(P.containsAwait)
        if (type === 'MemberExpression') return P.containsAwait(object)
        if (type === 'IfStatement')
            return P.containsAwait(test) || P.containsAwait(consequent) || P.containsAwait(alternate)
        return false
    },
}

const T = {
    // Extract child nodes from a property value (array or single node)
    // @sig toChildNodes :: Any -> [ESTreeNode]
    toChildNodes: value => {
        if (Array.isArray(value)) return value.filter(P.isNode)
        if (P.isNode(value)) return [value]
        return []
    },
}

const A = {
    // Get all direct child nodes of a raw node
    // @sig toChildren :: ESTreeNode -> [ESTreeNode]
    toChildren: rawNode =>
        Object.entries(rawNode)
            .filter(([key]) => !P.isMetaKey(key))
            .flatMap(([, value]) => T.toChildNodes(value)),

    // Recursively collect all descendant nodes with parent references
    // @sig collectDescendants :: (ESTreeNode, ASTNode?) -> [ASTNode]
    collectDescendants: (rawNode, wrappedParent) => {
        if (!rawNode || typeof rawNode !== 'object' || !rawNode.type) return []
        const wrapped = ASTNode.wrap(rawNode, wrappedParent)
        const childResults = A.toChildren(rawNode).flatMap(child => A.collectDescendants(child, wrapped))
        return [wrapped, ...childResults]
    },
}

const AST = {
    // === Entry Points ===

    // Collect all nodes from a raw ESTree AST as wrapped ASTNodes
    // @sig from :: ESTreeAST -> [ASTNode]
    from: ast => A.collectDescendants(ast, null),

    // Get just top-level statements as wrapped ASTNodes
    // @sig topLevelStatements :: ESTreeAST -> [ASTNode]
    topLevelStatements: ast => {
        if (!ast?.body) return []
        const wrappedRoot = ASTNode.wrap(ast, null)
        return ast.body.map(node => ASTNode.wrap(node, wrappedRoot))
    },

    // Get all descendant nodes of an ASTNode (including the node itself)
    // @sig descendants :: ASTNode -> [ASTNode]
    descendants: node => A.collectDescendants(node.esTree, node.parent),

    // === Helpers that need raw ESTree access ===

    // Check if node's body contains an await expression
    // @sig bodyContainsAwait :: ASTNode -> Boolean
    bodyContainsAwait: node => P.containsAwait(node.esTree.body),

    // Check if a wrapped function node is at module top level
    // @sig isTopLevel :: (ASTNode, ESTreeAST) -> Boolean
    isTopLevel: (node, ast) => {
        const body = ast?.body
        if (!body) return false
        return body.some(statement => P.isTopLevelDeclarationOf(node.esTree, statement))
    },

    // Get line number where comments for this node should appear (parent line for properties/variables)
    // @sig associatedCommentLine :: ASTNode -> Number
    associatedCommentLine: node => {
        const { parent, startLine } = node
        if (!parent) return startLine
        if (ASTNode.Property.is(parent) || ASTNode.VariableDeclarator.is(parent)) return parent.startLine
        return startLine
    },

    // Get all direct child nodes as wrapped ASTNodes
    // @sig children :: ASTNode -> [ASTNode]
    children: node => A.toChildren(node.esTree).map(child => ASTNode.wrap(child, node)),
}

export { AST }
