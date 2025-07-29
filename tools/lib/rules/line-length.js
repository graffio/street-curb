/**
 * Create a line-length violation object
 * @sig createViolation :: (Number, Number, String) -> Violation
 */
const createViolation = (line, column, message) => ({ type: 'line-length', line, column, message, rule: 'line-length' })

/**
 * Process line for length violations
 * @sig processLineForLength :: (String, Number, [Violation]) -> Void
 */
const processLineForLength = (line, index, violations) => {
    if (line.length <= 120) return
    violations.push(createViolation(index + 1, 121, 'Line exceeds 120 character limit'))
}

/**
 * Check for line length violations (A001 standard: max 120 characters)
 * @sig checkLineLength :: (AST?, String, String) -> [Violation]
 */
const checkLineLength = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')

    lines.forEach((line, index) => processLineForLength(line, index, violations))

    return violations
}

export { checkLineLength }
