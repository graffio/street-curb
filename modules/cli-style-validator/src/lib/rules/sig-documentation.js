// ABOUTME: Rule to detect missing @sig documentation on functions
// ABOUTME: Enforces documentation standard for top-level and long functions

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

const PRIORITY = 6

const T = {
    // @sig stripCommentMarkers :: String -> String
    stripCommentMarkers: line =>
        line
            .trim()
            .replace(/^\/\*\*?/, '')
            .replace(/^\*\//, '')
            .replace(/^\/\//, '')
            .replace(/^\*/, ''),

    // @sig getLinesBefore :: (String, Number) -> [String]
    getLinesBefore: (sourceCode, lineNum) =>
        sourceCode
            .split('\n')
            .slice(0, lineNum - 1)
            .reverse(),
}

const P = {
    // @sig isFunctionDeclarationStatement :: (Statement, ASTNode) -> Boolean
    isFunctionDeclarationStatement: (statement, functionNode) =>
        statement.type === 'FunctionDeclaration' && statement === functionNode,

    // @sig isVariableDeclarationWithFunction :: (Statement, ASTNode) -> Boolean
    isVariableDeclarationWithFunction: (statement, functionNode) => {
        if (statement.type !== 'VariableDeclaration') return false
        return statement.declarations.some(declarator => declarator.init === functionNode)
    },

    // @sig isTopLevelFunction :: (ASTNode, ASTNode) -> Boolean
    isTopLevelFunction: (functionNode, rootNode) =>
        rootNode.body.some(
            stmt =>
                P.isFunctionDeclarationStatement(stmt, functionNode) ||
                P.isVariableDeclarationWithFunction(stmt, functionNode),
        ),

    // @sig isDirectiveComment :: String -> Boolean
    isDirectiveComment: line => {
        const content = T.stripCommentMarkers(line).trim().toLowerCase()
        return content.startsWith('prettier-ignore') || content.startsWith('eslint-')
    },

    // @sig isSubstantiveCommentLine :: String -> Boolean
    isSubstantiveCommentLine: line => {
        if (!PS.isCommentLine(line.trim())) return false
        if (P.isDirectiveComment(line)) return false
        return T.stripCommentMarkers(line).trim().length > 0
    },

    // @sig isSigContinuationLine :: String -> Boolean
    isSigContinuationLine: line => {
        if (!PS.isCommentLine(line.trim())) return false
        const content = T.stripCommentMarkers(line)
        return content.length > 0 && /^\s{4,}/.test(content)
    },

    // @sig isSigLine :: String -> Boolean
    isSigLine: line => line.includes('@sig'),

    // @sig isNonCommentLine :: String -> Boolean
    isNonCommentLine: line => {
        const trimmed = line.trim()
        return trimmed && !PS.isCommentLine(trimmed)
    },

    // @sig isDescriptionLine :: String -> Boolean
    isDescriptionLine: line => P.isSubstantiveCommentLine(line) && !line.includes('@sig'),

    // @sig requiresSigDocumentation :: (ASTNode, ASTNode) -> Boolean
    requiresSigDocumentation: (node, ast) => P.isTopLevelFunction(node, ast) || AS.countFunctionLines(node) > 5,
}

const A = {
    // @sig findSigLineIndex :: (ASTNode, String) -> Number?
    findSigLineIndex: (functionNode, sourceCode) => {
        const lines = sourceCode.split('\n')
        const indices = Array.from(
            { length: functionNode.loc.start.line - 1 },
            (_, i) => functionNode.loc.start.line - 2 - i,
        )
        const found = indices.find(i => P.isSigLine(lines[i]) || P.isNonCommentLine(lines[i]))
        return found !== undefined && P.isSigLine(lines[found]) ? found : null
    },

    // @sig hasSigDocumentation :: (ASTNode, String) -> Boolean
    hasSigDocumentation: (functionNode, sourceCode) => A.findSigLineIndex(functionNode, sourceCode) !== null,

    // @sig isSigLastInCommentBlock :: (ASTNode, String) -> Boolean
    isSigLastInCommentBlock: (functionNode, sourceCode) => {
        const sigLineIndex = A.findSigLineIndex(functionNode, sourceCode)
        if (sigLineIndex === null) return true

        const lines = sourceCode.split('\n')
        const linesBetween = Array.from(
            { length: functionNode.loc.start.line - sigLineIndex - 2 },
            (_, i) => lines[sigLineIndex + 1 + i],
        )
        const isNonContinuationSubstantive = line => P.isSubstantiveCommentLine(line) && !P.isSigContinuationLine(line)
        return !linesBetween.some(isNonContinuationSubstantive)
    },

    // @sig hasDescriptionComment :: (ASTNode, String) -> Boolean
    hasDescriptionComment: (functionNode, sourceCode) => {
        const lines = sourceCode.split('\n')
        const indices = Array.from(
            { length: functionNode.loc.start.line - 1 },
            (_, i) => functionNode.loc.start.line - 2 - i,
        )
        return indices.some(i => !P.isNonCommentLine(lines[i]) && P.isDescriptionLine(lines[i]))
    },
}

const F = {
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
    // @sig checkFunctionForSig :: (ASTNode, ASTNode, String, Set, [Violation]) -> Void
    checkFunctionForSig: (node, ast, sourceCode, processedNodes, violations) => {
        if (!PS.isFunctionNode(node) || processedNodes.has(node)) return
        processedNodes.add(node)

        const requiresSig = P.requiresSigDocumentation(node, ast)
        const hasSig = A.hasSigDocumentation(node, sourceCode)
        const hasDescription = A.hasDescriptionComment(node, sourceCode)

        if (hasSig && !A.isSigLastInCommentBlock(node, sourceCode)) {
            violations.push(
                F.createViolation(
                    node,
                    '@sig must be last in the comment block. FIX: Move @sig line to end of JSDoc, just before */.',
                ),
            )
            return
        }

        if (hasSig && !hasDescription) {
            violations.push(
                F.createViolation(
                    node,
                    '@sig requires a description comment. FIX: Add a line describing what the function does above @sig.',
                ),
            )
            return
        }

        if (!requiresSig || hasSig) return

        const reason = P.isTopLevelFunction(node, ast) ? 'top-level function' : 'function longer than 5 lines'
        violations.push(
            F.createViolation(
                node,
                `Missing @sig documentation for ${reason}. ` +
                    'FIX: Add JSDoc with description and @sig type annotation. ' +
                    'If this is an inline callback, fix single-level-indentation first (extraction creates a named function).',
            ),
        )
    },

    // @sig checkSigDocumentation :: (AST?, String, String) -> [Violation]
    checkSigDocumentation: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const violations = []
        const processedNodes = new Set()
        AS.traverseAST(ast, node => V.checkFunctionForSig(node, ast, sourceCode, processedNodes, violations))

        return violations
    },
}

const checkSigDocumentation = V.checkSigDocumentation
export { checkSigDocumentation }
