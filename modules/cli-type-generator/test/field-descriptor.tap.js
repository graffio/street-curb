// ABOUTME: Tests for FieldDescriptor - the normalized descriptor for field types
// ABOUTME: Covers fromString, fromObject, and fromAny parsing

import t from 'tap'
import FieldDescriptor from '../src/descriptors/field-descriptor.js'

t.test('FieldDescriptor', t => {
    t.test('fromString', t => {
        t.test('Given a primitive type string', t => {
            t.test('When parsing "String"', t => {
                const { arrayDepth, baseType, fieldTypesReference, optional, regex, taggedType } =
                    FieldDescriptor.fromString('String')

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(optional, false, 'Then optional is false')
                t.equal(arrayDepth, 0, 'Then arrayDepth is 0')
                t.equal(taggedType, null, 'Then taggedType is null')
                t.equal(regex, null, 'Then regex is null')
                t.equal(fieldTypesReference, null, 'Then fieldTypesReference is null')
                t.end()
            })

            t.test('When parsing "Number"', t => {
                const ir = FieldDescriptor.fromString('Number')

                t.equal(ir.baseType, 'Number', 'Then baseType is Number')
                t.equal(ir.optional, false, 'Then optional is false')
                t.end()
            })

            t.test('When parsing "Boolean"', t => {
                const ir = FieldDescriptor.fromString('Boolean')

                t.equal(ir.baseType, 'Boolean', 'Then baseType is Boolean')
                t.end()
            })

            t.test('When parsing "Object"', t => {
                const ir = FieldDescriptor.fromString('Object')

                t.equal(ir.baseType, 'Object', 'Then baseType is Object')
                t.end()
            })

            t.test('When parsing "Date"', t => {
                const ir = FieldDescriptor.fromString('Date')

                t.equal(ir.baseType, 'Date', 'Then baseType is Date')
                t.end()
            })

            t.test('When parsing "Any"', t => {
                const ir = FieldDescriptor.fromString('Any')

                t.equal(ir.baseType, 'Any', 'Then baseType is Any')
                t.end()
            })

            t.end()
        })

        t.test('Given an optional type string', t => {
            t.test('When parsing "String?"', t => {
                const ir = FieldDescriptor.fromString('String?')

                t.equal(ir.baseType, 'String', 'Then baseType is String')
                t.equal(ir.optional, true, 'Then optional is true')
                t.end()
            })

            t.test('When parsing "Number?"', t => {
                const ir = FieldDescriptor.fromString('Number?')

                t.equal(ir.baseType, 'Number', 'Then baseType is Number')
                t.equal(ir.optional, true, 'Then optional is true')
                t.end()
            })

            t.end()
        })

        t.test('Given a Tagged type string', t => {
            t.test('When parsing "Account"', t => {
                const { baseType, optional, taggedType } = FieldDescriptor.fromString('Account')

                t.equal(baseType, 'Tagged', 'Then baseType is Tagged')
                t.equal(taggedType, 'Account', 'Then taggedType is Account')
                t.equal(optional, false, 'Then optional is false')
                t.end()
            })

            t.test('When parsing "Account?"', t => {
                const { baseType, optional, taggedType } = FieldDescriptor.fromString('Account?')

                t.equal(baseType, 'Tagged', 'Then baseType is Tagged')
                t.equal(taggedType, 'Account', 'Then taggedType is Account')
                t.equal(optional, true, 'Then optional is true')
                t.end()
            })

            t.end()
        })

        t.test('Given an array type string', t => {
            t.test('When parsing "[String]"', t => {
                const { arrayDepth, baseType, optional } = FieldDescriptor.fromString('[String]')

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(arrayDepth, 1, 'Then arrayDepth is 1')
                t.equal(optional, false, 'Then optional is false')
                t.end()
            })

            t.test('When parsing "[Account]"', t => {
                const { arrayDepth, baseType, taggedType } = FieldDescriptor.fromString('[Account]')

                t.equal(baseType, 'Tagged', 'Then baseType is Tagged')
                t.equal(taggedType, 'Account', 'Then taggedType is Account')
                t.equal(arrayDepth, 1, 'Then arrayDepth is 1')
                t.end()
            })

            t.test('When parsing "[[Number]]"', t => {
                const { arrayDepth, baseType } = FieldDescriptor.fromString('[[Number]]')

                t.equal(baseType, 'Number', 'Then baseType is Number')
                t.equal(arrayDepth, 2, 'Then arrayDepth is 2')
                t.end()
            })

            t.test('When parsing "[String]?"', t => {
                const { arrayDepth, baseType, optional } = FieldDescriptor.fromString('[String]?')

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(arrayDepth, 1, 'Then arrayDepth is 1')
                t.equal(optional, true, 'Then optional is true')
                t.end()
            })

            t.end()
        })

        t.test('Given a LookupTable type string', t => {
            t.test('When parsing "{Account:id}"', t => {
                const { baseType, idField, optional, taggedType } = FieldDescriptor.fromString('{Account:id}')

                t.equal(baseType, 'LookupTable', 'Then baseType is LookupTable')
                t.equal(taggedType, 'Account', 'Then taggedType is Account')
                t.equal(idField, 'id', 'Then idField is id')
                t.equal(optional, false, 'Then optional is false')
                t.end()
            })

            t.test('When parsing "{Transaction:transactionId}?"', t => {
                const { baseType, idField, optional, taggedType } =
                    FieldDescriptor.fromString('{Transaction:transactionId}?')

                t.equal(baseType, 'LookupTable', 'Then baseType is LookupTable')
                t.equal(taggedType, 'Transaction', 'Then taggedType is Transaction')
                t.equal(idField, 'transactionId', 'Then idField is transactionId')
                t.equal(optional, true, 'Then optional is true')
                t.end()
            })

            t.end()
        })

        t.test('Given a regex type string', t => {
            t.test('When parsing "/abc/"', t => {
                const { baseType, optional, regex } = FieldDescriptor.fromString('/abc/')

                t.equal(baseType, 'String', 'Then baseType is String')
                t.ok(regex instanceof RegExp, 'Then regex is a RegExp')
                t.equal(regex.source, 'abc', 'Then regex source is abc')
                t.equal(optional, false, 'Then optional is false')
                t.end()
            })

            t.test('When parsing "/^[0-9]+$/i"', t => {
                const { baseType, regex } = FieldDescriptor.fromString('/^[0-9]+$/i')

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(regex.source, '^[0-9]+$', 'Then regex source is correct')
                t.equal(regex.flags, 'i', 'Then regex flags are preserved')
                t.end()
            })

            t.test('When parsing "/abc/?"', t => {
                const { baseType, optional, regex } = FieldDescriptor.fromString('/abc/?')

                t.equal(baseType, 'String', 'Then baseType is String')
                t.ok(regex instanceof RegExp, 'Then regex is a RegExp')
                t.equal(optional, true, 'Then optional is true')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('fromObject', t => {
        t.test('Given a FieldTypes reference object', t => {
            t.test('When parsing a non-optional FieldTypes reference', t => {
                const input = {
                    isFieldTypesReference: true,
                    property: 'E164Phone',
                    fullReference: 'FieldTypes.E164Phone',
                }
                const { baseType, fieldTypesReference, optional, regex } = FieldDescriptor.fromObject(input)

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(optional, false, 'Then optional is false')
                t.same(
                    fieldTypesReference,
                    { property: 'E164Phone', fullReference: 'FieldTypes.E164Phone' },
                    'Then fieldTypesReference is preserved',
                )
                t.equal(regex, null, 'Then regex is null')
                t.end()
            })

            t.end()
        })

        t.test('Given a wrapper object with pattern and optional', t => {
            t.test('When parsing { pattern: FieldTypes.X, optional: true }', t => {
                const input = {
                    pattern: {
                        isFieldTypesReference: true,
                        property: 'E164Phone',
                        fullReference: 'FieldTypes.E164Phone',
                    },
                    optional: true,
                }
                const { baseType, fieldTypesReference, optional } = FieldDescriptor.fromObject(input)

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(optional, true, 'Then optional is true')
                t.same(
                    fieldTypesReference,
                    { property: 'E164Phone', fullReference: 'FieldTypes.E164Phone' },
                    'Then fieldTypesReference is preserved',
                )
                t.end()
            })

            t.test('When parsing { pattern: FieldTypes.X, optional: false }', t => {
                const input = {
                    pattern: {
                        isFieldTypesReference: true,
                        property: 'correlationId',
                        fullReference: 'FieldTypes.correlationId',
                    },
                    optional: false,
                }
                const { fieldTypesReference, optional } = FieldDescriptor.fromObject(input)

                t.equal(optional, false, 'Then optional is false')
                t.same(
                    fieldTypesReference,
                    { property: 'correlationId', fullReference: 'FieldTypes.correlationId' },
                    'Then fieldTypesReference is preserved',
                )
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('fromAny', t => {
        t.test('Given a string input', t => {
            t.test('When calling fromAny with "Number?"', t => {
                const { baseType, optional } = FieldDescriptor.fromAny('Number?')

                t.equal(baseType, 'Number', 'Then baseType is Number')
                t.equal(optional, true, 'Then optional is true')
                t.end()
            })

            t.end()
        })

        t.test('Given a RegExp input', t => {
            t.test('When calling fromAny with /^[a-z]+$/', t => {
                const { baseType, optional, regex } = FieldDescriptor.fromAny(/^[a-z]+$/)

                t.equal(baseType, 'String', 'Then baseType is String')
                t.equal(regex.source, '^[a-z]+$', 'Then regex source is preserved')
                t.equal(optional, false, 'Then optional is false')
                t.end()
            })

            t.end()
        })

        t.test('Given an object input', t => {
            t.test('When calling fromAny with a FieldTypes reference', t => {
                const input = { isFieldTypesReference: true, property: 'email', fullReference: 'FieldTypes.email' }
                const { baseType, fieldTypesReference } = FieldDescriptor.fromAny(input)

                t.equal(baseType, 'String', 'Then baseType is String')
                t.same(
                    fieldTypesReference,
                    { property: 'email', fullReference: 'FieldTypes.email' },
                    'Then fieldTypesReference is preserved',
                )
                t.end()
            })

            t.test('When calling fromAny with a wrapper object', t => {
                const input = {
                    pattern: {
                        isFieldTypesReference: true,
                        property: 'E164Phone',
                        fullReference: 'FieldTypes.E164Phone',
                    },
                    optional: true,
                }
                const { fieldTypesReference, optional } = FieldDescriptor.fromAny(input)

                t.equal(optional, true, 'Then optional is true')
                t.ok(fieldTypesReference, 'Then fieldTypesReference exists')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
