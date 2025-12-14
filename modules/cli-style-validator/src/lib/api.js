// ABOUTME: Main API for the style validator
// ABOUTME: Orchestrates running all style rules on source files

import { readFile } from 'fs/promises'
import { checkAboutmeComment } from './rules/aboutme-comment.js'
import { checkChainExtraction } from './rules/chain-extraction.js'
import { checkFileNaming } from './rules/file-naming.js'
import { checkFunctionDeclarationOrdering } from './rules/function-declaration-ordering.js'
import { checkFunctionalPatterns } from './rules/functional-patterns.js'
import { checkFunctionSpacing } from './rules/function-spacing.js'
import { checkImportOrdering } from './rules/import-ordering.js'
import { checkLineLength } from './rules/line-length.js'
import { checkSigDocumentation } from './rules/sig-documentation.js'
import { checkSingleLevelIndentation } from './rules/single-level-indentation.js'
import { parseCode } from './parser.js'

/**
 * Check single file for coding standards violations
 * CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 * Violation = { type: String, line: Number, column: Number, message: String, rule: String }
 * @sig checkFile :: String -> Promise<CheckResult>
 */
const checkFile = async filePath => {
    const sourceCode = await readFile(filePath, 'utf8')

    let ast = null
    try {
        ast = parseCode(sourceCode)
    } catch (parseError) {
        console.warn(`AST parsing failed for ${filePath}: ${parseError.message}`)
    }

    const violations = runAllRules(ast, sourceCode, filePath)

    return { filePath, violations, isCompliant: violations.length === 0 }
}

/**
 * Run all coding standards violation rules on source code
 * @sig runAllRules :: (AST?, String, String) -> [Violation]
 */
const runAllRules = (ast, sourceCode, filePath) => {
    const allViolations = []

    allViolations.push(...checkAboutmeComment(ast, sourceCode, filePath))
    allViolations.push(...checkChainExtraction(ast, sourceCode, filePath))
    allViolations.push(...checkFileNaming(ast, sourceCode, filePath))
    allViolations.push(...checkFunctionDeclarationOrdering(ast, sourceCode, filePath))
    allViolations.push(...checkFunctionalPatterns(ast, sourceCode, filePath))
    allViolations.push(...checkFunctionSpacing(ast, sourceCode, filePath))
    allViolations.push(...checkImportOrdering(ast, sourceCode, filePath))
    allViolations.push(...checkLineLength(ast, sourceCode, filePath))
    allViolations.push(...checkSigDocumentation(ast, sourceCode, filePath))
    allViolations.push(...checkSingleLevelIndentation(ast, sourceCode, filePath))

    return allViolations.sort((a, b) => a.line - b.line)
}

export { checkFile }
