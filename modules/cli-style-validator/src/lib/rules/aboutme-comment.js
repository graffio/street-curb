// ABOUTME: Rule to detect missing ABOUTME comments at file top
// ABOUTME: Enforces two-line ABOUTME header in all source files

const P = {
    // @sig isAboutmeComment :: String -> Boolean
    isAboutmeComment: line => line.trim().startsWith('// ABOUTME:'),

    // @sig isCodeLine :: String -> Boolean
    isCodeLine: line => {
        const trimmed = line.trim()
        if (trimmed === '') return false
        if (trimmed.startsWith('//')) return false
        if (trimmed.startsWith('/*')) return false
        if (trimmed.startsWith('*')) return false
        return true
    },

    // @sig isShebang :: String -> Boolean
    isShebang: line => line.trim().startsWith('#!'),
}

const F = {
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'aboutme-comment',
        line,
        column: 1,
        message,
        rule: 'aboutme-comment',
    }),
}

const V = {
    // @sig checkAboutmeComment :: (AST?, String, String) -> [Violation]
    checkAboutmeComment: (ast, sourceCode, filePath) => {
        const lines = sourceCode.split('\n')
        const firstCodeLine = A.findFirstCodeLine(lines)
        const headerLines = lines.slice(0, firstCodeLine)
        const aboutmeLines = headerLines.filter(P.isAboutmeComment)

        if (aboutmeLines.length === 0)
            return [
                F.createViolation(
                    1,
                    'Missing ABOUTME comments. Add two lines starting with "// ABOUTME:" at file top.',
                ),
            ]

        if (aboutmeLines.length === 1)
            return [F.createViolation(1, 'Only one ABOUTME comment found. Add a second "// ABOUTME:" line.')]

        const expectedFirstAboutme = P.isShebang(lines[0] || '') ? 1 : 0

        if (!P.isAboutmeComment(lines[expectedFirstAboutme] || ''))
            return [F.createViolation(1, 'ABOUTME comments must be at the very top of the file.')]

        if (!P.isAboutmeComment(lines[expectedFirstAboutme + 1] || ''))
            return [F.createViolation(2, 'Second ABOUTME comment must immediately follow the first.')]

        return []
    },
}

const A = {
    // @sig findFirstCodeLine :: [String] -> Number
    findFirstCodeLine: lines => {
        const index = lines.findIndex(P.isCodeLine)
        return index === -1 ? lines.length : index
    },
}

const checkAboutmeComment = V.checkAboutmeComment
export { checkAboutmeComment }
