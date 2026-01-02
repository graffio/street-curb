// ABOUTME: Shared predicate functions for style validator rules
// ABOUTME: Unified file/AST predicates to avoid duplication across rules
// COMPLEXITY-TODO: lines — will refactor to inline-in-namespace style (expires 2026-02-01)
// COMPLEXITY-TODO: functions — will refactor to inline-in-namespace style (expires 2026-02-01)
// COMPLEXITY-TODO: cohesion-structure — shared module uses module-level functions exported via PS namespace (expires 2026-02-01)
// COMPLEXITY-TODO: chain-extraction — will fix during inline-in-namespace refactor (expires 2026-02-01)
// COMPLEXITY-TODO: single-level-indentation — parseSingleComplexityComment requires conditionals (expires 2026-02-01)
// COMPLEXITY-TODO: line-length — will fix during refactor (expires 2026-02-01)

// Check if file is a test file that should skip validation
// Unified version: includes .tap.js, .test.js, .integration-test.js, and /test/ directory
// @sig isTestFile :: String -> Boolean
const isTestFile = filePath =>
    filePath.includes('.tap.js') ||
    filePath.includes('.test.js') ||
    filePath.includes('.integration-test.js') ||
    filePath.includes('/test/')

// Check if a line is a comment line
// Unified version: includes //, /*, *, and */ patterns
// @sig isCommentLine :: String -> Boolean
const isCommentLine = line => {
    const trimmed = line.trim()
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')
}

// Check if a node represents a function (declaration, expression, or arrow)
// @sig isFunctionNode :: ASTNode -> Boolean
const isFunctionNode = node =>
    node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression'

// Check if a node is a function declaration statement
// @sig isFunctionDeclaration :: ASTNode -> Boolean
const isFunctionDeclaration = node => node.type === 'FunctionDeclaration'

// Check if a node is a variable declaration with a function expression
// @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
const isFunctionVariableDeclaration = node =>
    node.type === 'VariableDeclaration' && node.declarations.some(d => d.init && isFunctionNode(d.init))

// Check if a node is a function statement (declaration or variable with function)
// @sig isFunctionStatement :: ASTNode -> Boolean
const isFunctionStatement = node => isFunctionDeclaration(node) || isFunctionVariableDeclaration(node)

// Check if source code is from a generated file
// @sig isGeneratedFile :: String -> Boolean
const isGeneratedFile = sourceCode => {
    const markers = ['do not edit ' + 'manually', 'Auto-' + 'generated']
    return markers.some(marker => sourceCode.includes(marker))
}

// Check if node is valid for traversal (has type property)
// @sig isValidNode :: Any -> Boolean
const isValidNode = node => node && typeof node === 'object' && node.type

// Check if node is a block statement
// @sig isBlockStatement :: ASTNode -> Boolean
const isBlockStatement = node => node.type === 'BlockStatement'

// Check if a name is PascalCase (starts with uppercase, alphanumeric)
// @sig isPascalCase :: String -> Boolean
const isPascalCase = name => /^[A-Z][a-zA-Z0-9]*$/.test(name)

// Check if a node spans multiple lines
// @sig isMultilineNode :: ASTNode -> Boolean
const isMultilineNode = node => node.loc && node.loc.end.line > node.loc.start.line

// Check if function counts toward complexity
// @sig isComplexFunction :: ASTNode -> Boolean
const isComplexFunction = node => isFunctionNode(node)

// Check if node is a function with a block body (not expression)
// @sig isFunctionWithBlockBody :: ASTNode -> Boolean
const isFunctionWithBlockBody = node => isFunctionNode(node) && node.body?.type === 'BlockStatement'

// Check if statement returns JSX element or fragment
// @sig hasJSXReturnStatement :: Statement -> Boolean
const hasJSXReturnStatement = stmt => {
    if (stmt.type !== 'ReturnStatement' || !stmt.argument) return false
    return stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment'
}

// Check if function returns JSX (arrow expression or block return)
// @sig isJSXFunction :: ASTNode -> Boolean
const isJSXFunction = node => {
    if (!node.body) return false
    if (node.expression && (node.body.type === 'JSXElement' || node.body.type === 'JSXFragment')) return true
    if (node.body.type === 'BlockStatement') return node.body.body.some(hasJSXReturnStatement)
    return false
}

// Check if function is the inner part of a curried function (body of another arrow)
// @sig isInnerCurriedFunction :: (ASTNode, ASTNode?) -> Boolean
const isInnerCurriedFunction = (node, parent) =>
    parent?.type === 'ArrowFunctionExpression' && parent.body === node && isFunctionNode(node)

