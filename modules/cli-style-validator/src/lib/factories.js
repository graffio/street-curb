// ABOUTME: Shared factory functions for style validator rules
// ABOUTME: Standardized violation creation to ensure consistent structure

import { PS } from './predicates.js'

const F = {
    // Create a violation factory for a specific rule
    // Usage: const violation = FS.createViolation('aboutme-comment', 0)
    // @sig createViolation :: (String, Number) -> (Number, String) -> Violation
    createViolation: (rule, priority) => (line, message) => ({ type: rule, line, column: 1, priority, message, rule }),

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
    // @sig toExpiredViolation :: Violation -> Violation
    toExpiredViolation: violation => ({ ...violation, message: `${violation.message} (COMPLEXITY-TODO expired)` }),

    // Wrap a rule check function with COMPLEXITY exemption handling
    // @sig withExemptions :: (String, CheckFn) -> CheckFn
    withExemptions: (ruleName, checkFn) => (ast, sourceCode, filePath) => {
        const { exempt, deferred, expired, reason, daysRemaining } = PS.getExemptionStatus(sourceCode, ruleName)

        if (exempt) return []
        if (deferred) return [F.createDeferralWarning(ruleName, reason, daysRemaining)]

        const violations = checkFn(ast, sourceCode, filePath)

        if (expired) return violations.map(F.toExpiredViolation)

        return violations
    },
}

const FS = { createViolation: F.createViolation, withExemptions: F.withExemptions }

export { FS }
