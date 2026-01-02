// ABOUTME: Rule to detect nested indentation (>1 level deep)
// ABOUTME: Enforces single-level indentation via early returns and extraction

import { AS } from '../aggregators.js'
import { FS } from '../factories.js'
import { PS } from '../predicates.js'

const PRIORITY = 2

const INDENTATION_STATEMENT_TYPES = new Set([
    'IfStatement',
    'ForStatement',
    'WhileStatement',
    'ForInStatement',
    'ForOfStatement',
    'SwitchStatement',
])

const ALLOWED_NESTING_TYPES = new Set([
    'TryStatement',
    'CatchClause',
    'ObjectExpression',
    'ArrayExpression',
    'JSXElement',
    'JSXFragment',
])

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
    isIndentationStatement: node => INDENTATION_STATEMENT_TYPES.has(node.type),

    // Check if node type is allowed to nest without counting as indentation
    // @sig isAllowedNesting :: ASTNode -> Boolean
    isAllowedNesting: node => ALLOWED_NESTING_TYPES.has(node.type),
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
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        priority: PRIORITY,
        message,
        rule: 'single-level-indentation',
    }),
}

const V = {
    // Validate callback functions should be extracted if multiline
    // @sig checkCallbackFunction :: (ASTNode, ASTNode, [Violation]) -> Void
    checkCallbackFunction: (node, ast, violations) => {
        if (!PS.isFunctionNode(node) || !AS.isCallbackFunction(node, ast) || PS.isJSXFunction(node)) return
        if (AS.countFunctionLines(node) > 1) violations.push(F.createViolation(node, CALLBACK_EXTRACTION_MESSAGE))
    },

    // Validate a function node for nested indentation violations
    // @sig checkFunctionNode :: (ASTNode, Set, [Violation]) -> Void
    checkFunctionNode: (node, processedNodes, violations) => {
        if (!PS.isFunctionWithBlockBody(node)) return
        A.findNestedViolations(node.body, 0, processedNodes, violations)
    },
}

const A = {
    // Flatten node properties into array of child values
    // @sig collectChildValues :: ASTNode -> [Any]
    collectChildValues: node => Object.keys(node).flatMap(key => (Array.isArray(node[key]) ? node[key] : [node[key]])),

    // Process a child node for violations, resetting depth at function boundaries
    // @sig processChildForViolations :: (ASTNode, Number, Set, [Violation]) -> Void
    processChildForViolations: (node, nextDepth, processedNodes, violations) => {
        if (!PS.isValidNode(node)) return
        if (PS.isFunctionWithBlockBody(node)) return A.findNestedViolations(node.body, 0, processedNodes, violations)
        if (!PS.isFunctionNode(node)) A.findNestedViolations(node, nextDepth, processedNodes, violations)
    },

    // Recursively find nested indentation violations in a node subtree
    // @sig findNestedViolations :: (ASTNode, Number, Set, [Violation]) -> Void
    findNestedViolations: (node, depth, processedNodes, violations) => {
        if (!node || typeof node !== 'object' || processedNodes.has(node)) return
        processedNodes.add(node)

        if (depth > 0 && P.isIndentationStatement(node))
            violations.push(F.createViolation(node, NESTED_INDENTATION_MESSAGE))

        const nextDepth = T.toNextDepth(node, depth)
        A.collectChildValues(node).forEach(c => A.processChildForViolations(c, nextDepth, processedNodes, violations))
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
