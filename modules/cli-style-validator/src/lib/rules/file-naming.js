// ABOUTME: Rule to detect file naming convention violations
// ABOUTME: Enforces PascalCase.jsx for component files, kebab-case for config/utility files

import { basename } from 'path'

const PRIORITY = 7

// Entry point files that are allowed to be lowercase
const ENTRY_POINT_FILES = new Set(['main.jsx', 'index.jsx', 'app.jsx', 'main.js', 'index.js', 'app.js'])

// COMPLEXITY: 7 predicates is acceptable - file-naming requires many boolean checks
// These are all small, focused predicates with consistent naming patterns
const P = {
    // @sig isPascalCase :: String -> Boolean
    isPascalCase: name => /^[A-Z][a-zA-Z0-9]*$/.test(name),

    // @sig isKebabCase :: String -> Boolean
    isKebabCase: name => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name),

    // @sig isLowerCase :: String -> Boolean
    isLowerCase: name => /^[a-z][a-z0-9]*$/.test(name),

    // @sig shouldSkip :: String -> Boolean
    shouldSkip: fileName => fileName.includes('.tap.') || fileName.includes('.test.') || fileName.includes('.config.'),

    // @sig exportsComponentsOnly :: AST -> Boolean
    exportsComponentsOnly: ast => {
        const names = T.getExportedNames(ast)
        if (names.length === 0) return true // No exports, assume component if .jsx
        return names.every(P.isPascalCase)
    },

    // @sig isMultiComponentFile :: AST -> Boolean
    isMultiComponentFile: ast => {
        const names = T.getExportedNames(ast)
        const componentCount = names.filter(P.isPascalCase).length
        return componentCount > 1
    },

    // @sig exportsMatchingComponent :: (AST, String) -> Boolean
    exportsMatchingComponent: (ast, fileName) => {
        const expectedName = fileName.slice(0, -4) // Remove .jsx
        const names = T.getExportedNames(ast)
        return names.includes(expectedName) && P.isPascalCase(expectedName)
    },
}

const T = {
    // @sig getSpecifierNames :: ASTNode -> [String]
    getSpecifierNames: ({ type, specifiers }) =>
        type === 'ExportNamedDeclaration' && specifiers ? specifiers.map(s => s.exported?.name).filter(Boolean) : [],

    // @sig getDefaultExportName :: ASTNode -> [String]
    getDefaultExportName: node =>
        node.type === 'ExportDefaultDeclaration' && node.declaration?.name ? [node.declaration.name] : [],

    // @sig getExportedNames :: AST -> [String]
    getExportedNames: ast => {
        if (!ast || !ast.body) return []
        const names = ast.body.flatMap(node => [...T.getSpecifierNames(node), ...T.getDefaultExportName(node)])
        return [...new Set(names)]
    },

    // @sig toPascalCase :: String -> String
    toPascalCase: str => {
        const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        return str.split(/[-_]/).map(capitalize).join('')
    },
}

const F = {
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
    // @sig checkJsxComponentNaming :: (String, String) -> [Violation]
    checkJsxComponentNaming: (name, fileName) => {
        if (P.isPascalCase(name)) return []
        const suggestion = `${T.toPascalCase(name)}.jsx`
        return [F.createViolation(`Component files must be PascalCase: ${fileName} should be ${suggestion}`)]
    },

    // @sig checkJsxConfigNaming :: (String, String) -> [Violation]
    checkJsxConfigNaming: (name, fileName) => {
        if (P.isKebabCase(name) || P.isLowerCase(name)) return []
        return [F.createViolation(`Config/utility JSX files should be kebab-case or lowercase: ${fileName}`)]
    },

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

    // @sig checkJsNaming :: String -> [Violation]
    checkJsNaming: fileName => {
        const name = fileName.slice(0, -3)
        if (P.isKebabCase(name) || P.isPascalCase(name)) return []
        return [F.createViolation(`JS files must be kebab-case: ${fileName}`)]
    },

    // @sig checkFileNaming :: (AST?, String, String) -> [Violation]
    checkFileNaming: (ast, sourceCode, filePath) => {
        const fileName = basename(filePath)
        if (P.shouldSkip(fileName)) return []
        if (fileName.endsWith('.jsx')) return V.checkJsxNaming(ast, fileName)
        if (fileName.endsWith('.js')) return V.checkJsNaming(fileName)
        return []
    },
}

const checkFileNaming = V.checkFileNaming
export { checkFileNaming }
