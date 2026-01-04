// ABOUTME: Fluent query DSL for read-only AST traversal
// ABOUTME: Enables declarative node finding, filtering, and transformation
// API documentation: see README.md in this directory

import { ASTNode } from '../../types/index.js'

// Internal helper to get raw ESTree node from wrapped ASTNode or pass through raw ESTree
// @sig raw :: (ASTNode | ESTreeNode) -> ESTreeNode
const raw = node => node?.raw ?? node

// Internal predicates for raw ESTree nodes (used during traversal)
const P = {
    // Check if value is a raw ESTree node
    // @sig isNode :: Any -> Boolean
    isNode: child => child && typeof child === 'object' && child.type,

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
        const {
            type,
            body,
            expression,
            declarations,
            right,
            callee,
            arguments: args,
            object,
            test,
            consequent,
            alternate,
        } = rawNode
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

const A = {
    // Collect child nodes from a value (handles arrays and single nodes)
    // @sig collectChildren :: Any -> [ESTreeNode]
    collectChildren: value => {
        if (Array.isArray(value)) return value.filter(P.isNode)
        if (P.isNode(value)) return [value]
        return []
    },

    // Get all direct child nodes of a raw node
    // @sig toChildren :: ESTreeNode -> [ESTreeNode]
    toChildren: rawNode =>
        Object.entries(rawNode)
            .filter(([key]) => !P.isMetaKey(key))
            .flatMap(([, value]) => A.collectChildren(value)),

    // Recursively collect all nodes with parent references
    // @sig collectAll :: (ESTreeNode, ASTNode?, [ASTNode]) -> [ASTNode]
    collectAll: (rawNode, wrappedParent, results) => {
        if (!rawNode || typeof rawNode !== 'object' || !rawNode.type) return results
        const wrapped = ASTNode.wrap(rawNode, wrappedParent)
        results.push(wrapped)
        A.toChildren(rawNode).forEach(child => A.collectAll(child, wrapped, results))
        return results
    },
}

const AST = {
    // === Entry Points ===

    // Collect all nodes from an AST (raw) or ASTNode (wrapped) as wrapped ASTNodes
    // @sig from :: (ESTreeAST | ASTNode) -> [ASTNode]
    from: ast => (ASTNode.isASTNode(ast) ? A.collectAll(raw(ast), ast.parent, []) : A.collectAll(ast, null, [])),

    // Get just top-level statements as wrapped ASTNodes
    // @sig topLevel :: ESTreeAST -> [ASTNode]
    topLevel: ast => {
        if (!ast?.body) return []
        const wrappedRoot = ASTNode.wrap(ast, null)
        return ast.body.map(node => ASTNode.wrap(node, wrappedRoot))
    },

    // === Type Predicates ===

    // Direct type check (for checking ESTree types by string)
    // @sig hasType :: (ASTNode | ESTreeNode, String) -> Boolean
    hasType: (node, type) => raw(node).type === type,

    // Check if node is a function declaration with a name
    // @sig isNamedFunctionDecl :: (ASTNode | ESTreeNode) -> Boolean
    isNamedFunctionDecl: node => raw(node).type === 'FunctionDeclaration' && raw(node).id?.name,

    // Check if node is an object expression
    // @sig isObjectExpr :: (ASTNode | ESTreeNode) -> Boolean
    isObjectExpr: node => raw(node).type === 'ObjectExpression',

    // Check if node is a variable declaration
    // @sig isVarDecl :: (ASTNode | ESTreeNode) -> Boolean
    isVarDecl: node => raw(node).type === 'VariableDeclaration',

    // Get node type string
    // @sig nodeType :: (ASTNode | ESTreeNode) -> String
    nodeType: node => raw(node).type,

    // === Property Accessors ===

    // Get body array or empty
    // @sig body :: ASTNode -> [ESTreeNode]
    body: node => raw(node).body || [],

    // Get declarations array or empty
    // @sig declarations :: ASTNode -> [ESTreeNode]
    declarations: node => raw(node).declarations || [],

    // Get the name of the first declared variable
    // @sig variableName :: ASTNode -> String?
    variableName: node => raw(node).declarations?.[0]?.id?.name,

    // Get the value (right-hand side) of the first declared variable
    // @sig variableValue :: ASTNode -> ESTreeNode?
    variableValue: node => raw(node).declarations?.[0]?.init,

    // Get properties array or empty
    // @sig properties :: ASTNode -> [ESTreeNode]
    properties: node => raw(node).properties || [],

    // Count properties in an object expression
    // @sig propertyCount :: ASTNode -> Number
    propertyCount: node => (raw(node).properties || []).length,

    // Get property key names from object expression
    // @sig propertyNames :: ASTNode -> [String]
    propertyNames: node =>
        (raw(node).properties || []).filter(p => p.key?.name || p.key?.value).map(p => p.key.name || p.key.value),

    // Get specifiers array or empty
    // @sig specifiers :: ASTNode -> [ESTreeNode]
    specifiers: node => raw(node).specifiers || [],

    // Get right-hand side of assignment (the value being assigned)
    // @sig rhs :: ASTNode -> ESTreeNode?
    rhs: node => raw(node).init,

    // Get id.name or undefined
    // @sig idName :: ASTNode -> String?
    idName: node => raw(node).id?.name,

    // Get key name (handles both identifier and literal keys)
    // @sig keyName :: ASTNode -> String?
    keyName: prop => raw(prop).key?.name || raw(prop).key?.value,

    // Get key name and value node from property
    // @sig keyValue :: ASTNode -> { key: String?, value: ESTreeNode? }
    keyValue: prop => ({ key: raw(prop).key?.name || raw(prop).key?.value, value: raw(prop).value }),

    // Get exported name from specifier
    // @sig exportedName :: ASTNode -> String?
    exportedName: spec => raw(spec).exported?.name,

    // Get value node from property
    // @sig value :: ASTNode -> ESTreeNode?
    value: prop => raw(prop).value,

    // Get function body (block or expression)
    // @sig functionBody :: ASTNode -> ESTreeNode?
    functionBody: node => raw(node).body,

    // Check if arrow function has expression body (not block)
    // @sig isExpressionArrow :: ASTNode -> Boolean
    isExpressionArrow: node => raw(node).expression === true,

    // Get statements from a block body
    // @sig blockStatements :: ASTNode -> [ESTreeNode]
    blockStatements: node => raw(node).body || [],

    // Get return statement argument
    // @sig returnArgument :: ASTNode -> ESTreeNode?
    returnArgument: node => raw(node).argument,

    // === Location Helpers ===

    // Count lines spanned by a node
    // @sig lineCount :: ASTNode -> Number
    lineCount: node => {
        const loc = raw(node).loc
        if (!loc) return 0
        return loc.end.line - loc.start.line + 1
    },

    // Get start line of a node
    // @sig startLine :: ASTNode -> Number
    startLine: node => raw(node).loc?.start?.line ?? 0,

    // Get start line with fallback to 1 (for info objects)
    // @sig line :: ASTNode -> Number
    line: node => raw(node).loc?.start?.line || 1,

    // Get end line of a node
    // @sig endLine :: ASTNode -> Number
    endLine: node => raw(node).loc?.end?.line ?? 0,

    // Get start column of a node (1-based for display)
    // @sig column :: ASTNode -> Number
    column: node => (raw(node).loc?.start?.column ?? 0) + 1,

    // === Node Helpers ===

    // Check if node's body contains an await expression
    // @sig bodyContainsAwait :: ASTNode -> Boolean
    bodyContainsAwait: node => P.containsAwait(raw(node).body),

    // Check if a function node is at module top level
    // @sig isTopLevel :: (ASTNode, ASTNode) -> Boolean
    isTopLevel: (node, ast) => {
        const body = raw(ast).body
        if (!body) return false
        return body.some(statement => P.isTopLevelDeclarationOf(raw(node), statement))
    },

    // Get the effective line for comment searching (uses parent for properties/variables)
    // @sig effectiveLine :: ASTNode -> Number
    effectiveLine: node => {
        const parent = node.parent
        if (!parent) return AST.startLine(node)
        const parentType = raw(parent).type
        if (parentType === 'Property' || parentType === 'VariableDeclarator') return AST.startLine(parent)
        return AST.startLine(node)
    },

    // Get all direct child nodes of a node (as raw ESTree nodes)
    // @sig children :: ASTNode -> [ESTreeNode]
    children: node => A.toChildren(raw(node)),

    // Get all descendant nodes of an ASTNode (including the node itself)
    // @sig descendants :: ASTNode -> [ASTNode]
    descendants: node => A.collectAll(raw(node), node.parent, []),
}

export { AST }
