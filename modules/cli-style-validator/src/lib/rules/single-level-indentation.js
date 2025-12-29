// ABOUTME: Rule to detect nested indentation (>1 level deep)
// ABOUTME: Enforces single-level indentation via early returns and extraction

import { PS } from '../predicates.js'

/**
 * Visit child node if it exists and has a type
 * @sig visitChild :: (Any, (ASTNode) -> Void) -> Void
 */
const visitChild = (child, visitor) => {
    if (!child || typeof child !== 'object' || !child.type) return
    traverseAST(child, visitor)
}

/**
 * Process single child in traversal
 * @sig processChild :: (Any, (ASTNode) -> Void) -> Void
 */
const processChild = (child, visitor) => {
    if (Array.isArray(child)) {
        child.forEach(item => visitChild(item, visitor))
        return
    }
    visitChild(child, visitor)
}

/**
 * Traverse AST node and visit all child nodes
 * @sig traverseAST :: (ASTNode, (ASTNode) -> Void) -> Void
 */
const traverseAST = (node, visitor) => {
    if (!node || typeof node !== 'object') return

    visitor(node)

    Object.keys(node).forEach(key => processChild(node[key], visitor))
}

const PRIORITY = 2

/**
 * Create a single-level-indentation violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'single-level-indentation',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    priority: PRIORITY,
    message,
    rule: 'single-level-indentation',
})

/**
 * Check if node is in arguments array context
 * @sig checkArgumentsContext :: (String, [Any], ASTNode) -> Boolean
 */
const checkArgumentsContext = (key, child, node) => key === 'arguments' && child.includes(node)

/**
 * Check if node is in callback-like context
 * @sig checkCallbackContext :: (String, ASTNode, ASTNode) -> Boolean
 */
const checkCallbackContext = (key, searchNode, node) => {
    if (key !== 'callee' && key !== 'init') return false
    if (key === 'init' && searchNode.type === 'VariableDeclarator') return false
    return true
}

/**
 * Process array child in context search
 * @sig processArrayChild :: (String, [Any], ASTNode, Function) -> Boolean
 */
const processArrayChild = (key, child, node, findContext) => {
    if (checkArgumentsContext(key, child, node)) return true
    child.forEach(findContext)
    return false
}

/**
 * Process object child in context search
 * @sig processObjectChild :: (Any, Function) -> Void
 */
const processObjectChild = (child, findContext) => child && typeof child === 'object' && findContext(child)

/**
 * Process non-array child in context finding
 * @sig processNonArrayChild :: (String, Any, ASTNode, ASTNode, Function, Object) -> Boolean
 */
const processNonArrayChild = (key, child, node, searchNode, findContext, tracker) => {
    if (child === node && checkCallbackContext(key, searchNode, node)) tracker.isCallback = true
    processObjectChild(child, findContext)
    return false
}

/**
 * Process search node child in context finding
 * @sig processSearchNodeChild :: (String, Any, ASTNode, ASTNode, Function, Object) -> Boolean
 */
const processSearchNodeChild = (key, child, node, searchNode, findContext, tracker) => {
    if (!Array.isArray(child)) return processNonArrayChild(key, child, node, searchNode, findContext, tracker)

    if (!processArrayChild(key, child, node, findContext)) return false
    tracker.isCallback = true
    return true
}

/**
 * Search context recursively in AST node
 * @sig searchContextRecursively :: (ASTNode, ASTNode, Object) -> Void
 */
const searchContextRecursively = (searchNode, node, tracker) => {
    const findContext = currentNode => searchContextRecursively(currentNode, node, tracker)

    if (!searchNode || typeof searchNode !== 'object') return

    Object.entries(searchNode).some(([key, child]) =>
        processSearchNodeChild(key, child, node, searchNode, findContext, tracker),
    )
}

/**
 * Find context of function node in AST
 * @sig findFunctionContext :: (ASTNode, ASTNode) -> Boolean
 */
const findFunctionContext = (node, rootNode) => {
    const tracker = { isCallback: false }
    searchContextRecursively(rootNode, node, tracker)
    return tracker.isCallback
}

/**
 * Check if a function is a callback (unnamed and used as argument or property value)
 * @sig isCallbackFunction :: (ASTNode, ASTNode) -> Boolean
 */
const isCallbackFunction = (node, rootNode) => {
    const { type } = node
    if (type === 'FunctionDeclaration') return false // Always has a name

    return findFunctionContext(node, rootNode)
}

/**
 * Count lines in a function body
 * @sig countFunctionBodyLines :: ASTNode -> Number
 */
const countFunctionBodyLines = functionNode => {
    if (!functionNode.body || !functionNode.body.loc) return 0

    const startLine = functionNode.body.loc.start.line
    const endLine = functionNode.body.loc.end.line
    return endLine - startLine + 1
}

/**
 * Check if statement has JSX return
 * @sig hasJSXReturnStatement :: Statement -> Boolean
 */
const hasJSXReturnStatement = statement => {
    if (statement.type !== 'ReturnStatement' || !statement.argument) return false
    return statement.argument.type === 'JSXElement' || statement.argument.type === 'JSXFragment'
}

/**
 * Check if a function is in JSX context (returns JSX elements)
 * @sig isJSXFunction :: ASTNode -> Boolean
 */
const isJSXFunction = functionNode => {
    const { body, expression } = functionNode
    if (!body) return false

    const { type, body: blockBody } = body

    // For expression bodies, check if it's JSX
    if (expression && type && (type === 'JSXElement' || type === 'JSXFragment')) return true

    // For block bodies, check if it contains JSX elements
    if (type === 'BlockStatement') return blockBody.some(hasJSXReturnStatement)

    return false
}

