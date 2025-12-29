// ABOUTME: Rule to enforce blank lines before multiline function declarations
// ABOUTME: Single-line functions can be grouped; multiline functions need separation

import { AS } from '../aggregators.js'
import { PS } from '../predicates.js'

const PRIORITY = 5

// ============================================================================
// P: Predicates
// ============================================================================

/**
 * Check if a node is a variable declaration containing a function
 * @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
 */
const isFunctionVariableDeclaration = node => {
    if (node.type !== 'VariableDeclaration') return false
    return node.declarations.some(d => d.init && PS.isFunctionNode(d.init))
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

const P = { isFunctionVariableDeclaration, isFunctionStatement, isMultilineStatement }

// ============================================================================
// T: Transformers
// ============================================================================

/**
 * Get trimmed content of the line before a given line number
 * @sig getPrevLineContent :: (Number, String) -> String
 */
const getPrevLineContent = (lineNum, sourceCode) => {
    if (lineNum <= 1) return ''
    const lines = sourceCode.split('\n')
    return lines[lineNum - 2]?.trim() || ''
}

const T = { getPrevLineContent }

// ============================================================================
// F: Factories
// ============================================================================

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

const F = { createViolation }

// ============================================================================
// A: Aggregators
// ============================================================================

/**
 * Find function statements in a block's body array
 * @sig findFunctionsInBlock :: [ASTNode] -> [ASTNode]
 */
const findFunctionsInBlock = statements => {
    if (!statements || !Array.isArray(statements)) return []
    return statements.filter(P.isFunctionStatement)
}

/**
 * Check functions in a block for spacing violations
 * @sig checkBlockFunctions :: ([ASTNode], String) -> [Violation]
 */
const checkBlockFunctions = (functions, sourceCode) => {
    const checkWithPrev = (node, index) => V.checkFunction(node, functions[index - 1], sourceCode)
    return functions.map(checkWithPrev).filter(v => v !== null)
}

/**
 * Check inner functions within a function node
 * @sig checkInnerFunctions :: (ASTNode, String) -> [Violation]
 */
const checkInnerFunctions = (node, sourceCode) => {
    if (!PS.isFunctionNode(node) || !node.body) return []
    if (node.body.type !== 'BlockStatement') return []
    return checkBlockFunctions(findFunctionsInBlock(node.body.body), sourceCode)
}

const A = { findFunctionsInBlock, checkBlockFunctions, checkInnerFunctions }

// ============================================================================
// V: Validators
// ============================================================================

/**
 * Check a single function for spacing violations
 * @sig checkFunction :: (ASTNode, ASTNode?, String) -> Violation?
 */
const checkFunction = (node, prevNode, sourceCode) => {
    if (!prevNode) return null

    const { line: startLine } = node.loc.start
    const prevLineContent = T.getPrevLineContent(startLine, sourceCode)

    if (prevLineContent === '') return null
    if (PS.isCommentLine(prevLineContent)) return null

    const currentIsMultiline = P.isMultilineStatement(node)
    const prevIsMultiline = P.isMultilineStatement(prevNode)

    if (currentIsMultiline) {
        const msg =
            'Multiline function requires blank line above. FIX: Add a blank line before this function definition.'
        return F.createViolation(startLine, msg)
    }

    if (prevIsMultiline) {
        const msg =
            'Function after multiline function requires blank line above. FIX: Add a blank line before this function.'
        return F.createViolation(startLine, msg)
    }

    return null
}

/**
 * Check for function spacing violations in all blocks
 * @sig checkFunctionSpacing :: (AST?, String, String) -> [Violation]
 */
const checkFunctionSpacing = (ast, sourceCode, filePath) => {
    if (!ast || PS.isTestFile(filePath)) return []

    const topLevelViolations = A.checkBlockFunctions(A.findFunctionsInBlock(ast.body), sourceCode)
    const nestedViolations = []
    AS.traverseAST(ast, node => nestedViolations.push(...A.checkInnerFunctions(node, sourceCode)))

    return [...topLevelViolations, ...nestedViolations]
}

const V = { checkFunction, checkFunctionSpacing }

export { checkFunctionSpacing }
