// ABOUTME: Rule to detect missing @sig documentation on functions
// ABOUTME: Enforces documentation standard for top-level and long functions

import { traverseAST, isFunctionNode } from '../traverse.js'

/**
 * Create a sig-documentation violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'sig-documentation',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    message,
    rule: 'sig-documentation',
})

/**
 * Check if statement is function declaration
 * @sig isFunctionDeclarationStatement :: (Statement, ASTNode) -> Boolean
 */
const isFunctionDeclarationStatement = (statement, functionNode) =>
    statement.type === 'FunctionDeclaration' && statement === functionNode

/**
 * Check if statement contains function in variable declaration
 * @sig isVariableDeclarationWithFunction :: (Statement, ASTNode) -> Boolean
 */
const isVariableDeclarationWithFunction = (statement, functionNode) => {
    if (statement.type !== 'VariableDeclaration') return false
    return statement.declarations.some(declarator => declarator.init === functionNode)
}

/**
 * Check if a function is at the top level of the file
 * @sig isTopLevelFunction :: (ASTNode, ASTNode) -> Boolean
 */
const isTopLevelFunction = (functionNode, rootNode) => {
    const checkStatement = statement =>
        isFunctionDeclarationStatement(statement, functionNode) ||
        isVariableDeclarationWithFunction(statement, functionNode)

    return rootNode.body.some(checkStatement)
}

/**
 * Count the number of lines in a function body
 * @sig countFunctionLines :: ASTNode -> Number
 */
const countFunctionLines = functionNode => {
    if (!functionNode.body || !functionNode.body.loc) return 0

    const startLine = functionNode.body.loc.start.line
    const endLine = functionNode.body.loc.end.line
    return endLine - startLine + 1
}

/**
 * Check if line is comment
 * @sig isCommentLine :: String -> Boolean
 */
const isCommentLine = line => {
    const trimmed = line.trim()
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('*/')
}

/**
 * Check line for @sig comment and determine if should continue search
 * @sig checkLineForSig :: String -> Object
 */
const checkLineForSig = line => {
    const trimmed = line.trim()

    // Stop if we hit a non-comment, non-empty line
    if (trimmed && !isCommentLine(trimmed)) return { found: false, shouldStop: true }

    // Check for @sig in comment
    if (trimmed.includes('@sig')) return { found: true, shouldStop: false }

    return { found: false, shouldStop: false }
}

/**
 * Process line in @sig search
 * @sig processLineInSigSearch :: (String) -> Boolean?
 */
const processLineInSigSearch = line => {
    const result = checkLineForSig(line)
    if (result.found) return true
    if (result.shouldStop) return false
    return null
}

/**
 * Check if a function has @sig documentation in preceding comments
 * @sig hasSigDocumentation :: (ASTNode, String) -> Boolean
 */
const hasSigDocumentation = (functionNode, sourceCode) => {
    const lines = sourceCode.split('\n')
    const functionStartLine = functionNode.loc.start.line

    // Create array of indices to check (from functionStartLine-2 down to 0)
    const indicesToCheck = Array.from({ length: functionStartLine - 1 }, (_, i) => functionStartLine - 2 - i)

    // Check if line gives definitive result
    const hasDefinitiveResult = i => {
        const searchResult = processLineInSigSearch(lines[i])
        return searchResult !== null
    }

    // Find first line that gives a definitive result
    const resultLine = indicesToCheck.find(hasDefinitiveResult)

    return resultLine !== undefined ? processLineInSigSearch(lines[resultLine]) : false
}

/**
 * Check if function requires @sig documentation
 * @sig requiresSigDocumentation :: (ASTNode, ASTNode) -> Boolean
 */
const requiresSigDocumentation = (node, ast) => {
    const isTopLevel = isTopLevelFunction(node, ast)
    const lineCount = countFunctionLines(node)
    return isTopLevel || lineCount > 5
}

/**
 * Check function node for @sig violations
 * @sig checkFunctionForSig :: (ASTNode, ASTNode, String, Set, [Violation]) -> Void
 */
const checkFunctionForSig = (node, ast, sourceCode, processedNodes, violations) => {
    if (!isFunctionNode(node) || processedNodes.has(node)) return
    processedNodes.add(node)

    const requiresSig = requiresSigDocumentation(node, ast)
    const hasSig = hasSigDocumentation(node, sourceCode)

    if (!requiresSig || hasSig) return

    const isTopLevel = isTopLevelFunction(node, ast)
    const reason = isTopLevel ? 'top-level function' : 'function longer than 5 lines'
    violations.push(createViolation(node, `Missing @sig documentation for ${reason}`))
}

/**
 * Check for @sig documentation violations (coding standards)
 * @sig checkSigDocumentation :: (AST?, String, String) -> [Violation]
 */
const checkSigDocumentation = (ast, sourceCode, filePath) => {
    if (!ast) return []

    const violations = []
    const processedNodes = new Set()

    traverseAST(ast, node => checkFunctionForSig(node, ast, sourceCode, processedNodes, violations))

    return violations
}

export { checkSigDocumentation }
