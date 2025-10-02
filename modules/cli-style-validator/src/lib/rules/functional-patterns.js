/**
 * Create a functional-patterns violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'functional-patterns',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    message,
    rule: 'functional-patterns',
})

/**
 * Check if node is an imperative loop statement
 * @sig isImperativeLoop :: ASTNode -> Boolean
 */
const isImperativeLoop = node =>
    node.type === 'ForStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'DoWhileStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement'

/**
 * Get suggestion message for imperative loop type
 * @sig getSuggestionForLoop :: String -> String
 */
const getSuggestionForLoop = nodeType => {
    if (nodeType === 'ForStatement') return 'Replace for loop with map/filter/reduce functional patterns'
    if (nodeType === 'WhileStatement') return 'Replace while loop with map/filter/reduce or early returns'
    if (nodeType === 'DoWhileStatement') return 'Replace do-while loop with map/filter/reduce or early returns'
    if (nodeType === 'ForInStatement')
        return 'Replace for-in loop with Object.entries/keys/values and functional patterns'
    if (nodeType === 'ForOfStatement') return 'Replace for-of loop with map/filter/reduce functional patterns'
    return 'Replace imperative loop with functional patterns'
}

/**
 * Process AST node for functional pattern violations
 * @sig processNodeForViolations :: (ASTNode, [Violation]) -> Void
 */
const processNodeForViolations = (node, violations) => {
    if (!isImperativeLoop(node)) return

    const suggestion = getSuggestionForLoop(node.type)
    violations.push(createViolation(node, suggestion))
}

/**
 * Process child node in traversal
 * @sig processChildInTraversal :: (Any, Function) -> Void
 */
const processChildInTraversal = (child, visitor) => {
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

    Object.values(node).forEach(child => processChildInTraversal(child, visitor))
}

/**
 * Check for functional pattern violations (coding standards)
 * @sig checkFunctionalPatterns :: (AST?, String, String) -> [Violation]
 */
const checkFunctionalPatterns = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []

    traverseAST(ast, node => processNodeForViolations(node, violations))

    return violations
}

export { checkFunctionalPatterns }
