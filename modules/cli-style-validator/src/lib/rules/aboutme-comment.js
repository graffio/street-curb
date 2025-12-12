// ABOUTME: Rule to detect missing ABOUTME comments at file top
// ABOUTME: Enforces two-line ABOUTME header in all source files

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

/**
 * Check if line is an ABOUTME comment
 * @sig isAboutmeComment :: String -> Boolean
 */
const isAboutmeComment = line => line.trim().startsWith('// ABOUTME:')

/**
 * Find the first non-empty, non-comment line index
 * @sig findFirstCodeLine :: [String] -> Number
 */
const findFirstCodeLine = lines => {
    const isCodeLine = line => {
        const trimmed = line.trim()
        if (trimmed === '') return false
        if (trimmed.startsWith('//')) return false
        if (trimmed.startsWith('/*')) return false
        if (trimmed.startsWith('*')) return false
        return true
    }

    const index = lines.findIndex(isCodeLine)
    return index === -1 ? lines.length : index
}

/**
 * Check for ABOUTME comment violations (coding standards: two ABOUTME lines at top)
 * @sig checkAboutmeComment :: (AST?, String, String) -> [Violation]
 */
const checkAboutmeComment = (ast, sourceCode, filePath) => {
    const lines = sourceCode.split('\n')
    const firstCodeLine = findFirstCodeLine(lines)

    // Get all lines before first code (potential ABOUTME location)
    const headerLines = lines.slice(0, firstCodeLine)

    // Find ABOUTME comments in header
    const aboutmeLines = headerLines.filter(isAboutmeComment)

    if (aboutmeLines.length === 0)
        return [createViolation(1, 'Missing ABOUTME comments. Add two lines starting with "// ABOUTME:" at file top.')]

    if (aboutmeLines.length === 1)
        return [createViolation(1, 'Only one ABOUTME comment found. Add a second "// ABOUTME:" line.')]

    // Check that ABOUTME lines are at the very top (allowing for shebang)
    const firstLine = lines[0]?.trim() || ''
    const isShebang = firstLine.startsWith('#!')
    const expectedFirstAboutme = isShebang ? 1 : 0

    if (!isAboutmeComment(lines[expectedFirstAboutme] || ''))
        return [createViolation(1, 'ABOUTME comments must be at the very top of the file.')]

    if (!isAboutmeComment(lines[expectedFirstAboutme + 1] || ''))
        return [createViolation(2, 'Second ABOUTME comment must immediately follow the first.')]

    return []
}

export { checkAboutmeComment }
