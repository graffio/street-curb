// ABOUTME: Rule to detect file naming convention violations
// ABOUTME: Enforces PascalCase.jsx for component files, kebab-case for config/utility files

import { basename } from 'path'

const PRIORITY = 7

// Entry point files that are allowed to be lowercase
const ENTRY_POINT_FILES = new Set(['main.jsx', 'index.jsx', 'app.jsx', 'main.js', 'index.js', 'app.js'])

// Create a file-naming violation object
// @sig createViolation :: String -> Violation
const createViolation = message => ({
    type: 'file-naming',
    line: 1,
    column: 1,
    priority: PRIORITY,
    message,
    rule: 'file-naming',
})

// Check if filename is PascalCase
// @sig isPascalCase :: String -> Boolean
const isPascalCase = name => /^[A-Z][a-zA-Z0-9]*$/.test(name)

// Check if filename is kebab-case
// @sig isKebabCase :: String -> Boolean
const isKebabCase = name => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)

// Check if filename is lowercase (no hyphens)
// @sig isLowerCase :: String -> Boolean
const isLowerCase = name => /^[a-z][a-z0-9]*$/.test(name)

// Extract names from export specifiers
// @sig getSpecifierNames :: Node -> [String]
const getSpecifierNames = ({ type, specifiers }) =>
    type === 'ExportNamedDeclaration' && specifiers ? specifiers.map(s => s.exported?.name).filter(Boolean) : []

// Extract name from default export
// @sig getDefaultExportName :: Node -> [String]
const getDefaultExportName = node =>
    node.type === 'ExportDefaultDeclaration' && node.declaration?.name ? [node.declaration.name] : []

// Extract exported names from AST to determine if file exports components
// @sig getExportedNames :: AST -> [String]
const getExportedNames = ast => {
    if (!ast || !ast.body) return []
    const names = ast.body.flatMap(node => [...getSpecifierNames(node), ...getDefaultExportName(node)])
    return [...new Set(names)]
}

// Check if file exports only React components (PascalCase names)
// @sig exportsComponentsOnly :: AST -> Boolean
const exportsComponentsOnly = ast => {
    const names = getExportedNames(ast)
    if (names.length === 0) return true // No exports, assume component if .jsx
    return names.every(isPascalCase)
}

// Check if file exports multiple components (utility module)
// @sig isMultiComponentFile :: AST -> Boolean
const isMultiComponentFile = ast => {
    const names = getExportedNames(ast)
    const componentCount = names.filter(isPascalCase).length
    return componentCount > 1
}

// Check if a file should be skipped (test/config files)
// @sig shouldSkip :: String -> Boolean
const shouldSkip = fileName =>
    fileName.includes('.tap.') || fileName.includes('.test.') || fileName.includes('.config.')

// Validate JSX component file naming
// @sig checkJsxComponentNaming :: (String, String) -> [Violation]
const checkJsxComponentNaming = (name, fileName) => {
    if (isPascalCase(name)) return []
    const suggestion = `${toPascalCase(name)}.jsx`
    return [createViolation(`Component files must be PascalCase: ${fileName} should be ${suggestion}`)]
}

// Validate JSX config/utility file naming
// @sig checkJsxConfigNaming :: (String, String) -> [Violation]
const checkJsxConfigNaming = (name, fileName) => {
    if (isKebabCase(name) || isLowerCase(name)) return []
    return [createViolation(`Config/utility JSX files should be kebab-case or lowercase: ${fileName}`)]
}

// Validate JSX file naming based on exports
// @sig checkJsxNaming :: (AST?, String) -> [Violation]
const checkJsxNaming = (ast, fileName) => {
    // Entry points are allowed to be lowercase
    if (ENTRY_POINT_FILES.has(fileName)) return []

    const name = fileName.slice(0, -4)

    // Multi-component utility files can be kebab-case
    if (isMultiComponentFile(ast)) return checkJsxConfigNaming(name, fileName)

    // Single-component files should be PascalCase
    return exportsComponentsOnly(ast) ? checkJsxComponentNaming(name, fileName) : checkJsxConfigNaming(name, fileName)
}

// Validate JS file naming
// @sig checkJsNaming :: String -> [Violation]
const checkJsNaming = fileName => {
    const name = fileName.slice(0, -3)
    if (isKebabCase(name) || isPascalCase(name)) return []
    return [createViolation(`JS files must be kebab-case: ${fileName}`)]
}

// Check for file naming violations based on export types
// @sig checkFileNaming :: (AST?, String, String) -> [Violation]
const checkFileNaming = (ast, sourceCode, filePath) => {
    const fileName = basename(filePath)
    if (shouldSkip(fileName)) return []
    if (fileName.endsWith('.jsx')) return checkJsxNaming(ast, fileName)
    if (fileName.endsWith('.js')) return checkJsNaming(fileName)
    return []
}

// Convert string to PascalCase (best effort)
// @sig toPascalCase :: String -> String
const toPascalCase = str => {
    const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    return str.split(/[-_]/).map(capitalize).join('')
}

export { checkFileNaming }
