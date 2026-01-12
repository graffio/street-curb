// ABOUTME: Rule to detect import violations (ES6 imports, design-system wrapping)
// ABOUTME: Enforces standard import patterns across the codebase

import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const P = {
    // Check if line uses CommonJS require()
    // @sig hasRequire :: String -> Boolean
    hasRequire: line => /\brequire\s*\(/.test(line),

    // Check if line imports from @radix-ui/themes directly
    // @sig importsRadixThemes :: String -> Boolean
    importsRadixThemes: line => line.includes('@radix-ui/themes'),

    // Check if file is in design-system module (allowed to use radix)
    // @sig isDesignSystemFile :: String -> Boolean
    isDesignSystemFile: filePath => filePath.includes('modules/design-system/'),
}

const F = {
    // Create a violation object for this rule
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'import-ordering',
        line,
        column: 1,
        message,
        rule: 'import-ordering',
    }),
}

const V = {
    // Validate import statements in source file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (PS.isTestFile(filePath)) return []
        const violations = []
        const lines = sourceCode.split('\n')
        const skipRadixCheck = P.isDesignSystemFile(filePath)

        lines.forEach((line, index) => A.collectLineViolations(line, index + 1, skipRadixCheck, violations))

        return violations
    },
}

const A = {
    // Check a single line for import violations and add to array
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

const checkImportOrdering = FS.withExemptions('import-ordering', V.check)
const ImportOrdering = { checkImportOrdering }
export { ImportOrdering }
