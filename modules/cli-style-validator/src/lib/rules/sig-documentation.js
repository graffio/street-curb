// ABOUTME: Rule to detect missing @sig documentation on functions
// ABOUTME: Enforces documentation standard for top-level and long functions

import { AST } from '../dsl/ast.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'
import { Lines } from '../dsl/source.js'

const PRIORITY = 6

const SIG_REQUIRES_DESCRIPTION_MESSAGE =
    '@sig requires a description comment. FIX: Add a line describing what the function does above @sig.'

const MISSING_SIG_FIX =
    'FIX: Add JSDoc with description and @sig type annotation. ' +
    'If this is an inline callback, fix single-level-indentation first (extraction creates a named function).'

const P = {
    // Check if line is a meaningful comment (not directive, not empty)
    // @sig isSubstantiveComment :: String -> Boolean
    isSubstantiveComment: line => {
        if (!PS.isCommentLine(line.trim())) return false
        if (PS.isDirectiveComment(line)) return false
        return PS.toCommentContent(line).trim().length > 0
    },

    // Check if line is an indented continuation of @sig (4+ spaces after comment marker)
    // @sig isSigContinuation :: String -> Boolean
    isSigContinuation: line => {
        if (!PS.isCommentLine(line.trim())) return false
        const content = PS.toCommentContent(line)
        return content.length > 0 && /^\s{4,}/.test(content)
    },

    // Check if line contains @sig marker
    // @sig hasSig :: String -> Boolean
    hasSig: line => line.includes('@sig'),

    // Check if line is a description comment (substantive but not @sig)
    // @sig isDescription :: String -> Boolean
    isDescription: line => P.isSubstantiveComment(line) && !line.includes('@sig'),

    // Check if line is substantive but not a continuation
    // @sig isNonContinuationComment :: String -> Boolean
    isNonContinuationComment: line => P.isSubstantiveComment(line) && !P.isSigContinuation(line),

    // Check if function requires @sig documentation
    // @sig requiresSig :: ({ node, parent }, AST) -> Boolean
    requiresSig: ({ node, parent }, ast) => {
        if (PS.isInnerCurriedFunction(node, parent)) return false
        return AST.isTopLevel(node, ast) || AST.lineCount(node) > 5
    },
}

const T = {
    // Get reason string for why function requires @sig
    // @sig toRequirementReason :: ({ node, parent }, AST) -> String
    toRequirementReason: ({ node }, ast) =>
        AST.isTopLevel(node, ast) ? 'top-level function' : 'function longer than 5 lines',
}

const F = {
    // Create a violation object from an AST node
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => ({
        type: 'sig-documentation',
        line: node.loc.start.line,
        column: node.loc.start.column + 1,
        priority: PRIORITY,
        message,
        rule: 'sig-documentation',
    }),
}

const A = {
    // Find @sig line in comment block above function, returns { found, lineIndex }
    // @sig findSigInCommentBlock :: (Lines, ASTNode, ASTNode?) -> { found: Boolean, lineIndex: Number? }
    findSigInCommentBlock: (src, node, parent) => {
        const commentLines = src.beforeNode(node, parent).takeUntil(PS.isNonCommentLine)
        const sigIndex = commentLines.findIndex(P.hasSig)
        if (sigIndex === -1) return { found: false, lineIndex: null }

        // Convert relative index back to absolute line number
        const effectiveLine = AST.effectiveLine(node, parent)
        const absoluteIndex = effectiveLine - 2 - sigIndex
        return { found: true, lineIndex: absoluteIndex }
    },

    // Check if there are substantive non-continuation comments between @sig and function
    // @sig hasCommentsBetweenSigAndFunction :: (Lines, Number, Number) -> Boolean
    hasCommentsBetweenSigAndFunction: (src, sigLineNum, functionLineNum) =>
        src.between(sigLineNum + 1, functionLineNum).some(P.isNonContinuationComment),

    // Check if there's a description comment above @sig line
    // @sig hasDescriptionAboveSig :: (Lines, Number) -> Boolean
    hasDescriptionAboveSig: (src, sigLineNum) =>
        src.before(sigLineNum).takeUntil(PS.isNonCommentLine).some(P.isDescription),
}

const V = {
    // Validate a single function for @sig documentation
    // @sig validateFunction :: ({ node, parent }, AST, Lines) -> [Violation]
    validateFunction: (pair, ast, src) => {
        const { node, parent } = pair
        const { found: hasSig, lineIndex: sigLineIndex } = A.findSigInCommentBlock(src, node, parent)
        const effectiveLine = AST.effectiveLine(node, parent)

        // Has @sig but it's not last in comment block
        if (hasSig && A.hasCommentsBetweenSigAndFunction(src, sigLineIndex, effectiveLine)) {
            const message =
                '@sig must be last in the comment block. FIX: Move @sig line to end of JSDoc, just before */.'
            return [F.createViolation(node, message)]
        }

        // Has @sig but missing description above it
        if (hasSig && !A.hasDescriptionAboveSig(src, sigLineIndex + 1))
            return [F.createViolation(node, SIG_REQUIRES_DESCRIPTION_MESSAGE)]

        // Requires @sig but doesn't have it
        if (P.requiresSig(pair, ast) && !hasSig) {
            const reason = T.toRequirementReason(pair, ast)
            return [F.createViolation(node, `Missing @sig documentation for ${reason}. ${MISSING_SIG_FIX}`)]
        }

        return []
    },

    // Validate @sig documentation in source file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const src = Lines.from(sourceCode)

        return AST.from(ast)
            .find(({ node }) => PS.isFunctionNode(node))
            .flatMap(pair => V.validateFunction(pair, ast, src))
    },
}

const checkSigDocumentation = FS.withExemptions('sig-documentation', V.check)
export { checkSigDocumentation }