// Statement types that create indentation levels
// @sig INDENTATION_STATEMENT_TYPES :: Set<String>
const INDENTATION_STATEMENT_TYPES = new Set([
    'IfStatement',
    'ForStatement',
    'WhileStatement',
    'ForInStatement',
    'ForOfStatement',
    'SwitchStatement',
])

/**
 * Check if a node represents a statement that creates indentation levels
 * @sig isIndentationStatement :: ASTNode -> Boolean
 */
const isIndentationStatement = node => INDENTATION_STATEMENT_TYPES.has(node.type)

// Node types where nesting is allowed per coding standards
// @sig ALLOWED_NESTING_TYPES :: Set<String>
const ALLOWED_NESTING_TYPES = new Set([
    'TryStatement',
    'CatchClause',
    'ObjectExpression',
    'ArrayExpression',
    'JSXElement',
    'JSXFragment',
])

/**
 * Check if nesting is allowed for this node type per coding standards
 * @sig isAllowedNesting :: ASTNode -> Boolean
 */
const isAllowedNesting = node => ALLOWED_NESTING_TYPES.has(node.type)

/**
 * Check if node is valid for traversal
 * @sig isValidNode :: Any -> Boolean
 */
const isValidNode = node => node && typeof node === 'object' && node.type

/**
 * Check if node is a function with block body
 * @sig isFunctionWithBlockBody :: ASTNode -> Boolean
 */
const isFunctionWithBlockBody = node => {
    if (!PS.isFunctionNode(node)) return false
    const { body } = node
    return body && body.type === 'BlockStatement'
}

/**
 * Process child node for violations (handles both single and array items)
 * @sig processChildNode :: (ASTNode, Number, Function) -> Void
 */
const processChildNode = (node, nextDepth, findViolations) => {
    if (!isValidNode(node)) return

    if (isFunctionWithBlockBody(node)) {
        findViolations(node.body, 0)
        return
    }

    if (!PS.isFunctionNode(node)) findViolations(node, nextDepth)
}

/**
 * Process array of child nodes for violations
 * @sig processChildArray :: ([ASTNode], Number, Function) -> Void
 */
const processChildArray = (childArray, nextDepth, findViolations) =>
    childArray.forEach(item => processChildNode(item, nextDepth, findViolations))

/**
 * Find nested violations in AST node
 * @sig findNestedViolations :: (ASTNode, Number, Set, [Violation]) -> Void
 */
const findNestedViolations = (node, depth, processedNodes, violations) => {
    /**
     * Process child node key for violations
     * @sig processChildKey :: (String, Number, Set, [Violation]) -> Void
     */
    const processChildKey = (key, nextDepth, processedNodes, violations) => {
        const child = node[key]
        const processChild = Array.isArray(child) ? processChildArray : processChildNode
        processChild(child, nextDepth, (childNode, childDepth) =>
            findNestedViolations(childNode, childDepth, processedNodes, violations),
        )
    }

    if (!node || typeof node !== 'object') return
    if (processedNodes.has(node)) return
    processedNodes.add(node)

    // Check for forbidden nested statements beyond first level
    if (depth > 0 && isIndentationStatement(node)) {
        const msg =
            'Nested indentation detected. ' +
            'FIX: Extract the nested block to a named function in the appropriate module-level cohesion group ' +
            '(P/T/F/V/A), or use early returns to flatten the logic.'
        violations.push(createViolation(node, msg))
    }

    // Always traverse child nodes, but adjust depth based on node type
    const nextDepth = isAllowedNesting(node) ? depth : isIndentationStatement(node) ? depth + 1 : depth

    Object.keys(node).forEach(key => processChildKey(key, nextDepth, processedNodes, violations))
}

// Message for multi-line callback extraction
// @sig CALLBACK_EXTRACTION_MESSAGE :: String
const CALLBACK_EXTRACTION_MESSAGE =
    'Extract multi-line unnamed function to a named function. ' +
    'FIX: Move the callback body to a named function in the appropriate module-level cohesion group (P/T/F/V/A). ' +
    'For Promise executors: extract to a function that receives resolve/reject as parameters. ' +
    "For .map() callbacks: if it doesn't fit on one line with .map(), extract it."

/**
 * Check callback function for violations
 * @sig checkCallbackFunction :: (ASTNode, ASTNode, [Violation]) -> Void
 */
const checkCallbackFunction = (node, ast, violations) => {
    if (!PS.isFunctionNode(node) || !isCallbackFunction(node, ast) || isJSXFunction(node)) return

    const lineCount = countFunctionBodyLines(node)
    if (lineCount > 1) violations.push(createViolation(node, CALLBACK_EXTRACTION_MESSAGE))
}

/**
 * Check function node for nested violations
 * @sig checkFunctionNode :: (ASTNode, Set, [Violation]) -> Void
 */
const checkFunctionNode = (node, processedNodes, violations) => {
    if (!PS.isFunctionNode(node) || !node.body || node.body.type !== 'BlockStatement') return
    findNestedViolations(node.body, 0, processedNodes, violations)
}

/**
 * Check for single-level indentation violations (coding standards)
 * @sig checkSingleLevelIndentation :: (AST?, String, String) -> [Violation]
 */
const checkSingleLevelIndentation = (ast, sourceCode, filePath) => {
    /**
     * Process AST node for violations
     * @sig processASTNode :: ASTNode -> Void
     */
    const processASTNode = node => {
        checkCallbackFunction(node, ast, violations)
        checkFunctionNode(node, processedNodes, violations)
    }

    if (!ast || PS.isTestFile(filePath)) return []

    const violations = []
    const processedNodes = new Set()

    traverseAST(ast, processASTNode)

    return violations
}

export { checkSingleLevelIndentation }
