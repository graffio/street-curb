// ABOUTME: Rule to detect nested indentation (>1 level deep)
// ABOUTME: Enforces single-level indentation via early returns and extraction

import { AST, ASTNode } from '@graffio/ast'
import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 2

const CALLBACK_EXTRACTION_MESSAGE =
    'Extract multi-line unnamed function to a named function. ' +
    'FIX: Move the callback body to a named function in the appropriate module-level cohesion group (P/T/F/V/A). ' +
    'For Promise executors: extract to a function that receives resolve/reject as parameters. ' +
    "For .map() callbacks: if it doesn't fit on one line with .map(), extract it."

const NESTED_INDENTATION_MESSAGE =
    'Nested indentation detected. ' +
    'FIX: Extract the nested block to a named function in the appropriate cohesion group ' +
    '(P/T/F/V/A), or use early returns to flatten the logic.'

const P = {
    // Check if node is a control flow statement that increases indentation
    // @sig isIndentationStatement :: ASTNode -> Boolean
    isIndentationStatement: node =>
        ASTNode.IfStatement.is(node) ||
        ASTNode.ForStatement.is(node) ||
        ASTNode.WhileStatement.is(node) ||
        ASTNode.ForInStatement.is(node) ||
        ASTNode.ForOfStatement.is(node) ||
        ASTNode.SwitchStatement.is(node),

    // Check if node type is allowed to nest without counting as indentation
    // @sig isAllowedNesting :: ASTNode -> Boolean
    isAllowedNesting: node =>
        ASTNode.TryStatement.is(node) ||
        ASTNode.CatchClause.is(node) ||
        ASTNode.ObjectExpression.is(node) ||
        ASTNode.ArrayExpression.is(node) ||
        ASTNode.JSXElement.is(node) ||
        ASTNode.JSXFragment.is(node),
}

const T = {
    // Calculate next depth based on node type
    // @sig toNextDepth :: (ASTNode, Number) -> Number
    toNextDepth: (node, depth) => {
        if (P.isAllowedNesting(node)) return depth
        if (P.isIndentationStatement(node)) return depth + 1
        return depth
    },
}

const F = {
    // Create a single-level-indentation violation at node location
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'single-level-indentation',
        line: node.line,
        column: node.column,
        priority: PRIORITY,
        message,
        rule: 'single-level-indentation',
    }),
}

const V = {
    // Validate callback functions should be extracted if multiline
    // @sig checkCallbackFunction :: (ASTNode, ASTNode, [Violation]) -> Void
    checkCallbackFunction: (node, ast, violations) => {
        if (!PS.isFunctionNode(node) || !AS.isCallbackFunction(node) || PS.isJSXFunction(node)) return
        if (AS.countFunctionLines(node) > 1) violations.push(F.createViolation(node, CALLBACK_EXTRACTION_MESSAGE))
    },

    // Validate a function node for nested indentation violations
    // @sig checkFunctionNode :: (ASTNode, Set, [Violation]) -> Void
    checkFunctionNode: (node, processedNodes, violations) => {
        if (!PS.isFunctionWithBlockBody(node)) return
        const body = node.body
        if (body) A.findNestedViolations(body, 0, processedNodes, violations)
    },
}

const A = {
    // Process a child node for violations, resetting depth at function boundaries
    // @sig processChildForViolations :: (ASTNode, Number, Set, [Violation]) -> Void
    processChildForViolations: (node, nextDepth, processedNodes, violations) => {
        if (PS.isFunctionWithBlockBody(node)) {
            const body = node.body
            if (body) return A.findNestedViolations(body, 0, processedNodes, violations)
            return
        }
        if (!PS.isFunctionNode(node)) A.findNestedViolations(node, nextDepth, processedNodes, violations)
    },

    // Recursively find nested indentation violations in a node subtree
    // @sig findNestedViolations :: (ASTNode, Number, Set, [Violation]) -> Void
    findNestedViolations: (node, depth, processedNodes, violations) => {
        if (!node || processedNodes.has(node.identity)) return
        processedNodes.add(node.identity)

        if (depth > 0 && P.isIndentationStatement(node))
            violations.push(F.createViolation(node, NESTED_INDENTATION_MESSAGE))

        const nextDepth = T.toNextDepth(node, depth)
        AST.children(node).forEach(child => A.processChildForViolations(child, nextDepth, processedNodes, violations))
    },

    // Collect all violations from the AST
    // @sig collectViolations :: (AST, [Violation]) -> [Violation]
    collectViolations: (ast, violations, processedNodes) => {
        AS.traverseAST(ast, node => V.checkCallbackFunction(node, ast, violations))
        AS.traverseAST(ast, node => V.checkFunctionNode(node, processedNodes, violations))
        return violations
    },
}

const VV = {
    // Validate single-level indentation throughout the file
    // @sig checkSingleLevelIndentation :: (AST?, String, String) -> [Violation]
    checkSingleLevelIndentation: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []
        return A.collectViolations(ast, [], new Set())
    },
}

const checkSingleLevelIndentation = FS.withExemptions('single-level-indentation', VV.checkSingleLevelIndentation)
export { checkSingleLevelIndentation }
