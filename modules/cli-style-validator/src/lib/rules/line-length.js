// ABOUTME: Rule to detect lines exceeding 120 characters
// ABOUTME: Suggests extracting variables rather than wrapping lines

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
 * Check if trimmed line is a block boundary (blank line)
 * @sig isBlockBoundary :: String -> Boolean
 */
const isBlockBoundary = trimmed => trimmed === ''

/**
 * Check if trimmed line contains prettier-ignore directive
 * @sig hasPrettierIgnore :: String -> Boolean
 */
const hasPrettierIgnore = trimmed => trimmed.includes('prettier-ignore')

/**
 * Get lines to scan backwards (up to 30 lines before index)
 * @sig getLinesToScan :: ([String], Number) -> [String]
 */
const getLinesToScan = (lines, index) => {
    const start = Math.max(0, index - 30)
    return lines.slice(start, index).reverse()
}

/**
 * Check if line is within a prettier-ignored block
 * Scans backwards to find prettier-ignore, stops at blank lines
 * @sig isPrettierIgnored :: ([String], Number) -> Boolean
 */
const isPrettierIgnored = (lines, index) => {
    const toScan = getLinesToScan(lines, index)
    const blockEnd = toScan.findIndex(line => isBlockBoundary(line.trim()))
    const searchRange = blockEnd === -1 ? toScan : toScan.slice(0, blockEnd)
    return searchRange.some(line => hasPrettierIgnore(line.trim()))
}

/**
 * Process line for length violations
 * @sig processLineForLength :: (String, Number, [Violation], [String]) -> Void
 */
const processLineForLength = (line, index, violations, allLines) => {
    if (line.length <= 120) return
    if (isPrettierIgnored(allLines, index)) return

    violations.push(createViolation(index + 1, 121))
}

/**
 * Check for line length violations (coding standards: max 120 characters)
 * @sig checkLineLength :: (AST?, String, String) -> [Violation]
 */
const checkLineLength = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')

    lines.forEach((line, index) => processLineForLength(line, index, violations, lines))

    return violations
}

export { checkLineLength }
