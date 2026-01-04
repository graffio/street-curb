// ABOUTME: Main AST abstraction - provides accessors that hide ESTree structure
// ABOUTME: All accessors return wrapped ASTNodes, not raw ESTree nodes
// COMPLEXITY-TODO: functions — AST accessors grouped by purpose, not decomposable (expires 2026-02-01)
// COMPLEXITY-TODO: lines — Accessors expanded to wrap all returned nodes (expires 2026-02-01)

import { ASTNode } from './types/ast-node.js'

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
    from: ast => (ASTNode.isASTNode(ast) ? A.collectAll(ast.esTree, ast.parent, []) : A.collectAll(ast, null, [])),

    // Get just top-level statements as wrapped ASTNodes
    // @sig topLevel :: ESTreeAST -> [ASTNode]
    topLevel: ast => {
        if (!ast?.body) return []
        const wrappedRoot = ASTNode.wrap(ast, null)
        return ast.body.map(node => ASTNode.wrap(node, wrappedRoot))
    },

    // Get all descendant nodes of an ASTNode (including the node itself)
    // @sig descendants :: ASTNode -> [ASTNode]
    descendants: node => A.collectAll(node.esTree, node.parent, []),

    // === Type Predicates ===

    // Direct type check (for checking ESTree types by string)
    // @sig hasType :: (ASTNode, String) -> Boolean
    hasType: (node, type) => node.esTree.type === type,

    // Check if node is a function declaration with a name
    // @sig isNamedFunctionDecl :: ASTNode -> Boolean
    isNamedFunctionDecl: node => node.esTree.type === 'FunctionDeclaration' && node.esTree.id?.name,

    // Check if node is an object expression
    // @sig isObjectExpr :: ASTNode -> Boolean
    isObjectExpr: node => node.esTree.type === 'ObjectExpression',

    // Check if node is a variable declaration
    // @sig isVarDecl :: ASTNode -> Boolean
    isVarDecl: node => node.esTree.type === 'VariableDeclaration',

    // Get node type string
    // @sig nodeType :: ASTNode -> String
    nodeType: node => node.esTree.type,

    // === Property Accessors ===

    // Get body array or empty
    // @sig body :: ASTNode -> [ESTreeNode]
    body: node => node.esTree.body || [],

    // Get declarations array or empty
    // @sig declarations :: ASTNode -> [ASTNode]
    declarations: node => (node.esTree.declarations || []).map(d => ASTNode.wrap(d, node)),

    // Get the name of the first declared variable
    // @sig variableName :: ASTNode -> String?
    variableName: node => node.esTree.declarations?.[0]?.id?.name,

    // Get the value (right-hand side) of the first declared variable
    // @sig variableValue :: ASTNode -> ASTNode?
    variableValue: node => {
        const init = node.esTree.declarations?.[0]?.init
        return init ? ASTNode.wrap(init, node) : null
    },

    // Get the init of a VariableDeclarator as wrapped ASTNode
    // @sig variableInit :: ASTNode -> ASTNode?
    variableInit: node => {
        const init = node.esTree.init
        return init ? ASTNode.wrap(init, node) : null
    },

    // Get properties array or empty
    // @sig properties :: ASTNode -> [ASTNode]
    properties: node => (node.esTree.properties || []).map(p => ASTNode.wrap(p, node)),

    // Count properties in an object expression
    // @sig propertyCount :: ASTNode -> Number
    propertyCount: node => (node.esTree.properties || []).length,

    // Get property key names from object expression
    // @sig propertyNames :: ASTNode -> [String]
    propertyNames: node =>
        (node.esTree.properties || []).filter(p => p.key?.name || p.key?.value).map(p => p.key.name || p.key.value),

    // Get specifiers array or empty
    // @sig specifiers :: ASTNode -> [ASTNode]
    specifiers: node => (node.esTree.specifiers || []).map(s => ASTNode.wrap(s, node)),

    // Get right-hand side of assignment (the value being assigned)
    // @sig rhs :: ASTNode -> ASTNode?
    rhs: node => {
        const init = node.esTree.init
        return init ? ASTNode.wrap(init, node) : null
    },

    // Get id.name or undefined
    // @sig idName :: ASTNode -> String?
    idName: node => node.esTree.id?.name,

    // Get key name (handles both identifier and literal keys)
    // @sig keyName :: ASTNode -> String?
    keyName: prop => prop.esTree.key?.name || prop.esTree.key?.value,

    // Get key name and value node from property
    // @sig keyValue :: ASTNode -> { key: String?, value: ASTNode? }
    keyValue: prop => {
        const raw = prop.esTree
        const value = raw.value ? ASTNode.wrap(raw.value, prop) : null
        return { key: raw.key?.name || raw.key?.value, value }
    },

    // Get exported name from specifier
    // @sig exportedName :: ASTNode -> String?
    exportedName: spec => spec.esTree.exported?.name,

    // Get value node from property
    // @sig value :: ASTNode -> ESTreeNode?
    value: prop => prop.esTree.value,

    // Get function body (block or expression)
    // @sig functionBody :: ASTNode -> ASTNode?
    functionBody: node => {
        const body = node.esTree.body
        return body ? ASTNode.wrap(body, node) : null
    },

    // Check if arrow function has expression body (not block)
    // @sig isExpressionArrow :: ASTNode -> Boolean
    isExpressionArrow: node => node.esTree.expression === true,

    // Get statements from a block body
    // @sig blockStatements :: ASTNode -> [ASTNode]
    blockStatements: node => (node.esTree.body || []).map(stmt => ASTNode.wrap(stmt, node)),

    // Get return statement argument
    // @sig returnArgument :: ASTNode -> ASTNode?
    returnArgument: node => {
        const arg = node.esTree.argument
        return arg ? ASTNode.wrap(arg, node) : null
    },

    // Get MemberExpression object (the part before the dot)
    // @sig memberObject :: ASTNode -> ASTNode?
    memberObject: node => {
        const obj = node.esTree.object
        return obj ? ASTNode.wrap(obj, node) : null
    },

    // Get MemberExpression property (the part after the dot)
    // @sig memberProperty :: ASTNode -> ASTNode?
    memberProperty: node => {
        const prop = node.esTree.property
        return prop ? ASTNode.wrap(prop, node) : null
    },

    // Check if MemberExpression uses computed access (a[b] vs a.b)
    // @sig isComputed :: ASTNode -> Boolean
    isComputed: node => node.esTree.computed === true,

    // Get name from Identifier node
    // @sig identifierName :: ASTNode -> String?
    identifierName: node => node.esTree.name,

    // Get CallExpression callee (the function being called)
    // @sig callee :: ASTNode -> ASTNode?
    callee: node => {
        const callee = node.esTree.callee
        return callee ? ASTNode.wrap(callee, node) : null
    },

    // Get AssignmentExpression left side (the target of assignment)
    // @sig assignmentLeft :: ASTNode -> ASTNode?
    assignmentLeft: node => {
        const left = node.esTree.left
        return left ? ASTNode.wrap(left, node) : null
    },

    // Get ExportDefaultDeclaration declaration name
    // @sig defaultExportName :: ASTNode -> String?
    defaultExportName: node => node.esTree.declaration?.name,

    // Check if two nodes refer to the same ESTree node (identity comparison)
    // @sig isSameNode :: (ASTNode, ASTNode) -> Boolean
    isSameNode: (a, b) => a.esTree === b.esTree,

    // === Location Helpers ===

    // Count lines spanned by a node
    // @sig lineCount :: ASTNode -> Number
    lineCount: node => {
        const loc = node.esTree.loc
        if (!loc) return 0
        return loc.end.line - loc.start.line + 1
    },

    // Get start line of a node
    // @sig startLine :: ASTNode -> Number
    startLine: node => node.esTree.loc?.start?.line ?? 0,

    // Get start line with fallback to 1 (for info objects)
    // @sig line :: ASTNode -> Number
    line: node => node.esTree.loc?.start?.line || 1,

    // Get end line of a node
    // @sig endLine :: ASTNode -> Number
    endLine: node => node.esTree.loc?.end?.line ?? 0,

    // Get start column of a node (1-based for display)
    // @sig column :: ASTNode -> Number
    column: node => (node.esTree.loc?.start?.column ?? 0) + 1,

    // === Node Helpers ===

    // Check if node's body contains an await expression
    // @sig bodyContainsAwait :: ASTNode -> Boolean
    bodyContainsAwait: node => P.containsAwait(node.esTree.body),

    // Check if a function node is at module top level (ast is raw ESTree Program)
    // @sig isTopLevel :: (ASTNode, ESTreeAST) -> Boolean
    isTopLevel: (node, ast) => {
        const body = ast?.body
        if (!body) return false
        return body.some(statement => P.isTopLevelDeclarationOf(node.esTree, statement))
    },

    // Get the effective line for comment searching (uses parent for properties/variables)
    // @sig effectiveLine :: ASTNode -> Number
    effectiveLine: node => {
        const parent = node.parent
        if (!parent) return AST.startLine(node)
        const parentType = parent.esTree.type
        if (parentType === 'Property' || parentType === 'VariableDeclarator') return AST.startLine(parent)
        return AST.startLine(node)
    },

    // Get all direct child nodes of a node (as raw ESTree nodes)
    // @sig children :: ASTNode -> [ESTreeNode]
    children: node => A.toChildren(node.esTree),
}

export { AST }
