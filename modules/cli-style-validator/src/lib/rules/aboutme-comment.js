// ABOUTME: Rule to detect missing ABOUTME comments at file top
// ABOUTME: Enforces two-line ABOUTME header in all source files

// ============================================================================
// P: Predicates
// ============================================================================

/**
 * Check if line is an ABOUTME comment
 * @sig isAboutmeComment :: String -> Boolean
 */
const isAboutmeComment = line => line.trim().startsWith('// ABOUTME:')

/**
 * Check if line is code (non-empty, non-comment)
 * @sig isCodeLine :: String -> Boolean
 */
const isCodeLine = line => {
    const trimmed = line.trim()
    if (trimmed === '') return false
    if (trimmed.startsWith('//')) return false
    if (trimmed.startsWith('/*')) return false
    if (trimmed.startsWith('*')) return false
    return true
}

/**
 * Check if line is a shebang
 * @sig isShebang :: String -> Boolean
 */
const isShebang = line => line.trim().startsWith('#!')

const P = { isAboutmeComment, isCodeLine, isShebang }

// ============================================================================
// F: Factories
// ============================================================================

/**
 * Create an aboutme-comment violation object
 * @sig createViolation :: (Number, String) -> Violation
 */
const createViolation = (line, message) => ({
    type: 'aboutme-comment',
    line,
    column: 1,
    message,
    rule: 'aboutme-comment',
})

const F = { createViolation }

// ============================================================================
// A: Aggregators
// ============================================================================

/**
 * Find the first non-empty, non-comment line index
 * @sig findFirstCodeLine :: [String] -> Number
 */
const findFirstCodeLine = lines => {
    const index = lines.findIndex(P.isCodeLine)
    return index === -1 ? lines.length : index
}

const A = { findFirstCodeLine }

// ============================================================================
// V: Validators
// ============================================================================

/**
 * Check for ABOUTME comment violations (coding standards: two ABOUTME lines at top)
 * @sig checkAboutmeComment :: (AST?, String, String) -> [Violation]
 */
const checkAboutmeComment = (ast, sourceCode, filePath) => {
    const lines = sourceCode.split('\n')
    const firstCodeLine = A.findFirstCodeLine(lines)
    const headerLines = lines.slice(0, firstCodeLine)
    const aboutmeLines = headerLines.filter(P.isAboutmeComment)

    if (aboutmeLines.length === 0)
        return [
            F.createViolation(1, 'Missing ABOUTME comments. Add two lines starting with "// ABOUTME:" at file top.'),
        ]

    if (aboutmeLines.length === 1)
        return [F.createViolation(1, 'Only one ABOUTME comment found. Add a second "// ABOUTME:" line.')]

    const expectedFirstAboutme = P.isShebang(lines[0] || '') ? 1 : 0

    if (!P.isAboutmeComment(lines[expectedFirstAboutme] || ''))
        return [F.createViolation(1, 'ABOUTME comments must be at the very top of the file.')]

    if (!P.isAboutmeComment(lines[expectedFirstAboutme + 1] || ''))
        return [F.createViolation(2, 'Second ABOUTME comment must immediately follow the first.')]

    return []
}

export { checkAboutmeComment }
