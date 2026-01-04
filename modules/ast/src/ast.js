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

const T = {
    // Extract raw ESTree from wrapped ASTNode
    // @sig toESTree :: ASTNode -> ESTreeNode
    toESTree: node => node.esTree,
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
    from: ast => (ASTNode.isASTNode(ast) ? A.collectAll(T.toESTree(ast), ast.parent, []) : A.collectAll(ast, null, [])),

    // Get just top-level statements as wrapped ASTNodes
    // @sig topLevel :: ESTreeAST -> [ASTNode]
    topLevel: ast => {
        if (!ast?.body) return []
        const wrappedRoot = ASTNode.wrap(ast, null)
        return ast.body.map(node => ASTNode.wrap(node, wrappedRoot))
    },

    // Get all descendant nodes of an ASTNode (including the node itself)
    // @sig descendants :: ASTNode -> [ASTNode]
    descendants: node => A.collectAll(T.toESTree(node), node.parent, []),

    // === Type Predicates ===

    // Direct type check (for checking ESTree types by string)
    // @sig hasType :: (ASTNode, String) -> Boolean
    hasType: (node, type) => T.toESTree(node).type === type,

    // Check if node is a function declaration with a name
    // @sig isNamedFunctionDecl :: ASTNode -> Boolean
    isNamedFunctionDecl: node => T.toESTree(node).type === 'FunctionDeclaration' && T.toESTree(node).id?.name,

    // Check if node is an object expression
    // @sig isObjectExpr :: ASTNode -> Boolean
    isObjectExpr: node => T.toESTree(node).type === 'ObjectExpression',

    // Check if node is a variable declaration
    // @sig isVarDecl :: ASTNode -> Boolean
    isVarDecl: node => T.toESTree(node).type === 'VariableDeclaration',

    // Get node type string
    // @sig nodeType :: ASTNode -> String
    nodeType: node => T.toESTree(node).type,

    // === Property Accessors ===

    // Get body array or empty
    // @sig body :: ASTNode -> [ESTreeNode]
    body: node => T.toESTree(node).body || [],

    // Get declarations array or empty
    // @sig declarations :: ASTNode -> [ASTNode]
    declarations: node => (T.toESTree(node).declarations || []).map(d => ASTNode.wrap(d, node)),

    // Get the name of the first declared variable
    // @sig variableName :: ASTNode -> String?
    variableName: node => T.toESTree(node).declarations?.[0]?.id?.name,

    // Get the value (right-hand side) of the first declared variable
    // @sig variableValue :: ASTNode -> ASTNode?
    variableValue: node => {
        const init = T.toESTree(node).declarations?.[0]?.init
        return init ? ASTNode.wrap(init, node) : null
    },

    // Get the init of a VariableDeclarator as wrapped ASTNode
    // @sig variableInit :: ASTNode -> ASTNode?
    variableInit: node => {
        const init = T.toESTree(node).init
        return init ? ASTNode.wrap(init, node) : null
    },

    // Get properties array or empty
    // @sig properties :: ASTNode -> [ASTNode]
    properties: node => (T.toESTree(node).properties || []).map(p => ASTNode.wrap(p, node)),

    // Count properties in an object expression
    // @sig propertyCount :: ASTNode -> Number
    propertyCount: node => (T.toESTree(node).properties || []).length,

    // Get property key names from object expression
    // @sig propertyNames :: ASTNode -> [String]
    propertyNames: node =>
        (T.toESTree(node).properties || [])
            .filter(p => p.key?.name || p.key?.value)
            .map(p => p.key.name || p.key.value),

    // Get specifiers array or empty
    // @sig specifiers :: ASTNode -> [ASTNode]
    specifiers: node => (T.toESTree(node).specifiers || []).map(s => ASTNode.wrap(s, node)),

    // Get right-hand side of assignment (the value being assigned)
    // @sig rhs :: ASTNode -> ASTNode?
    rhs: node => {
        const init = T.toESTree(node).init
        return init ? ASTNode.wrap(init, node) : null
    },

    // Get id.name or undefined
    // @sig idName :: ASTNode -> String?
    idName: node => T.toESTree(node).id?.name,

    // Get key name (handles both identifier and literal keys)
    // @sig keyName :: ASTNode -> String?
    keyName: prop => T.toESTree(prop).key?.name || T.toESTree(prop).key?.value,

    // Get key name and value node from property
    // @sig keyValue :: ASTNode -> { key: String?, value: ASTNode? }
    keyValue: prop => {
        const raw = T.toESTree(prop)
        const value = raw.value ? ASTNode.wrap(raw.value, prop) : null
        return { key: raw.key?.name || raw.key?.value, value }
    },

    // Get exported name from specifier
    // @sig exportedName :: ASTNode -> String?
    exportedName: spec => T.toESTree(spec).exported?.name,

    // Get value node from property
    // @sig value :: ASTNode -> ESTreeNode?
    value: prop => T.toESTree(prop).value,

    // Get function body (block or expression)
    // @sig functionBody :: ASTNode -> ASTNode?
    functionBody: node => {
        const body = T.toESTree(node).body
        return body ? ASTNode.wrap(body, node) : null
    },

    // Check if arrow function has expression body (not block)
    // @sig isExpressionArrow :: ASTNode -> Boolean
    isExpressionArrow: node => T.toESTree(node).expression === true,

    // Get statements from a block body
    // @sig blockStatements :: ASTNode -> [ASTNode]
    blockStatements: node => (T.toESTree(node).body || []).map(stmt => ASTNode.wrap(stmt, node)),

    // Get return statement argument
    // @sig returnArgument :: ASTNode -> ASTNode?
    returnArgument: node => {
        const arg = T.toESTree(node).argument
        return arg ? ASTNode.wrap(arg, node) : null
    },

    // Get MemberExpression object (the part before the dot)
    // @sig memberObject :: ASTNode -> ASTNode?
    memberObject: node => {
        const obj = T.toESTree(node).object
        return obj ? ASTNode.wrap(obj, node) : null
    },

    // Get MemberExpression property (the part after the dot)
    // @sig memberProperty :: ASTNode -> ASTNode?
    memberProperty: node => {
        const prop = T.toESTree(node).property
        return prop ? ASTNode.wrap(prop, node) : null
    },

    // Check if MemberExpression uses computed access (a[b] vs a.b)
    // @sig isComputed :: ASTNode -> Boolean
    isComputed: node => T.toESTree(node).computed === true,

    // Get name from Identifier node
    // @sig identifierName :: ASTNode -> String?
    identifierName: node => T.toESTree(node).name,

    // Get CallExpression callee (the function being called)
    // @sig callee :: ASTNode -> ASTNode?
    callee: node => {
        const callee = T.toESTree(node).callee
        return callee ? ASTNode.wrap(callee, node) : null
    },

    // Get AssignmentExpression left side (the target of assignment)
    // @sig assignmentLeft :: ASTNode -> ASTNode?
    assignmentLeft: node => {
        const left = T.toESTree(node).left
        return left ? ASTNode.wrap(left, node) : null
    },

    // Get ExportDefaultDeclaration declaration name
    // @sig defaultExportName :: ASTNode -> String?
    defaultExportName: node => T.toESTree(node).declaration?.name,

    // Check if two nodes refer to the same ESTree node (identity comparison)
    // @sig isSameNode :: (ASTNode, ASTNode) -> Boolean
    isSameNode: (a, b) => T.toESTree(a) === T.toESTree(b),

    // === Location Helpers ===

    // Count lines spanned by a node
    // @sig lineCount :: ASTNode -> Number
    lineCount: node => {
        const loc = T.toESTree(node).loc
        if (!loc) return 0
        return loc.end.line - loc.start.line + 1
    },

    // Get start line of a node
    // @sig startLine :: ASTNode -> Number
    startLine: node => T.toESTree(node).loc?.start?.line ?? 0,

    // Get start line with fallback to 1 (for info objects)
    // @sig line :: ASTNode -> Number
    line: node => T.toESTree(node).loc?.start?.line || 1,

    // Get end line of a node
    // @sig endLine :: ASTNode -> Number
    endLine: node => T.toESTree(node).loc?.end?.line ?? 0,

    // Get start column of a node (1-based for display)
    // @sig column :: ASTNode -> Number
    column: node => (T.toESTree(node).loc?.start?.column ?? 0) + 1,

    // === Node Helpers ===

    // Check if node's body contains an await expression
    // @sig bodyContainsAwait :: ASTNode -> Boolean
    bodyContainsAwait: node => P.containsAwait(T.toESTree(node).body),

    // Check if a function node is at module top level (ast is raw ESTree Program)
    // @sig isTopLevel :: (ASTNode, ESTreeAST) -> Boolean
    isTopLevel: (node, ast) => {
        const body = ast?.body
        if (!body) return false
        return body.some(statement => P.isTopLevelDeclarationOf(T.toESTree(node), statement))
    },

    // Get the effective line for comment searching (uses parent for properties/variables)
    // @sig effectiveLine :: ASTNode -> Number
    effectiveLine: node => {
        const parent = node.parent
        if (!parent) return AST.startLine(node)
        const parentType = T.toESTree(parent).type
        if (parentType === 'Property' || parentType === 'VariableDeclarator') return AST.startLine(parent)
        return AST.startLine(node)
    },

    // Get all direct child nodes of a node (as raw ESTree nodes)
    // @sig children :: ASTNode -> [ESTreeNode]
    children: node => A.toChildren(T.toESTree(node)),
}

export { AST }
