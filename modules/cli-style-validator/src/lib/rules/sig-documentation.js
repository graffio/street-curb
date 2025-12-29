// ABOUTME: Rule to detect missing @sig documentation on functions
// ABOUTME: Enforces documentation standard for top-level and long functions

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

const PRIORITY = 6

/**
 * Create a sig-documentation violation object from AST node
 * @sig createViolation :: (ASTNode, String) -> Violation
 */
const createViolation = (node, message) => ({
    type: 'sig-documentation',
    line: node.loc.start.line,
    column: node.loc.start.column + 1,
    priority: PRIORITY,
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
 * Remove comment markers from a line, returning raw content
 * @sig stripCommentMarkers :: String -> String
 */
const stripCommentMarkers = line =>
    line
        .trim()
        .replace(/^\/\*\*?/, '')
        .replace(/^\*\//, '')
        .replace(/^\/\//, '')
        .replace(/^\*/, '')

/**
 * Check if line is a directive comment (prettier-ignore, eslint-disable, etc.)
 * @sig isDirectiveComment :: String -> Boolean
 */
const isDirectiveComment = line => {
    const content = stripCommentMarkers(line).trim().toLowerCase()
    return content.startsWith('prettier-ignore') || content.startsWith('eslint-')
}

/**
 * Check if line is a substantive comment (has content beyond markers and directives)
 * @sig isSubstantiveCommentLine :: String -> Boolean
 */
const isSubstantiveCommentLine = line => {
    if (!PS.isCommentLine(line.trim())) return false
    if (isDirectiveComment(line)) return false
    return stripCommentMarkers(line).trim().length > 0
}

/**
 * Check if line is indented continuation of @sig type definition
 * @sig isSigContinuationLine :: String -> Boolean
 */
const isSigContinuationLine = line => {
    if (!PS.isCommentLine(line.trim())) return false
    const content = stripCommentMarkers(line)
    return content.length > 0 && /^\s{4,}/.test(content)
}

/**
 * Find the line index containing @sig in preceding comments (0-indexed)
 * @sig findSigLineIndex :: (ASTNode, String) -> Number?
 */
const findSigLineIndex = (functionNode, sourceCode) => {
    const isSigLine = line => line.includes('@sig')

    const isNonCommentLine = line => {
        const trimmed = line.trim()
        return trimmed && !PS.isCommentLine(trimmed)
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
    const isNonContinuationSubstantive = line => isSubstantiveCommentLine(line) && !isSigContinuationLine(line)

    const sigLineIndex = findSigLineIndex(functionNode, sourceCode)
    if (sigLineIndex === null) return true

    const lines = sourceCode.split('\n')
    const functionStartLine = functionNode.loc.start.line
    const linesBetween = Array.from(
        { length: functionStartLine - sigLineIndex - 2 },
        (_, i) => lines[sigLineIndex + 1 + i],
    )

    return !linesBetween.some(isNonContinuationSubstantive)
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
        return trimmed && !PS.isCommentLine(trimmed)
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
    if (!PS.isFunctionNode(node) || processedNodes.has(node)) return
    processedNodes.add(node)

    const requiresSig = requiresSigDocumentation(node, ast)
    const hasSig = hasSigDocumentation(node, sourceCode)
    const hasDescription = hasDescriptionComment(node, sourceCode)

    if (hasSig && !isSigLastInCommentBlock(node, sourceCode)) {
        const msg = '@sig must be last in the comment block. FIX: Move @sig line to end of JSDoc, just before */.'
        violations.push(createViolation(node, msg))
        return
    }

    if (hasSig && !hasDescription) {
        const msg = '@sig requires a description comment. FIX: Add a line describing what the function does above @sig.'
        violations.push(createViolation(node, msg))
        return
    }

    if (!requiresSig || hasSig) return

    const isTopLevel = isTopLevelFunction(node, ast)
    const reason = isTopLevel ? 'top-level function' : 'function longer than 5 lines'
    const msg =
        `Missing @sig documentation for ${reason}. ` +
        'FIX: Add JSDoc with description and @sig type annotation. ' +
        'If this is an inline callback, fix single-level-indentation first (extraction creates a named function).'
    violations.push(createViolation(node, msg))
}

/**
 * Check for @sig documentation violations (coding standards)
 * @sig checkSigDocumentation :: (AST?, String, String) -> [Violation]
 */
const checkSigDocumentation = (ast, sourceCode, filePath) => {
    if (!ast || PS.isTestFile(filePath)) return []

    const violations = []
    const processedNodes = new Set()

    AS.traverseAST(ast, node => checkFunctionForSig(node, ast, sourceCode, processedNodes, violations))

    return violations
}

export { checkSigDocumentation }
