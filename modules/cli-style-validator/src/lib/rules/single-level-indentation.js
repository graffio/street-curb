// ABOUTME: Rule to detect nested indentation (>1 level deep)
// ABOUTME: Enforces single-level indentation via early returns and extraction

import { AS } from '../aggregators.js'
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

const P = {
    // Check if node is a control flow statement that increases indentation
    // @sig isIndentationStatement :: ASTNode -> Boolean
    isIndentationStatement: node => INDENTATION_STATEMENT_TYPES.has(node.type),

    // Check if node type is allowed to nest without counting as indentation
    // @sig isAllowedNesting :: ASTNode -> Boolean
    isAllowedNesting: node => ALLOWED_NESTING_TYPES.has(node.type),

    // Check if node is a function with a block body (not expression)
    // @sig isFunctionWithBlockBody :: ASTNode -> Boolean
    isFunctionWithBlockBody: node => PS.isFunctionNode(node) && node.body?.type === 'BlockStatement',

    // Check if statement returns JSX element or fragment
    // @sig hasJSXReturnStatement :: Statement -> Boolean
    hasJSXReturnStatement: stmt => {
        if (stmt.type !== 'ReturnStatement' || !stmt.argument) return false
        return stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment'
    },

    // Check if function returns JSX (arrow expression or block return)
    // @sig isJSXFunction :: ASTNode -> Boolean
    isJSXFunction: node => {
        if (!node.body) return false
        if (node.expression && (node.body.type === 'JSXElement' || node.body.type === 'JSXFragment')) return true
        if (node.body.type === 'BlockStatement') return node.body.body.some(P.hasJSXReturnStatement)
        return false
    },

    // Check if node is in an arguments array context
    // @sig isArgumentsContext :: (String, [Any], ASTNode) -> Boolean
    isArgumentsContext: (key, child, node) => key === 'arguments' && child.includes(node),

    // Check if node is in a callback context (callee or non-declarator init)
    // @sig isCallbackContext :: (String, ASTNode) -> Boolean
    isCallbackContext: (key, searchNode) => {
        if (key !== 'callee' && key !== 'init') return false
        if (key === 'init' && searchNode.type === 'VariableDeclarator') return false
        return true
    },

    // Check if node is a callback function (not declaration)
    // @sig isCallbackFunction :: (ASTNode, ASTNode) -> Boolean
    isCallbackFunction: (node, rootNode) => {
        if (node.type === 'FunctionDeclaration') return false
        return A.findFunctionContext(node, rootNode)
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
        if (!PS.isFunctionNode(node) || !P.isCallbackFunction(node, ast) || P.isJSXFunction(node)) return
        if (AS.countFunctionLines(node) > 1) violations.push(F.createViolation(node, CALLBACK_EXTRACTION_MESSAGE))
    },

    // Validate a function node for nested indentation violations
    // @sig checkFunctionNode :: (ASTNode, Set, [Violation]) -> Void
    checkFunctionNode: (node, processedNodes, violations) => {
        if (!P.isFunctionWithBlockBody(node)) return
        A.findNestedViolations(node.body, 0, processedNodes, violations)
    },

    // Validate single-level indentation throughout the file
    // @sig checkSingleLevelIndentation :: (AST?, String, String) -> [Violation]
    checkSingleLevelIndentation: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const violations = []
        const processedNodes = new Set()

        AS.traverseAST(ast, node => {
            V.checkCallbackFunction(node, ast, violations)
            V.checkFunctionNode(node, processedNodes, violations)
        })

        return violations
    },
}

const A = {
    // Recursively search AST to find if node is in callback context
    // @sig searchContextRecursively :: (ASTNode, ASTNode, { isCallback: Boolean }) -> Void
    searchContextRecursively: (searchNode, node, tracker) => {
        if (!searchNode || typeof searchNode !== 'object') return

        Object.entries(searchNode).some(([key, child]) => {
            if (Array.isArray(child)) {
                if (P.isArgumentsContext(key, child, node)) {
                    tracker.isCallback = true
                    return true
                }
                child.forEach(item => A.searchContextRecursively(item, node, tracker))
                return false
            }
            if (child === node && P.isCallbackContext(key, searchNode)) tracker.isCallback = true
            if (child && typeof child === 'object') A.searchContextRecursively(child, node, tracker)
            return false
        })
    },

    // Find whether a function is used as a callback in the AST
    // @sig findFunctionContext :: (ASTNode, ASTNode) -> Boolean
    findFunctionContext: (node, rootNode) => {
        const tracker = { isCallback: false }
        A.searchContextRecursively(rootNode, node, tracker)
        return tracker.isCallback
    },

    // Process a child node for violations, resetting depth at function boundaries
    // @sig processChildForViolations :: (ASTNode, Number, Function) -> Void
    processChildForViolations: (node, nextDepth, findViolations) => {
        if (!PS.isValidNode(node)) return
        if (P.isFunctionWithBlockBody(node)) {
            findViolations(node.body, 0)
            return
        }
        if (!PS.isFunctionNode(node)) findViolations(node, nextDepth)
    },

    // Recursively find nested indentation violations in a node subtree
    // @sig findNestedViolations :: (ASTNode, Number, Set, [Violation]) -> Void
    findNestedViolations: (node, depth, processedNodes, violations) => {
        if (!node || typeof node !== 'object' || processedNodes.has(node)) return
        processedNodes.add(node)

        if (depth > 0 && P.isIndentationStatement(node))
            violations.push(
                F.createViolation(
                    node,
                    'Nested indentation detected. ' +
                        'FIX: Extract the nested block to a named function in the appropriate module-level cohesion group ' +
                        '(P/T/F/V/A), or use early returns to flatten the logic.',
                ),
            )

        const nextDepth = P.isAllowedNesting(node) ? depth : P.isIndentationStatement(node) ? depth + 1 : depth

        Object.keys(node).forEach(key => {
            const child = node[key]
            if (Array.isArray(child))
                child.forEach(item =>
                    A.processChildForViolations(item, nextDepth, (n, d) =>
                        A.findNestedViolations(n, d, processedNodes, violations),
                    ),
                )
            else
                A.processChildForViolations(child, nextDepth, (n, d) =>
                    A.findNestedViolations(n, d, processedNodes, violations),
                )
        })
    },
}

const checkSingleLevelIndentation = V.checkSingleLevelIndentation
export { checkSingleLevelIndentation }
