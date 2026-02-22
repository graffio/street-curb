// ABOUTME: Rule to detect imperative loop patterns
// ABOUTME: Enforces functional programming style (no for/while loops)

import { Ast, AstNode } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if node is a loop (for/while/do-while), excluding async for-of
    // @sig isImperativeLoop :: AstNode -> Boolean
    isImperativeLoop: node => {
        if (ForOfStatement.is(node) && Ast.bodyContainsAwait(node)) return false
        return PS.isLoop(node)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Convert loop node to fix suggestion message
    // @sig toLoopSuggestion :: AstNode -> String
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a violation from an AST node
    // @sig createViolation :: (AstNode, String) -> Violation
    createViolation: (node, message) => violation(node.line, node.column, message),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Validate that code uses functional patterns instead of loops
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []
        return A.collectViolations(ast)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Check node for loop violations and add to array
    // @sig checkNode :: (AstNode, [Violation]) -> Void
    checkNode: (node, violations) => {
        if (!P.isImperativeLoop(node)) return
        violations.push(F.createViolation(node, T.toLoopSuggestion(node)))
    },

    // Collect all loop violations from AST
    // @sig collectViolations :: AST -> [Violation]
    collectViolations: ast => {
        const violations = []
        Ast.from(ast).forEach(node => A.checkNode(node, violations))
        return violations
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const { DoWhileStatement, ForInStatement, ForOfStatement, ForStatement, WhileStatement } = AstNode

const violation = FS.createViolation('functional-patterns', 1)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run functional-patterns rule with COMPLEXITY exemption support
// @sig checkFunctionalPatterns :: (AST?, String, String) -> [Violation]
const checkFunctionalPatterns = (ast, sourceCode, filePath) =>
    FS.withExemptions('functional-patterns', V.check, ast, sourceCode, filePath)
export { checkFunctionalPatterns }
