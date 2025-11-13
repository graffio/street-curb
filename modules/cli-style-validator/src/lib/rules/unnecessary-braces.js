/**
 * Process child node in AST traversal
 * @sig processChildNode :: (Any, Function) -> Void
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
 * Create an unnecessary-braces violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'unnecessary-braces',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    message,
    rule: 'unnecessary-braces',
})

/**
 * Check if statement for violations
 * @sig checkIfStatement :: (ASTNode, [Violation]) -> Void
 */
const checkIfStatement = (node, violations) => {
    if (isSingleStatementBlock(node.consequent))
        violations.push(createViolation(node.consequent, 'Remove unnecessary braces from single statement if block'))

    // Check else block if it exists
    if (node.alternate && isSingleStatementBlock(node.alternate))
        violations.push(createViolation(node.alternate, 'Remove unnecessary braces from single statement else block'))
}

/**
 * Check node for violations
 * @sig checkNodeForViolations :: (ASTNode, [Violation]) -> Void
 */
const checkNodeForViolations = (node, violations) => {
    // Check if statements with single-statement consequent
    if (node.type === 'IfStatement') checkIfStatement(node, violations)

    // Check for loops with single-statement body
    if (isLoopStatement(node) && isSingleStatementBlock(node.body))
        violations.push(createViolation(node.body, 'Remove unnecessary braces from single statement for loop'))

    // Check arrow functions with single return statement
    if (isArrowFunctionWithUnnecessaryBraces(node))
        violations.push(createViolation(node.body, 'Remove unnecessary braces from single-return arrow function'))

    // Check arrow functions with single statement (not return)
    if (isArrowFunctionWithSingleStatement(node))
        violations.push(createViolation(node.body, 'Remove unnecessary braces from single-statement arrow function'))

    // Check function expressions with single statement (not declarations, which require braces)
    if (isFunctionExpressionWithSingleStatement(node))
        violations.push(
            createViolation(node.body, 'Remove unnecessary braces from single-statement function expression'),
        )
}

/**
 * Check for unnecessary braces on single-statement blocks (coding standards)
 * @sig checkUnnecessaryBraces :: (AST?, String, String) -> [Violation]
 */
const checkUnnecessaryBraces = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []

    traverseAST(ast, node => checkNodeForViolations(node, violations))

    return violations
}

/**
 * Check if a node is a loop statement
 * @sig isLoopStatement :: ASTNode -> Boolean
 */
const isLoopStatement = node =>
    node.type === 'ForStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement'

/**
 * Check if a node is an arrow function with unnecessary braces
 * @sig isArrowFunctionWithUnnecessaryBraces :: ASTNode -> Boolean
 */
const isArrowFunctionWithUnnecessaryBraces = node =>
    node.type === 'ArrowFunctionExpression' && node.body.type === 'BlockStatement' && isSingleReturnStatement(node.body)

/**
 * Check if a node is an arrow function with single statement (not return)
 * @sig isArrowFunctionWithSingleStatement :: ASTNode -> Boolean
 */
const isArrowFunctionWithSingleStatement = node =>
    node.type === 'ArrowFunctionExpression' &&
    node.body.type === 'BlockStatement' &&
    isSingleStatementBlock(node.body) &&
    !isSingleReturnStatement(node.body)

/**
 * Check if a node is a function expression with single statement (not declaration)
 * @sig isFunctionExpressionWithSingleStatement :: ASTNode -> Boolean
 */
const isFunctionExpressionWithSingleStatement = node =>
    node.type === 'FunctionExpression' &&
    node.body &&
    node.body.type === 'BlockStatement' &&
    isSingleStatementBlock(node.body)

/**
 * Check if a node is a block statement with only one statement
 * @sig isSingleStatementBlock :: ASTNode -> Boolean
 */
const isSingleStatementBlock = node => node.type === 'BlockStatement' && node.body.length === 1

/**
 * Check if a block statement contains only a single return statement
 * @sig isSingleReturnStatement :: ASTNode -> Boolean
 */
const isSingleReturnStatement = node => {
    if (node.type !== 'BlockStatement' || node.body.length !== 1) return false

    const statement = node.body[0]
    return statement.type === 'ReturnStatement'
}

export { checkUnnecessaryBraces }
