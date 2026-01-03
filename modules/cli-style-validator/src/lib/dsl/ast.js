// ABOUTME: Fluent query DSL for read-only AST traversal
// ABOUTME: Enables declarative node finding, filtering, and transformation
// API documentation: see README.md in this directory

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

    // Filter by node type
    // @sig ofType :: String -> Query
    ofType: type => Query(pairs.filter(({ node }) => node.type === type)),

    // Filter by parent type
    // @sig ofParentType :: String -> Query
    ofParentType: type => Query(pairs.filter(({ parent }) => parent?.type === type)),

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

const P = {
    // Check if value is an AST node
    // @sig isNode :: Any -> Boolean
    isNode: child => child && typeof child === 'object' && child.type,

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

    // Create a query from an AST root, collecting all nodes with parent context
    // @sig from :: AST -> Query
    from: ast => {
        const pairs = []
        AST.walk(ast, (node, parent) => pairs.push({ node, parent }))
        return Query(pairs)
    },

    // Create a query over just top-level statements (ast.body)
    // @sig topLevel :: AST -> Query
    topLevel: ast => Query((ast?.body || []).map(node => ({ node, parent: ast }))),

    // === Type Predicates ===

    // Create a type predicate function
    // @sig isType :: String -> (ASTNode -> Boolean)
    isType: type => node => node?.type === type,

    // Direct type check
    // @sig hasType :: (ASTNode, String) -> Boolean
    hasType: (node, type) => node?.type === type,

    // Check if node is a VariableDeclaration
    // @sig isVarDecl :: ASTNode -> Boolean
    isVarDecl: node => node?.type === 'VariableDeclaration',

    // Check if node is a FunctionDeclaration
    // @sig isFunctionDecl :: ASTNode -> Boolean
    isFunctionDecl: node => node?.type === 'FunctionDeclaration',

    // Check if node is an ObjectExpression
    // @sig isObjectExpr :: ASTNode -> Boolean
    isObjectExpr: node => node?.type === 'ObjectExpression',

    // Check if node is a FunctionDeclaration with a name
    // @sig isNamedFunctionDecl :: ASTNode -> Boolean
    isNamedFunctionDecl: node => node?.type === 'FunctionDeclaration' && node.id?.name,

    // === Property Accessors (safe) ===

    // Get body array or empty
    // @sig body :: AST -> [Statement]
    body: ast => ast?.body || [],

    // Get declarations array or empty
    // @sig declarations :: ASTNode -> [VariableDeclarator]
    declarations: node => node?.declarations || [],

    // Get the name of the first declared variable
    // @sig variableName :: VariableDeclaration -> String?
    variableName: node => node?.declarations?.[0]?.id?.name,

    // Get the value (right-hand side) of the first declared variable
    // @sig variableValue :: VariableDeclaration -> ASTNode?
    variableValue: node => node?.declarations?.[0]?.init,

    // Get properties array or empty
    // @sig properties :: ASTNode -> [Property]
    properties: node => node?.properties || [],

    // Get specifiers array or empty
    // @sig specifiers :: ASTNode -> [Specifier]
    specifiers: node => node?.specifiers || [],

    // Get right-hand side of assignment (the value being assigned)
    // @sig rhs :: VariableDeclarator -> ASTNode?
    rhs: node => node?.init,

    // Get id.name or undefined
    // @sig idName :: ASTNode -> String?
    idName: node => node?.id?.name,

    // Get key name (handles both identifier and literal keys)
    // @sig keyName :: Property -> String?
    keyName: prop => prop?.key?.name || prop?.key?.value,

    // Get key name and value node from property
    // @sig keyValue :: Property -> { key: String?, value: ASTNode? }
    keyValue: prop => ({ key: prop?.key?.name || prop?.key?.value, value: prop?.value }),

    // Get exported name from specifier
    // @sig exportedName :: Specifier -> String?
    exportedName: spec => spec?.exported?.name,

    // Get value node from property
    // @sig value :: Property -> ASTNode?
    value: prop => prop?.value,

    // === Node Helpers ===

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

    // Get start line with fallback to 1 (for info objects)
    // @sig line :: ASTNode -> Number
    line: node => node?.loc?.start?.line || 1,

    // Get end line of a node
    // @sig endLine :: ASTNode -> Number
    endLine: node => node.loc?.end?.line ?? 0,

    // Check if a function node is at module top level
    // @sig isTopLevel :: (ASTNode, AST) -> Boolean
    isTopLevel: (node, ast) => {
        if (!ast?.body) return false
        return ast.body.some(statement => P.isTopLevelDeclarationOf(node, statement))
    },

    // Get the effective line for comment searching (uses parent for properties/variables)
    // @sig effectiveLine :: (ASTNode, ASTNode?) -> Number
    effectiveLine: (node, parent) => {
        if (parent?.type === 'Property' || parent?.type === 'VariableDeclarator') return AST.startLine(parent)
        return AST.startLine(node)
    },
}

export { AST }
