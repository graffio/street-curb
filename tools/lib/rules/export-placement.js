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
 * Check for export placement violations (A001 standard: single export at bottom)
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

    // Find all export lines
    const exportLines = lineIndexMap
        .filter(({ line }) => line.startsWith('export ') && !line.startsWith('export default'))
        .map(({ index }) => index)

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

    const exportLine = exportLines[0]
    const lastNonEmptyLineIndex = findLastNonEmptyLine(lines)

    if (exportLine < lastNonEmptyLineIndex)
        violations.push(
            createViolation(
                'export-not-at-bottom',
                exportLine + 1,
                1,
                'Export statement must be at the bottom of the file',
            ),
        )

    return violations
}

export { checkExportPlacement }
