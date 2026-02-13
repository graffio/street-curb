// ABOUTME: Rule to detect import violations (ES6 imports)
// ABOUTME: Enforces standard import patterns across the codebase

import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const P = {
    // Check if line uses CommonJS require syntax
    // @sig hasRequire :: String -> Boolean
    hasRequire: line => /\brequire\s*\(/.test(line),
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

const ImportOrdering = FS.withExemptions('import-ordering', V.check)
export { ImportOrdering }
