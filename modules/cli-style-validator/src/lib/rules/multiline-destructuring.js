// ABOUTME: Rule to detect wasteful multiline destructuring patterns
// ABOUTME: Suggests compacting destructuring to fit on fewer lines when possible

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 3
const MAX_LINE_LENGTH = 120

const P = {
    // Check if raw ESTree node is an object pattern
    // @sig isObjectPattern :: ESTreeNode -> Boolean
    isObjectPattern: node => node?.type === 'ObjectPattern',

    // Check if raw ESTree node is an array pattern
    // @sig isArrayPattern :: ESTreeNode -> Boolean
    isArrayPattern: node => node?.type === 'ArrayPattern',

    // Check if raw ESTree node is a destructuring pattern (object or array)
    // @sig isDestructuringPattern :: ESTreeNode -> Boolean
    isDestructuringPattern: node => P.isObjectPattern(node) || P.isArrayPattern(node),

    // Check if declaration uses destructuring
    // @sig hasDestructuring :: ASTNode -> Boolean
    hasDestructuring: node => {
        if (!ASTNode.VariableDeclaration.is(node)) return false
        const declarator = node.esTree.declarations?.[0]
        if (!declarator) return false
        return P.isDestructuringPattern(declarator.id)
    },

    // Check if destructuring spans multiple lines
    // @sig isMultiline :: ASTNode -> Boolean
    isMultiline: node => node.lineCount > 1,
}

const T = {
    // Extract property names from an object pattern (raw ESTree)
    // @sig toPropertyNames :: ESTreeNode -> [String]
    toPropertyNames: pattern => {
        if (!P.isObjectPattern(pattern)) return []
        return (pattern.properties || [])
            .map(prop => {
                if (prop.type === 'RestElement') return '...' + prop.argument?.name
                const key = prop.key?.name || prop.key?.value
                const value = prop.value?.name
                return key === value ? key : `${key}: ${value}`
            })
            .filter(Boolean)
    },

    // Extract element names from an array pattern (raw ESTree)
    // @sig toElementNames :: ESTreeNode -> [String]
    toElementNames: pattern => {
        if (!P.isArrayPattern(pattern)) return []
        return (pattern.elements || []).map(el => {
            if (!el) return ''
            if (el.type === 'RestElement') return '...' + el.argument?.name
            return el.name || ''
        })
    },

    // Build a single-line version of the destructuring (raw ESTree declarator)
    // @sig toCompactForm :: (ESTreeNode, String) -> String
    toCompactForm: (declarator, keyword) => {
        const pattern = declarator.id
        const init = declarator.init
        const initText = init?.name || init?.raw || '...'

        if (P.isObjectPattern(pattern)) {
            const props = T.toPropertyNames(pattern)
            return `${keyword} { ${props.join(', ')} } = ${initText}`
        }

        if (P.isArrayPattern(pattern)) {
            const elements = T.toElementNames(pattern)
            return `${keyword} [${elements.join(', ')}] = ${initText}`
        }

        return ''
    },

    // Calculate how many lines would be needed to fit under 120 chars (raw ESTree declarator)
    // @sig toRequiredLines :: (ESTreeNode, String, Number) -> Number
    toRequiredLines: (declarator, keyword, indentSize) => {
        const pattern = declarator.id
        const init = declarator.init
        const initText = init?.name || init?.raw || '...'

        const names = P.isObjectPattern(pattern) ? T.toPropertyNames(pattern) : T.toElementNames(pattern)

        const open = P.isObjectPattern(pattern) ? '{ ' : '['
        const close = P.isObjectPattern(pattern) ? ' }' : ']'
        const prefix = `${keyword} ${open}`
        const suffix = `${close} = ${initText}`

        // Try single line first
        const singleLine = `${prefix}${names.join(', ')}${suffix}`
        if (singleLine.length + indentSize <= MAX_LINE_LENGTH) return 1

        // Count how many lines needed with proper wrapping
        let currentLength = prefix.length + indentSize
        let lines = 1

        names.forEach((name, i) => {
            const separator = i < names.length - 1 ? ', ' : ''
            const addition = name + separator

            if (currentLength + addition.length > MAX_LINE_LENGTH) {
                lines++
                currentLength = indentSize + addition.length
            } else {
                currentLength += addition.length
            }
        })

        return lines
    },
}

const F = {
    // Create a multiline-destructuring violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'multiline-destructuring',
        line,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'multiline-destructuring',
    }),
}

const V = {
    // Check if a multiline destructuring could be compacted
    // @sig checkDeclaration :: ASTNode -> Violation?
    checkDeclaration: node => {
        if (!P.hasDestructuring(node) || !P.isMultiline(node)) return null

        const declarator = node.esTree.declarations[0]
        const keyword = node.esTree.kind
        const currentLines = node.lineCount
        const indentSize = node.column - 1

        const requiredLines = T.toRequiredLines(declarator, keyword, indentSize)

        if (requiredLines >= currentLines) return null

        const compactForm = T.toCompactForm(declarator, keyword)
        const suggestion =
            requiredLines === 1
                ? `FIX: Compact to single line: \`${compactForm}\``
                : `FIX: Can fit on ${requiredLines} lines instead of ${currentLines}.`

        return F.createViolation(
            node.line,
            `Destructuring spans ${currentLines} lines but could fit on ${requiredLines}. ${suggestion}`,
        )
    },

    // Validate multiline destructuring patterns in source file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        return AST.topLevelStatements(ast)
            .concat(
                AST.from(ast)
                    .filter(PS.isFunctionNode)
                    .flatMap(f => f.body?.body || []),
            )
            .filter(ASTNode.VariableDeclaration.is)
            .map(V.checkDeclaration)
            .filter(Boolean)
    },
}

const checkMultilineDestructuring = FS.withExemptions('multiline-destructuring', V.check)
const MultilineDestructuring = { checkMultilineDestructuring }
export { MultilineDestructuring }
