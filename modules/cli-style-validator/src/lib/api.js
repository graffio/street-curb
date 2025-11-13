import { readFile } from 'fs/promises'
import { checkLineLength } from './rules/line-length.js'
import { checkExportPlacement } from './rules/export-placement.js'
import { checkUnnecessaryBraces } from './rules/unnecessary-braces.js'
import { checkSingleLevelIndentation } from './rules/single-level-indentation.js'
import { checkSigDocumentation } from './rules/sig-documentation.js'
import { checkFunctionalPatterns } from './rules/functional-patterns.js'
import { checkFunctionDeclarationOrdering } from './rules/function-declaration-ordering.js'
import { parseCode } from './parser.js'

/**
 * Check single file for coding standards violations
 * @sig checkFile :: String -> Promise<CheckResult>
 *     CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 *     Violation = { type: String, line: Number, column: Number, message: String, rule: String }
 */
const checkFile = async filePath => {
    const sourceCode = await readFile(filePath, 'utf8')

    let ast = null
    try {
        ast = parseCode(sourceCode)
    } catch (parseError) {
        // If parsing fails, continue with string-based rules only
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

    // Run line-length rule (string-based)
    const lineLengthViolations = checkLineLength(null, sourceCode, filePath)
    allViolations.push(...lineLengthViolations)

    // Run export placement rule (string-based)
    const exportViolations = checkExportPlacement(null, sourceCode, filePath)
    allViolations.push(...exportViolations)

    // Run unnecessary braces rule (AST-based)
    const bracesViolations = checkUnnecessaryBraces(ast, sourceCode, filePath)
    allViolations.push(...bracesViolations)

    // Run single-level indentation rule (AST-based)
    const indentationViolations = checkSingleLevelIndentation(ast, sourceCode, filePath)
    allViolations.push(...indentationViolations)

    // Run @sig documentation rule (AST-based)
    const sigViolations = checkSigDocumentation(ast, sourceCode, filePath)
    allViolations.push(...sigViolations)

    // Run functional patterns rule (AST-based)
    const functionalViolations = checkFunctionalPatterns(ast, sourceCode, filePath)
    allViolations.push(...functionalViolations)

    // Run function declaration ordering rule (AST-based)
    const functionOrderingViolations = checkFunctionDeclarationOrdering(ast, sourceCode, filePath)
    allViolations.push(...functionOrderingViolations)

    // Sort violations by line number for consistent output
    return allViolations.sort((a, b) => a.line - b.line)
}

export { checkFile }
