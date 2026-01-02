// ABOUTME: Rule to detect missing @sig documentation on functions
// ABOUTME: Enforces documentation standard for top-level and long functions
// COMPLEXITY: sig-documentation — Multi-aspect validation (presence, ordering, description) requires many predicates

import { AS } from '../aggregators.js'
import { FS } from '../factories.js'
import { PS } from '../predicates.js'

const PRIORITY = 6

const SIG_REQUIRES_DESCRIPTION_MESSAGE =
    '@sig requires a description comment. FIX: Add a line describing what the function does above @sig.'

const MISSING_SIG_FIX =
    'FIX: Add JSDoc with description and @sig type annotation. ' +
    'If this is an inline callback, fix single-level-indentation first (extraction creates a named function).'

const P = {
    // Check if statement is a function declaration matching the node
    // @sig isFunctionDeclarationStatement :: (Statement, ASTNode) -> Boolean
    isFunctionDeclarationStatement: (statement, functionNode) =>
        statement.type === 'FunctionDeclaration' && statement === functionNode,

    // Check if statement is a variable declaration containing the function
    // @sig isVariableDeclarationWithFunction :: (Statement, ASTNode) -> Boolean
    isVariableDeclarationWithFunction: (statement, functionNode) =>
        statement.type === 'VariableDeclaration' && statement.declarations.some(d => d.init === functionNode),

    // Check if statement contains the target function
    // @sig isStatementWithFunction :: (Statement, ASTNode) -> Boolean
    isStatementWithFunction: (stmt, functionNode) =>
        P.isFunctionDeclarationStatement(stmt, functionNode) || P.isVariableDeclarationWithFunction(stmt, functionNode),

    // Check if function is at module top level
    // @sig isTopLevelFunction :: (ASTNode, ASTNode) -> Boolean
    isTopLevelFunction: (functionNode, rootNode) => rootNode.body.some(s => P.isStatementWithFunction(s, functionNode)),

    // Check if line is a meaningful comment (not directive, not empty)
    // @sig isSubstantiveCommentLine :: String -> Boolean
    isSubstantiveCommentLine: line => {
        if (!PS.isCommentLine(line.trim())) return false
        if (PS.isDirectiveComment(line)) return false
        return PS.toCommentContent(line).trim().length > 0
    },

    // Check if line is an indented continuation of @sig
    // @sig isSigContinuationLine :: String -> Boolean
    isSigContinuationLine: line => {
        if (!PS.isCommentLine(line.trim())) return false
        const content = PS.toCommentContent(line)
        return content.length > 0 && /^\s{4,}/.test(content)
    },

    // Check if line contains @sig marker
    // @sig isSigLine :: String -> Boolean
    isSigLine: line => line.includes('@sig'),

    // Check if line is a description comment (not @sig)
    // @sig isDescriptionLine :: String -> Boolean
    isDescriptionLine: line => P.isSubstantiveCommentLine(line) && !line.includes('@sig'),

    // Check if function requires @sig documentation
    // @sig requiresSigDocumentation :: (ASTNode, ASTNode, ASTNode?) -> Boolean
    requiresSigDocumentation: (node, ast, parent) => {
        if (PS.isInnerCurriedFunction(node, parent)) return false
        return P.isTopLevelFunction(node, ast) || AS.countFunctionLines(node) > 5
    },

    // Check if function has @sig comment above it
    // @sig hasSigDocumentation :: (ASTNode, ASTNode?, String) -> Boolean
    hasSigDocumentation: (functionNode, parent, sourceCode) =>
        A.findSigLineIndex(functionNode, parent, sourceCode) !== null,

    // Check if comment between @sig and function is a continuation (indented) or substantive
    // @sig isNonContinuationSubstantive :: String -> Boolean
    isNonContinuationSubstantive: line => P.isSubstantiveCommentLine(line) && !P.isSigContinuationLine(line),

    // Check if @sig is the last line in comment block
    // @sig isSigLastInCommentBlock :: (ASTNode, ASTNode?, String) -> Boolean
    isSigLastInCommentBlock: (functionNode, parent, sourceCode) => {
        const sigLineIndex = A.findSigLineIndex(functionNode, parent, sourceCode)
        if (sigLineIndex === null) return true

        const startLine = T.toSigSearchLine(functionNode, parent)
        const lines = sourceCode.split('\n')
        const linesBetween = Array.from({ length: startLine - sigLineIndex - 2 }, (_, i) => lines[sigLineIndex + 1 + i])
        return !linesBetween.some(P.isNonContinuationSubstantive)
    },

    // Check if function has description comment above @sig
    // @sig hasDescriptionComment :: (ASTNode, ASTNode?, String) -> Boolean
    hasDescriptionComment: (functionNode, parent, sourceCode) => {
        const startLine = T.toSigSearchLine(functionNode, parent)
        const lines = sourceCode.split('\n')
        const indices = Array.from({ length: startLine - 1 }, (_, i) => startLine - 2 - i)
        return indices.some(i => !PS.isNonCommentLine(lines[i]) && P.isDescriptionLine(lines[i]))
    },
}

