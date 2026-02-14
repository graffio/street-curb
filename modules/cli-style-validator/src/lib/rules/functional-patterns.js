// ABOUTME: Rule to detect imperative loop patterns
// ABOUTME: Enforces functional programming style (no for/while loops)

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const { DoWhileStatement, ForInStatement, ForOfStatement, ForStatement, WhileStatement } = ASTNode

const P = {
    // Check if node is a loop type
    // @sig isLoop :: ASTNode -> Boolean
    isLoop: node =>
        ForStatement.is(node) ||
        WhileStatement.is(node) ||
        DoWhileStatement.is(node) ||
        ForInStatement.is(node) ||
        ForOfStatement.is(node),

    // Check if node is a loop (for/while/do-while), excluding async for-of
    // @sig isImperativeLoop :: ASTNode -> Boolean
    isImperativeLoop: node => {
        if (ForOfStatement.is(node) && AST.bodyContainsAwait(node)) return false
        return P.isLoop(node)
    },
}

const T = {
    // Convert loop node to fix suggestion message
    // @sig toLoopSuggestion :: ASTNode -> String
    toLoopSuggestion: node => {
        if (ForStatement.is(node)) return 'Replace for loop with map/filter/reduce functional patterns'
        if (WhileStatement.is(node)) return 'Replace while loop with map/filter/reduce or early returns'
        if (DoWhileStatement.is(node)) return 'Replace do-while loop with map/filter/reduce or early returns'
        if (ForInStatement.is(node))
            return 'Replace for-in loop with Object.entries/keys/values and functional patterns'
        if (ForOfStatement.is(node)) return 'Replace for-of loop with map/filter/reduce functional patterns'
        return 'Replace imperative loop with functional patterns'
    },
}

const F = {
    // Create a violation object from an AST node
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'functional-patterns',
        line: node.line,
        column: node.column,
        message,
        rule: 'functional-patterns',
    }),
}

const V = {
    // Validate that code uses functional patterns instead of loops
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []
        return A.collectViolations(ast)
    },
}

const A = {
    // Check node for loop violations and add to array
    // @sig checkNode :: (ASTNode, [Violation]) -> Void
    checkNode: (node, violations) => {
        if (!P.isImperativeLoop(node)) return
        violations.push(F.createViolation(node, T.toLoopSuggestion(node)))
    },

    // Collect all loop violations from AST
    // @sig collectViolations :: AST -> [Violation]
    collectViolations: ast => {
        const violations = []
        AST.from(ast).forEach(node => A.checkNode(node, violations))
        return violations
    },
}

const checkFunctionalPatterns = FS.withExemptions('functional-patterns', V.check)
export { checkFunctionalPatterns }
