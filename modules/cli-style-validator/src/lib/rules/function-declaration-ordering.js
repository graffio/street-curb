// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { AST, ASTNode } from '@graffio/ast'
import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const { ArrowFunctionExpression, BreakStatement, ContinueStatement, DoWhileStatement } = ASTNode
const { ExpressionStatement, ForInStatement, ForOfStatement, ForStatement, FunctionDeclaration } = ASTNode
const { FunctionExpression, IfStatement, ReturnStatement, ThrowStatement, TryStatement } = ASTNode
const { VariableDeclaration, VariableDeclarator, WhileStatement } = ASTNode

const PRIORITY = 4

const P = {
    // Check if node is a variable declarator with function value (works on wrapped nodes)
    // @sig isVariableWithFunctionExpression :: ASTNode -> Boolean
    isVariableWithFunctionExpression: node => {
        if (!VariableDeclarator.is(node)) return false
        const init = node.value
        if (!init) return false
        return ArrowFunctionExpression.is(init) || FunctionExpression.is(init)
    },

    // Check if statement declares a function (multiline only for this rule)
    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => {
        if (PS.isFunctionDeclaration(node)) return true
        if (VariableDeclaration.is(node)) {
            const init = node.firstValue
            if (!init) return false
            return ArrowFunctionExpression.is(init) || FunctionExpression.is(init)
        }
        return false
    },

    // Check if node is a non-function statement type
    // @sig isNonFunctionStatementType :: ASTNode -> Boolean
    isNonFunctionStatementType: node =>
        VariableDeclaration.is(node) ||
        ExpressionStatement.is(node) ||
        ReturnStatement.is(node) ||
        IfStatement.is(node) ||
        ForStatement.is(node) ||
        WhileStatement.is(node) ||
        DoWhileStatement.is(node) ||
        ForInStatement.is(node) ||
        ForOfStatement.is(node) ||
        TryStatement.is(node) ||
        ThrowStatement.is(node) ||
        BreakStatement.is(node) ||
        ContinueStatement.is(node),

    // Check if statement is executable (not a function)
    // @sig isNonFunctionStatement :: ASTNode -> Boolean
    isNonFunctionStatement: node => {
        if (!node || P.isFunctionStatement(node)) return false
        return P.isNonFunctionStatementType(node)
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
        line: node.line,
        column: node.column,
        priority: PRIORITY,
        message,
        rule: 'function-declaration-ordering',
    }),
}

const V = {
    // Validate that functions are declared before executable statements
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []
        const violations = []
        AST.from(ast).forEach(node => A.processBlockForViolations(node, violations))
        return violations
    },
}

const A = {
    // Add violation for misplaced variable function declarator
    // @sig processDeclarator :: (ASTNode, [Violation]) -> Void
    processDeclarator: (declarator, violations) => {
        if (!P.isVariableWithFunctionExpression(declarator)) return
        const funcName = AS.getFunctionName(declarator)
        const init = declarator.value
        const funcType = ArrowFunctionExpression.is(init) ? 'Arrow function' : 'Function'
        violations.push(F.createViolation(declarator, T.buildFunctionOrderingMessage(funcType, funcName)))
    },

    // Route misplaced function to appropriate processor
    // @sig processMisplacedFunctionStatement :: (ASTNode, [Violation]) -> Void
    processMisplacedFunctionStatement: (statement, violations) => {
        if (FunctionDeclaration.is(statement)) {
            const funcName = AS.getFunctionName(statement)
            return violations.push(F.createViolation(statement, T.buildFunctionOrderingMessage('Function', funcName)))
        }
        if (VariableDeclaration.is(statement)) {
            const decls = statement.declarations
            decls.forEach(d => A.processDeclarator(d, violations))
        }
    },

    // Reducer to track non-function statements and flag misplaced functions
    // @sig processStatementReducer :: ([Violation], ASTNode, Boolean) -> Boolean
    processStatementReducer: (violations, statement, foundNonFunction) => {
        if (P.isNonFunctionStatement(statement)) return true
        if (P.isFunctionStatement(statement) && foundNonFunction)
            A.processMisplacedFunctionStatement(statement, violations)
        if (VariableDeclaration.is(statement) && !P.isFunctionStatement(statement)) return true
        return foundNonFunction
    },

    // Check all statements in a block for ordering violations
    // @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
    processBlockForViolations: (block, violations) => {
        if (!PS.isBlockStatement(block)) return
        const body = block.body
        body.reduce((found, stmt) => A.processStatementReducer(violations, stmt, found), false)
    },
}

const checkFunctionDeclarationOrdering = FS.withExemptions('function-declaration-ordering', V.check)
export { checkFunctionDeclarationOrdering }