const T = {
    // Get lines before a given line number, reversed for searching upward
    // @sig toReversedLinesBefore :: (String, Number) -> [String]
    toReversedLinesBefore: (sourceCode, lineNum) =>
        sourceCode
            .split('\n')
            .slice(0, lineNum - 1)
            .reverse(),

    // Get the line to start searching for @sig (uses parent line for property/variable values)
    // @sig toSigSearchLine :: (ASTNode, ASTNode?) -> Number
    toSigSearchLine: (functionNode, parent) => {
        if (parent?.type === 'Property' || parent?.type === 'VariableDeclarator') return parent.loc.start.line
        return functionNode.loc.start.line
    },
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

const V = {
    // Validate @sig documentation for a single function
    // @sig checkFunctionForSig :: (ASTNode, ASTNode?, ASTNode, String, Set, [Violation]) -> Void
    checkFunctionForSig: (node, parent, ast, sourceCode, processedNodes, violations) => {
        if (!PS.isFunctionNode(node) || processedNodes.has(node)) return
        processedNodes.add(node)

        const requiresSig = P.requiresSigDocumentation(node, ast, parent)
        const hasSig = P.hasSigDocumentation(node, parent, sourceCode)
        const hasDescription = P.hasDescriptionComment(node, parent, sourceCode)
        const message = '@sig must be last in the comment block. FIX: Move @sig line to end of JSDoc, just before */.'

        if (hasSig && !P.isSigLastInCommentBlock(node, parent, sourceCode)) {
            violations.push(F.createViolation(node, message))
            return
        }

        if (hasSig && !hasDescription) {
            violations.push(F.createViolation(node, SIG_REQUIRES_DESCRIPTION_MESSAGE))
            return
        }

        if (!requiresSig || hasSig) return

        const reason = P.isTopLevelFunction(node, ast) ? 'top-level function' : 'function longer than 5 lines'
        violations.push(F.createViolation(node, `Missing @sig documentation for ${reason}. ${MISSING_SIG_FIX}`))
    },
}

const A = {
    // Find line index of @sig comment before function
    // @sig findSigLineIndex :: (ASTNode, ASTNode?, String) -> Number?
    findSigLineIndex: (functionNode, parent, sourceCode) => {
        const startLine = T.toSigSearchLine(functionNode, parent)
        const lines = sourceCode.split('\n')
        const indices = Array.from({ length: startLine - 1 }, (_, i) => startLine - 2 - i)
        const found = indices.find(i => P.isSigLine(lines[i]) || PS.isNonCommentLine(lines[i]))
        return found !== undefined && P.isSigLine(lines[found]) ? found : null
    },
}

const VV = {
    // Validate @sig documentation in source file
    // @sig checkSigDocumentation :: (AST?, String, String) -> [Violation]
    checkSigDocumentation: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const result = []
        const processedNodes = new Set()
        AS.traverseAST(ast, (node, parent) =>
            V.checkFunctionForSig(node, parent, ast, sourceCode, processedNodes, result),
        )

        return result
    },
}

const checkSigDocumentation = FS.withExemptions('sig-documentation', VV.checkSigDocumentation)
export { checkSigDocumentation }
