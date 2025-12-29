// ABOUTME: Rule to detect lines exceeding 120 characters
// ABOUTME: Suggests extracting variables rather than wrapping lines

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

const PRIORITY = 3

const P = {
    // @sig hasPrettierIgnore :: String -> Boolean
    hasPrettierIgnore: line => line.includes('prettier-ignore'),

    // @sig isBoundaryLine :: String -> Boolean
    isBoundaryLine: line => line.trim() === '' || !PS.isCommentLine(line),

    // @sig nodeHasPrettierIgnore :: (ASTNode, [String]) -> Boolean
    nodeHasPrettierIgnore: (node, lines) => {
        if (!node.loc) return false
        const precedingLines = A.getPrecedingCommentLines(lines, node.loc.start.line - 1)
        return precedingLines.some(P.hasPrettierIgnore)
    },

    // @sig shouldReportLine :: (String, Number, Set<Number>) -> Boolean
    shouldReportLine: (line, lineNumber, ignoredLines) => line.length > 120 && !ignoredLines.has(lineNumber),
}

const T = {
    // @sig lineRange :: (Number, Number) -> [Number]
    lineRange: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i),

    // @sig getNodeLineNumbers :: ASTNode -> [Number]
    getNodeLineNumbers: node => (node.loc ? T.lineRange(node.loc.start.line, node.loc.end.line) : []),
}

const F = {
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
    // @sig checkLineLength :: (AST?, String, String) -> [Violation]
    checkLineLength: (ast, sourceCode, filePath) => {
        const lines = sourceCode.split('\n')
        const ignoredLines = A.buildIgnoredLinesSet(ast, lines)

        return lines
            .map((line, index) => ({ line, lineNumber: index + 1 }))
            .filter(({ line, lineNumber }) => P.shouldReportLine(line, lineNumber, ignoredLines))
            .map(({ lineNumber }) => F.createViolation(lineNumber, 121))
    },
}

const A = {
    // @sig getPrecedingCommentLines :: ([String], Number) -> [String]
    getPrecedingCommentLines: (lines, startIndex) => {
        const preceding = lines.slice(0, startIndex).reverse()
        const boundaryIndex = preceding.findIndex(P.isBoundaryLine)
        return boundaryIndex === -1 ? preceding : preceding.slice(0, boundaryIndex)
    },

    // @sig collectIgnoredLines :: ([String], ASTNode) -> [Number]
    collectIgnoredLines: (lines, node) => (P.nodeHasPrettierIgnore(node, lines) ? T.getNodeLineNumbers(node) : []),

    // @sig buildIgnoredLinesSet :: (AST, [String]) -> Set<Number>
    buildIgnoredLinesSet: (ast, lines) => {
        if (!ast) return new Set()

        const allIgnored = []
        AS.traverseAST(ast, node => allIgnored.push(...A.collectIgnoredLines(lines, node)))
        return new Set(allIgnored)
    },
}

const checkLineLength = V.checkLineLength
export { checkLineLength }
