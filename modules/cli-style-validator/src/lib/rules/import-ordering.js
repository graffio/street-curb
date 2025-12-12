// ABOUTME: Rule to detect import violations
// ABOUTME: Enforces ES6 imports, no require(), and @graffio/design-system over @radix-ui/themes

/**
 * Create an import-ordering violation object
 * @sig createViolation :: (Number, String) -> Violation
 */
const createViolation = (line, message) => ({
    type: 'import-ordering',
    line,
    column: 1,
    message,
    rule: 'import-ordering',
})

/**
 * Check if line contains require() call
 * @sig hasRequire :: String -> Boolean
 */
const hasRequire = line => /\brequire\s*\(/.test(line)

/**
 * Check if line imports from @radix-ui/themes
 * @sig importsRadixThemes :: String -> Boolean
 */
const importsRadixThemes = line => line.includes('@radix-ui/themes')

/**
 * Process line for import violations
 * @sig processLine :: (String, Number, [Violation]) -> Void
 */
const processLine = (line, index, violations) => {
    const lineNum = index + 1

    if (hasRequire(line)) violations.push(createViolation(lineNum, 'Use ES6 import syntax instead of require()'))

    if (importsRadixThemes(line))
        violations.push(createViolation(lineNum, 'Import from @graffio/design-system instead of @radix-ui/themes'))
}

/**
 * Check for import violations (coding standards)
 * @sig checkImportOrdering :: (AST?, String, String) -> [Violation]
 */
const checkImportOrdering = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')

    lines.forEach((line, index) => processLine(line, index, violations))

    return violations
}

export { checkImportOrdering }
