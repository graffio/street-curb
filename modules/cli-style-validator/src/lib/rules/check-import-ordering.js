// ABOUTME: Rule to detect import violations (ES6 imports)
// ABOUTME: Enforces standard import patterns across the codebase

import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

const P = {
    // Check if line uses CommonJS require syntax
    // @sig hasRequire :: String -> Boolean
    hasRequire: line => /\brequire\s*\(/.test(line),
}

const violation = FS.createViolation('import-ordering', 4)

const F = {
    // Create an import-ordering violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),
}

const V = {
    // Validate import statements in source file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (PS.isTestFile(filePath)) return []
        const violations = []
        const lines = sourceCode.split('\n')

        lines.forEach((line, index) => A.collectLineViolations(line, index + 1, violations))

        return violations
    },
}

const A = {
    // Check a single line for import violations and add to array
    // @sig collectLineViolations :: (String, Number, [Violation]) -> Void
    collectLineViolations: (line, lineNum, violations) => {
        if (P.hasRequire(line))
            violations.push(F.createViolation(lineNum, 'Use ES6 import syntax instead of CommonJS require'))
    },
}

// Run import-ordering rule with COMPLEXITY exemption support
// @sig checkImportOrdering :: (AST?, String, String) -> [Violation]
const checkImportOrdering = (ast, sourceCode, filePath) =>
    FS.withExemptions('import-ordering', V.check, ast, sourceCode, filePath)
export { checkImportOrdering }
