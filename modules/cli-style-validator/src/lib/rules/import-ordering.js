// ABOUTME: Rule to detect import violations
// ABOUTME: Enforces ES6 imports, no require(), and @graffio/design-system over @radix-ui/themes

const P = {
    // @sig hasRequire :: String -> Boolean
    hasRequire: line => /\brequire\s*\(/.test(line),

    // @sig importsRadixThemes :: String -> Boolean
    importsRadixThemes: line => line.includes('@radix-ui/themes'),

    // @sig isDesignSystemFile :: String -> Boolean
    isDesignSystemFile: filePath => filePath.includes('modules/design-system/'),
}

const F = {
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'import-ordering',
        line,
        column: 1,
        message,
        rule: 'import-ordering',
    }),
}

const A = {
    // @sig collectLineViolations :: (String, Number, Boolean, [Violation]) -> Void
    collectLineViolations: (line, lineNum, skipRadixCheck, violations) => {
        if (P.hasRequire(line))
            violations.push(F.createViolation(lineNum, 'Use ES6 import syntax instead of require()'))
        if (!skipRadixCheck && P.importsRadixThemes(line))
            violations.push(
                F.createViolation(lineNum, 'Import from @graffio/design-system instead of @radix-ui/themes'),
            )
    },
}

const V = {
    // @sig checkImportOrdering :: (AST?, String, String) -> [Violation]
    checkImportOrdering: (ast, sourceCode, filePath) => {
        const violations = []
        const lines = sourceCode.split('\n')
        const skipRadixCheck = P.isDesignSystemFile(filePath)

        lines.forEach((line, index) => A.collectLineViolations(line, index + 1, skipRadixCheck, violations))

        return violations
    },
}

const checkImportOrdering = V.checkImportOrdering
export { checkImportOrdering }
