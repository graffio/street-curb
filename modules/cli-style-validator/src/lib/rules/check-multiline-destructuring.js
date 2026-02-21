// ABOUTME: Rule to detect wasteful multiline destructuring patterns
// ABOUTME: Suggests compacting destructuring to fit on fewer lines when possible

import { AST, ASTNode } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Transform a single object pattern property to its string representation
    // @sig toPropertyName :: ESTreeProperty -> String?
    toPropertyName: prop => {
        if (prop.type === 'RestElement') return '...' + prop.argument?.name
        const key = prop.key?.name || prop.key?.value
        const value = prop.value?.name
        return key === value ? key : `${key}: ${value}`
    },

    // Extract property names from an object pattern (raw ESTree)
    // @sig toPropertyNames :: ESTreeNode -> [String]
    toPropertyNames: pattern => {
        if (!P.isObjectPattern(pattern)) return []
        return (pattern.properties || []).map(T.toPropertyName).filter(Boolean)
    },

    // Transform a single array pattern element to its name string
    // @sig toElementName :: ESTreeElement? -> String
    toElementName: el => {
        if (!el) return ''
        if (el.type === 'RestElement') return '...' + el.argument?.name
        return el.name || ''
    },

    // Extract element names from an array pattern (raw ESTree)
    // @sig toElementNames :: ESTreeNode -> [String]
    toElementNames: pattern => {
        if (!P.isArrayPattern(pattern)) return []
        return (pattern.elements || []).map(T.toElementName)
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
        return A.countWrappedLines(names, prefix.length + indentSize, indentSize)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a multiline-destructuring violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Check if a multiline destructuring could be compacted
    // @sig checkDeclaration :: ASTNode -> Violation?
    checkDeclaration: node => {
        const { column, line, lineCount } = node
        if (!P.hasDestructuring(node) || !P.isMultiline(node)) return undefined

        const declarator = node.esTree.declarations[0]
        const keyword = node.esTree.kind
        const indentSize = column - 1

        const requiredLines = T.toRequiredLines(declarator, keyword, indentSize)

        if (requiredLines >= lineCount) return undefined

        const compactForm = T.toCompactForm(declarator, keyword)
        const suggestion =
            requiredLines === 1
                ? `FIX: Compact to single line: \`${compactForm}\``
                : `FIX: Can fit on ${requiredLines} lines instead of ${lineCount}.`

        return F.createViolation(
            line,
            `Destructuring spans ${lineCount} lines but could fit on ${requiredLines}. ${suggestion}`,
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Accumulate line wrapping state for a single name token
    // @sig processToken :: (WrapState, String, Number) -> WrapState
    processToken: (acc, token, indentSize) => {
        const { currentLength, lines } = acc
        const { length } = token
        if (currentLength + length > MAX_LINE_LENGTH) return { lines: lines + 1, currentLength: indentSize + length }
        return { lines, currentLength: currentLength + length }
    },

    // Count how many lines are needed to wrap names within the line length limit
    // @sig countWrappedLines :: ([String], Number, Number) -> Number
    countWrappedLines: (names, startLength, indentSize) => {
        const result = names.reduce(
            (acc, name, i) => A.processToken(acc, name + (i < names.length - 1 ? ', ' : ''), indentSize),
            { lines: 1, currentLength: startLength },
        )
        return result.lines
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 3
const MAX_LINE_LENGTH = 120

const violation = FS.createViolation('multiline-destructuring', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run multiline-destructuring rule with COMPLEXITY exemption support
// @sig checkMultilineDestructuring :: (AST?, String, String) -> [Violation]
const checkMultilineDestructuring = (ast, sourceCode, filePath) =>
    FS.withExemptions('multiline-destructuring', V.check, ast, sourceCode, filePath)
export { checkMultilineDestructuring }
