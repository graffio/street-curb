// ABOUTME: Main API for the style validator
// ABOUTME: Orchestrates running all style rules on source files

import { readFile } from 'fs/promises'
import { Parser } from './parser.js'
import { PS } from './shared/predicates.js'
import { checkAboutmeComment } from './rules/aboutme-comment.js'
import { checkChainExtraction } from './rules/chain-extraction.js'
import { checkCohesionStructure } from './rules/cohesion-structure.js'
import { checkExportStructure } from './rules/export-structure.js'
import { checkFileNaming } from './rules/file-naming.js'
import { checkFunctionNaming } from './rules/function-naming.js'
import { checkFunctionDeclarationOrdering } from './rules/function-declaration-ordering.js'
import { checkFunctionSpacing } from './rules/function-spacing.js'
import { checkFunctionalPatterns } from './rules/functional-patterns.js'
import { checkImportOrdering } from './rules/import-ordering.js'
import { checkLineLength } from './rules/line-length.js'
import { checkMultilineDestructuring } from './rules/multiline-destructuring.js'
import { checkReactComponentCohesion } from './rules/react-component-cohesion.js'
import { checkReactReduxSeparation } from './rules/react-redux-separation.js'
import { checkSigDocumentation } from './rules/sig-documentation.js'
import { checkSingleLevelIndentation } from './rules/single-level-indentation.js'

/**
 * Check single file for coding standards violations
 * CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 * Violation = { type: String, line: Number, column: Number, message: String, rule: String, priority: Number }
 *
 * Priority determines fix order (lower = fix first):
 *   0 = cohesion-structure, export-structure (structural issues - address first)
 *   1 = chain-extraction, functional-patterns (shortens lines, may fix line-length)
 *   2 = single-level-indentation, react-component-cohesion (extracts functions, may fix line-length)
 *   3 = line-length, multiline-destructuring (fix remaining after 1 and 2)
 *   4 = function-declaration-ordering, import-ordering (just reordering)
 *   5 = function-spacing (just blank lines)
 *   6 = sig-documentation, function-naming, aboutme-comment (documentation)
 *   7 = file-naming (last - changes file paths)
 *   8 = react-redux-separation (React/Redux boundary enforcement)
 *
 * @sig checkFile :: String -> Promise<CheckResult>
 */
const checkFile = async filePath => {
    const sourceCode = await readFile(filePath, 'utf8')

    // Skip generated files entirely - they're auto-created and shouldn't be validated
    if (PS.isGeneratedFile(sourceCode)) return { filePath, violations: [], isCompliant: true }

    let ast = null
    try {
        ast = Parser.parseCode(sourceCode)
    } catch (parseError) {
        console.warn(`AST parsing failed for ${filePath}: ${parseError.message}`)
    }

    const allViolations = [
        ...checkAboutmeComment(ast, sourceCode, filePath),
        ...checkChainExtraction(ast, sourceCode, filePath),
        ...checkCohesionStructure(ast, sourceCode, filePath),
        ...checkExportStructure(ast, sourceCode, filePath),
        ...checkFileNaming(ast, sourceCode, filePath),
        ...checkFunctionDeclarationOrdering(ast, sourceCode, filePath),
        ...checkFunctionSpacing(ast, sourceCode, filePath),
        ...checkFunctionNaming(ast, sourceCode, filePath),
        ...checkFunctionalPatterns(ast, sourceCode, filePath),
        ...checkImportOrdering(ast, sourceCode, filePath),
        ...checkLineLength(ast, sourceCode, filePath),
        ...checkMultilineDestructuring(ast, sourceCode, filePath),
        ...checkReactComponentCohesion(ast, sourceCode, filePath),
        ...checkReactReduxSeparation(ast, sourceCode, filePath),
        ...checkSigDocumentation(ast, sourceCode, filePath),
        ...checkSingleLevelIndentation(ast, sourceCode, filePath),
    ]

    const violations = allViolations.sort((a, b) => a.priority - b.priority || a.line - b.line)

    // Warnings (deferred via COMPLEXITY-TODO) don't block compliance
    const errors = violations.filter(v => !v.type.endsWith('-warning'))
    return { filePath, violations, isCompliant: errors.length === 0 }
}

export { checkFile }
