/**
 * Create an export-placement violation object
 * @sig createViolation :: (String, Number, Number, String) -> Violation
 */
const createViolation = (type, line, column, message) => ({ type, line, column, message, rule: 'export-placement' })

/**
 * Find the index of the last non-empty line in a file
 * @sig findLastNonEmptyLine :: ([String]) -> Number
 */
const findLastNonEmptyLine = lines => {
    const nonEmptyIndices = lines
        .map((line, index) => ({ line: line.trim(), index }))
        .filter(({ line }) => line !== '')
        .map(({ index }) => index)

    if (nonEmptyIndices.length === 0) return -1
    return nonEmptyIndices[nonEmptyIndices.length - 1]
}

/**
 * Create line-index mapping objects for processing
 * @sig createLineIndexMap :: ([String]) -> [LineIndex]
 *     LineIndex = { line: String, index: Number }
 */
const createLineIndexMap = lines => lines.map((line, index) => ({ line: line.trim(), index }))

/**
 * Check for export placement violations (coding standards: single export at bottom)
 * @sig checkExportPlacement :: (AST?, String, String) -> [Violation]
 */
const checkExportPlacement = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')
    const lineIndexMap = createLineIndexMap(lines)

    /**
     * Create export default violation from line index
     * @sig createExportDefaultViolation :: Number -> Violation
     */
    const createExportDefaultViolation = index =>
        createViolation('export-default', index + 1, 1, 'Use of export default is forbidden - use named exports only')

    // Check for export default violations
    const exportDefaultViolations = lineIndexMap
        .filter(({ line }) => line.startsWith('export default'))
        .map(({ index }) => createExportDefaultViolation(index))

    violations.push(...exportDefaultViolations)

    // Find all export statements (including multi-line)
    const exportStartLines = lineIndexMap
        .filter(({ line }) => line.startsWith('export ') && !line.startsWith('export default'))
        .map(({ index }) => index)

    /**
     * Finds the end line of a multi-line export block
     * @sig findExportEndLine :: (Number, [String]) -> Number
     */
    const findExportEndLine = (startLine, lines) => {
        if (!lines[startLine].trim().includes('{')) return startLine

        const endLineIndex = lines.findIndex((line, index) => index >= startLine && line.trim().includes('}'))

        return endLineIndex === -1 ? startLine : endLineIndex
    }

    // For multi-line exports, find the end of each export block
    const exportEndLines = exportStartLines.map(startLine => findExportEndLine(startLine, lines))

    const exportLines = exportStartLines

    // Check for scattered exports (more than one export statement)
    if (exportLines.length > 1)
        violations.push(
            createViolation(
                'scattered-exports',
                exportLines[1] + 1,
                1,
                'Multiple scattered export statements found - use single export at bottom',
            ),
        )

    // Check if single export is at bottom
    if (exportLines.length !== 1) return violations

    const exportStartLine = exportLines[0]
    const exportEndLine = exportEndLines[0]
    const lastNonEmptyLineIndex = findLastNonEmptyLine(lines)

    // Check if the export block ends at the last non-empty line
    if (exportEndLine < lastNonEmptyLineIndex)
        violations.push(
            createViolation(
                'export-not-at-bottom',
                exportStartLine + 1,
                1,
                'Export statement must be at the bottom of the file',
            ),
        )

    return violations
}

export { checkExportPlacement }
