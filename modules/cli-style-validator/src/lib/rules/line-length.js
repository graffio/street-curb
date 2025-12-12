// ABOUTME: Rule to detect lines exceeding 120 characters
// ABOUTME: Suggests extracting variables rather than wrapping lines

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

    const message =
        'Line exceeds 120 characters. Extract a sub-expression into a named variable to shorten (do not just wrap).'
    violations.push(createViolation(index + 1, 121, message))
}

/**
 * Check for line length violations (coding standards: max 120 characters)
 * @sig checkLineLength :: (AST?, String, String) -> [Violation]
 */
const checkLineLength = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')

    lines.forEach((line, index) => processLineForLength(line, index, violations))

    return violations
}

export { checkLineLength }
