/**
 * Check for line length violations (A001 standard: max 120 characters)
 * @sig checkLineLength :: (AST?, String, String) -> [Violation]
 */
const checkLineLength = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')

    lines.forEach((line, index) => {
        if (line.length > 120) {
            violations.push({
                type: 'line-length',
                line: index + 1,
                column: 121,
                message: 'Line exceeds 120 character limit',
                rule: 'line-length',
            })
        }
    })

    return violations
}

export { checkLineLength }
