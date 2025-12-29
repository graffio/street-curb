// ABOUTME: Rule to detect lines exceeding 120 characters
// ABOUTME: Suggests extracting variables rather than wrapping lines

import { traverseAST } from '../aggregators.js'

const PRIORITY = 3

/**
 * Create a line-length violation object
 * @sig createViolation :: (Number, Number) -> Violation
 */
const createViolation = (line, column) => ({
    type: 'line-length',
    line,
    column,
    priority: PRIORITY,
    message:
        'Line exceeds 120 characters. ' +
        'FIX: Extract a sub-expression into a named variable to shorten. Do NOT just wrap the line.',
    rule: 'line-length',
})

/**
 * Check if line is a comment line
 * @sig isCommentLine :: String -> Boolean
 */
const isCommentLine = line => {
    const trimmed = line.trim()
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')
}

/**
 * Check if line contains prettier-ignore directive
 * @sig hasPrettierIgnore :: String -> Boolean
 */
const hasPrettierIgnore = line => line.includes('prettier-ignore')

/**
 * Check if line is a boundary (blank or non-comment)
 * @sig isBoundaryLine :: String -> Boolean
 */
const isBoundaryLine = line => line.trim() === '' || !isCommentLine(line)

/**
 * Get preceding comment lines up to boundary (blank or non-comment)
 * @sig getPrecedingCommentLines :: ([String], Number) -> [String]
 */
const getPrecedingCommentLines = (lines, startIndex) => {
    const preceding = lines.slice(0, startIndex).reverse()
    const boundaryIndex = preceding.findIndex(isBoundaryLine)
    return boundaryIndex === -1 ? preceding : preceding.slice(0, boundaryIndex)
}

/**
 * Check if a node has prettier-ignore in its preceding comments
 * @sig nodeHasPrettierIgnore :: (ASTNode, [String]) -> Boolean
 */
const nodeHasPrettierIgnore = (node, lines) => {
    if (!node.loc) return false
    const nodeStartLine = node.loc.start.line - 1
    const precedingLines = getPrecedingCommentLines(lines, nodeStartLine)
    return precedingLines.some(hasPrettierIgnore)
}

/**
 * Generate array of line numbers from start to end (inclusive)
 * @sig lineRange :: (Number, Number) -> [Number]
 */
const lineRange = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i)

/**
 * Get line numbers covered by a node
 * @sig getNodeLineNumbers :: ASTNode -> [Number]
 */
const getNodeLineNumbers = node => (node.loc ? lineRange(node.loc.start.line, node.loc.end.line) : [])

/**
 * Process node for prettier-ignore and collect ignored lines
 * @sig collectIgnoredLines :: ([String], ASTNode) -> [Number]
 */
const collectIgnoredLines = (lines, node) => (nodeHasPrettierIgnore(node, lines) ? getNodeLineNumbers(node) : [])

/**
 * Build set of line numbers that are prettier-ignored via AST analysis
 * @sig buildIgnoredLinesSet :: (AST, [String]) -> Set<Number>
 */
const buildIgnoredLinesSet = (ast, lines) => {
    if (!ast) return new Set()

    const allIgnored = []
    traverseAST(ast, node => allIgnored.push(...collectIgnoredLines(lines, node)))
    return new Set(allIgnored)
}

/**
 * Check if a line should trigger a violation
 * @sig shouldReportLine :: (String, Number, Set<Number>) -> Boolean
 */
const shouldReportLine = (line, lineNumber, ignoredLines) => line.length > 120 && !ignoredLines.has(lineNumber)

/**
 * Check for line length violations (coding standards: max 120 characters)
 * @sig checkLineLength :: (AST?, String, String) -> [Violation]
 */
const checkLineLength = (ast, sourceCode, filePath) => {
    const lines = sourceCode.split('\n')
    const ignoredLines = buildIgnoredLinesSet(ast, lines)

    return lines
        .map((line, index) => ({ line, lineNumber: index + 1 }))
        .filter(({ line, lineNumber }) => shouldReportLine(line, lineNumber, ignoredLines))
        .map(({ lineNumber }) => createViolation(lineNumber, 121))
}

export { checkLineLength }
