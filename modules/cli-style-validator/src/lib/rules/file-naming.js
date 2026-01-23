// ABOUTME: Rule to detect file naming convention violations
// ABOUTME: Enforces PascalCase.jsx for component files, kebab-case for config/utility files
// COMPLEXITY: functions — Export-based naming rules require multiple export predicates

import { basename } from 'path'

import { AS } from '../shared/aggregators.js'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 7

// Entry point files that are allowed to be lowercase
const ENTRY_POINT_FILES = new Set(['main.jsx', 'index.jsx', 'app.jsx', 'main.js', 'index.js', 'app.js'])

const P = {
    // Check if name is simple lowercase (no hyphens)
    // @sig isLowerCase :: String -> Boolean
    isLowerCase: name => /^[a-z][a-z0-9]*$/.test(name),

    // Check if file should skip naming validation
    // @sig shouldSkip :: String -> Boolean
    shouldSkip: fileName =>
        fileName.includes('.tap.') ||
        fileName.includes('.test.') ||
        fileName.includes('.config.') ||
        fileName.includes('.type.'),

    // Check if file only exports PascalCase names (components)
    // @sig exportsComponentsOnly :: AST -> Boolean
    exportsComponentsOnly: ast => {
        const names = AS.toExportedNames(ast)
        if (names.length === 0) return true // No exports, assume component if .jsx
        return names.every(PS.isPascalCase)
    },

    // Check if file exports multiple components
    // @sig isMultiComponentFile :: AST -> Boolean
    isMultiComponentFile: ast => {
        const names = AS.toExportedNames(ast)
        const componentCount = names.filter(PS.isPascalCase).length
        return componentCount > 1
    },

    // Check if file exports a component matching its filename
    // @sig exportsMatchingComponent :: (AST, String) -> Boolean
    exportsMatchingComponent: (ast, fileName) => {
        const expectedName = fileName.slice(0, -4) // Remove .jsx
        const names = AS.toExportedNames(ast)
        return names.includes(expectedName) && PS.isPascalCase(expectedName)
    },
}

const T = {
    // Convert kebab-case or snake_case to PascalCase
    // @sig toPascalCase :: String -> String
    toPascalCase: str => {
        const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        return str.split(/[-_]/).map(capitalize).join('')
    },
}

const F = {
    // Create a file-naming violation with given message
    // @sig createViolation :: String -> Violation
    createViolation: message => ({
        type: 'file-naming',
        line: 1,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'file-naming',
    }),
}

const V = {
    // Validate JSX component file naming (should be PascalCase)
    // @sig checkJsxComponentNaming :: (String, String) -> [Violation]
    checkJsxComponentNaming: (name, fileName) => {
        if (PS.isPascalCase(name)) return []
        const suggestion = `${T.toPascalCase(name)}.jsx`
        return [F.createViolation(`Component files must be PascalCase: ${fileName} should be ${suggestion}`)]
    },

    // Validate JSX config/utility file naming (should be kebab-case)
    // @sig checkJsxConfigNaming :: (String, String) -> [Violation]
    checkJsxConfigNaming: (name, fileName) => {
        if (PS.isKebabCase(name) || P.isLowerCase(name)) return []
        return [F.createViolation(`Config/utility JSX files should be kebab-case or lowercase: ${fileName}`)]
    },

    // Validate JSX file naming based on exports
    // @sig checkJsxNaming :: (AST?, String) -> [Violation]
    checkJsxNaming: (ast, fileName) => {
        // Entry points are allowed to be lowercase
        if (ENTRY_POINT_FILES.has(fileName)) return []

        const name = fileName.slice(0, -4)

        // If file exports a PascalCase component matching the filename, it's a component file
        // This handles pages that also export utility functions (e.g., getChildRows)
        if (P.exportsMatchingComponent(ast, fileName)) return V.checkJsxComponentNaming(name, fileName)

        // Multi-component utility files can be kebab-case
        if (P.isMultiComponentFile(ast)) return V.checkJsxConfigNaming(name, fileName)

        // Single-component files should be PascalCase
        return P.exportsComponentsOnly(ast)
            ? V.checkJsxComponentNaming(name, fileName)
            : V.checkJsxConfigNaming(name, fileName)
    },

    // Validate JS file naming (should be kebab-case)
    // @sig checkJsNaming :: String -> [Violation]
    checkJsNaming: fileName => {
        const name = fileName.slice(0, -3)
        if (PS.isKebabCase(name) || PS.isPascalCase(name)) return []
        return [F.createViolation(`JS files must be kebab-case: ${fileName}`)]
    },

    // Validate file naming conventions for entire file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        const fileName = basename(filePath)
        if (P.shouldSkip(fileName)) return []
        if (fileName.endsWith('.jsx')) return V.checkJsxNaming(ast, fileName)
        if (fileName.endsWith('.js')) return V.checkJsNaming(fileName)
        return []
    },
}

const checkFileNaming = FS.withExemptions('file-naming', V.check)
const FileNaming = { checkFileNaming }
export { FileNaming }
