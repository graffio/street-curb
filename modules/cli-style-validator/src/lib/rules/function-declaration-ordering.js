// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { traverseAST } from '../aggregators.js'

const PRIORITY = 4

/**
 * Create a function-declaration-ordering violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'function-declaration-ordering',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    priority: PRIORITY,
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
    const { type, id } = node
    if (type === 'FunctionDeclaration') return id ? id.name : '<anonymous>'
    if (type === 'VariableDeclarator') return id ? id.name : '<anonymous>'
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

// Statement types that are not function declarations
// @sig NON_FUNCTION_STATEMENT_TYPES :: Set<String>
const NON_FUNCTION_STATEMENT_TYPES = new Set([
    'VariableDeclaration',
    'ExpressionStatement',
    'ReturnStatement',
    'IfStatement',
    'ForStatement',
    'WhileStatement',
    'DoWhileStatement',
    'ForInStatement',
    'ForOfStatement',
    'TryStatement',
    'ThrowStatement',
    'BreakStatement',
    'ContinueStatement',
])

/**
 * Check if statement is a variable declaration or executable statement
 * @sig isNonFunctionStatement :: ASTNode -> Boolean
 */
const isNonFunctionStatement = node => {
    if (!node) return false
    if (isFunctionStatement(node)) return false
    return NON_FUNCTION_STATEMENT_TYPES.has(node.type)
}

// Build message explaining why functions should be at top
// @sig buildFunctionOrderingMessage :: (String, String) -> String
const buildFunctionOrderingMessage = (funcType, funcName) =>
    `${funcType} '${funcName}' must be defined before hooks. ` +
    'FIX: Move the function definition above the first useSelector/useState call. ' +
    'Safe because: closures capture variable bindings, not values - ' +
    'variables will be initialized before the function is called.'

/**
 * Process function declaration for violations
 * @sig processFunctionDeclaration :: (ASTNode, [Violation]) -> Void
 */
const processFunctionDeclaration = (statement, violations) => {
    const funcName = getFunctionName(statement)
    violations.push(createViolation(statement, buildFunctionOrderingMessage('Function', funcName)))
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
    violations.push(createViolation(declarator, buildFunctionOrderingMessage(funcType, funcName)))
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
 * Process statement and return whether a non-function was found
 * @sig processStatementReducer :: ([Violation], ASTNode, Boolean) -> Boolean
 */
const processStatementReducer = (violations, statement, foundNonFunction) => {
    if (isNonFunctionStatement(statement)) return true

    if (isFunctionStatement(statement) && foundNonFunction) processMisplacedFunctionStatement(statement, violations)

    // Variable declarations without functions also mark as non-function found
    if (statement.type === 'VariableDeclaration' && !isFunctionStatement(statement)) return true

    return foundNonFunction
}

/**
 * Process block for function ordering violations
 * @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
 */
const processBlockForViolations = (block, violations) => {
    if (!isBlockStatement(block) || !block.body) return

    block.body.reduce((found, stmt) => processStatementReducer(violations, stmt, found), false)
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
