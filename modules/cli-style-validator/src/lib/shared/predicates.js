// ABOUTME: Shared predicate functions for style validator rules
// ABOUTME: Unified file/AST predicates to avoid duplication across rules
// COMPLEXITY: lines — Shared module consolidating predicates from multiple rules
// COMPLEXITY: functions — Shared module consolidating predicates from multiple rules

import { AST, ASTNode } from '@graffio/ast'

// Regex patterns for COMPLEXITY comments
const COMPLEXITY_PATTERN = /^\/\/\s*COMPLEXITY:\s*(\S+)\s*(?:—\s*(.+))?$/
const COMPLEXITY_TODO_BASE = /^\/\/\s*COMPLEXITY-TODO:\s*(\S+)/
const EXPIRES_PATTERN = /\(expires\s+(\S+)\)\s*$/

const PS = {
    // Check if file is a test file that should skip validation
    // @sig isTestFile :: String -> Boolean
    isTestFile: filePath =>
        filePath.includes('.tap.js') ||
        filePath.includes('.test.js') ||
        filePath.includes('.integration-test.js') ||
        filePath.includes('/test/'),

    // Check if a line is a comment line
    // @sig isCommentLine :: String -> Boolean
    isCommentLine: line => {
        const trimmed = line.trim()
        return (
            trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')
        )
    },

    // Check if a node represents a function (declaration, expression, or arrow)
    // @sig isFunctionNode :: ASTNode -> Boolean
    isFunctionNode: node =>
        AST.hasType(node, 'FunctionDeclaration') ||
        AST.hasType(node, 'FunctionExpression') ||
        AST.hasType(node, 'ArrowFunctionExpression'),

    // Check if a node is a function declaration statement
    // @sig isFunctionDeclaration :: ASTNode -> Boolean
    isFunctionDeclaration: node => AST.hasType(node, 'FunctionDeclaration'),

    // Check if a node is a variable declaration with a function expression
    // @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
    isFunctionVariableDeclaration: node => {
        if (!AST.hasType(node, 'VariableDeclaration')) return false
        return AST.declarations(node).some(declaration => {
            const init = AST.rhs(declaration)
            return init && PS.isFunctionNode(init)
        })
    },

    // Check if a node is a function statement (declaration or variable with function)
    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => PS.isFunctionDeclaration(node) || PS.isFunctionVariableDeclaration(node),

    // Check if source code is from a generated file
    // @sig isGeneratedFile :: String -> Boolean
    isGeneratedFile: sourceCode => {
        const markers = ['do not edit ' + 'manually', 'Auto-' + 'generated']
        return markers.some(marker => sourceCode.includes(marker))
    },

    // Check if node is valid for traversal (is an ASTNode with type)
    // @sig isValidNode :: Any -> Boolean
    isValidNode: node => ASTNode.isASTNode(node) && AST.nodeType(node),

    // Check if node is a block statement
    // @sig isBlockStatement :: ASTNode -> Boolean
    isBlockStatement: node => AST.hasType(node, 'BlockStatement'),

    // Check if a name is PascalCase (starts with uppercase, alphanumeric)
    // @sig isPascalCase :: String -> Boolean
    isPascalCase: name => /^[A-Z][a-zA-Z0-9]*$/.test(name),

    // Check if name is kebab-case (lowercase with hyphens)
    // @sig isKebabCase :: String -> Boolean
    isKebabCase: name => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name),

    // Check if a node spans multiple lines
    // @sig isMultilineNode :: ASTNode -> Boolean
    isMultilineNode: node => AST.endLine(node) > AST.startLine(node),

    // Check if function counts toward complexity
    // @sig isComplexFunction :: ASTNode -> Boolean
    isComplexFunction: node => PS.isFunctionNode(node),

    // Check if node is a function with a block body (not expression)
    // @sig isFunctionWithBlockBody :: ASTNode -> Boolean
    isFunctionWithBlockBody: node => {
        if (!PS.isFunctionNode(node)) return false
        const body = AST.functionBody(node)
        return body && AST.hasType(body, 'BlockStatement')
    },

    // Check if statement returns JSX element or fragment
    // @sig hasJSXReturnStatement :: ASTNode -> Boolean
    hasJSXReturnStatement: statement => {
        if (!AST.hasType(statement, 'ReturnStatement')) return false
        const argument = AST.returnArgument(statement)
        if (!argument) return false
        const argType = AST.nodeType(argument)
        return argType === 'JSXElement' || argType === 'JSXFragment'
    },

    // Check if function returns JSX (arrow expression or block return)
    // @sig isJSXFunction :: ASTNode -> Boolean
    isJSXFunction: node => {
        const body = AST.functionBody(node)
        if (!body) return false
        const bodyType = AST.nodeType(body)
        if (AST.isExpressionArrow(node) && (bodyType === 'JSXElement' || bodyType === 'JSXFragment')) return true
        if (bodyType === 'BlockStatement') return AST.blockStatements(body).some(PS.hasJSXReturnStatement)
        return false
    },

    // Check if function is the inner part of a curried function (body of another arrow)
    // @sig isInnerCurriedFunction :: (ASTNode, ASTNode?) -> Boolean
    isInnerCurriedFunction: (node, parent) => {
        if (!parent) return false
        if (!AST.hasType(parent, 'ArrowFunctionExpression')) return false
        const body = AST.functionBody(parent)
        return body && AST.isSameNode(body, node) && PS.isFunctionNode(node)
    },

    // Strip comment markers (//, /*, *, */) from a line to get content
    // @sig toCommentContent :: String -> String
    toCommentContent: line =>
        line
            .trim()
            .replace(/^\/\*\*?/, '')
            .replace(/^\*\//, '')
            .replace(/^\/\//, '')
            .replace(/^\*/, ''),

    // Check if line is a prettier-ignore or eslint directive comment
    // @sig isDirectiveComment :: String -> Boolean
    isDirectiveComment: line => {
        const content = PS.toCommentContent(line).trim().toLowerCase()
        return content.startsWith('prettier-ignore') || content.startsWith('eslint-')
    },

    // Check if line is not a comment (actual code or empty)
    // @sig isNonCommentLine :: String -> Boolean
    isNonCommentLine: line => {
        const trimmed = line.trim()
        return trimmed && !PS.isCommentLine(trimmed)
    },

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
        if (todoBaseMatch) return PS.parseTodoComment(trimmed, todoBaseMatch)

        const permanentMatch = trimmed.match(COMPLEXITY_PATTERN)
        if (permanentMatch) return PS.parsePermanentComment(permanentMatch)

        return null
    },

    // Parse all COMPLEXITY comments from source code
    // @sig parseComplexityComments :: String -> [{ rule, reason?, expires?, error? }]
    parseComplexityComments: sourceCode => sourceCode.split('\n').map(PS.parseSingleComplexityComment).filter(Boolean),

    // Check if comment matches a rule and is a permanent exemption
    // @sig isPermanentExemption :: (String, { rule, expires?, error? }) -> Boolean
    isPermanentExemption: (ruleName, { rule, expires, error }) => rule === ruleName && !expires && !error,

    // Check if a rule has a permanent exemption (not TODO)
    // @sig isExempt :: (String, String) -> Boolean
    isExempt: (sourceCode, ruleName) =>
        PS.parseComplexityComments(sourceCode).some(c => PS.isPermanentExemption(ruleName, c)),

    // Get full exemption status for a rule
    // @sig getExemptionStatus :: (String, String) -> ExemptionStatus
    getExemptionStatus: (sourceCode, ruleName) => {
        const comments = PS.parseComplexityComments(sourceCode)
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

export { PS }