// Strip comment markers (//, /*, *, */) from a line to get content
// @sig toCommentContent :: String -> String
const toCommentContent = line =>
    line
        .trim()
        .replace(/^\/\*\*?/, '')
        .replace(/^\*\//, '')
        .replace(/^\/\//, '')
        .replace(/^\*/, '')

// Check if line is a prettier-ignore or eslint directive comment
// @sig isDirectiveComment :: String -> Boolean
const isDirectiveComment = line => {
    const content = toCommentContent(line).trim().toLowerCase()
    return content.startsWith('prettier-ignore') || content.startsWith('eslint-')
}

// Check if line is not a comment (actual code or empty)
// @sig isNonCommentLine :: String -> Boolean
const isNonCommentLine = line => {
    const trimmed = line.trim()
    return trimmed && !isCommentLine(trimmed)
}

// Regex patterns for COMPLEXITY comments
// COMPLEXITY: rule — reason
// COMPLEXITY-TODO: rule — reason (expires YYYY-MM-DD)
const COMPLEXITY_PATTERN = /^\/\/\s*COMPLEXITY:\s*(\S+)\s*(?:—\s*(.+))?$/
const COMPLEXITY_TODO_BASE = /^\/\/\s*COMPLEXITY-TODO:\s*(\S+)/
const EXPIRES_PATTERN = /\(expires\s+(\S+)\)\s*$/

// Parse a single COMPLEXITY comment line
// @sig parseSingleComplexityComment :: String -> { rule, reason?, expires?, error? } | null
const parseSingleComplexityComment = line => {
    const trimmed = line.trim()

    const todoBaseMatch = trimmed.match(COMPLEXITY_TODO_BASE)
    if (todoBaseMatch) {
        const rule = todoBaseMatch[1]
        const afterRule = trimmed.slice(todoBaseMatch[0].length).trim()

        if (!afterRule.startsWith('—')) return { rule, error: 'COMPLEXITY-TODO requires a reason after —' }

        const expiresMatch = afterRule.match(EXPIRES_PATTERN)
        if (!expiresMatch) {
            const reason = afterRule.slice(1).trim()
            return {
                rule,
                reason: reason || undefined,
                error: 'COMPLEXITY-TODO requires expiration date (expires YYYY-MM-DD)',
            }
        }

        const expires = expiresMatch[1]
        const reason = afterRule.slice(1, afterRule.indexOf('(expires')).trim()

        if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) return { rule, reason, error: `Invalid date format: ${expires}` }

        const date = new Date(expires)
        if (isNaN(date.getTime())) return { rule, reason, error: `Invalid date: ${expires}` }

        return { rule, reason, expires }
    }

    const permanentMatch = trimmed.match(COMPLEXITY_PATTERN)
    if (permanentMatch) {
        const [, rule, reason] = permanentMatch
        if (!reason) return { rule, error: 'COMPLEXITY requires a reason after —' }
        return { rule, reason }
    }

    return null
}

// Parse all COMPLEXITY comments from source code
// @sig parseComplexityComments :: String -> [{ rule, reason?, expires?, error? }]
const parseComplexityComments = sourceCode => {
    const lines = sourceCode.split('\n')
    return lines.map(parseSingleComplexityComment).filter(Boolean)
}

// Check if a rule has a permanent exemption (not TODO)
// @sig isExempt :: (String, String) -> Boolean
const isExempt = (sourceCode, ruleName) => {
    const comments = parseComplexityComments(sourceCode)
    return comments.some(c => c.rule === ruleName && !c.expires && !c.error)
}

// Get full exemption status for a rule
// @sig getExemptionStatus :: (String, String) -> ExemptionStatus
const getExemptionStatus = (sourceCode, ruleName) => {
    const comments = parseComplexityComments(sourceCode)
    const comment = comments.find(c => c.rule === ruleName)

    if (!comment) return { exempt: false, deferred: false, expired: false }

    if (comment.error) return { exempt: false, deferred: false, expired: false, error: comment.error }

    if (!comment.expires) return { exempt: true, deferred: false, reason: comment.reason }

    const expiresDate = new Date(comment.expires)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiresDate.setHours(0, 0, 0, 0)

    const daysRemaining = Math.ceil((expiresDate - today) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) return { exempt: false, deferred: false, expired: true, reason: comment.reason }

    return {
        exempt: false,
        deferred: true,
        expired: false,
        daysRemaining,
        reason: comment.reason,
        warning: `COMPLEXITY-TODO deferred: ${ruleName} — "${comment.reason}" (${daysRemaining} days remaining)`,
    }
}

const PS = {
    getExemptionStatus,
    hasJSXReturnStatement,
    isBlockStatement,
    isCommentLine,
    isExempt,
    isNonCommentLine,
    isComplexFunction,
    isDirectiveComment,
    isFunctionDeclaration,
    isFunctionNode,
    isFunctionStatement,
    isFunctionVariableDeclaration,
    isFunctionWithBlockBody,
    isGeneratedFile,
    isInnerCurriedFunction,
    isJSXFunction,
    isMultilineNode,
    isPascalCase,
    isTestFile,
    isValidNode,
    parseComplexityComments,
    toCommentContent,
}

export { PS }
