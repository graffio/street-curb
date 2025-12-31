// ABOUTME: Main API for the style validator
// ABOUTME: Orchestrates running all style rules on source files

import { readFile } from 'fs/promises'
import { parseCode } from './parser.js'
import { checkAboutmeComment } from './rules/aboutme-comment.js'
import { checkChainExtraction } from './rules/chain-extraction.js'
import { checkComplexityBudget } from './rules/complexity-budget.js'
import { checkFileNaming } from './rules/file-naming.js'
import { checkFunctionDeclarationOrdering } from './rules/function-declaration-ordering.js'
import { checkCohesionStructure } from './rules/cohesion-structure.js'
import { checkFunctionSpacing } from './rules/function-spacing.js'
import { checkFunctionalPatterns } from './rules/functional-patterns.js'
import { checkImportOrdering } from './rules/import-ordering.js'
import { checkLineLength } from './rules/line-length.js'
import { checkSigDocumentation } from './rules/sig-documentation.js'
import { checkSingleLevelIndentation } from './rules/single-level-indentation.js'
import { checkReactComponentCohesion } from './rules/react-component-cohesion.js'

/**
 * Check single file for coding standards violations
 * CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 * Violation = { type: String, line: Number, column: Number, message: String, rule: String, priority: Number }
 *
 * Priority determines fix order (lower = fix first):
 *   0 = complexity-budget (structural issues - address first)
 *   1 = chain-extraction (shortens lines, may fix line-length)
 *   2 = single-level-indentation (extracts functions, may fix line-length and sig-documentation)
 *   3 = line-length (fix remaining after 1 and 2)
 *   4 = function-declaration-ordering (just reordering)
 *   5 = function-spacing (just blank lines)
 *   6 = sig-documentation (depends on extraction being done first)
 *   7 = file-naming (last - changes file paths)
 *
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

    const allViolations = [
        ...checkAboutmeComment(ast, sourceCode, filePath),
        ...checkChainExtraction(ast, sourceCode, filePath),
        ...checkComplexityBudget(ast, sourceCode, filePath),
        ...checkFileNaming(ast, sourceCode, filePath),
        ...checkFunctionDeclarationOrdering(ast, sourceCode, filePath),
        ...checkFunctionalPatterns(ast, sourceCode, filePath),
        ...checkCohesionStructure(ast, sourceCode, filePath),
        ...checkFunctionSpacing(ast, sourceCode, filePath),
        ...checkImportOrdering(ast, sourceCode, filePath),
        ...checkLineLength(ast, sourceCode, filePath),
        ...checkSigDocumentation(ast, sourceCode, filePath),
        ...checkSingleLevelIndentation(ast, sourceCode, filePath),
        ...checkReactComponentCohesion(ast, sourceCode, filePath),
    ]

    const violations = allViolations.sort((a, b) => a.priority - b.priority || a.line - b.line)

    return { filePath, violations, isCompliant: violations.length === 0 }
}

export { checkFile }
