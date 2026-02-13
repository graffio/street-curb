// ABOUTME: Main API for the style validator
// ABOUTME: Orchestrates running all style rules on source files

import { readFile } from 'fs/promises'
import { Parser } from './parser.js'
import { PS } from './shared/predicates.js'
import { AboutmeComment } from './rules/aboutme-comment.js'
import { ChainExtraction } from './rules/chain-extraction.js'
import { CohesionStructure } from './rules/cohesion-structure.js'
import { exportStructure } from './rules/export-structure.js'
import { FileNaming } from './rules/file-naming.js'
import { FunctionDeclarationOrdering } from './rules/function-declaration-ordering.js'
import { FunctionSpacing } from './rules/function-spacing.js'
import { FunctionalPatterns } from './rules/functional-patterns.js'
import { ImportOrdering } from './rules/import-ordering.js'
import { LineLength } from './rules/line-length.js'
import { MultilineDestructuring } from './rules/multiline-destructuring.js'
import { ReactComponentCohesion } from './rules/react-component-cohesion.js'
import { checkReactReduxSeparation } from './rules/react-redux-separation.js'
import { SigDocumentation } from './rules/sig-documentation.js'
import { SingleLevelIndentation } from './rules/single-level-indentation.js'

/**
 * Check single file for coding standards violations
 * CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 * Violation = { type: String, line: Number, column: Number, message: String, rule: String, priority: Number }
 * Options = { strictReact?: Boolean }
 *
 * Priority determines fix order (lower = fix first):
 *   0 = cohesion-structure (structural issues - address first)
 *   1 = chain-extraction (shortens lines, may fix line-length)
 *   2 = single-level-indentation (extracts functions, may fix line-length and sig-documentation)
 *   3 = line-length (fix remaining after 1 and 2)
 *   4 = function-declaration-ordering (just reordering)
 *   5 = function-spacing (just blank lines)
 *   6 = sig-documentation (depends on extraction being done first)
 *   7 = file-naming (last - changes file paths)
 *   8 = react-redux-separation (experimental, only with --strict-react)
 *
 * @sig checkFile :: (String, Options?) -> Promise<CheckResult>
 */
const checkFile = async (filePath, options = {}) => {
    const sourceCode = await readFile(filePath, 'utf8')

    // Skip generated files entirely - they're auto-created and shouldn't be validated
    if (PS.isGeneratedFile(sourceCode)) return { filePath, violations: [], isCompliant: true }

    let ast = null
    try {
        ast = Parser.parseCode(sourceCode)
    } catch (parseError) {
        console.warn(`AST parsing failed for ${filePath}: ${parseError.message}`)
    }

    const strictReactViolations = options.strictReact ? checkReactReduxSeparation(ast, sourceCode, filePath) : []

    const allViolations = [
        ...AboutmeComment.checkAboutmeComment(ast, sourceCode, filePath),
        ...ChainExtraction.checkChainExtraction(ast, sourceCode, filePath),
        ...CohesionStructure.checkCohesionStructure(ast, sourceCode, filePath),
        ...exportStructure(ast, sourceCode, filePath),
        ...FileNaming.checkFileNaming(ast, sourceCode, filePath),
        ...FunctionDeclarationOrdering.checkFunctionDeclarationOrdering(ast, sourceCode, filePath),
        ...FunctionSpacing.checkFunctionSpacing(ast, sourceCode, filePath),
        ...FunctionalPatterns.checkFunctionalPatterns(ast, sourceCode, filePath),
        ...ImportOrdering(ast, sourceCode, filePath),
        ...LineLength.checkLineLength(ast, sourceCode, filePath),
        ...MultilineDestructuring.checkMultilineDestructuring(ast, sourceCode, filePath),
        ...ReactComponentCohesion.checkReactComponentCohesion(ast, sourceCode, filePath),
        ...SigDocumentation.checkSigDocumentation(ast, sourceCode, filePath),
        ...SingleLevelIndentation.checkSingleLevelIndentation(ast, sourceCode, filePath),
        ...strictReactViolations,
    ]

    const violations = allViolations.sort((a, b) => a.priority - b.priority || a.line - b.line)

    // Warnings (deferred via COMPLEXITY-TODO) don't block compliance
    const errors = violations.filter(v => !v.type.endsWith('-warning'))
    return { filePath, violations, isCompliant: errors.length === 0 }
}

export { checkFile }
