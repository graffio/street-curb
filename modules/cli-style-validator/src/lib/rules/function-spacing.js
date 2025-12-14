// ABOUTME: Rule to enforce blank lines before multiline function declarations
// ABOUTME: Single-line functions can be grouped; multiline functions need separation

import { traverseAST, isFunctionNode } from '../traverse.js'

const PRIORITY = 5

/**
 * Create a function-spacing violation object
 * @sig createViolation :: (Number, String) -> Violation
 */
const createViolation = (line, message) => ({
    type: 'function-spacing',
    line,
    column: 1,
    priority: PRIORITY,
    message,
    rule: 'function-spacing',
})

/**
 * Check if a node is a variable declaration containing a function
 * @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
 */
const isFunctionVariableDeclaration = node => {
    if (node.type !== 'VariableDeclaration') return false
    return node.declarations.some(d => d.init && isFunctionNode(d.init))
}

/**
 * Check if a statement is a function (declaration or variable with function)
 * @sig isFunctionStatement :: ASTNode -> Boolean
 */
const isFunctionStatement = node => node.type === 'FunctionDeclaration' || isFunctionVariableDeclaration(node)

/**
 * Check if a statement spans multiple lines
 * @sig isMultilineStatement :: ASTNode -> Boolean
 */
const isMultilineStatement = node => {
    if (!node.loc) return false
    return node.loc.end.line > node.loc.start.line
}

/**
 * Check if a line is a comment line
 * @sig isCommentLine :: String -> Boolean
 */
const isCommentLine = line => {
    const trimmed = line.trim()
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('*/')
}

/**
 * Check if there's a blank line or comment before a given line number
 * @sig getPrevLineContent :: (Number, String) -> String
 */
const getPrevLineContent = (lineNum, sourceCode) => {
    if (lineNum <= 1) return ''
    const lines = sourceCode.split('\n')
    return lines[lineNum - 2]?.trim() || ''
}

/**
 * Find function statements in a block's body array
 * @sig findFunctionsInBlock :: [ASTNode] -> [ASTNode]
 */
const findFunctionsInBlock = statements => {
    if (!statements || !Array.isArray(statements)) return []
    return statements.filter(isFunctionStatement)
}

/**
 * Check a single function for spacing violations
 * @sig checkFunction :: (ASTNode, ASTNode?, String) -> Violation?
 */
const checkFunction = (node, prevNode, sourceCode) => {
    if (!prevNode) return null

    const { line: startLine } = node.loc.start
    const prevLineContent = getPrevLineContent(startLine, sourceCode)

    // If previous line is blank, no violation
    if (prevLineContent === '') return null

    // If previous line is a comment, eslint handles spacing - skip
    if (isCommentLine(prevLineContent)) return null

    const currentIsMultiline = isMultilineStatement(node)
    const prevIsMultiline = isMultilineStatement(prevNode)

    if (currentIsMultiline) {
        const msg =
            'Multiline function requires blank line above. FIX: Add a blank line before this function definition.'
        return createViolation(startLine, msg)
    }

    if (prevIsMultiline) {
        const msg =
            'Function after multiline function requires blank line above. FIX: Add a blank line before this function.'
        return createViolation(startLine, msg)
    }

    return null
}

/**
 * Check functions in a block for spacing violations
 * @sig checkBlockFunctions :: ([ASTNode], String) -> [Violation]
 */
const checkBlockFunctions = (functions, sourceCode) => {
    const checkWithPrev = (node, index) => checkFunction(node, functions[index - 1], sourceCode)
    return functions.map(checkWithPrev).filter(v => v !== null)
}

/**
 * Check if file is a test file that should skip validation
 * @sig isTestFile :: String -> Boolean
 */
const isTestFile = filePath => filePath.includes('.tap.js') || filePath.includes('.integration-test.js')

/**
 * Check for function spacing violations in all blocks
 * @sig checkFunctionSpacing :: (AST?, String, String) -> [Violation]
 */
const checkFunctionSpacing = (ast, sourceCode, filePath) => {
    const checkInnerFunctions = node => {
        if (!isFunctionNode(node) || !node.body) return []
        if (node.body.type !== 'BlockStatement') return []
        return checkBlockFunctions(findFunctionsInBlock(node.body.body), sourceCode)
    }

    if (!ast || isTestFile(filePath)) return []

    const topLevelViolations = checkBlockFunctions(findFunctionsInBlock(ast.body), sourceCode)
    const nestedViolations = []
    traverseAST(ast, node => nestedViolations.push(...checkInnerFunctions(node)))

    return [...topLevelViolations, ...nestedViolations]
}

export { checkFunctionSpacing }
