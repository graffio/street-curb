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

    for (const key in node) processChild(node[key], visitor)
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
 * Check if nesting is allowed for this node type per A001 standards
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
 * Process array of child nodes for violations
 * @sig processChildArray :: ([ASTNode], Number, Function) -> Void
 */
const processChildArray = (childArray, nextDepth, findViolations) => {
    childArray.forEach(item => {
        if (!item || typeof item !== 'object' || !item.type) return

        if (isFunctionNode(item) && item.body && item.body.type === 'BlockStatement') {
            findViolations(item.body, 0)
            return
        }

        if (!isFunctionNode(item)) findViolations(item, nextDepth)
    })
}

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
 * Check for single-level indentation violations (A001 standard)
 * @sig checkSingleLevelIndentation :: (AST?, String, String) -> [Violation]
 */
const checkSingleLevelIndentation = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []
    const processedNodes = new Set()

    const findNestedViolations = (node, depth = 0) => {
        if (!node || typeof node !== 'object') return
        if (processedNodes.has(node)) return
        processedNodes.add(node)

        // Check for forbidden nested statements beyond first level
        if (depth > 0 && isIndentationStatement(node))
            violations.push(
                createViolation(node, 'Avoid nested indentation - extract to separate functions or use early returns'),
            )

        // Always traverse child nodes, but adjust depth based on node type
        const nextDepth = isAllowedNesting(node) ? depth : isIndentationStatement(node) ? depth + 1 : depth

        for (const key in node) {
            const child = node[key]
            const processChild = Array.isArray(child) ? processChildArray : processSingleChild
            processChild(child, nextDepth, findNestedViolations)
        }
    }

    traverseAST(ast, node => {
        if (isFunctionNode(node) && node.body && node.body.type === 'BlockStatement') findNestedViolations(node.body, 0)
    })

    return violations
}

export { checkSingleLevelIndentation }
