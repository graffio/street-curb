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

/**
 * Create a single-level-indentation violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'single-level-indentation',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    message,
    rule: 'single-level-indentation',
})

/**
 * Check if a node represents a function
 * @sig isFunctionNode :: ASTNode -> Boolean
 */
const isFunctionNode = node =>
    node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression'

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
const processNonArrayChild = (key, child, node, searchNode, findContext, state) => {
    if (child === node && checkCallbackContext(key, searchNode, node)) state.isCallback = true
    processObjectChild(child, findContext)
    return false
}

/**
 * Process search node child in context finding
 * @sig processSearchNodeChild :: (String, Any, ASTNode, ASTNode, Function, Object) -> Boolean
 */
const processSearchNodeChild = (key, child, node, searchNode, findContext, state) => {
    if (!Array.isArray(child)) return processNonArrayChild(key, child, node, searchNode, findContext, state)

    if (!processArrayChild(key, child, node, findContext)) return false
    state.isCallback = true
    return true
}

/**
 * Search context recursively in AST node
 * @sig searchContextRecursively :: (ASTNode, ASTNode, Object) -> Void
 */
const searchContextRecursively = (searchNode, node, state) => {
    if (!searchNode || typeof searchNode !== 'object') return

    const findContext = currentNode => searchContextRecursively(currentNode, node, state)

    Object.entries(searchNode).some(([key, child]) =>
        processSearchNodeChild(key, child, node, searchNode, findContext, state),
    )
}

/**
 * Find context of function node in AST
 * @sig findFunctionContext :: (ASTNode, ASTNode) -> Boolean
 */
const findFunctionContext = (node, rootNode) => {
    const state = { isCallback: false }
    searchContextRecursively(rootNode, node, state)
    return state.isCallback
}

/**
 * Check if a function is a callback (unnamed and used as argument or property value)
 * @sig isCallbackFunction :: (ASTNode, ASTNode) -> Boolean
 */
const isCallbackFunction = (node, rootNode) => {
    if (node.type === 'FunctionDeclaration') return false // Always has a name

    const isCallback = findFunctionContext(node, rootNode)

    // Additional check: function expressions without id are callbacks unless they're variable assignments
    if (node.type === 'FunctionExpression' && !node.id && !isCallback) return true

    return isCallback
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
    if (!functionNode.body) return false

    // For expression bodies, check if it's JSX
    if (
        functionNode.expression &&
        functionNode.body.type &&
        (functionNode.body.type === 'JSXElement' || functionNode.body.type === 'JSXFragment')
    )
        return true

    // For block bodies, check if it contains JSX elements
    if (functionNode.body.type === 'BlockStatement') return functionNode.body.body.some(hasJSXReturnStatement)

    return false
}

/**
 * Check if a node represents a statement that creates indentation levels
 * @sig isIndentationStatement :: ASTNode -> Boolean
 */
const isIndentationStatement = node =>
    node.type === 'IfStatement' ||
    node.type === 'ForStatement' ||
    node.type === 'WhileStatement' ||
    node.type === 'ForInStatement' ||
    node.type === 'ForOfStatement' ||
    node.type === 'SwitchStatement'

/**
 * Check if nesting is allowed for this node type per coding standards
 * @sig isAllowedNesting :: ASTNode -> Boolean
 */
const isAllowedNesting = node =>
    node.type === 'TryStatement' ||
    node.type === 'CatchClause' ||
    node.type === 'ObjectExpression' ||
    node.type === 'ArrayExpression' ||
    node.type === 'JSXElement' ||
    node.type === 'JSXFragment'

/**
 * Process child item for violations
 * @sig processChildItem :: (ASTNode, Number, Function) -> Void
 */
const processChildItem = (item, nextDepth, findViolations) => {
    if (!item || typeof item !== 'object' || !item.type) return

    if (isFunctionNode(item) && item.body && item.body.type === 'BlockStatement') {
        findViolations(item.body, 0)
        return
    }

    if (!isFunctionNode(item)) findViolations(item, nextDepth)
}

/**
 * Process array of child nodes for violations
 * @sig processChildArray :: ([ASTNode], Number, Function) -> Void
 */
const processChildArray = (childArray, nextDepth, findViolations) =>
    childArray.forEach(item => processChildItem(item, nextDepth, findViolations))

/**
 * Process single child node for violations
 * @sig processSingleChild :: (ASTNode, Number, Function) -> Void
 */
const processSingleChild = (child, nextDepth, findViolations) => {
    if (!child || typeof child !== 'object' || !child.type) return

    if (isFunctionNode(child) && child.body && child.body.type === 'BlockStatement') {
        findViolations(child.body, 0)
        return
    }

    if (!isFunctionNode(child)) findViolations(child, nextDepth)
}

/**
 * Find nested violations in AST node
 * @sig findNestedViolations :: (ASTNode, Number, Set, [Violation]) -> Void
 */
const findNestedViolations = (node, depth, processedNodes, violations) => {
    if (!node || typeof node !== 'object') return
    if (processedNodes.has(node)) return
    processedNodes.add(node)

    // Check for forbidden nested statements beyond first level
    if (depth > 0 && isIndentationStatement(node))
        violations.push(
            createViolation(node, 'Avoid nested indentation - extract to separate functions or use early returns'),
        )

    /**
     * Process child node key for violations
     * @sig processChildKey :: (String, Number, Set, [Violation]) -> Void
     */
    const processChildKey = (key, nextDepth, processedNodes, violations) => {
        const child = node[key]
        const processChild = Array.isArray(child) ? processChildArray : processSingleChild
        processChild(child, nextDepth, (childNode, childDepth) =>
            findNestedViolations(childNode, childDepth, processedNodes, violations),
        )
    }

    // Always traverse child nodes, but adjust depth based on node type
    const nextDepth = isAllowedNesting(node) ? depth : isIndentationStatement(node) ? depth + 1 : depth

    Object.keys(node).forEach(key => processChildKey(key, nextDepth, processedNodes, violations))
}

/**
 * Check callback function for violations
 * @sig checkCallbackFunction :: (ASTNode, ASTNode, [Violation]) -> Void
 */
const checkCallbackFunction = (node, ast, violations) => {
    if (!isFunctionNode(node) || !isCallbackFunction(node, ast) || isJSXFunction(node)) return

    const lineCount = countFunctionBodyLines(node)
    if (lineCount > 1) violations.push(createViolation(node, 'Extract multi-line unnamed function to a named function'))
}

/**
 * Check function node for nested violations
 * @sig checkFunctionNode :: (ASTNode, Set, [Violation]) -> Void
 */
const checkFunctionNode = (node, processedNodes, violations) => {
    if (!isFunctionNode(node) || !node.body || node.body.type !== 'BlockStatement') return
    findNestedViolations(node.body, 0, processedNodes, violations)
}

/**
 * Check for single-level indentation violations (coding standards)
 * @sig checkSingleLevelIndentation :: (AST?, String, String) -> [Violation]
 */
const checkSingleLevelIndentation = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []
    const processedNodes = new Set()

    /**
     * Process AST node for violations
     * @sig processASTNode :: ASTNode -> Void
     */
    const processASTNode = node => {
        checkCallbackFunction(node, ast, violations)
        checkFunctionNode(node, processedNodes, violations)
    }

    traverseAST(ast, processASTNode)

    return violations
}

export { checkSingleLevelIndentation }
