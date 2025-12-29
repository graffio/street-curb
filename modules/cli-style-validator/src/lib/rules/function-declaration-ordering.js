// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { AS } from '../aggregators.js'

const PRIORITY = 4

// Statement types that are not function declarations
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

// ============================================================================
// P: Predicates
// ============================================================================

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
 * @sig isSingleLineFunctionExpression :: ASTNode -> Boolean
 */
const isSingleLineFunctionExpression = node => false

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
    return NON_FUNCTION_STATEMENT_TYPES.has(node.type)
}

const P = {
    isFunctionDeclaration,
    isVariableWithFunctionExpression,
    isSingleLineFunctionExpression,
    isBlockStatement,
    isMultiLineFunctionDeclarator,
    isFunctionStatement,
    isNonFunctionStatement,
}

// ============================================================================
// T: Transformers
// ============================================================================

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
 * Build message explaining why functions should be at top
 * @sig buildFunctionOrderingMessage :: (String, String) -> String
 */
const buildFunctionOrderingMessage = (funcType, funcName) =>
    `${funcType} '${funcName}' must be defined before hooks. ` +
    'FIX: Move the function definition above the first useSelector/useState call. ' +
    'Safe because: closures capture variable bindings, not values - ' +
    'variables will be initialized before the function is called.'

const T = { getFunctionName, buildFunctionOrderingMessage }

// ============================================================================
// F: Factories
// ============================================================================

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

const F = { createViolation }

// ============================================================================
// A: Aggregators
// ============================================================================

/**
 * Process function declaration for violations
 * @sig processFunctionDeclaration :: (ASTNode, [Violation]) -> Void
 */
const processFunctionDeclaration = (statement, violations) => {
    const funcName = T.getFunctionName(statement)
    violations.push(F.createViolation(statement, T.buildFunctionOrderingMessage('Function', funcName)))
}

/**
 * Process individual declarator for function violations
 * @sig processDeclarator :: (ASTNode, [Violation]) -> Void
 */
const processDeclarator = (declarator, violations) => {
    if (!P.isVariableWithFunctionExpression(declarator) || P.isSingleLineFunctionExpression(declarator)) return

    const funcName = T.getFunctionName(declarator)
    const isArrow = declarator.init.type === 'ArrowFunctionExpression'
    const funcType = isArrow ? 'Arrow function' : 'Function'
    violations.push(F.createViolation(declarator, T.buildFunctionOrderingMessage(funcType, funcName)))
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
    if (P.isNonFunctionStatement(statement)) return true
    if (P.isFunctionStatement(statement) && foundNonFunction) processMisplacedFunctionStatement(statement, violations)
    if (statement.type === 'VariableDeclaration' && !P.isFunctionStatement(statement)) return true
    return foundNonFunction
}

/**
 * Process block for function ordering violations
 * @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
 */
const processBlockForViolations = (block, violations) => {
    if (!P.isBlockStatement(block) || !block.body) return
    block.body.reduce((found, stmt) => processStatementReducer(violations, stmt, found), false)
}

const A = {
    processFunctionDeclaration,
    processDeclarator,
    processVariableDeclarationWithFunctions,
    processMisplacedFunctionStatement,
    processStatementReducer,
    processBlockForViolations,
}

// ============================================================================
// V: Validators
// ============================================================================

/**
 * Check for function declaration ordering violations (coding standards)
 * @sig checkFunctionDeclarationOrdering :: (AST?, String, String) -> [Violation]
 */
const checkFunctionDeclarationOrdering = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []
    AS.traverseAST(ast, node => A.processBlockForViolations(node, violations))

    return violations
}

export { checkFunctionDeclarationOrdering }
