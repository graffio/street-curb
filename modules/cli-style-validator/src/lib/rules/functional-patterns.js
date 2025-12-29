// ABOUTME: Rule to detect imperative loop patterns
// ABOUTME: Enforces functional programming style (no for/while loops)

import { AS } from '../aggregators.js'

const P = {
    // @sig containsAwait :: ASTNode -> Boolean
    containsAwait: node => {
        if (!node) return false
        if (node.type === 'AwaitExpression') return true
        if (node.type === 'BlockStatement') return node.body.some(P.containsAwait)
        if (node.type === 'ExpressionStatement') return P.containsAwait(node.expression)
        if (node.type === 'VariableDeclaration') return node.declarations.some(d => P.containsAwait(d.init))
        if (node.type === 'AssignmentExpression') return P.containsAwait(node.right)
        if (node.type === 'CallExpression') return P.containsAwait(node.callee) || node.arguments.some(P.containsAwait)
        if (node.type === 'MemberExpression') return P.containsAwait(node.object)
        if (node.type === 'IfStatement')
            return P.containsAwait(node.test) || P.containsAwait(node.consequent) || P.containsAwait(node.alternate)
        return false
    },

    // @sig isImperativeLoop :: ASTNode -> Boolean
    isImperativeLoop: node => {
        if (node.type === 'ForOfStatement' && P.containsAwait(node.body)) return false
        return ['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement'].includes(
            node.type,
        )
    },
}

const T = {
    // @sig getSuggestionForLoop :: String -> String
    getSuggestionForLoop: nodeType => {
        if (nodeType === 'ForStatement') return 'Replace for loop with map/filter/reduce functional patterns'
        if (nodeType === 'WhileStatement') return 'Replace while loop with map/filter/reduce or early returns'
        if (nodeType === 'DoWhileStatement') return 'Replace do-while loop with map/filter/reduce or early returns'
        if (nodeType === 'ForInStatement')
            return 'Replace for-in loop with Object.entries/keys/values and functional patterns'
        if (nodeType === 'ForOfStatement') return 'Replace for-of loop with map/filter/reduce functional patterns'
        return 'Replace imperative loop with functional patterns'
    },
}

const F = {
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'functional-patterns',
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        message,
        rule: 'functional-patterns',
    }),
}

const A = {
    // @sig processNodeForViolations :: (ASTNode, [Violation]) -> Void
    processNodeForViolations: (node, violations) => {
        if (!P.isImperativeLoop(node)) return
        violations.push(F.createViolation(node, T.getSuggestionForLoop(node.type)))
    },
}

const V = {
    // @sig checkFunctionalPatterns :: (AST?, String, String) -> [Violation]
    checkFunctionalPatterns: (ast, sourceCode, filePath) => {
        if (!ast) return []
        const violations = []
        AS.traverseAST(ast, node => A.processNodeForViolations(node, violations))
        return violations
    },
}

const checkFunctionalPatterns = V.checkFunctionalPatterns
export { checkFunctionalPatterns }
