import { readFile } from 'fs/promises'
import { checkLineLength } from './rules/line-length.js'
import { checkExportPlacement } from './rules/export-placement.js'

/**
 * Check single file for A001 violations
 * @sig checkFile :: String -> Promise<CheckResult>
 *     CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 *     Violation = { type: String, line: Number, column: Number, message: String, rule: String }
 */
export const checkFile = async filePath => {
    const sourceCode = await readFile(filePath, 'utf8')
    const violations = runAllRules(sourceCode, filePath)

    return { filePath, violations, isCompliant: violations.length === 0 }
}

/**
 * Run all A001 violation rules on source code
 * @sig runAllRules :: (String, String) -> [Violation]
 */
const runAllRules = (sourceCode, filePath) => {
    const allViolations = []

    // Run line-length rule
    const lineLengthViolations = checkLineLength(null, sourceCode, filePath)
    allViolations.push(...lineLengthViolations)

    // Run export placement rule
    const exportViolations = checkExportPlacement(null, sourceCode, filePath)
    allViolations.push(...exportViolations)

    // Sort violations by line number for consistent output
    return allViolations.sort((a, b) => a.line - b.line)
}
