// ABOUTME: Fluent query DSL for read-only AST traversal
// ABOUTME: Enables declarative node finding, filtering, and transformation
// COMPLEXITY-TODO: functions — ASTNode wrapping adds accessor functions (expires 2026-02-01)
// API documentation: see README.md in this directory

import { ASTNode } from '../../types/index.js'

// Collection of { node, parent } pairs with chainable query methods
// @sig Nodes :: [{ node: ASTNode, parent: ASTNode? }] -> Nodes
const Nodes = pairs => ({
    // Filter to nodes matching predicate
    // @sig find :: ({ node, parent } -> Boolean) -> Nodes
    find: predicate => Nodes(pairs.filter(predicate)),

    // Alias for find (reads better after initial find)
    // @sig where :: ({ node, parent } -> Boolean) -> Nodes
    where: predicate => Nodes(pairs.filter(predicate)),

    // Filter out nodes matching predicate
    // @sig reject :: ({ node, parent } -> Boolean) -> Nodes
    reject: predicate => Nodes(pairs.filter(p => !predicate(p))),

    // Filter by node type (works with both wrapped ASTNode and raw ESTree nodes)
    // @sig ofType :: String -> Nodes
    ofType: type => Nodes(pairs.filter(({ node }) => (node.raw?.type ?? node.type) === type)),

    // Filter by parent type (works with both wrapped ASTNode and raw ESTree nodes)
    // @sig ofParentType :: String -> Nodes
    ofParentType: type => Nodes(pairs.filter(({ parent }) => (parent?.raw?.type ?? parent?.type) === type)),

    // Transform each pair
    // @sig map :: ({ node, parent } -> T) -> [T]
    map: fn => pairs.map(fn),

    // Transform and flatten
    // @sig flatMap :: ({ node, parent } -> [T]) -> [T]
    flatMap: fn => pairs.flatMap(fn),

    // Transform just the node (ignores parent)
    // @sig mapNode :: (ASTNode -> T) -> [T]
    mapNode: fn => pairs.map(({ node }) => fn(node)),

    // Transform just the node and flatten
    // @sig flatMapNode :: (ASTNode -> [T]) -> [T]
    flatMapNode: fn => pairs.flatMap(({ node }) => fn(node)),

    // Get results as array
    // @sig toArray :: () -> [{ node, parent }]
    toArray: () => pairs,

    // Get first result or null
    // @sig first :: () -> { node, parent }?
    first: () => pairs[0] || null,

    // Count results
    // @sig count :: () -> Number
    count: () => pairs.length,

    // Check if any match predicate
    // @sig some :: ({ node, parent } -> Boolean) -> Boolean
    some: predicate => pairs.some(predicate),

    // Check if any node matches predicate (ignores parent)
    // @sig someNode :: (ASTNode -> Boolean) -> Boolean
    someNode: predicate => pairs.some(({ node }) => predicate(node)),

    // Check if all match predicate
    // @sig every :: ({ node, parent } -> Boolean) -> Boolean
    every: predicate => pairs.every(predicate),
})

// COMPLEXITY: "raw" — Module-level helper for ASTNode wrapper interop, used throughout AST module
// Get raw ESTree node from either wrapped ASTNode or raw node
// @sig raw :: (ASTNode | ESTreeNode) -> ESTreeNode
const raw = node => node?.raw ?? node

const P = {
    // Check if value is an AST node (handles both wrapped and raw)
    // @sig isNode :: Any -> Boolean
    isNode: child => child && typeof child === 'object' && (raw(child).type || child.type),

    // Keys to skip during traversal
    // @sig isMetaKey :: String -> Boolean
    isMetaKey: key => ['type', 'loc', 'range', 'start', 'end'].includes(key),

    // Check if statement declares a function node at top level
    // @sig isTopLevelDeclarationOf :: (ASTNode, ASTNode) -> Boolean
    isTopLevelDeclarationOf: (targetNode, statement) =>
        statement === targetNode ||
        (statement.type === 'VariableDeclaration' && statement.declarations.some(d => d.init === targetNode)),
}

const A = {
    // Collect child nodes from a value (handles arrays and single nodes)
    // @sig collectChildren :: Any -> [ASTNode]
    collectChildren: value => {
        if (Array.isArray(value)) return value.filter(P.isNode)
        if (P.isNode(value)) return [value]
        return []
    },

    // Get all direct child nodes of a node
    // @sig toChildren :: ASTNode -> [ASTNode]
    toChildren: node =>
        Object.entries(node)
            .filter(([key]) => !P.isMetaKey(key))
            .flatMap(([, value]) => A.collectChildren(value)),
}

