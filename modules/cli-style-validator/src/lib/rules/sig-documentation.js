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
 * Check if line is a substantive comment (has content beyond markers)
 * @sig isSubstantiveCommentLine :: String -> Boolean
 */
const isSubstantiveCommentLine = line => {
    const trimmed = line.trim()
    if (!isCommentLine(trimmed)) return false

    const withoutMarkers = trimmed
        .replace(/^\/\*\*?/, '')
        .replace(/^\*\//, '')
        .replace(/^\/\//, '')
        .replace(/^\*/, '')
        .trim()

    return withoutMarkers.length > 0
}

/**
 * Find the line index containing @sig in preceding comments (0-indexed)
 * @sig findSigLineIndex :: (ASTNode, String) -> Number?
 */
const findSigLineIndex = (functionNode, sourceCode) => {
    const isSigLine = line => line.includes('@sig')
    const isNonCommentLine = line => {
        const trimmed = line.trim()
        return trimmed && !isCommentLine(trimmed)
    }

    const lines = sourceCode.split('\n')
    const functionStartLine = functionNode.loc.start.line
    const indicesToCheck = Array.from({ length: functionStartLine - 1 }, (_, i) => functionStartLine - 2 - i)

    const sigIndex = indicesToCheck.find(i => isSigLine(lines[i]) || isNonCommentLine(lines[i]))
    return sigIndex !== undefined && isSigLine(lines[sigIndex]) ? sigIndex : null
}

/**
 * Check if a function has @sig documentation in preceding comments
 * @sig hasSigDocumentation :: (ASTNode, String) -> Boolean
 */
const hasSigDocumentation = (functionNode, sourceCode) => findSigLineIndex(functionNode, sourceCode) !== null

/**
 * Check if @sig is last substantive comment before function
 * @sig isSigLastInCommentBlock :: (ASTNode, String) -> Boolean
 */
const isSigLastInCommentBlock = (functionNode, sourceCode) => {
    const sigLineIndex = findSigLineIndex(functionNode, sourceCode)
    if (sigLineIndex === null) return true

    const lines = sourceCode.split('\n')
    const functionStartLine = functionNode.loc.start.line
    const linesBetween = Array.from(
        { length: functionStartLine - sigLineIndex - 2 },
        (_, i) => lines[sigLineIndex + 1 + i],
    )

    return !linesBetween.some(isSubstantiveCommentLine)
}

/**
 * Check if line is a description comment (substantive but not @sig)
 * @sig isDescriptionLine :: String -> Boolean
 */
const isDescriptionLine = line => isSubstantiveCommentLine(line) && !line.includes('@sig')

/**
 * Check if function has description comment in preceding comments
 * @sig hasDescriptionComment :: (ASTNode, String) -> Boolean
 */
const hasDescriptionComment = (functionNode, sourceCode) => {
    const isNonCommentLine = line => {
        const trimmed = line.trim()
        return trimmed && !isCommentLine(trimmed)
    }
    const checkLineForDescription = (lines, i) => {
        if (isNonCommentLine(lines[i])) return false
        return isDescriptionLine(lines[i])
    }

    const lines = sourceCode.split('\n')
    const functionStartLine = functionNode.loc.start.line
    const indicesToCheck = Array.from({ length: functionStartLine - 1 }, (_, i) => functionStartLine - 2 - i)

    return indicesToCheck.some(i => checkLineForDescription(lines, i))
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
    const hasDescription = hasDescriptionComment(node, sourceCode)

    if (hasSig && !isSigLastInCommentBlock(node, sourceCode)) {
        violations.push(createViolation(node, '@sig must be last in the comment block'))
        return
    }

    if (hasSig && !hasDescription) {
        violations.push(createViolation(node, '@sig requires a description comment'))
        return
    }

    if (!requiresSig || hasSig) return

    const isTopLevel = isTopLevelFunction(node, ast)
    const reason = isTopLevel ? 'top-level function' : 'function longer than 5 lines'
    violations.push(createViolation(node, `Missing @sig documentation for ${reason}`))
}

/**
 * Check if file is a test file that should skip @sig validation
 * @sig isTestFile :: String -> Boolean
 */
const isTestFile = filePath => filePath.includes('.tap.js') || filePath.includes('.integration-test.js')

/**
 * Check for @sig documentation violations (coding standards)
 * @sig checkSigDocumentation :: (AST?, String, String) -> [Violation]
 */
const checkSigDocumentation = (ast, sourceCode, filePath) => {
    if (!ast || isTestFile(filePath)) return []

    const violations = []
    const processedNodes = new Set()

    traverseAST(ast, node => checkFunctionForSig(node, ast, sourceCode, processedNodes, violations))

    return violations
}

export { checkSigDocumentation }
