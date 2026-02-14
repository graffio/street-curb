// ABOUTME: Rule to enforce blank lines before multiline function declarations
// ABOUTME: Single-line functions can be grouped; multiline functions need separation

import { AST } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

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

const violation = FS.createViolation('function-spacing', PRIORITY)

const F = {
    // Create a function-spacing violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),
}

const V = {
    // Check if a function needs a blank line above it
    // @sig checkFunction :: (ASTNode, ASTNode?, String) -> Violation?
    checkFunction: (node, prevNode, sourceCode) => {
        if (!prevNode) return null

        const startLine = node.startLine
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

        const topLevelViolations = A.checkBlockFunctions(
            A.findFunctionsInBlock(AST.topLevelStatements(ast)),
            sourceCode,
        )
        const nestedViolations = []
        AST.from(ast).forEach(node => nestedViolations.push(...A.checkInnerFunctions(node, sourceCode)))

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
        if (!PS.isFunctionWithBlockBody(node)) return []
        return A.checkBlockFunctions(A.findFunctionsInBlock(node.body.body), sourceCode)
    },
}

// Run function-spacing rule with COMPLEXITY exemption support
// @sig checkFunctionSpacing :: (AST?, String, String) -> [Violation]
const checkFunctionSpacing = (ast, sourceCode, filePath) =>
    FS.withExemptions('function-spacing', V.check, ast, sourceCode, filePath)
export { checkFunctionSpacing }
