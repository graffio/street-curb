// ABOUTME: Rule to detect file naming convention violations
// ABOUTME: Enforces PascalCase.jsx for components, kebab-case.js for others

import { basename } from 'path'

/**
 * Create a file-naming violation object
 * @sig createViolation :: String -> Violation
 */
const createViolation = message => ({ type: 'file-naming', line: 1, column: 1, message, rule: 'file-naming' })

/**
 * Check if filename is PascalCase
 * @sig isPascalCase :: String -> Boolean
 */
const isPascalCase = name => /^[A-Z][a-zA-Z0-9]*$/.test(name)

/**
 * Check if filename is kebab-case
 * @sig isKebabCase :: String -> Boolean
 */
const isKebabCase = name => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)

/**
 * Check for file naming violations (coding standards)
 * @sig checkFileNaming :: (AST?, String, String) -> [Violation]
 */
const checkFileNaming = (ast, sourceCode, filePath) => {
    const fileName = basename(filePath)

    // Skip test files and config files
    if (fileName.includes('.tap.') || fileName.includes('.test.') || fileName.includes('.config.')) return []

    // Handle .jsx files - should be PascalCase
    if (fileName.endsWith('.jsx')) {
        const name = fileName.slice(0, -4)
        if (!isPascalCase(name))
            return [
                createViolation(
                    `JSX component files must be PascalCase: ${fileName} should be ${toPascalCase(name)}.jsx`,
                ),
            ]
        return []
    }

    // Handle .js files - should be kebab-case
    if (fileName.endsWith('.js')) {
        const name = fileName.slice(0, -3)
        if (!isKebabCase(name) && !isPascalCase(name))
            return [createViolation(`JS files must be kebab-case: ${fileName}`)]
        return []
    }

    return []
}

/**
 * Convert string to PascalCase (best effort)
 * @sig toPascalCase :: String -> String
 */
const toPascalCase = str => {
    const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    return str.split(/[-_]/).map(capitalize).join('')
}

export { checkFileNaming }
