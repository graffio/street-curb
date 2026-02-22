// ABOUTME: Rule to detect nested indentation (>1 level deep)
// ABOUTME: Enforces single-level indentation via early returns and extraction
// COMPLEXITY: single-level-indentation — processChildForViolations guards body before recursing into function scope

import { Ast, AstNode } from '@graffio/ast'
import { Aggregators as AS } from '../shared/aggregators.js'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if node is a control flow statement that increases indentation
    // @sig isIndentationStatement :: AstNode -> Boolean
    isIndentationStatement: node =>
        IfStatement.is(node) ||
        ForStatement.is(node) ||
        WhileStatement.is(node) ||
        ForInStatement.is(node) ||
        ForOfStatement.is(node) ||
        SwitchStatement.is(node),

    // Check if node type is allowed to nest without counting as indentation
    // @sig isAllowedNesting :: AstNode -> Boolean
    isAllowedNesting: node =>
        TryStatement.is(node) ||
        CatchClause.is(node) ||
        ObjectExpression.is(node) ||
        ArrayExpression.is(node) ||
        JSXElement.is(node) ||
        JSXFragment.is(node),

    // Check if function body contains any control flow statements
    // @sig hasControlFlow :: AstNode -> Boolean
    hasControlFlow: node => Ast.descendants(node).some(P.isIndentationStatement),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Calculate next depth based on node type
    // @sig toNextDepth :: (AstNode, Number) -> Number
    toNextDepth: (node, depth) => {
        if (P.isAllowedNesting(node)) return depth
        if (P.isIndentationStatement(node)) return depth + 1
        return depth
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
    // Validate callback functions: flag if too long (>2 lines) or has control flow
    // A 2-statement body spans 4 lines (open brace, 2 statements, close brace), so flag at 5+ lines
    // Line count has precedence over control flow check
    // @sig checkCallbackFunction :: (AstNode, AstNode, [Violation]) -> Void
    checkCallbackFunction: (node, ast, violations) => {
        if (!PS.isFunctionNode(node) || !AS.isCallbackFunction(node) || PS.isJSXFunction(node)) return

        if (AS.countFunctionLines(node) > 4) return violations.push(F.createViolation(node, CALLBACK_TOO_LONG_MESSAGE))

        if (P.hasControlFlow(node)) return violations.push(F.createViolation(node, CALLBACK_CONTROL_FLOW_MESSAGE))
    },

    // Validate a function node for nested indentation violations
    // @sig checkFunctionNode :: (AstNode, Set, [Violation]) -> Void
    checkFunctionNode: (node, processedNodes, violations) => {
        if (!PS.isFunctionWithBlockBody(node)) return
        const body = node.body
        if (body) A.findNestedViolations(body, 0, processedNodes, violations)
    },

    // Validate single-level indentation throughout the file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []
        return A.collectViolations(ast, [], new Set())
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Process a child node for violations, resetting depth at function boundaries
    // @sig processChildForViolations :: (AstNode, Number, Set, [Violation]) -> Void
    processChildForViolations: (node, nextDepth, processedNodes, violations) => {
        if (PS.isFunctionWithBlockBody(node)) {
            const body = node.body
            if (body) return A.findNestedViolations(body, 0, processedNodes, violations)
            return
        }
        if (!PS.isFunctionNode(node)) A.findNestedViolations(node, nextDepth, processedNodes, violations)
    },

    // Recursively find nested indentation violations in a node subtree
    // @sig findNestedViolations :: (AstNode, Number, Set, [Violation]) -> Void
    findNestedViolations: (node, depth, processedNodes, violations) => {
        if (!node || processedNodes.has(node.identity)) return
        processedNodes.add(node.identity)

        if (depth > 0 && P.isIndentationStatement(node))
            violations.push(F.createViolation(node, NESTED_INDENTATION_MESSAGE))

        const nextDepth = T.toNextDepth(node, depth)
        Ast.children(node).forEach(child => A.processChildForViolations(child, nextDepth, processedNodes, violations))
    },

    // Collect all violations from the AST
    // @sig collectViolations :: (AST, [Violation]) -> [Violation]
    collectViolations: (ast, violations, processedNodes) => {
        Ast.from(ast).forEach(node => V.checkCallbackFunction(node, ast, violations))
        Ast.from(ast).forEach(node => V.checkFunctionNode(node, processedNodes, violations))
        return violations
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const { ArrayExpression, CatchClause, ForInStatement, ForOfStatement, ForStatement } = AstNode
const { IfStatement, JSXElement, JSXFragment, ObjectExpression, SwitchStatement } = AstNode
const { TryStatement, WhileStatement } = AstNode

const PRIORITY = 2

const CALLBACK_TOO_LONG_MESSAGE =
    'Callback exceeds 2 lines — extract to a named function. ' +
    'FIX: Move the callback body to a named function in the appropriate module-level cohesion group (P/T/F/V/A).'

const CALLBACK_CONTROL_FLOW_MESSAGE =
    'Callback contains control flow — simplify or extract. ' +
    'FIX: Use a ternary expression, or extract to a named function in the appropriate cohesion group (P/T/F/V/A).'

const NESTED_INDENTATION_MESSAGE =
    'Nested indentation detected. ' +
    'FIX: Extract the nested block to a named function in the appropriate cohesion group ' +
    '(P/T/F/V/A), or use early returns to flatten the logic.'

const violation = FS.createViolation('single-level-indentation', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run single-level-indentation rule with COMPLEXITY exemption support
// @sig checkSingleLevelIndentation :: (AST?, String, String) -> [Violation]
const checkSingleLevelIndentation = (ast, sourceCode, filePath) =>
    FS.withExemptions('single-level-indentation', V.check, ast, sourceCode, filePath)
export { checkSingleLevelIndentation }
