// ABOUTME: Shared factory functions for style validator rules
// ABOUTME: Standardized violation creation to ensure consistent structure
// COMPLEXITY: export-structure — Abbreviated export name FS per conventions.md

import { TS } from './transformers.js'

const FS = {
    // Create a deferral warning for a rule with active COMPLEXITY-TODO
    // @sig createDeferralWarning :: (String, String, Number) -> Warning
    createDeferralWarning: (ruleName, reason, daysRemaining) => ({
        type: `${ruleName}-warning`,
        line: 1,
        column: 1,
        priority: 0,
        message: `COMPLEXITY-TODO deferred: ${ruleName} — "${reason}" (${daysRemaining} days remaining)`,
        rule: ruleName,
        daysRemaining,
    }),

    // Add expired note to violation message
    // @sig createExpiredViolation :: Violation -> Violation
    createExpiredViolation: violation => ({ ...violation, message: `${violation.message} (COMPLEXITY-TODO expired)` }),

    // Wrap a rule check function with COMPLEXITY exemption handling
    // @sig withExemptions :: (String, CheckFn) -> CheckFn
    withExemptions: (ruleName, checkFn) => (ast, sourceCode, filePath) => {
        const { exempt, deferred, expired, reason, daysRemaining } = TS.getExemptionStatus(sourceCode, ruleName)

        if (exempt) return []
        if (deferred) return [FS.createDeferralWarning(ruleName, reason, daysRemaining)]

        const violations = checkFn(ast, sourceCode, filePath)

        if (expired) return violations.map(FS.createExpiredViolation)

        return violations
    },
}

export { FS }