const AST = {
    // === Entry Points ===

    // Create Nodes from an AST root, collecting all nodes with parent context
    // Nodes are wrapped in ASTNode TaggedSum for type-safe pattern matching
    // @sig from :: AST -> Nodes
    from: ast => {
        const pairs = []
        AST.walk(ast, (node, parent) =>
            pairs.push({ node: ASTNode.wrap(node), parent: parent ? ASTNode.wrap(parent) : null }),
        )
        return Nodes(pairs)
    },

    // Create Nodes over just top-level statements (ast.body)
    // Nodes are wrapped in ASTNode TaggedSum for type-safe pattern matching
    // @sig topLevel :: AST -> Nodes
    topLevel: ast =>
        Nodes((ast?.body || []).map(node => ({ node: ASTNode.wrap(node), parent: ast ? ASTNode.wrap(ast) : null }))),

    // === Type Predicates (handle both wrapped ASTNode and raw ESTree) ===

    // Create a type predicate function
    // @sig isType :: String -> (ASTNode -> Boolean)
    isType: type => node => raw(node)?.type === type,

    // Direct type check
    // @sig hasType :: (ASTNode, String) -> Boolean
    hasType: (node, type) => raw(node)?.type === type,

    // Check if node is a VariableDeclaration
    // @sig isVarDecl :: ASTNode -> Boolean
    isVarDecl: node => raw(node)?.type === 'VariableDeclaration',

    // Check if node is a FunctionDeclaration
    // @sig isFunctionDecl :: ASTNode -> Boolean
    isFunctionDecl: node => raw(node)?.type === 'FunctionDeclaration',

    // Check if node is an ObjectExpression
    // @sig isObjectExpr :: ASTNode -> Boolean
    isObjectExpr: node => raw(node)?.type === 'ObjectExpression',

    // Check if node is a FunctionDeclaration with a name
    // @sig isNamedFunctionDecl :: ASTNode -> Boolean
    isNamedFunctionDecl: node => raw(node)?.type === 'FunctionDeclaration' && raw(node).id?.name,

    // === Property Accessors (handle both wrapped ASTNode and raw ESTree) ===

    // Get body array or empty
    // @sig body :: AST -> [Statement]
    body: ast => raw(ast)?.body || [],

    // Get declarations array or empty
    // @sig declarations :: ASTNode -> [VariableDeclarator]
    declarations: node => raw(node)?.declarations || [],

    // Get the name of the first declared variable
    // @sig variableName :: VariableDeclaration -> String?
    variableName: node => raw(node)?.declarations?.[0]?.id?.name,

    // Get the value (right-hand side) of the first declared variable
    // @sig variableValue :: VariableDeclaration -> ASTNode?
    variableValue: node => raw(node)?.declarations?.[0]?.init,

    // Get properties array or empty
    // @sig properties :: ASTNode -> [Property]
    properties: node => raw(node)?.properties || [],

    // Get specifiers array or empty
    // @sig specifiers :: ASTNode -> [Specifier]
    specifiers: node => raw(node)?.specifiers || [],

    // Get right-hand side of assignment (the value being assigned)
    // @sig rhs :: VariableDeclarator -> ASTNode?
    rhs: node => raw(node)?.init,

    // Get id.name or undefined
    // @sig idName :: ASTNode -> String?
    idName: node => raw(node)?.id?.name,

    // Get key name (handles both identifier and literal keys)
    // @sig keyName :: Property -> String?
    keyName: prop => raw(prop)?.key?.name || raw(prop)?.key?.value,

    // Get key name and value node from property
    // @sig keyValue :: Property -> { key: String?, value: ASTNode? }
    keyValue: prop => ({ key: raw(prop)?.key?.name || raw(prop)?.key?.value, value: raw(prop)?.value }),

    // Get exported name from specifier
    // @sig exportedName :: Specifier -> String?
    exportedName: spec => raw(spec)?.exported?.name,

    // Get value node from property
    // @sig value :: Property -> ASTNode?
    value: prop => raw(prop)?.value,

    // === Node Helpers ===

    // Walk AST depth-first, calling visitor(node, parent) for each node
    // @sig walk :: (ASTNode, (ASTNode, ASTNode?) -> Void, ASTNode?) -> Void
    walk: (node, visitor, parent = null) => {
        if (!node || typeof node !== 'object') return
        if (node.type) visitor(node, parent)
        A.toChildren(node).forEach(child => AST.walk(child, visitor, node))
    },

    // Count lines spanned by a node (handles both wrapped and raw)
    // @sig lineCount :: ASTNode -> Number
    lineCount: node => {
        const r = raw(node)
        if (!r.loc) return 0
        return r.loc.end.line - r.loc.start.line + 1
    },

    // Get start line of a node (handles both wrapped and raw)
    // @sig startLine :: ASTNode -> Number
    startLine: node => raw(node)?.loc?.start?.line ?? 0,

    // Get start line with fallback to 1 (for info objects)
    // @sig line :: ASTNode -> Number
    line: node => raw(node)?.loc?.start?.line || 1,

    // Get end line of a node (handles both wrapped and raw)
    // @sig endLine :: ASTNode -> Number
    endLine: node => raw(node)?.loc?.end?.line ?? 0,

    // Check if a function node is at module top level
    // @sig isTopLevel :: (ASTNode, AST) -> Boolean
    isTopLevel: (node, ast) => {
        const r = raw(ast)
        if (!r?.body) return false
        return r.body.some(statement => P.isTopLevelDeclarationOf(raw(node), statement))
    },

    // Get the effective line for comment searching (uses parent for properties/variables)
    // @sig effectiveLine :: (ASTNode, ASTNode?) -> Number
    effectiveLine: (node, parent) => {
        const rp = raw(parent)
        if (rp?.type === 'Property' || rp?.type === 'VariableDeclarator') return AST.startLine(parent)
        return AST.startLine(node)
    },
}

export { AST }
