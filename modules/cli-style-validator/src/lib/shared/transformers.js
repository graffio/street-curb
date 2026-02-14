// ABOUTME: Shared transformer functions for style validator rules
// ABOUTME: Parsing and transformation utilities for COMPLEXITY comments

// Regex patterns for COMPLEXITY comments
const COMPLEXITY_PATTERN = /^\/\/\s*COMPLEXITY:\s*(\S+)\s*(?:—\s*(.+))?$/
const COMPLEXITY_TODO_BASE = /^\/\/\s*COMPLEXITY-TODO:\s*(\S+)/
const EXPIRES_PATTERN = /\(expires\s+(\S+)\)\s*$/

const TS = {
    // Convert kebab-case or snake_case to PascalCase
    // @sig toPascalCase :: String -> String
    toPascalCase: str =>
        str.includes('-') || str.includes('_')
            ? str
                  .split(/[-_]/)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join('')
            : str.charAt(0).toUpperCase() + str.slice(1),

    // Strip comment markers (//, /*, *, */) from a line to get content
    // @sig toCommentContent :: String -> String
    toCommentContent: line =>
        line
            .trim()
            .replace(/^\/\*\*?/, '')
            .replace(/^\*\//, '')
            .replace(/^\/\//, '')
            .replace(/^\*/, ''),

    // Parse COMPLEXITY-TODO comment after base match
    // @sig parseTodoComment :: (String, RegExpMatchArray) -> ParseResult
    parseTodoComment: (trimmed, todoBaseMatch) => {
        const rule = todoBaseMatch[1]
        const afterRule = trimmed.slice(todoBaseMatch[0].length).trim()

        if (!afterRule.startsWith('—')) return { rule, error: 'COMPLEXITY-TODO requires a reason after —' }

        const expiresMatch = afterRule.match(EXPIRES_PATTERN)
        const reasonEndIdx = expiresMatch ? afterRule.indexOf('(expires') : undefined
        const reason = afterRule.slice(1, reasonEndIdx).trim()

        if (!expiresMatch)
            return {
                rule,
                reason: reason || undefined,
                error: 'COMPLEXITY-TODO requires expiration date (expires YYYY-MM-DD)',
            }

        const expires = expiresMatch[1]

        if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) return { rule, reason, error: `Invalid date format: ${expires}` }

        const date = new Date(expires)
        if (isNaN(date.getTime())) return { rule, reason, error: `Invalid date: ${expires}` }

        return { rule, reason, expires }
    },

    // Parse permanent COMPLEXITY comment after match
    // @sig parsePermanentComment :: RegExpMatchArray -> ParseResult
    parsePermanentComment: permanentMatch => {
        const [, rule, reason] = permanentMatch
        if (!reason) return { rule, error: 'COMPLEXITY requires a reason after —' }
        return { rule, reason }
    },

    // Parse a single COMPLEXITY comment line
    // @sig parseSingleComplexityComment :: String -> { rule, reason?, expires?, error? } | null
    parseSingleComplexityComment: line => {
        const trimmed = line.trim()

        const todoBaseMatch = trimmed.match(COMPLEXITY_TODO_BASE)
        if (todoBaseMatch) return TS.parseTodoComment(trimmed, todoBaseMatch)

        const permanentMatch = trimmed.match(COMPLEXITY_PATTERN)
        if (permanentMatch) return TS.parsePermanentComment(permanentMatch)

        return null
    },

    // Parse all COMPLEXITY comments from source code
    // @sig parseComplexityComments :: String -> [{ rule, reason?, expires?, error? }]
    parseComplexityComments: sourceCode => sourceCode.split('\n').map(TS.parseSingleComplexityComment).filter(Boolean),

    // Get full exemption status for a rule
    // @sig getExemptionStatus :: (String, String) -> ExemptionStatus
    getExemptionStatus: (sourceCode, ruleName) => {
        const comments = TS.parseComplexityComments(sourceCode)
        const comment = comments.find(c => c.rule === ruleName)

        if (!comment) return { exempt: false, deferred: false, expired: false }

        const { error, expires, reason } = comment
        if (error) return { exempt: false, deferred: false, expired: false, error }
        if (!expires) return { exempt: true, deferred: false, reason }

        const expiresDate = new Date(expires)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        expiresDate.setHours(0, 0, 0, 0)

        const daysRemaining = Math.ceil((expiresDate - today) / (1000 * 60 * 60 * 24))

        if (daysRemaining < 0) return { exempt: false, deferred: false, expired: true, reason }

        return {
            exempt: false,
            deferred: true,
            expired: false,
            daysRemaining,
            reason,
            warning: `COMPLEXITY-TODO deferred: ${ruleName} — "${reason}" (${daysRemaining} days remaining)`,
        }
    },
}

export { TS as Transformers }
