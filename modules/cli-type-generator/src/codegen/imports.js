// ABOUTME: Code generation for import statements
// ABOUTME: Generates import section from parsed ImportInfo structures

/*
 * Generate imports section for generated file
 * @sig generateImportsSection :: [ImportInfo] -> String
 */
const generateImportsSection = imports => {
    /*
     * Format an import specifier for code generation
     * @sig formatSpecifier :: ImportSpecifier -> String
     */
    const formatSpecifier = spec => {
        const { type, imported, local } = spec
        if (type === 'ImportDefaultSpecifier') return local
        if (type === 'ImportNamespaceSpecifier') return `* as ${local}`
        return imported === local ? imported : `${imported} as ${local}`
    }

    const formatImport = imp => {
        const specifiers = imp.specifiers.map(formatSpecifier).join(', ')
        return `import { ${specifiers} } from '${imp.source}'`
    }

    return imports && imports.length ? imports.map(formatImport).join('\n') + '\n' : ''
}

export { generateImportsSection }
