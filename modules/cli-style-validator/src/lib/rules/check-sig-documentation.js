// ABOUTME: Rule to detect missing @sig documentation on functions
// ABOUTME: Enforces documentation standard for top-level and long functions

import { AST, Lines } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'
import { Transformers as TS } from '../shared/transformers.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if line is a meaningful comment (not directive, not empty)
    // @sig isSubstantiveComment :: String -> Boolean
    isSubstantiveComment: line => {
        if (!PS.isCommentLine(line.trim())) return false
        if (PS.isDirectiveComment(line)) return false
        return TS.toCommentContent(line).trim().length > 0
    },

    // Check if line is an indented continuation of a sig annotation (4+ spaces after comment marker)
    // @sig isSigContinuation :: String -> Boolean
    isSigContinuation: line => {
        if (!PS.isCommentLine(line.trim())) return false
        const content = TS.toCommentContent(line)
        return content.length > 0 && /^\s{4,}/.test(content)
    },

    // Check if line contains a sig annotation marker
    // @sig hasSig :: String -> Boolean
    hasSig: line => line.includes('@sig'),

    // Check if line is a description comment (substantive, not a sig annotation)
    // @sig isDescription :: String -> Boolean
    isDescription: line => P.isSubstantiveComment(line) && !line.includes('@sig'),

    // Check if line is substantive but not a continuation
    // @sig isNonContinuationComment :: String -> Boolean
    isNonContinuationComment: line => P.isSubstantiveComment(line) && !P.isSigContinuation(line),

    // Check if function requires signature documentation
    // @sig requiresSig :: (ASTNode, AST) -> Boolean
    requiresSig: (node, ast) => {
        if (PS.isInnerCurriedFunction(node, node.parent)) return false
        return AST.isTopLevel(node, ast) || node.lineCount > 5
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Get reason string for why function requires signature documentation
    // @sig toRequirementReason :: (ASTNode, AST) -> String
    toRequirementReason: (node, ast) =>
        AST.isTopLevel(node, ast) ? 'top-level function' : 'function longer than 5 lines',
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a violation from an AST node
    // @sig createViolation :: (ASTNode, String) -> Violation
    createViolation: (node, message) => violation(node.line, node.column, message),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Validate a single function for signature documentation
    // @sig validateFunction :: (ASTNode, AST, Lines) -> [Violation]
    validateFunction: (node, ast, src) => {
        const { found: hasSig, lineIndex: sigLineIndex } = A.findSigInCommentBlock(src, node)
        const effectiveLine = AST.associatedCommentLine(node)

        // Has sig but it's not last in comment block
        if (hasSig && A.hasCommentsBetweenSigAndFunction(src, sigLineIndex, effectiveLine)) {
            const message =
                '@sig must be last in the comment block. FIX: Move @sig line to end of JSDoc, just before */.'
            return [F.createViolation(node, message)]
        }

        // Has sig but missing description above it
        if (hasSig && !A.hasDescriptionAboveSig(src, sigLineIndex + 1))
            return [F.createViolation(node, SIG_REQUIRES_DESCRIPTION_MESSAGE)]

        // Requires sig but doesn't have it
        if (P.requiresSig(node, ast) && !hasSig) {
            const reason = T.toRequirementReason(node, ast)
            return [F.createViolation(node, `Missing @sig documentation for ${reason}. ${MISSING_SIG_FIX}`)]
        }

        return []
    },

    // Validate signature documentation in source file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const src = Lines.from(sourceCode)

        return AST.from(ast)
            .filter(node => PS.isFunctionNode(node))
            .flatMap(node => V.validateFunction(node, ast, src))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Find sig annotation line in comment block above function
    // @sig findSigInCommentBlock :: (Lines, ASTNode) -> { found: Boolean, lineIndex: Number? }
    findSigInCommentBlock: (src, node) => {
        const commentLines = src.beforeNode(node, node.parent).takeUntil(PS.isNonCommentLine)
        const sigIndex = commentLines.findIndex(P.hasSig)
        if (sigIndex === -1) return { found: false, lineIndex: undefined }

        // Convert relative index back to absolute line number
        const effectiveLine = AST.associatedCommentLine(node)
        const absoluteIndex = effectiveLine - 2 - sigIndex
        return { found: true, lineIndex: absoluteIndex }
    },

    // Check if there are substantive non-continuation comments between sig and function
    // @sig hasCommentsBetweenSigAndFunction :: (Lines, Number, Number) -> Boolean
    hasCommentsBetweenSigAndFunction: (src, sigLineNum, functionLineNum) =>
        src.between(sigLineNum + 1, functionLineNum).some(P.isNonContinuationComment),

    // Check if there's a description comment above sig annotation line
    // @sig hasDescriptionAboveSig :: (Lines, Number) -> Boolean
    hasDescriptionAboveSig: (src, sigLineNum) =>
        src.before(sigLineNum).takeUntil(PS.isNonCommentLine).some(P.isDescription),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 6

const SIG_REQUIRES_DESCRIPTION_MESSAGE =
    '@sig requires a description comment. FIX: Add a line describing what the function does above @sig.'

const MISSING_SIG_FIX =
    'FIX: Add JSDoc with description and @sig type annotation. ' +
    'If this is an inline callback, fix single-level-indentation first (extraction creates a named function).'

const violation = FS.createViolation('sig-documentation', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run sig-documentation rule with exemption support
// @sig checkSigDocumentation :: (AST?, String, String) -> [Violation]
const checkSigDocumentation = (ast, sourceCode, filePath) =>
    FS.withExemptions('sig-documentation', V.check, ast, sourceCode, filePath)
export { checkSigDocumentation }
