// ABOUTME: Shared factory functions for style validator rules
// ABOUTME: Standardized violation creation to ensure consistent structure

// Create a violation factory for a specific rule
// @sig createViolation :: (String, Number) -> (Number, String) -> Violation
//
// Usage:
//   const violation = FS.createViolation('aboutme-comment', 0)
//   violations.push(violation(1, 'Missing ABOUTME comments'))
const createViolation = (rule, priority) => (line, message) => ({
    type: rule,
    line,
    column: 1,
    priority,
    message,
    rule,
})

const FS = { createViolation }

export { FS }
