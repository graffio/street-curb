// ABOUTME: Rule to enforce blank lines before multiline function declarations
// ABOUTME: Single-line functions can be grouped; multiline functions need separation

import { AST } from '@graffio/ast'
import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 5

const T = {
    // Transform line number to trimmed content of preceding line
    // @sig toPrevLineContent :: (Number, String) -> String
    toPrevLineContent: (lineNum, sourceCode) => {
        if (lineNum <= 1) return ''
        const lines = sourceCode.split('\n')
        return lines[lineNum - 2]?.trim() || ''
    },
}

const F = {
    // Create a violation object for this rule
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'function-spacing',
        line,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'function-spacing',
    }),
}

const V = {
    // Check if a function needs a blank line above it
    // @sig checkFunction :: (ASTNode, ASTNode?, String) -> Violation?
    checkFunction: (node, prevNode, sourceCode) => {
        if (!prevNode) return null

        const startLine = AST.startLine(node)
        const prevLineContent = T.toPrevLineContent(startLine, sourceCode)

        if (prevLineContent === '' || PS.isCommentLine(prevLineContent)) return null

        const currentIsMultiline = PS.isMultilineNode(node)
        const prevIsMultiline = PS.isMultilineNode(prevNode)

        if (currentIsMultiline)
            return F.createViolation(
                startLine,
                'Multiline function requires blank line above. FIX: Add a blank line before this function definition.',
            )

        const postMultilineMsg = 'Function after multiline needs blank line above. FIX: Add a blank line before it.'
        if (prevIsMultiline) return F.createViolation(startLine, postMultilineMsg)

        return null
    },

    // Validate blank lines between function declarations
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const topLevelViolations = A.checkBlockFunctions(A.findFunctionsInBlock(AST.topLevel(ast)), sourceCode)
        const nestedViolations = []
        AS.traverseAST(ast, node => nestedViolations.push(...A.checkInnerFunctions(node, sourceCode)))

        return [...topLevelViolations, ...nestedViolations]
    },
}

const A = {
    // Filter statements to only function declarations
    // @sig findFunctionsInBlock :: [ASTNode] -> [ASTNode]
    findFunctionsInBlock: statements => {
        if (!statements || !Array.isArray(statements)) return []
        return statements.filter(PS.isFunctionStatement)
    },

    // Check spacing between consecutive functions in a block
    // @sig checkBlockFunctions :: ([ASTNode], String) -> [Violation]
    checkBlockFunctions: (functions, sourceCode) =>
        functions.map((node, index) => V.checkFunction(node, functions[index - 1], sourceCode)).filter(v => v !== null),

    // Check spacing for functions inside a function body
    // @sig checkInnerFunctions :: (ASTNode, String) -> [Violation]
    checkInnerFunctions: (node, sourceCode) => {
        if (!PS.isFunctionNode(node)) return []
        const body = AST.functionBody(node)
        if (!body || !AST.hasType(body, 'BlockStatement')) return []
        return A.checkBlockFunctions(A.findFunctionsInBlock(AST.blockStatements(body)), sourceCode)
    },
}

const checkFunctionSpacing = FS.withExemptions('function-spacing', V.check)
export { checkFunctionSpacing }
