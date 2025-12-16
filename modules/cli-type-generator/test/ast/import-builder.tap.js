// ABOUTME: Tests for AST-based import generation
// ABOUTME: Compares AST output against string template output

import t from 'tap'
import { generateImportsSectionAST } from '../../src/ast/import-builder.js'
import { ImportSpecifier } from '../../src/types/import-specifier.js'

t.test('generateImportsSectionAST', t => {
    t.test('Given empty imports', t => {
        t.test('When generating imports section', t => {
            const result = generateImportsSectionAST([])

            t.equal(result, '', 'Then returns empty string')
            t.end()
        })

        t.test('When imports is null', t => {
            const result = generateImportsSectionAST(null)

            t.equal(result, '', 'Then returns empty string')
            t.end()
        })

        t.end()
    })

    t.test('Given a single named import', t => {
        t.test('When generating imports section', t => {
            const imports = [
                { source: './field-types.js', specifiers: [ImportSpecifier.Named('FieldTypes', 'FieldTypes')] },
            ]

            const result = generateImportsSectionAST(imports)

            t.ok(result.includes('import'), 'Then contains import keyword')
            t.ok(result.includes('FieldTypes'), 'Then contains specifier name')
            t.ok(result.includes('./field-types.js'), 'Then contains source path')
            t.end()
        })

        t.end()
    })

    t.test('Given an aliased import', t => {
        t.test('When local differs from imported', t => {
            const imports = [
                { source: '@graffio/functional', specifiers: [ImportSpecifier.Named('LookupTable', 'LT')] },
            ]

            const result = generateImportsSectionAST(imports)

            t.ok(result.includes('LookupTable'), 'Then contains imported name')
            t.ok(result.includes('LT'), 'Then contains local alias')
            t.end()
        })

        t.end()
    })

    t.test('Given a namespace import', t => {
        t.test('When type is ImportNamespaceSpecifier', t => {
            const imports = [{ source: '@graffio/cli-type-generator', specifiers: [ImportSpecifier.Namespace('R')] }]

            const result = generateImportsSectionAST(imports)

            t.ok(result.includes('* as R'), 'Then contains namespace syntax')
            t.end()
        })

        t.end()
    })

    t.test('Given a default import', t => {
        t.test('When type is ImportDefaultSpecifier', t => {
            const imports = [{ source: './some-module.js', specifiers: [ImportSpecifier.Default('SomeModule')] }]

            const result = generateImportsSectionAST(imports)

            t.ok(result.includes('SomeModule'), 'Then contains default import name')
            t.end()
        })

        t.end()
    })

    t.test('Given multiple imports', t => {
        t.test('When generating imports section', t => {
            const imports = [
                { source: './field-types.js', specifiers: [ImportSpecifier.Named('FieldTypes', 'FieldTypes')] },
                { source: '@graffio/cli-type-generator', specifiers: [ImportSpecifier.Namespace('R')] },
            ]

            const result = generateImportsSectionAST(imports)

            t.ok(result.includes('FieldTypes'), 'Then contains first import')
            t.ok(result.includes('* as R'), 'Then contains second import')
            t.end()
        })

        t.end()
    })

    t.end()
})
