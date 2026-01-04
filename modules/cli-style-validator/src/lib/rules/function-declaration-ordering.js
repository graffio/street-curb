// ABOUTME: Rule to detect functions defined after non-function statements
// ABOUTME: Enforces functions-at-top-of-block coding standard

import { AST, ASTNode } from '@graffio/ast'
import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

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
    // Check if node is a variable declarator with function value (works on wrapped nodes)
    // @sig isVariableWithFunctionExpression :: ASTNode -> Boolean
    isVariableWithFunctionExpression: node => {
        if (!AST.hasType(node, 'VariableDeclarator')) return false
        const init = AST.rhs(node)
        if (!init) return false
        return init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression'
    },

    // Check if statement declares a function (multiline only for this rule)
    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => {
        if (PS.isFunctionDeclaration(node)) return true
        if (AST.hasType(node, 'VariableDeclaration')) {
            const decls = AST.declarations(node)
            return decls.some(d => {
                const init = d.init
                return init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')
            })
        }
        return false
    },

    // Check if statement is executable (not a function)
    // @sig isNonFunctionStatement :: ASTNode -> Boolean
    isNonFunctionStatement: node => {
        if (!node || P.isFunctionStatement(node)) return false
        return NON_FUNCTION_STATEMENT_TYPES.has(AST.nodeType(node))
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
        line: AST.line(node),
        column: AST.column(node),
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
        const init = AST.rhs(declarator)
        const funcType = init.type === 'ArrowFunctionExpression' ? 'Arrow function' : 'Function'
        violations.push(F.createViolation(declarator, T.buildFunctionOrderingMessage(funcType, funcName)))
    },

    // Route misplaced function to appropriate processor
    // @sig processMisplacedFunctionStatement :: (ASTNode, [Violation]) -> Void
    processMisplacedFunctionStatement: (statement, violations) => {
        if (AST.hasType(statement, 'FunctionDeclaration')) {
            const funcName = AS.getFunctionName(statement)
            return violations.push(F.createViolation(statement, T.buildFunctionOrderingMessage('Function', funcName)))
        }
        if (AST.hasType(statement, 'VariableDeclaration')) {
            const decls = AST.declarations(statement)
            decls.forEach(d => A.processDeclaratorRaw(d, violations))
        }
    },

    // Process raw declarator for function expressions
    // @sig processDeclaratorRaw :: (ESTreeDeclarator, [Violation]) -> Void
    processDeclaratorRaw: (rawDecl, violations) => {
        const init = rawDecl.init
        if (!init) return
        if (init.type !== 'ArrowFunctionExpression' && init.type !== 'FunctionExpression') return
        const funcName = rawDecl.id?.name || '<anonymous>'
        const funcType = init.type === 'ArrowFunctionExpression' ? 'Arrow function' : 'Function'
        violations.push({
            type: 'function-declaration-ordering',
            line: rawDecl.loc?.start?.line || 1,
            column: (rawDecl.loc?.start?.column || 0) + 1,
            priority: PRIORITY,
            message: T.buildFunctionOrderingMessage(funcType, funcName),
            rule: 'function-declaration-ordering',
        })
    },

    // Reducer to track non-function statements and flag misplaced functions
    // @sig processStatementReducer :: ([Violation], ASTNode, Boolean) -> Boolean
    processStatementReducer: (violations, statement, foundNonFunction) => {
        if (P.isNonFunctionStatement(statement)) return true
        if (P.isFunctionStatement(statement) && foundNonFunction)
            A.processMisplacedFunctionStatement(statement, violations)
        if (AST.hasType(statement, 'VariableDeclaration') && !P.isFunctionStatement(statement)) return true
        return foundNonFunction
    },

    // Check all statements in a block for ordering violations
    // @sig processBlockForViolations :: (ASTNode, [Violation]) -> Void
    processBlockForViolations: (block, violations) => {
        if (!PS.isBlockStatement(block)) return
        const body = AST.blockStatements(block)
        body.reduce((found, rawStmt) => {
            const stmt = ASTNode.wrap(rawStmt)
            return A.processStatementReducer(violations, stmt, found)
        }, false)
    },
}

const checkFunctionDeclarationOrdering = FS.withExemptions('function-declaration-ordering', V.check)
export { checkFunctionDeclarationOrdering }
