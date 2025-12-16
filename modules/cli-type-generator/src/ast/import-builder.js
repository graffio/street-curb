// ABOUTME: AST builder for import declarations (proof-of-concept)
// ABOUTME: Builds ESTree-compatible AST nodes for escodegen

import { generate } from 'escodegen'

/**
 * Build an ImportSpecifier AST node from ImportSpecifier TaggedSum
 * @sig buildImportSpecifier :: ImportSpecifier -> ASTNode
 */
const buildImportSpecifier = spec =>
    spec.match({
        Default: ({ local }) => ({ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: local } }),
        Namespace: ({ local }) => ({ type: 'ImportNamespaceSpecifier', local: { type: 'Identifier', name: local } }),
        Named: ({ imported, local }) => ({
            type: 'ImportSpecifier',
            imported: { type: 'Identifier', name: imported },
            local: { type: 'Identifier', name: local },
        }),
    })

/**
 * Build an ImportDeclaration AST node
 * @sig buildImportDeclaration :: ImportInfo -> ASTNode
 */
const buildImportDeclaration = imp => ({
    type: 'ImportDeclaration',
    specifiers: imp.specifiers.map(buildImportSpecifier),
    source: { type: 'Literal', value: imp.source },
})

/**
 * Build a Program AST node containing import declarations
 * @sig buildImportsProgram :: [ImportInfo] -> ASTNode
 */
const buildImportsProgram = imports => ({
    type: 'Program',
    sourceType: 'module',
    body: imports.map(buildImportDeclaration),
})

/**
 * Generate imports section using AST (replaces string template version)
 * @sig generateImportsSectionAST :: [ImportInfo] -> String
 */
const generateImportsSectionAST = imports => {
    if (!imports || imports.length === 0) return ''
    return generate(buildImportsProgram(imports)) + '\n'
}

export { generateImportsSectionAST, buildImportDeclaration, buildImportsProgram }
