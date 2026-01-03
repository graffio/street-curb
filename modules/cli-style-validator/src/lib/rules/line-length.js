// ABOUTME: Rule to detect lines exceeding 120 characters
// ABOUTME: Suggests extracting variables rather than wrapping lines

import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 3

const P = {
    // Check if line contains prettier-ignore directive
    // @sig hasPrettierIgnore :: String -> Boolean
    hasPrettierIgnore: line => line.includes('prettier-ignore'),

    // Check if line is a boundary (empty or non-comment)
    // @sig isBoundaryLine :: String -> Boolean
    isBoundaryLine: line => line.trim() === '' || !PS.isCommentLine(line),

    // Check if node has prettier-ignore in preceding comments
    // @sig nodeHasPrettierIgnore :: (ASTNode, [String]) -> Boolean
    nodeHasPrettierIgnore: (node, lines) => {
        if (!node.loc) return false
        const precedingLines = A.toPrecedingCommentLines(lines, node.loc.start.line - 1)
        return precedingLines.some(P.hasPrettierIgnore)
    },

    // Check if line exceeds limit and isn't ignored
    // @sig shouldReportLine :: (String, Number, Set<Number>) -> Boolean
    shouldReportLine: (line, lineNumber, ignoredLines) => line.length > 120 && !ignoredLines.has(lineNumber),
}

const F = {
    // Create a violation object for this rule
    // @sig createViolation :: (Number, Number) -> Violation
    createViolation: (line, column) => ({
        type: 'line-length',
        line,
        column,
        priority: PRIORITY,
        message:
            'Line exceeds 120 characters. ' +
            'FIX: Extract a sub-expression into a named variable to shorten. Do NOT just wrap the line.',
        rule: 'line-length',
    }),
}

const V = {
    // Validate that no lines exceed 120 characters
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        const lines = sourceCode.split('\n')
        const ignoredLines = A.buildIgnoredLinesSet(ast, lines)

        return lines
            .map((line, index) => ({ line, lineNumber: index + 1 }))
            .filter(({ line, lineNumber }) => P.shouldReportLine(line, lineNumber, ignoredLines))
            .map(({ lineNumber }) => F.createViolation(lineNumber, 121))
    },
}

const A = {
    // Transform line array to preceding comment lines before index
    // @sig toPrecedingCommentLines :: ([String], Number) -> [String]
    toPrecedingCommentLines: (lines, startIndex) => {
        const preceding = lines.slice(0, startIndex).reverse()
        const boundaryIndex = preceding.findIndex(P.isBoundaryLine)
        return boundaryIndex === -1 ? preceding : preceding.slice(0, boundaryIndex)
    },

    // Get line numbers to ignore if node has prettier-ignore
    // @sig collectIgnoredLines :: ([String], ASTNode) -> [Number]
    collectIgnoredLines: (lines, node) => (P.nodeHasPrettierIgnore(node, lines) ? AS.toNodeLineNumbers(node) : []),

    // Build set of all line numbers that should be ignored
    // @sig buildIgnoredLinesSet :: (AST, [String]) -> Set<Number>
    buildIgnoredLinesSet: (ast, lines) => {
        if (!ast) return new Set()

        const allIgnored = []
        AS.traverseAST(ast, node => allIgnored.push(...A.collectIgnoredLines(lines, node)))
        return new Set(allIgnored)
    },
}

const checkLineLength = FS.withExemptions('line-length', V.check)
export { checkLineLength }
