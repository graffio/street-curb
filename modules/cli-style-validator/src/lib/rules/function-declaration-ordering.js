// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { traverseAST } from '../traverse.js'

/**
 * Create a function-declaration-ordering violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'function-declaration-ordering',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    message,
    rule: 'function-declaration-ordering',
})

/**
 * Check if node is a function declaration
 * @sig isFunctionDeclaration :: ASTNode -> Boolean
 */
const isFunctionDeclaration = node => node.type === 'FunctionDeclaration'

/**
 * Check if node is a variable declarator with function expression
 * @sig isVariableWithFunctionExpression :: ASTNode -> Boolean
 */
const isVariableWithFunctionExpression = node =>
    node.type === 'VariableDeclarator' &&
    node.init &&
    (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')

/**
 * Check if function expression is single-line anonymous (allowed inline per coding standards)
 * Named function variables should always be treated as function declarations
 * Only truly anonymous inline functions (callbacks) are allowed to remain inline
 * @sig isSingleLineFunctionExpression :: ASTNode -> Boolean
 */
const isSingleLineFunctionExpression = node =>
    // Named function variables (const funcName = () => {}) should never be considered inline
    // This function should return false for all VariableDeclarator nodes
    // Only anonymous callbacks like data.filter(user => user.isActive) should be inline
    false

/**
 * Get function name from node
 * @sig getFunctionName :: ASTNode -> String
 */
const getFunctionName = node => {
    if (node.type === 'FunctionDeclaration') return node.id ? node.id.name : '<anonymous>'
    if (node.type === 'VariableDeclarator') return node.id ? node.id.name : '<anonymous>'
    return '<anonymous>'
}

/**
 * Check if node is a block statement that can contain functions
 * @sig isBlockStatement :: ASTNode -> Boolean
 */
const isBlockStatement = node => node.type === 'BlockStatement'

/**
 * Check if declarator contains multi-line function
 * @sig isMultiLineFunctionDeclarator :: ASTNode -> Boolean
 */
const isMultiLineFunctionDeclarator = declarator =>
    isVariableWithFunctionExpression(declarator) && !isSingleLineFunctionExpression(declarator)

/**
 * Check if statement is a multi-line function-related statement
 * @sig isFunctionStatement :: ASTNode -> Boolean
 */
const isFunctionStatement = node => {
    if (isFunctionDeclaration(node)) return true

    if (node.type === 'VariableDeclaration') return node.declarations.some(isMultiLineFunctionDeclarator)

    return false
}

/**
 * Check if statement is a variable declaration or executable statement
 * @sig isNonFunctionStatement :: ASTNode -> Boolean
 */
const isNonFunctionStatement = node => {
    if (!node) return false
    if (isFunctionStatement(node)) return false

    return (
        node.type === 'VariableDeclaration' ||
        node.type === 'ExpressionStatement' ||
        node.type === 'ReturnStatement' ||
        node.type === 'IfStatement' ||
        node.type === 'ForStatement' ||
        node.type === 'WhileStatement' ||
        node.type === 'DoWhileStatement' ||
        node.type === 'ForInStatement' ||
        node.type === 'ForOfStatement' ||
        node.type === 'TryStatement' ||
        node.type === 'ThrowStatement' ||
        node.type === 'BreakStatement' ||
        node.type === 'ContinueStatement'
    )
}

/**
 * Process function declaration for violations
 * @sig processFunctionDeclaration :: (ASTNode, [Violation]) -> Void
 */
const processFunctionDeclaration = (statement, violations) => {
    const funcName = getFunctionName(statement)
    const message = `Function '${funcName}' should be defined at the top of its containing block`
    violations.push(createViolation(statement, message))
}

/**
 * Process individual declarator for function violations
 * @sig processDeclarator :: (ASTNode, [Violation]) -> Void
 */
const processDeclarator = (declarator, violations) => {
    if (!isVariableWithFunctionExpression(declarator) || isSingleLineFunctionExpression(declarator)) return

    const funcName = getFunctionName(declarator)
    const isArrow = declarator.init.type === 'ArrowFunctionExpression'
    const funcType = isArrow ? 'Arrow function' : 'Function'
    const message = `${funcType} '${funcName}' should be defined at the top of its containing block`
    violations.push(createViolation(declarator, message))
}

/**
 * Process variable declaration with function expressions for violations
 * @sig processVariableDeclarationWithFunctions :: (ASTNode, [Violation]) -> Void
 */
const processVariableDeclarationWithFunctions = (statement, violations) =>
    statement.declarations.forEach(declarator => processDeclarator(declarator, violations))

/**
 * Process function statement that appears after non-function statements
 * @sig processMisplacedFunctionStatement :: (ASTNode, [Violation]) -> Void
 */
const processMisplacedFunctionStatement = (statement, violations) => {
    if (statement.type === 'FunctionDeclaration') {
        processFunctionDeclaration(statement, violations)
        return
    }

    if (statement.type === 'VariableDeclaration') processVariableDeclarationWithFunctions(statement, violations)
}

/**
 * Process individual statement in block
 * @sig processStatement :: (ASTNode, [Violation], Object) -> Void
 */
const processStatement = (statement, violations, tracker) => {
    if (isNonFunctionStatement(statement)) {
        tracker.foundNonFunction = true
        return
    }

    if (isFunctionStatement(statement) && tracker.foundNonFunction)
        processMisplacedFunctionStatement(statement, violations)

    // Also check if this is a variable declaration with function that comes after non-function
    if (statement.type === 'VariableDeclaration' && !isFunctionStatement(statement)) tracker.foundNonFunction = true
}

/**
 * Process block for function ordering violations
 * @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
 */
const processBlockForViolations = (block, violations) => {
    if (!isBlockStatement(block) || !block.body) return

    const statements = block.body
    const tracker = { foundNonFunction: false }

    statements.forEach(statement => processStatement(statement, violations, tracker))
}

/**
 * Check for function declaration ordering violations (coding standards)
 * @sig checkFunctionDeclarationOrdering :: (AST?, String, String) -> [Violation]
 */
const checkFunctionDeclarationOrdering = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []

    traverseAST(ast, node => processBlockForViolations(node, violations))

    return violations
}

export { checkFunctionDeclarationOrdering }
