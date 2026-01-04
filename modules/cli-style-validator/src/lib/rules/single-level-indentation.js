// ABOUTME: Rule to detect nested indentation (>1 level deep)
// ABOUTME: Enforces single-level indentation via early returns and extraction

import { AST } from '../dsl/ast.js'
import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

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
    // Check if node is a control flow statement that increases indentation (works on raw nodes)
    // @sig isIndentationStatement :: ESTreeNode -> Boolean
    isIndentationStatement: rawNode => INDENTATION_STATEMENT_TYPES.has(rawNode.type),

    // Check if node type is allowed to nest without counting as indentation (works on raw nodes)
    // @sig isAllowedNesting :: ESTreeNode -> Boolean
    isAllowedNesting: rawNode => ALLOWED_NESTING_TYPES.has(rawNode.type),
}

const T = {
    // Calculate next depth based on node type (works on raw nodes)
    // @sig toNextDepth :: (ESTreeNode, Number) -> Number
    toNextDepth: (rawNode, depth) => {
        if (P.isAllowedNesting(rawNode)) return depth
        if (P.isIndentationStatement(rawNode)) return depth + 1
        return depth
    },
}

const F = {
    // Create a single-level-indentation violation at node location
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'single-level-indentation',
        line: AST.line(node),
        column: AST.column(node),
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
        const body = AST.functionBody(node)
        A.findNestedViolations(body, 0, processedNodes, violations)
    },
}

const A = {
    // Flatten raw node properties into array of child values
    // @sig collectChildValues :: ESTreeNode -> [Any]
    collectChildValues: rawNode =>
        Object.keys(rawNode).flatMap(key => (Array.isArray(rawNode[key]) ? rawNode[key] : [rawNode[key]])),

    // Check if value is a valid raw AST node
    // @sig isValidRawNode :: Any -> Boolean
    isValidRawNode: node => node && typeof node === 'object' && node.type,

    // Process a child raw node for violations, resetting depth at function boundaries
    // @sig processChildForViolations :: (ESTreeNode, Number, Set, [Violation]) -> Void
    processChildForViolations: (rawNode, nextDepth, processedNodes, violations) => {
        if (!A.isValidRawNode(rawNode)) return
        const isFunctionWithBlock = A.isRawFunctionWithBlock(rawNode)
        if (isFunctionWithBlock) return A.findNestedViolations(rawNode.body, 0, processedNodes, violations)
        if (!A.isRawFunctionNode(rawNode)) A.findNestedViolations(rawNode, nextDepth, processedNodes, violations)
    },

    // Check if raw node is a function (for internal traversal)
    // @sig isRawFunctionNode :: ESTreeNode -> Boolean
    isRawFunctionNode: rawNode => {
        const type = rawNode.type
        return type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression'
    },

    // Check if raw node is a function with block body
    // @sig isRawFunctionWithBlock :: ESTreeNode -> Boolean
    isRawFunctionWithBlock: rawNode => A.isRawFunctionNode(rawNode) && rawNode.body?.type === 'BlockStatement',

    // Recursively find nested indentation violations in a raw node subtree
    // @sig findNestedViolations :: (ESTreeNode, Number, Set, [Violation]) -> Void
    findNestedViolations: (rawNode, depth, processedNodes, violations) => {
        if (!rawNode || typeof rawNode !== 'object' || processedNodes.has(rawNode)) return
        processedNodes.add(rawNode)

        if (depth > 0 && P.isIndentationStatement(rawNode))
            violations.push(F.createViolation(rawNode, NESTED_INDENTATION_MESSAGE))

        const nextDepth = T.toNextDepth(rawNode, depth)
        A.collectChildValues(rawNode).forEach(c =>
            A.processChildForViolations(c, nextDepth, processedNodes, violations),
        )
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
