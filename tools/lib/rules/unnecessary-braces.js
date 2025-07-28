/**
 * Traverse AST node and visit all child nodes
 * @sig traverseAST :: (ASTNode, (ASTNode) -> Void) -> Void
 */
const traverseAST = (node, visitor) => {
    if (!node || typeof node !== 'object') return

    visitor(node)

    for (const key in node) {
        const child = node[key]
        if (Array.isArray(child)) child.forEach(item => traverseAST(item, visitor))
        else if (child && typeof child === 'object' && child.type) traverseAST(child, visitor)
    }
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
 * Check for unnecessary braces on single-statement blocks (A001 standard)
 * @sig checkUnnecessaryBraces :: (AST?, String, String) -> [Violation]
 */
const checkUnnecessaryBraces = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []

    traverseAST(ast, node => {
        // Check if statements with single-statement consequent
        if (node.type === 'IfStatement') {
            if (isSingleStatementBlock(node.consequent))
                violations.push(
                    createViolation(node.consequent, 'Remove unnecessary braces from single statement if block'),
                )

            // Check else block if it exists
            if (node.alternate && isSingleStatementBlock(node.alternate))
                violations.push(
                    createViolation(node.alternate, 'Remove unnecessary braces from single statement else block'),
                )
        }

        // Check for loops with single-statement body
        if (isLoopStatement(node) && isSingleStatementBlock(node.body))
            violations.push(createViolation(node.body, 'Remove unnecessary braces from single statement for loop'))

        // Check arrow functions with single return statement
        if (isArrowFunctionWithUnnecessaryBraces(node))
            violations.push(createViolation(node.body, 'Remove unnecessary braces from single-return arrow function'))
    })

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
