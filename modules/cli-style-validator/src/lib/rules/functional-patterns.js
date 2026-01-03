// ABOUTME: Rule to detect imperative loop patterns
// ABOUTME: Enforces functional programming style (no for/while loops)

import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'

const LOOP_TYPES = ['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement']

const P = {
    // Recursively check if node contains an await expression
    // @sig containsAwait :: ASTNode -> Boolean
    containsAwait: node => {
        if (!node) return false
        const {
            type,
            body,
            expression,
            declarations,
            right,
            callee,
            arguments: args,
            object,
            test,
            consequent,
            alternate,
        } = node
        if (type === 'AwaitExpression') return true
        if (type === 'BlockStatement') return body.some(P.containsAwait)
        if (type === 'ExpressionStatement') return P.containsAwait(expression)
        if (type === 'VariableDeclaration') return declarations.some(d => P.containsAwait(d.init))
        if (type === 'AssignmentExpression') return P.containsAwait(right)
        if (type === 'CallExpression') return P.containsAwait(callee) || args.some(P.containsAwait)
        if (type === 'MemberExpression') return P.containsAwait(object)
        if (type === 'IfStatement')
            return P.containsAwait(test) || P.containsAwait(consequent) || P.containsAwait(alternate)
        return false
    },

    // Check if node is a loop (for/while/do-while), excluding async for-of
    // @sig isImperativeLoop :: ASTNode -> Boolean
    isImperativeLoop: node => {
        const { type, body } = node
        if (type === 'ForOfStatement' && P.containsAwait(body)) return false
        return LOOP_TYPES.includes(type)
    },
}

const T = {
    // Convert loop type to fix suggestion message
    // @sig toLoopSuggestion :: String -> String
    toLoopSuggestion: nodeType => {
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
    // Create a violation object from an AST node
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'functional-patterns',
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        message,
        rule: 'functional-patterns',
    }),
}

const V = {
    // Validate that code uses functional patterns instead of loops
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast) return []
        return A.collectViolations(ast)
    },
}

const A = {
    // Check node for loop violations and add to array
    // @sig checkNode :: (ASTNode, [Violation]) -> Void
    checkNode: (node, violations) => {
        if (!P.isImperativeLoop(node)) return
        violations.push(F.createViolation(node, T.toLoopSuggestion(node.type)))
    },

    // Collect all loop violations from AST
    // @sig collectViolations :: AST -> [Violation]
    collectViolations: ast => {
        const violations = []
        AS.traverseAST(ast, node => A.checkNode(node, violations))
        return violations
    },
}

const checkFunctionalPatterns = FS.withExemptions('functional-patterns', V.check)
export { checkFunctionalPatterns }
