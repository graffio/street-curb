// ABOUTME: Tests for TypeDescriptor - the normalized descriptor for type definitions
// ABOUTME: Covers normalize function for Tagged and TaggedSum types

import t from 'tap'
import TypeDescriptor from '../src/descriptors/type-descriptor.js'

t.test('TypeDescriptor', t => {
    t.test('normalize', t => {
        t.test('Given a Tagged type parse result', t => {
            t.test('When normalizing a simple Tagged type', t => {
                const parseResult = {
                    typeDefinition: { name: 'Account', kind: 'tagged', fields: { id: 'String', balance: 'Number' } },
                    imports: [],
                    functions: [],
                }

                const descriptor = TypeDescriptor.normalize(parseResult)
                const { childTypes, fields, kind, name, needsLookupTable } = descriptor

                t.equal(kind, 'Tagged', 'Then kind is Tagged')
                t.equal(name, 'Account', 'Then name is Account')
                t.equal(fields.id.baseType, 'String', 'Then id field baseType is String')
                t.equal(fields.balance.baseType, 'Number', 'Then balance field baseType is Number')
                t.same(childTypes, [], 'Then childTypes is empty')
                t.equal(needsLookupTable, false, 'Then needsLookupTable is false')
                t.end()
            })

            t.test('When normalizing a Tagged type with child types', t => {
                const parseResult = {
                    typeDefinition: {
                        name: 'Transaction',
                        kind: 'tagged',
                        fields: { id: 'String', account: 'Account', category: 'Category?' },
                    },
                    imports: [],
                    functions: [],
                }

                const descriptor = TypeDescriptor.normalize(parseResult)

                t.equal(descriptor.kind, 'Tagged', 'Then kind is Tagged')
                t.equal(descriptor.fields.account.baseType, 'Tagged', 'Then account field baseType is Tagged')
                t.equal(descriptor.fields.account.taggedType, 'Account', 'Then account taggedType is Account')
                t.equal(descriptor.fields.category.optional, true, 'Then category field is optional')
                t.same(descriptor.childTypes, ['Account', 'Category'], 'Then childTypes contains Account and Category')
                t.end()
            })

            t.test('When normalizing a Tagged type with LookupTable', t => {
                const parseResult = {
                    typeDefinition: { name: 'AccountList', kind: 'tagged', fields: { accounts: '{Account:id}' } },
                    imports: [],
                    functions: [],
                }

                const descriptor = TypeDescriptor.normalize(parseResult)
                const { childTypes, needsLookupTable } = descriptor
                const { baseType, idField, taggedType } = descriptor.fields.accounts

                t.equal(baseType, 'LookupTable', 'Then accounts field baseType is LookupTable')
                t.equal(taggedType, 'Account', 'Then accounts taggedType is Account')
                t.equal(idField, 'id', 'Then accounts idField is id')
                t.same(childTypes, ['Account'], 'Then childTypes contains Account')
                t.equal(needsLookupTable, true, 'Then needsLookupTable is true')
                t.end()
            })

            t.test('When normalizing preserves imports and functions', t => {
                const imports = [{ source: './other.js', specifiers: [] }]
                const functions = [{ typeName: 'Account', functionName: 'validate' }]
                const parseResult = {
                    typeDefinition: { name: 'Account', kind: 'tagged', fields: { id: 'String' } },
                    imports,
                    functions,
                }

                const descriptor = TypeDescriptor.normalize(parseResult)

                t.same(descriptor.imports, imports, 'Then imports are preserved')
                t.same(descriptor.functions, functions, 'Then functions are preserved')
                t.end()
            })

            t.end()
        })

        t.test('Given a TaggedSum type parse result', t => {
            t.test('When normalizing a simple TaggedSum type', t => {
                const parseResult = {
                    typeDefinition: {
                        name: 'Shape',
                        kind: 'taggedSum',
                        variants: { Circle: { radius: 'Number' }, Square: { side: 'Number' } },
                    },
                    imports: [],
                    functions: [],
                }

                const descriptor = TypeDescriptor.normalize(parseResult)
                const { kind, name, needsLookupTable, variants } = descriptor

                t.equal(kind, 'TaggedSum', 'Then kind is TaggedSum')
                t.equal(name, 'Shape', 'Then name is Shape')
                t.ok(variants.Circle, 'Then Circle variant exists')
                t.ok(variants.Square, 'Then Square variant exists')
                t.equal(variants.Circle.fields.radius.baseType, 'Number', 'Then Circle.radius is Number')
                t.equal(variants.Square.fields.side.baseType, 'Number', 'Then Square.side is Number')
                t.same(variants.Circle.childTypes, [], 'Then Circle childTypes is empty')
                t.same(variants.Square.childTypes, [], 'Then Square childTypes is empty')
                t.equal(needsLookupTable, false, 'Then needsLookupTable is false')
                t.end()
            })

            t.test('When normalizing a TaggedSum with variant-specific child types', t => {
                const parseResult = {
                    typeDefinition: {
                        name: 'View',
                        kind: 'taggedSum',
                        variants: {
                            Register: { id: 'String', account: 'Account' },
                            Report: { id: 'String', reportType: 'String' },
                        },
                    },
                    imports: [],
                    functions: [],
                }

                const descriptor = TypeDescriptor.normalize(parseResult)

                t.same(
                    descriptor.variants.Register.childTypes,
                    ['Account'],
                    'Then Register childTypes contains Account',
                )
                t.same(descriptor.variants.Report.childTypes, [], 'Then Report childTypes is empty')
                t.end()
            })

            t.test('When normalizing a TaggedSum with LookupTable in one variant', t => {
                const parseResult = {
                    typeDefinition: {
                        name: 'Container',
                        kind: 'taggedSum',
                        variants: { WithItems: { items: '{Item:id}' }, Empty: { reason: 'String' } },
                    },
                    imports: [],
                    functions: [],
                }

                const descriptor = TypeDescriptor.normalize(parseResult)

                t.equal(descriptor.variants.WithItems.fields.items.baseType, 'LookupTable', 'Then items is LookupTable')
                t.same(descriptor.variants.WithItems.childTypes, ['Item'], 'Then WithItems childTypes contains Item')
                t.equal(descriptor.needsLookupTable, true, 'Then needsLookupTable is true')
                t.end()
            })

            t.end()
        })

        t.test('Given an unknown type kind', t => {
            t.test('When normalizing throws an error', t => {
                const parseResult = {
                    typeDefinition: { name: 'Bad', kind: 'unknown', fields: {} },
                    imports: [],
                    functions: [],
                }

                t.throws(() => TypeDescriptor.normalize(parseResult), 'Then throws an error')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
