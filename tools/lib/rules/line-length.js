/**
 * Create a line-length violation object
 * @sig createViolation :: (Number, Number, String) -> Violation
 */
const createViolation = (line, column, message) => ({ type: 'line-length', line, column, message, rule: 'line-length' })

/**
 * Check for line length violations (A001 standard: max 120 characters)
 * @sig checkLineLength :: (AST?, String, String) -> [Violation]
 */
const checkLineLength = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')

    lines.forEach((line, index) => {
        if (line.length > 120) violations.push(createViolation(index + 1, 121, 'Line exceeds 120 character limit'))
    })

    return violations
}

export { checkLineLength }
