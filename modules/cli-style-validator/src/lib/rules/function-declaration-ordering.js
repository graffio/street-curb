// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { AS } from '../aggregators.js'

const PRIORITY = 4

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

const P = {
    // @sig isFunctionDeclaration :: ASTNode -> Boolean
    isFunctionDeclaration: node => node.type === 'FunctionDeclaration',

    // @sig isVariableWithFunctionExpression :: ASTNode -> Boolean
    isVariableWithFunctionExpression: node =>
        node.type === 'VariableDeclarator' &&
        node.init &&
        (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression'),

    // @sig isSingleLineFunctionExpression :: ASTNode -> Boolean
    isSingleLineFunctionExpression: node => false,

    // @sig isBlockStatement :: ASTNode -> Boolean
    isBlockStatement: node => node.type === 'BlockStatement',

    // @sig isMultiLineFunctionDeclarator :: ASTNode -> Boolean
    isMultiLineFunctionDeclarator: declarator =>
        P.isVariableWithFunctionExpression(declarator) && !P.isSingleLineFunctionExpression(declarator),

    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => {
        if (P.isFunctionDeclaration(node)) return true
        if (node.type === 'VariableDeclaration') return node.declarations.some(P.isMultiLineFunctionDeclarator)
        return false
    },

    // @sig isNonFunctionStatement :: ASTNode -> Boolean
    isNonFunctionStatement: node => {
        if (!node || P.isFunctionStatement(node)) return false
        return NON_FUNCTION_STATEMENT_TYPES.has(node.type)
    },
}

const T = {
    // @sig buildFunctionOrderingMessage :: (String, String) -> String
    buildFunctionOrderingMessage: (funcType, funcName) =>
        `${funcType} '${funcName}' must be defined before hooks. ` +
        'FIX: Move the function definition above the first useSelector/useState call. ' +
        'Safe because: closures capture variable bindings, not values - ' +
        'variables will be initialized before the function is called.',
}

const F = {
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'function-declaration-ordering',
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        priority: PRIORITY,
        message,
        rule: 'function-declaration-ordering',
    }),
}

const V = {
    // @sig checkFunctionDeclarationOrdering :: (AST?, String, String) -> [Violation]
    checkFunctionDeclarationOrdering: (ast, sourceCode, filePath) => {
        if (!ast) return []
        const violations = []
        AS.traverseAST(ast, node => A.processBlockForViolations(node, violations))
        return violations
    },
}

const A = {
    // @sig processFunctionDeclaration :: (ASTNode, [Violation]) -> Void
    processFunctionDeclaration: (statement, violations) => {
        const funcName = AS.getFunctionName(statement)
        violations.push(F.createViolation(statement, T.buildFunctionOrderingMessage('Function', funcName)))
    },

    // @sig processDeclarator :: (ASTNode, [Violation]) -> Void
    processDeclarator: (declarator, violations) => {
        if (!P.isVariableWithFunctionExpression(declarator) || P.isSingleLineFunctionExpression(declarator)) return
        const funcName = AS.getFunctionName(declarator)
        const funcType = declarator.init.type === 'ArrowFunctionExpression' ? 'Arrow function' : 'Function'
        violations.push(F.createViolation(declarator, T.buildFunctionOrderingMessage(funcType, funcName)))
    },

    // @sig processVariableDeclarationWithFunctions :: (ASTNode, [Violation]) -> Void
    processVariableDeclarationWithFunctions: (statement, violations) =>
        statement.declarations.forEach(declarator => A.processDeclarator(declarator, violations)),

    // @sig processMisplacedFunctionStatement :: (ASTNode, [Violation]) -> Void
    processMisplacedFunctionStatement: (statement, violations) => {
        if (statement.type === 'FunctionDeclaration') {
            A.processFunctionDeclaration(statement, violations)
            return
        }
        if (statement.type === 'VariableDeclaration') A.processVariableDeclarationWithFunctions(statement, violations)
    },

    // @sig processStatementReducer :: ([Violation], ASTNode, Boolean) -> Boolean
    processStatementReducer: (violations, statement, foundNonFunction) => {
        if (P.isNonFunctionStatement(statement)) return true
        if (P.isFunctionStatement(statement) && foundNonFunction)
            A.processMisplacedFunctionStatement(statement, violations)
        if (statement.type === 'VariableDeclaration' && !P.isFunctionStatement(statement)) return true
        return foundNonFunction
    },

    // @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
    processBlockForViolations: (block, violations) => {
        if (!P.isBlockStatement(block) || !block.body) return
        block.body.reduce((found, stmt) => A.processStatementReducer(violations, stmt, found), false)
    },
}

const checkFunctionDeclarationOrdering = V.checkFunctionDeclarationOrdering
export { checkFunctionDeclarationOrdering }
