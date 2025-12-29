// ABOUTME: Rule to detect import violations
// ABOUTME: Enforces ES6 imports, no require(), and @graffio/design-system over @radix-ui/themes

// ============================================================================
// P: Predicates
// ============================================================================

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
 * Check if file is within the design-system module (allowed to import from radix)
 * @sig isDesignSystemFile :: String -> Boolean
 */
const isDesignSystemFile = filePath => filePath.includes('modules/design-system/')

const P = { hasRequire, importsRadixThemes, isDesignSystemFile }

// ============================================================================
// F: Factories
// ============================================================================

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

const F = { createViolation }

// ============================================================================
// A: Aggregators
// ============================================================================

/**
 * Collect violations for a single line
 * @sig collectLineViolations :: (String, Number, Boolean, [Violation]) -> Void
 */
const collectLineViolations = (line, lineNum, skipRadixCheck, violations) => {
    if (P.hasRequire(line)) violations.push(F.createViolation(lineNum, 'Use ES6 import syntax instead of require()'))
    if (!skipRadixCheck && P.importsRadixThemes(line))
        violations.push(F.createViolation(lineNum, 'Import from @graffio/design-system instead of @radix-ui/themes'))
}

const A = { collectLineViolations }

// ============================================================================
// V: Validators
// ============================================================================

/**
 * Check for import violations (coding standards)
 * @sig checkImportOrdering :: (AST?, String, String) -> [Violation]
 */
const checkImportOrdering = (ast, sourceCode, filePath) => {
    const violations = []
    const lines = sourceCode.split('\n')
    const skipRadixCheck = P.isDesignSystemFile(filePath)

    lines.forEach((line, index) => A.collectLineViolations(line, index + 1, skipRadixCheck, violations))

    return violations
}

export { checkImportOrdering }
