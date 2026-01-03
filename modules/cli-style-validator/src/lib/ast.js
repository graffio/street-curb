// ABOUTME: Fluent query DSL for read-only AST traversal
// ABOUTME: Enables declarative node finding, filtering, and transformation
// COMPLEXITY-TODO: lines — API documentation adds necessary lines (expires 2026-01-03)
//
// API OVERVIEW
// =============================================================================
//
// AST.from(ast) -> Query
//   Start a query over all nodes in an AST. Returns { node, parent } pairs.
//
// Query Methods (chainable):
//   .find(predicate)    - Filter to nodes matching predicate
//   .where(predicate)   - Alias for find (reads better in chains)
//   .reject(predicate)  - Exclude nodes matching predicate
//
// Query Methods (terminal):
//   .map(fn)            - Transform each pair, returns array
//   .flatMap(fn)        - Transform and flatten, returns array
//   .toArray()          - Get all pairs as array
//   .first()            - Get first pair or null
//   .count()            - Count matching nodes
//   .some(predicate)    - Check if any match
//   .every(predicate)   - Check if all match
//
// Static Helpers:
//   AST.walk(node, visitor)      - Low-level depth-first traversal
//   AST.lineCount(node)          - Lines spanned by node
//   AST.startLine(node)          - First line of node
//   AST.endLine(node)            - Last line of node
//   AST.isTopLevel(node, ast)    - Is node at module top level?
//   AST.effectiveLine(node, parent) - Line for comment searching
//
// EXAMPLES
// =============================================================================
//
// Find all functions:
//   AST.from(ast)
//       .find(({ node }) => PS.isFunctionNode(node))
//       .toArray()
//
// Find top-level functions longer than 5 lines:
//   AST.from(ast)
//       .find(({ node }) => PS.isFunctionNode(node))
//       .where(({ node }) => AST.isTopLevel(node, ast))
//       .where(({ node }) => AST.lineCount(node) > 5)
//       .toArray()
//
// Validate each function and collect violations:
//   AST.from(ast)
//       .find(({ node }) => PS.isFunctionNode(node))
//       .reject(({ node, parent }) => PS.isInnerCurriedFunction(node, parent))
//       .flatMap(({ node, parent }) => validateFunction(node, parent))
//
// Count all identifier nodes:
//   AST.from(ast)
//       .find(({ node }) => node.type === 'Identifier')
//       .count()
//
// =============================================================================

// Query builder over array of { node, parent } pairs
// @sig Query :: [{ node: ASTNode, parent: ASTNode? }] -> QueryObject
const Query = pairs => ({
    // Filter to nodes matching predicate
    // @sig find :: ({ node, parent } -> Boolean) -> Query
    find: predicate => Query(pairs.filter(predicate)),

    // Alias for find (reads better after initial find)
    // @sig where :: ({ node, parent } -> Boolean) -> Query
    where: predicate => Query(pairs.filter(predicate)),

    // Filter out nodes matching predicate
    // @sig reject :: ({ node, parent } -> Boolean) -> Query
    reject: predicate => Query(pairs.filter(p => !predicate(p))),

    // Transform each pair
    // @sig map :: ({ node, parent } -> T) -> [T]
    map: fn => pairs.map(fn),

    // Transform and flatten
    // @sig flatMap :: ({ node, parent } -> [T]) -> [T]
    flatMap: fn => pairs.flatMap(fn),

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

    // Check if all match predicate
    // @sig every :: ({ node, parent } -> Boolean) -> Boolean
    every: predicate => pairs.every(predicate),
})

const P = {
    // Check if value is an AST node
    // @sig isNode :: Any -> Boolean
    isNode: child => child && typeof child === 'object' && child.type,

    // Keys to skip during traversal
    // @sig isMetaKey :: String -> Boolean
    isMetaKey: key => ['type', 'loc', 'range', 'start', 'end'].includes(key),
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
    // Create a query from an AST root, collecting all nodes with parent context
    // @sig from :: AST -> Query
    from: ast => {
        const pairs = []
        AST.walk(ast, (node, parent) => pairs.push({ node, parent }))
        return Query(pairs)
    },

    // Walk AST depth-first, calling visitor(node, parent) for each node
    // @sig walk :: (ASTNode, (ASTNode, ASTNode?) -> Void, ASTNode?) -> Void
    walk: (node, visitor, parent = null) => {
        if (!node || typeof node !== 'object') return
        if (node.type) visitor(node, parent)
        A.toChildren(node).forEach(child => AST.walk(child, visitor, node))
    },

    // Count lines spanned by a node
    // @sig lineCount :: ASTNode -> Number
    lineCount: node => {
        if (!node.loc) return 0
        return node.loc.end.line - node.loc.start.line + 1
    },

    // Get start line of a node
    // @sig startLine :: ASTNode -> Number
    startLine: node => node.loc?.start?.line ?? 0,

    // Get end line of a node
    // @sig endLine :: ASTNode -> Number
    endLine: node => node.loc?.end?.line ?? 0,

    // Check if a function node is at module top level
    // @sig isTopLevel :: (ASTNode, AST) -> Boolean
    isTopLevel: (node, ast) => {
        if (!ast?.body) return false
        return ast.body.some(
            stmt =>
                stmt === node || (stmt.type === 'VariableDeclaration' && stmt.declarations.some(d => d.init === node)),
        )
    },

    // Get the effective line for comment searching (uses parent for properties/variables)
    // @sig effectiveLine :: (ASTNode, ASTNode?) -> Number
    effectiveLine: (node, parent) => {
        if (parent?.type === 'Property' || parent?.type === 'VariableDeclarator') return AST.startLine(parent)
        return AST.startLine(node)
    },
}

export { AST }
