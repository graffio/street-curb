// ABOUTME: Rule to detect missing ABOUTME comments at file top
// ABOUTME: Enforces two-line ABOUTME header in all source files

import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

const P = {
    // Check if line starts with ABOUTME marker
    // @sig isAboutmeComment :: String -> Boolean
    isAboutmeComment: line => line.trim().startsWith('// ABOUTME:'),

    // Check if line contains actual code (not empty/comment/shebang)
    // @sig isCodeLine :: String -> Boolean
    isCodeLine: line => {
        const trimmed = line.trim()
        if (trimmed === '') return false
        if (trimmed.startsWith('#!')) return false
        if (trimmed.startsWith('//')) return false
        if (trimmed.startsWith('/*')) return false
        if (trimmed.startsWith('*')) return false
        return true
    },

    // Check if line is a shebang (#!/usr/bin/env node)
    // @sig isShebang :: String -> Boolean
    isShebang: line => line.trim().startsWith('#!'),
}

const violation = FS.createViolation('aboutme-comment', 6)

const F = {
    // Create a violation for this rule
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),
}

const V = {
    // Validate ABOUTME comments at file top
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (PS.isTestFile(filePath)) return []
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
    // Find index of first non-comment line in file
    // @sig findFirstCodeLine :: [String] -> Number
    findFirstCodeLine: lines => {
        const index = lines.findIndex(P.isCodeLine)
        return index === -1 ? lines.length : index
    },
}

// Run aboutme-comment rule with COMPLEXITY exemption support
// @sig checkAboutmeComment :: (AST?, String, String) -> [Violation]
const checkAboutmeComment = (ast, sourceCode, filePath) =>
    FS.withExemptions('aboutme-comment', V.check, ast, sourceCode, filePath)
export { checkAboutmeComment }
