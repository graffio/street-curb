// ABOUTME: Rule to enforce blank lines before multiline function declarations
// ABOUTME: Single-line functions can be grouped; multiline functions need separation

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

const PRIORITY = 5

const P = {
    // @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
    isFunctionVariableDeclaration: node => {
        if (node.type !== 'VariableDeclaration') return false
        return node.declarations.some(d => d.init && PS.isFunctionNode(d.init))
    },

    // @sig isFunctionStatement :: ASTNode -> Boolean
    isFunctionStatement: node => node.type === 'FunctionDeclaration' || P.isFunctionVariableDeclaration(node),
}

const T = {
    // @sig getPrevLineContent :: (Number, String) -> String
    getPrevLineContent: (lineNum, sourceCode) => {
        if (lineNum <= 1) return ''
        const lines = sourceCode.split('\n')
        return lines[lineNum - 2]?.trim() || ''
    },
}

const F = {
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
    // @sig checkFunction :: (ASTNode, ASTNode?, String) -> Violation?
    checkFunction: (node, prevNode, sourceCode) => {
        if (!prevNode) return null

        const { line: startLine } = node.loc.start
        const prevLineContent = T.getPrevLineContent(startLine, sourceCode)

        if (prevLineContent === '' || PS.isCommentLine(prevLineContent)) return null

        const currentIsMultiline = PS.isMultilineNode(node)
        const prevIsMultiline = PS.isMultilineNode(prevNode)

        if (currentIsMultiline)
            return F.createViolation(
                startLine,
                'Multiline function requires blank line above. FIX: Add a blank line before this function definition.',
            )

        if (prevIsMultiline)
            return F.createViolation(
                startLine,
                'Function after multiline function requires blank line above. FIX: Add a blank line before this function.',
            )

        return null
    },

    // @sig checkFunctionSpacing :: (AST?, String, String) -> [Violation]
    checkFunctionSpacing: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const topLevelViolations = A.checkBlockFunctions(A.findFunctionsInBlock(ast.body), sourceCode)
        const nestedViolations = []
        AS.traverseAST(ast, node => nestedViolations.push(...A.checkInnerFunctions(node, sourceCode)))

        return [...topLevelViolations, ...nestedViolations]
    },
}

const A = {
    // @sig findFunctionsInBlock :: [ASTNode] -> [ASTNode]
    findFunctionsInBlock: statements => {
        if (!statements || !Array.isArray(statements)) return []
        return statements.filter(P.isFunctionStatement)
    },

    // @sig checkBlockFunctions :: ([ASTNode], String) -> [Violation]
    checkBlockFunctions: (functions, sourceCode) =>
        functions.map((node, index) => V.checkFunction(node, functions[index - 1], sourceCode)).filter(v => v !== null),

    // @sig checkInnerFunctions :: (ASTNode, String) -> [Violation]
    checkInnerFunctions: (node, sourceCode) => {
        if (!PS.isFunctionNode(node) || !node.body || node.body.type !== 'BlockStatement') return []
        return A.checkBlockFunctions(A.findFunctionsInBlock(node.body.body), sourceCode)
    },
}

const checkFunctionSpacing = V.checkFunctionSpacing
export { checkFunctionSpacing }
