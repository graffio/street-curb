// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { AS } from '../aggregators.js'
import { FS } from '../factories.js'
import { PS } from '../predicates.js'

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
    // Check if node is a variable declarator with function value
    // @sig isVariableWithFunctionExpression :: ASTNode -> Boolean
    isVariableWithFunctionExpression: node =>
        node.type === 'VariableDeclarator' &&
        node.init &&
        (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression'),

    // Check if statement declares a function (multiline only for this rule)
    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => {
        if (PS.isFunctionDeclaration(node)) return true
        if (node.type === 'VariableDeclaration') return node.declarations.some(P.isVariableWithFunctionExpression)
        return false
    },

    // Check if statement is executable (not a function)
    // @sig isNonFunctionStatement :: ASTNode -> Boolean
    isNonFunctionStatement: node => {
        if (!node || P.isFunctionStatement(node)) return false
        return NON_FUNCTION_STATEMENT_TYPES.has(node.type)
    },
}

const T = {
    // Build error message explaining why function must be moved
    // @sig buildFunctionOrderingMessage :: (String, String) -> String
    buildFunctionOrderingMessage: (funcType, funcName) =>
        `${funcType} '${funcName}' must be defined before hooks. ` +
        'FIX: Move the function definition above the first useSelector/useState call. ' +
        'Safe because: closures capture variable bindings, not values - ' +
        'variables will be initialized before the function is called.',
}

const F = {
    // Create a violation object from an AST node
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
    // Validate that functions are declared before executable statements
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast) return []
        const violations = []
        AS.traverseAST(ast, node => A.processBlockForViolations(node, violations))
        return violations
    },
}

const A = {
    // Add violation for misplaced variable function declarator
    // @sig processDeclarator :: (ASTNode, [Violation]) -> Void
    processDeclarator: (declarator, violations) => {
        if (!P.isVariableWithFunctionExpression(declarator)) return
        const funcName = AS.getFunctionName(declarator)
        const funcType = declarator.init.type === 'ArrowFunctionExpression' ? 'Arrow function' : 'Function'
        violations.push(F.createViolation(declarator, T.buildFunctionOrderingMessage(funcType, funcName)))
    },

    // Route misplaced function to appropriate processor
    // @sig processMisplacedFunctionStatement :: (ASTNode, [Violation]) -> Void
    processMisplacedFunctionStatement: (statement, violations) => {
        const { type, declarations } = statement
        if (type === 'FunctionDeclaration') {
            const funcName = AS.getFunctionName(statement)
            return violations.push(F.createViolation(statement, T.buildFunctionOrderingMessage('Function', funcName)))
        }
        if (type === 'VariableDeclaration') declarations.forEach(d => A.processDeclarator(d, violations))
    },

    // Reducer to track non-function statements and flag misplaced functions
    // @sig processStatementReducer :: ([Violation], ASTNode, Boolean) -> Boolean
    processStatementReducer: (violations, statement, foundNonFunction) => {
        if (P.isNonFunctionStatement(statement)) return true
        if (P.isFunctionStatement(statement) && foundNonFunction)
            A.processMisplacedFunctionStatement(statement, violations)
        if (statement.type === 'VariableDeclaration' && !P.isFunctionStatement(statement)) return true
        return foundNonFunction
    },

    // Check all statements in a block for ordering violations
    // @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
    processBlockForViolations: (block, violations) => {
        if (!PS.isBlockStatement(block) || !block.body) return
        block.body.reduce((found, stmt) => A.processStatementReducer(violations, stmt, found), false)
    },
}

const checkFunctionDeclarationOrdering = FS.withExemptions('function-declaration-ordering', V.check)
export { checkFunctionDeclarationOrdering }
