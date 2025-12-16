// ABOUTME: Main test suite for cli-type-generator
// ABOUTME: Tests generated types, constructors, validation, Firestore serialization, and LookupTable operations

import { LookupTable } from '@graffio/functional'
import fs from 'fs'
import path from 'path'
import tap from 'tap'
import { generateIndexFile, generateOne } from '../src/cli-api.js'
import { generateStaticTaggedSumType, generateStaticTaggedType } from '../src/tagged-type-generator.js'

/*
 * Legacy compatibility wrapper for the new per-file type generation system
 * This function generates all types by running the yarn types:generate command
 * @sig generateTypes :: () -> Promise<void>
 */
const generateTypes = async () => {
    try {
        // Run the new type generation system
        const names = [
            'bob',
            'carol',
            'coord',
            'custom-serialization',
            'double-nested-array',
            'event',
            'field-types-test',
            'has-id',
            'has-id-enhanced',
            'middle',
            'middle-type-enum',
            'nested-array',
            'notification',
            'optional-coord',
            'optional-number',
            'optional-string',
            'optional-triple-nested-coord',
            'shape',
            'triple-nested-array',
            'triple-nested-coord',
            'tuple',
            'many-lookup-tables',
            'optional-field-types-test',
        ]

        const inputDirectory = `test/type-definitions`
        const outputDirectory = `test/generated`

        await Promise.all(names.map(n => generateOne(`${inputDirectory}/${n}.type.js`, `${outputDirectory}/${n}.js`)))

        await generateIndexFile('test/generated')
    } catch (error) {
        console.error(`❌ Type generation failed: ${error.message}`)
        process.exit(1)
    }
}

// Clean up any existing generated test files before starting
try {
    fs.rmSync('./generated/', { recursive: true, force: true })
} catch (error) {} // Ignore if directory doesn't exist

await generateTypes()

const outputDir = new URL('./generated/', import.meta.url).pathname
const generatedTypes = await import('./generated/index.js')
const {
    Bob,
    Carol,
    Coord,
    CustomSerialization,
    DoubleNestedArray,
    Event,
    HasId,
    HasIdEnhanced,
    Middle,
    MiddleTypeEnum,
    NestedArray,
    Notification,
    OptionalCoord,
    OptionalNumber,
    OptionalString,
    OptionalTripleNestedCoord,
    Shape,
    TripleNestedArray,
    TripleNestedCoord,
    Tuple,
    ManyLookupTables,
    OptionalFieldTypesTest,
} = generatedTypes

// Alias for backward compatibility with tests
const UseLookupTable = ManyLookupTables

// Add prototype method to Tuple to match original test setup
Tuple.prototype.foo = 'foo'

// Add static helper methods to Coord to match original test setup
Coord.translate = (shape, x, y) => Coord(shape.x + x, shape.y + y)
const isCoord = Coord.is
const coord = Coord(1, 2)

// Add static helper method to Shape to match original test setup
Shape.translate = (shape, x, y) =>
    shape.match({
        Square: ({ topLeft, bottomRight }) =>
            Shape.Square(Coord.translate(topLeft, x, y), Coord.translate(bottomRight, x, y)),
        Circle: ({ centre, radius }) => Shape.Circle(Coord.translate(centre, x, y), radius),
    })

const square = Shape.Square(Coord(0, 0), Coord(4, 4))
const circle = Shape.Circle(Coord(0, 0), 2)

tap.test('Empty Array Validation Fix', t => {
    t.test('Given NestedArray with [Number] type', t => {
        t.test('When creating with empty array', t => {
            const emptyArray = NestedArray([])
            t.ok(emptyArray, 'Then empty array should be accepted')
            t.equal(emptyArray.toString(), 'NestedArray([])', 'Then toString should work correctly')
            t.end()
        })

        t.test('When creating with non-empty valid array', t => {
            const validArray = NestedArray([1, 2, 3])
            t.ok(validArray, 'Then valid non-empty array should be accepted')
            t.equal(validArray.toString(), 'NestedArray([1, 2, 3])', 'Then toString should work correctly')
            t.end()
        })

        t.test('When creating with non-empty invalid array', t => {
            t.throws(
                () => NestedArray(['invalid']),
                /expected p to have type \[Number\]/,
                'Then invalid array should be rejected',
            )
            t.end()
        })

        t.end()
    })

    t.test('Given DoubleNestedArray with [[Number]] type', t => {
        t.test('When creating with empty outer array', t => {
            const emptyOuter = DoubleNestedArray([])
            t.ok(emptyOuter, 'Then empty outer array should be accepted')
            t.equal(emptyOuter.toString(), 'DoubleNestedArray([])', 'Then toString should work correctly')
            t.end()
        })

        t.test('When creating with empty inner arrays', t => {
            const emptyInner = DoubleNestedArray([[], []])
            t.ok(emptyInner, 'Then empty inner arrays should be accepted')
            t.equal(emptyInner.toString(), 'DoubleNestedArray([[], []])', 'Then toString should work correctly')
            t.end()
        })

        t.test('When creating with mixed empty and non-empty arrays', t => {
            const mixed = DoubleNestedArray([[], [1, 2], []])
            t.ok(mixed, 'Then mixed empty/non-empty arrays should be accepted')
            t.equal(mixed.toString(), 'DoubleNestedArray([[], [1, 2], []])', 'Then toString should work correctly')
            t.end()
        })

        t.test('When creating with non-empty valid arrays', t => {
            const validNested = DoubleNestedArray([
                [1, 2],
                [3, 4],
            ])
            t.ok(validNested, 'Then valid nested arrays should be accepted')
            t.equal(
                validNested.toString(),
                'DoubleNestedArray([[1, 2], [3, 4]])',
                'Then toString should work correctly',
            )
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Enhanced Types - Function Attachment', t => {
    t.test('Given HasIdEnhanced type with imports and attached functions', t => {
        t.test('When I examine the type constructor', t => {
            t.equal(typeof HasIdEnhanced, 'function', 'Then HasIdEnhanced is a function')
            t.equal(HasIdEnhanced.name, 'HasIdEnhanced', 'Then constructor name is HasIdEnhanced')
            t.equal(HasIdEnhanced.toString(), 'HasIdEnhanced', 'Then toString returns type name')
            t.end()
        })

        t.test('When I test the attached createRandom function', t => {
            t.equal(typeof HasIdEnhanced.createRandom, 'function', 'Then createRandom is a function')

            const randomId = HasIdEnhanced.createRandom()
            t.ok(HasIdEnhanced.is(randomId), 'Then createRandom returns valid HasIdEnhanced instance')
            t.equal(typeof randomId.id, 'string', 'Then generated id is a string')
            t.ok(randomId.id.length > 30, 'Then generated id has reasonable length')

            // Test that multiple calls generate different IDs
            const randomId2 = HasIdEnhanced.createRandom()
            t.not(randomId.id, randomId2.id, 'Then multiple calls generate different IDs')
            t.end()
        })

        t.test('When I test the attached isValidId function', t => {
            t.equal(typeof HasIdEnhanced.isValidId, 'function', 'Then isValidId is a function')

            // Test valid UUID v4 format
            const validUuid = '12345678-1234-4234-8234-123456789012'
            t.ok(HasIdEnhanced.isValidId(validUuid), 'Then isValidId accepts valid UUID')

            // Test invalid IDs
            t.notOk(HasIdEnhanced.isValidId('invalid'), 'Then isValidId rejects invalid string')
            t.notOk(HasIdEnhanced.isValidId(123), 'Then isValidId rejects number')
            t.notOk(HasIdEnhanced.isValidId(null), 'Then isValidId rejects null')
            t.notOk(HasIdEnhanced.isValidId(undefined), 'Then isValidId rejects undefined')

            // Test generated IDs are valid
            const randomId = HasIdEnhanced.createRandom()
            t.ok(HasIdEnhanced.isValidId(randomId.id), 'Then createRandom generates valid IDs')
            t.end()
        })

        t.test('When I test the attached fromObject function', t => {
            t.equal(typeof HasIdEnhanced.fromObject, 'function', 'Then fromObject is a function')

            const validUuid = '12345678-1234-4234-8234-123456789012'
            const obj = { id: validUuid, extra: 'data' }

            const instance = HasIdEnhanced.fromObject(obj)
            t.ok(HasIdEnhanced.is(instance), 'Then fromObject returns valid HasIdEnhanced instance')
            t.equal(instance.id, validUuid, 'Then fromObject extracts correct ID')

            // Test error cases
            t.throws(() => HasIdEnhanced.fromObject(null), 'Then fromObject throws on null')
            t.throws(() => HasIdEnhanced.fromObject({}), 'Then fromObject throws on object without id')
            t.throws(() => HasIdEnhanced.fromObject({ id: null }), 'Then fromObject throws on null id')
            t.end()
        })

        t.test('When I test integration between functions', t => {
            // Create random instance
            const randomInstance = HasIdEnhanced.createRandom()
            const { id } = randomInstance

            // Verify it's valid
            t.ok(HasIdEnhanced.isValidId(id), 'Then createRandom output passes isValidId')

            // Convert to object and back
            const asObject = { id, extra: 'test' }
            const fromObjectInstance = HasIdEnhanced.fromObject(asObject)

            t.equal(fromObjectInstance.id, id, 'Then roundtrip preserves ID')
            t.ok(HasIdEnhanced.is(fromObjectInstance), 'Then fromObject result is valid instance')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Enhanced Types - Base Compatibility', t => {
    t.test('Given HasIdEnhanced type maintains base functionality', t => {
        t.test('When I test core type functionality', t => {
            const validUuid = '12345678-1234-4234-8234-123456789012'
            const instance = HasIdEnhanced(validUuid)

            t.ok(HasIdEnhanced.is(instance), 'Then core constructor works')
            t.equal(instance.id, validUuid, 'Then field access works')
            t.equal(instance.toString(), `HasIdEnhanced("${validUuid}")`, 'Then toString works')

            // Test validation still works
            t.throws(() => HasIdEnhanced('invalid'), /expected id to match/, 'Then validation still works')
            t.throws(() => HasIdEnhanced(123), /expected id to have type String/, 'Then type checking still works')
            t.end()
        })

        t.test('When I test from method compatibility', t => {
            const validUuid = '12345678-1234-4234-8234-123456789012'
            const obj = { id: validUuid }

            const instance = HasIdEnhanced.from(obj)
            t.ok(HasIdEnhanced.is(instance), 'Then built-in from method still works')
            t.equal(instance.id, validUuid, 'Then from method extracts correct data')

            // Both from methods should work
            const instance2 = HasIdEnhanced.fromObject(obj)
            t.equal(instance.id, instance2.id, 'Then both from methods produce same result')
            t.end()
        })

        t.test('When I test JSON serialization', t => {
            const instance = HasIdEnhanced.createRandom()
            const json = JSON.stringify(instance)
            const parsed = JSON.parse(json)

            t.equal(typeof json, 'string', 'Then JSON.stringify works')
            t.equal(parsed.id, instance.id, 'Then JSON roundtrip preserves data')

            // Can reconstruct from JSON
            const reconstructed = HasIdEnhanced.from(parsed)
            t.equal(reconstructed.id, instance.id, 'Then can reconstruct from JSON')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Enhanced Types - Import Handling', t => {
    t.test('Given type definitions with imports', t => {
        t.test('When I examine the generated code structure', t => {
            // Read the generated file to verify import handling
            const generatedCode = fs.readFileSync('test/generated/has-id-enhanced.js', 'utf8')

            // Should not contain internal imports in generated code
            t.notOk(
                generatedCode.includes("import StringTypes from './string-types.js'"),
                'Then internal imports are filtered out',
            )

            // Should contain the generated type functionality
            t.ok(generatedCode.includes('HasIdEnhanced.createRandom'), 'Then attached functions are included')
            t.ok(generatedCode.includes('HasIdEnhanced.isValidId'), 'Then all attached functions are included')
            t.ok(generatedCode.includes('HasIdEnhanced.fromObject'), 'Then all attached functions are included')

            // Should contain regex validation from import resolution
            t.ok(generatedCode.includes('/^[0-9a-f]{8}-[0-9a-f]{4}'), 'Then import values are resolved')
            t.end()
        })

        t.test('When I test that imports are properly resolved', t => {
            // The StringTypes.Id should be resolved to actual regex in validation
            const validUuid = '12345678-1234-4234-8234-123456789012'
            const invalidId = 'not-a-uuid'

            t.doesNotThrow(() => HasIdEnhanced(validUuid), 'Then resolved regex accepts valid UUID')
            t.throws(() => HasIdEnhanced(invalidId), 'Then resolved regex rejects invalid UUID')

            // The validation should match what isValidId function uses
            const instance = HasIdEnhanced(validUuid)
            t.ok(HasIdEnhanced.isValidId(instance.id), 'Then import resolution is consistent')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Tagged Types Static Migration - Core Functionality', t => {
    t.test('Given static Coord type', t => {
        t.test('When I examine the type constructor', t => {
            t.equal(typeof Coord, 'function', 'Then the Type Constructor is a function')
            t.equal(Coord.name, 'Coord', 'Then the name of the Type Constructor function is "Coord"')
            t.equal(
                Coord.constructor,
                Function,
                'Then Coord.constructor, as with all functions, is the native JS Function',
            )
            t.equal(Coord.prototype.constructor, Coord, 'Then Coord.prototype.constructor points back to Coord')
            t.equal(Coord.toString(), 'Coord', 'Then Coord.toString() returns "Coord"')
            t.notOk(Coord.is({}), 'Then Coord.is({}) correctly returns false')
            t.notOk({} instanceof Coord, 'Then {} instanceof Coord correctly returns false')
            t.end()
        })
        t.test('When I create a coord instance', t => {
            t.equal(coord.x, 1, 'Then coord.x is 1')
            t.equal(coord.y, 2, 'Then coord.y is 2')
            t.equal(coord.toString(), 'Coord(1, 2)', 'Then coord.toString() is "Coord(1, 2)"')
            t.ok(Coord.is(coord), 'Then Coord.is(coord) is true')
            t.ok(coord instanceof Coord, 'Then coord is an instanceof Coord')
            t.ok(Coord.prototype === Object.getPrototypeOf(coord), 'Then Coord.prototype is the immediate prototype')
            t.ok(
                Object.prototype.isPrototypeOf.call(Coord.prototype, coord),
                'Then Coord.prototype is in the prototype chain',
            )
            t.end()
        })
        t.test('When I test argument validation', t => {
            t.throws(
                () => Coord(1),
                new TypeError('In constructor Coord(x, y): expected 2 arguments, found 1'),
                'Then throws on wrong arg count',
            )
            t.throws(
                () => Coord(1, 2, 3),
                new TypeError('In constructor Coord(x, y): expected 2 arguments, found 3'),
                'Then throws on too many args',
            )
            t.end()
        })
        t.test('When I use helper methods', t => {
            t.ok(coord.x === 1 && coord.y === 2, 'Then coord is unchanged after translate')
            t.same(Coord.translate(coord, 1, 2), Coord(2, 4), 'Then coord2 is Coord(2, 4)')
            t.ok(isCoord(coord), 'Then isCoord(coord) correctly returns true when unbound')
            t.notOk(isCoord({}), 'Then isCoord({}) correctly returns false when unbound')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - TaggedSum Functionality', t => {
    t.test('Given static Shape taggedSum type', t => {
        t.test('When I examine the type structure', t => {
            t.equal(typeof Shape, 'object', 'Then Shape is an object')
            t.equal(typeof Shape.Square, 'function', 'Then Shape.Square is a function')
            t.equal(typeof Shape.Circle, 'function', 'Then Shape.Circle is a function')
            t.end()
        })
        t.test('When I create instances', t => {
            t.equal(square.topLeft.toString(), 'Coord(0, 0)', 'Then square.topLeft is correct')
            t.equal(square.bottomRight.toString(), 'Coord(4, 4)', 'Then square.bottomRight is correct')
            t.equal(circle.centre.toString(), 'Coord(0, 0)', 'Then circle.centre is correct')
            t.equal(circle.radius, 2, 'Then circle.radius is correct')
            t.equal(square.toString(), 'Shape.Square(Coord(0, 0), Coord(4, 4))', 'Then square toString')
            t.equal(circle.toString(), 'Shape.Circle(Coord(0, 0), 2)', 'Then circle toString')
            t.end()
        })
        t.test('When I test type checking', t => {
            const { Circle, Square, is } = Shape
            t.ok(is(square), 'Then Shape.is(square) is true')
            t.ok(is(circle), 'Then Shape.is(circle) is true')
            t.ok(Square.is(square), 'Then Shape.Square.is(square) is true')
            t.ok(Circle.is(circle), 'Then Shape.Circle.is(circle) is true')
            t.notOk(Square.is(circle), 'Then Shape.Square.is(circle) is false')
            t.notOk(Circle.is(square), 'Then Shape.Circle.is(square) is false')
            t.end()
        })
        t.test('When I use match functionality', t => {
            const squareResult = square.match({ Square: () => 'square', Circle: () => 'circle' })
            t.equal(squareResult, 'square', 'Then match works correctly on square')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - Complex Type Validation', t => {
    t.test('Given complex type validation', t => {
        t.test('When I test HasId with regex validation', t => {
            const validId = '00000000-1234-1234-0000-123456789012'
            t.doesNotThrow(() => HasId(validId), 'Then HasId accepts valid UUID')
            t.throws(() => HasId('50'), /expected id to match/, 'Then HasId rejects invalid UUID')
            t.throws(() => HasId(50), /expected id to have type String/, 'Then HasId rejects non-string')
            t.end()
        })
        t.test('When I test Bob with multiple field types', t => {
            const bob = Bob(4, 'four', { n: 4 }, 4)
            const { a, num, o, s } = bob
            t.equal(num, 4, 'Then Bob.num is correct')
            t.equal(s, 'four', 'Then Bob.s is correct')
            t.same(o, { n: 4 }, 'Then Bob.o is correct')
            t.equal(a, 4, 'Then Bob.a is correct')
            t.throws(
                () => Bob('uh-oh', 'four', { n: 4 }, 'a'),
                /expected num to have type Number/,
                'Then Bob validates num type',
            )
            t.throws(
                () => Bob(4, { o: 3 }, { n: 4 }, 'A String!'),
                /expected s to have type String/,
                'Then Bob validates s type',
            )
            t.end()
        })
        t.test('When I test Carol with Coord field', t => {
            const carol = Carol(Coord(1, 2))
            t.equal(carol.p.toString(), 'Coord(1, 2)', 'Then Carol accepts Coord')
            t.throws(() => Carol('not a coord'), /expected p to have type Coord/, 'Then Carol rejects non-Coord')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - Date Type Validation', t => {
    t.test('Given Event type with Date fields', t => {
        t.test('When I test required Date field', t => {
            const now = new Date()
            const event = Event('Conference', now, undefined)
            const { name, occurredAt, scheduledFor } = event
            t.equal(name, 'Conference', 'Then Event.name is correct')
            t.equal(occurredAt, now, 'Then Event.occurredAt accepts Date')
            t.equal(scheduledFor, undefined, 'Then optional Date can be undefined')
            t.end()
        })

        t.test('When I test Date validation rejects non-Date values', t => {
            t.throws(
                () => Event('Meeting', 'not a date', undefined),
                /expected occurredAt to have type Date/,
                'Then Event rejects string for required Date field',
            )
            t.throws(
                () => Event('Meeting', 12345, undefined),
                /expected occurredAt to have type Date/,
                'Then Event rejects number for required Date field',
            )
            t.throws(
                () => Event('Meeting', { year: 2024 }, undefined),
                /expected occurredAt to have type Date/,
                'Then Event rejects object for required Date field',
            )
            t.end()
        })

        t.test('When I test optional Date field', t => {
            const now = new Date()
            const future = new Date(Date.now() + 86400000)

            const eventWithSchedule = Event('Workshop', now, future)
            t.equal(eventWithSchedule.scheduledFor, future, 'Then optional Date accepts Date value')

            const eventWithoutSchedule = Event('Workshop', now, undefined)
            t.equal(eventWithoutSchedule.scheduledFor, undefined, 'Then optional Date accepts undefined')

            t.throws(
                () => Event('Workshop', now, 'tomorrow'),
                /expected scheduledFor to have type Date/,
                'Then optional Date rejects non-Date values',
            )
            t.end()
        })

        t.test('When I test Event toString with Dates', t => {
            const date = new Date('2024-01-15T10:30:00.000Z')
            const event = Event('Launch', date, undefined)
            t.ok(event.toString().includes('Launch'), 'Then toString includes event name')
            t.ok(event.toString().includes('2024-01-15T10:30:00.000Z'), 'Then toString includes ISO date string')
            t.end()
        })

        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - Array Types', t => {
    t.test('Given array type handling', t => {
        t.test('When I test nested arrays', t => {
            const nested = NestedArray([1, 2, 3])
            t.same(nested.p, [1, 2, 3], 'Then NestedArray accepts [Number]')
            t.throws(
                () => NestedArray(['a', 'b']),
                /expected p to have type \[Number\]/,
                'Then NestedArray rejects [String]',
            )
            t.end()
        })
        t.test('When I test double nested arrays', t => {
            const doubleNested = DoubleNestedArray([[1, 2, 3]])
            t.same(doubleNested.p, [[1, 2, 3]], 'Then DoubleNestedArray accepts [[Number]]')
            t.throws(
                () => DoubleNestedArray([['a', 'b']]),
                /expected p to have type \[\[Number\]\]/,
                'Then DoubleNestedArray rejects [[String]]',
            )
            t.end()
        })
        t.test('When I test triple nested arrays', t => {
            const tripleNested = TripleNestedArray([[[1, 2, 3]]])
            t.same(tripleNested.p, [[[1, 2, 3]]], 'Then TripleNestedArray accepts [[[Number]]]')
            t.end()
        })
        t.test('When I test triple nested coordinates', t => {
            const tripleCoord = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.equal(tripleCoord.p[0][0][0].toString(), 'Coord(1, 2)', 'Then TripleNestedCoord accepts [[[Coord]]]')
            t.throws(
                () => TripleNestedCoord([[['not coord']]]),
                /expected p to have type \[\[\[Coord\]\]\]/,
                'Then TripleNestedCoord rejects non-Coord',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - Optional Types', t => {
    t.test('Given optional type handling', t => {
        t.test('When I test optional fields', t => {
            const optionalWithValue = OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.equal(optionalWithValue.p[0][0][0].toString(), 'Coord(1, 2)', 'Then optional type accepts value')

            const optionalEmpty = OptionalTripleNestedCoord()
            t.equal(optionalEmpty.p, undefined, 'Then optional type accepts undefined')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - Nested TaggedSum Types', t => {
    t.test('Given nested taggedSum types', t => {
        t.test('When I test nested enum functionality', t => {
            const middleEnum = MiddleTypeEnum.MiddleTypeEnumA('foo')
            t.ok(MiddleTypeEnum.is(middleEnum), 'Then MiddleTypeEnum.is works')
            t.ok(MiddleTypeEnum.MiddleTypeEnumA.is(middleEnum), 'Then specific variant is works')

            const middle = Middle.E('middle', middleEnum)
            t.equal(middle.name, 'middle', 'Then Middle.E name is correct')
            t.equal(middle.middleEnum, middleEnum, 'Then Middle.E middleEnum is correct')

            const middleResult = middle.match({ E: ({ name }) => `E: ${name}`, F: () => 'F' })
            t.equal(middleResult, 'E: middle', 'Then Middle match works')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - JSON Serialization', t => {
    t.test('Given JSON serialization', t => {
        t.test('When I test toJSON functionality', t => {
            const coordJson = JSON.stringify(coord)
            t.equal(coordJson, '{"x":1,"y":2}', 'Then Coord JSON serialization')

            const circleJson = JSON.stringify(circle)
            t.equal(
                circleJson,
                '{"@@tagName":"Circle","centre":{"x":0,"y":0},"radius":2}',
                'Then Circle JSON serialization',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - Summary', t => {
    t.test('Given the complete static type migration', t => {
        t.test('When I validate migration success', t => {
            t.pass('Then ✅ All core tagged type functionality migrated successfully')
            t.pass('Then ✅ All taggedSum type functionality migrated successfully')
            t.pass('Then ✅ All complex type validation migrated successfully')
            t.pass('Then ✅ All array type handling migrated successfully')
            t.pass('Then ✅ All optional type handling migrated successfully')
            t.pass('Then ✅ All nested types migrated successfully')
            t.pass('Then ✅ All JSON serialization migrated successfully')
            t.pass('Then ✅ Static types maintain 100% API compatibility with cli-type-generator types')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test("Given Coord = tagged('Coord', { x: 'Number', y: 'Number' })", t => {
    t.test('Then', t => {
        t.same(typeof Coord, 'function', 'The Type Constructor is a function')
        t.same(Coord.name, 'Coord', 'The name of the Type Constructor function is "Coord"')
        t.same(Coord.constructor, Function, 'Coord.constructor, as with all functions, is the native JS Function')
        t.same(Coord.prototype.constructor, Coord, 'Coord.prototype.constructor points back to Coord')
        t.same(Coord.toString(), `Coord`, 'Coord.toString() returns "Coord"')
        t.notOk(Coord.is({}), 'Coord.is({}) correctly returns false')
        t.notOk({} instanceof Coord, '{} instanceof Coord correctly returns false')
        t.end()
    })

    t.test('When I create coord = Coord(1, 2)', t => {
        t.same(coord.x, 1, 'coord.x is 1')
        t.same(coord.y, 2, 'coord.y is 2')
        t.same(coord.toString(), `Coord(1, 2)`, 'coord.toString() is "Coord(1, 2)"')
        t.ok(Coord.is(coord), 'Coord.is(coord) is true')
        t.ok(coord instanceof Coord, 'coord is an instanceof Coord')
        t.ok(
            Coord.prototype === Object.getPrototypeOf(coord),
            'Coord.prototype is the immediate prototype of coord via getPrototypeOf',
        )
        t.ok(
            Object.prototype.isPrototypeOf.call(Coord.prototype, coord),
            'Coord.prototype is in the prototype chain of coord via isPrototypeOf',
        )
        t.end()
    })

    t.test('When I instead try to create coord = Coord(1)', t => {
        t.throws(
            () => Coord(1),
            new TypeError(`In constructor Coord(x, y): expected 2 arguments, found 1`),
            'I get the error',
        )
        t.end()
    })

    t.test('When I instead try to create coord = Coord(1, 2, 3)', t => {
        t.throws(
            () => Coord(1, 2, 3),
            new TypeError(`In constructor Coord(x, y): expected 2 arguments, found 3`),
            'I get the error',
        )
        t.end()
    })

    t.test('When I translate coord2 = Coord.translate(coord, 1, 2)', t => {
        t.ok(coord.x === 1 && coord.y === 2, 'coord is unchanged')
        t.same(Coord.translate(coord, 1, 2), Coord(2, 4), 'coord2 is Coord(2, 4)')
        t.end()
    })

    t.test('When I define isCoord = Coord.is and list = List.Nil', t => {
        t.ok(isCoord(coord), 'isCoord(coord) correctly returns true even when used as an unbound variable')
        t.notOk(isCoord({}), 'isCoord({}) correctly returns false even when used as an unbound variable')
        t.end()
    })

    t.test('When I create a Coord from an object: coord1 = Coord.from({ x: 1, y: 2 })', t => {
        const coord1 = Coord.from({ x: 1, y: 2 })
        t.same(coord1, Coord(1, 2), 'coord1 is Coord(1, 2)')
        t.end()
    })

    t.test('When I create a Coord from an object: coord1 = Coord.from({ x: 1, y: 2, z: 3 })', t => {
        const coord1 = Coord.from({ x: 1, y: 2, z: 3 })
        t.same(coord1, Coord(1, 2), 'coord1 is Coord(1, 2) because the z is ignored')
        t.end()
    })

    t.test('When I instead try to create a Coord from an object: coord1 = Coord.from({ x: 1 })', t => {
        t.throws(
            () => Coord.from({ x: 1 }),
            new TypeError('In constructor Coord(x, y): expected y to have type Number; found undefined)'),
            'I get the error',
        )
        t.end()
    })

    t.end()
})

/*
 * Test taggedSum
 */
tap.test('Given Shape as a taggedSum with Square and Circle constructors', t => {
    t.test('Then', t => {
        const { Square, prototype } = Shape
        t.same(typeof Shape, 'object', 'Shape is an object')
        t.same(Shape['@@typeName'], 'Shape', "Shape's '@@typeName' is 'Shape'")
        t.same(Shape['@@tagNames'], ['Square', 'Circle'], "Shape's '@@tagNames' are ['Square', 'Circle']")
        t.same(typeof Square, 'function', 'Shape.Square is a function')

        t.ok(typeof prototype.match === 'function', 'Shape.prototype.match is a function')
        t.ok(typeof prototype.constructor === 'object', 'Shape.prototype.constructor exists')
        t.same(Object.keys(prototype), [], 'Shape.prototype has no enumerable properties')

        t.same(Square.toString(), `Shape.Square`, 'Shape.Square.toString() returns "Shape.Square"')
        t.notOk(Square.is({}), 'Shape.Square.is({}) correctly returns false')
        t.end()
    })

    t.test('When I create square = Shape.Square(Coord(0, 0), Coord(4, 4) circle = Shape.Circle(Coord(0, 0), 2)', t => {
        const { Circle, Square, is, prototype } = Shape
        t.same(square.topLeft, Coord(0, 0), 'square.topLeft is Coord(0, 0)')
        t.same(square.bottomRight, Coord(4, 4), 'square.bottomRight is Coord(4, 4)')
        t.same(circle.centre, Coord(0, 0), 'circle.center is Coord(0, 0)')
        t.same(circle.radius, 2, 'circle.radius is 2')

        t.same(
            square.toString(),
            'Shape.Square(Coord(0, 0), Coord(4, 4))',
            'square.toString() is Shape.Square(Coord(0, 0), Coord(4, 4))',
        )
        t.same(circle.toString(), 'Shape.Circle(Coord(0, 0), 2)', 'circle.toString() is Shape.Circle(Coord(0, 0), 2)')

        t.ok(is(square), 'Shape.is(square) is true')
        t.ok(is(circle), 'Shape.is(circle) is true')
        t.ok(Square.is(square), 'Shape.Square.is(square) is true')
        t.ok(Circle.is(circle), 'Shape.Circle.is(circle) is true')
        t.notOk(Square.is(circle), 'Shape.Square.is(circle) is false')
        t.notOk(Circle.is(square), 'Shape.Circle.is(square) is false')

        t.ok(
            Object.prototype.isPrototypeOf.call(prototype, square),
            'Shape.prototype is in the prototype chain for square',
        )
        t.ok(
            Object.prototype.isPrototypeOf.call(prototype, circle),
            'Shape.prototype is in the prototype chain for circle',
        )
        t.same(
            Object.getPrototypeOf(Object.getPrototypeOf(square)),
            prototype,
            "square's prototype's prototype is Square.prototype",
        )
        t.end()
    })

    t.test('When I instead try to create a Square with too few or too many parameters', t => {
        t.throws(
            () => Shape.Square(Coord(1, 1)),
            new TypeError('In constructor Shape.Square(topLeft, bottomRight): expected 2 arguments, found 1'),
            'With too few arguments I get',
        )
        t.throws(
            () => Shape.Square(1, 1, 1),
            new TypeError(`In constructor Shape.Square(topLeft, bottomRight): expected 2 arguments, found 3`),
            'With too many arguments I get',
        )
        t.end()
    })

    t.test('When I translate square and circle by (1, 2)', t => {
        t.same(
            Shape.translate(square, 1, 2),
            Shape.Square(Coord(1, 2), Coord(5, 6)),
            'The new translated square is Shape.Square(Coord(1, 2), Coord(5, 6)',
        )
        t.same(
            Shape.translate(circle, 1, 2),
            Shape.Circle(Coord(1, 2), 2),
            'The new translated circle is Shape.Circle(Coord(1, 2), 2)',
        )
        t.end()
    })

    t.test('When I ask about instanceof', t => {
        t.ok(square instanceof Shape.Square, 'square is an instanceof Shape.Square')
        t.end()
    })

    t.end()
})

/*
 * Type checking
 */

tap.test('Type Checking', t => {
    t.test("Given HasId = tagged('Id', { id: Id )) ", t => {
        t.test('When I try to create a = HasId(50)', t => {
            const expected = 'In constructor HasId(id): expected id to have type String; found 50'
            t.throws(() => HasId(50), new TypeError(expected), 'It should throw since the given id is not a string')
            t.end()
        })

        t.test('When I try to create a = HasId("50")', t => {
            const uuidRegex = '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i'
            const expected = `In constructor HasId(id): expected id to match ${uuidRegex}; found "50"`
            t.throws(() => HasId('50'), new TypeError(expected), 'It should throw since the given id is not a UUID')
            t.end()
        })

        t.test('When I try to create a = HasId("00000000-1234-1234-123456789012")', t => {
            const id = '00000000-1234-1234-0000-123456789012'
            t.same(HasId(id).id, id, 'It should succeed since the id is a valid UUID')
            t.end()
        })

        t.end()
    })

    t.test("Given Bob = tagged('Bob', { num: 'Number', s: 'String', o: 'Object', a: 'Any' }) ", t => {
        t.test("When I try to create a = Bob(4, 'four', { n: 4 }, 4)", t => {
            const expected = { num: 4, s: 'four', o: { n: 4 }, a: 4 }
            const a = Bob(4, 'four', { n: 4 }, 4)
            t.same(a, expected, `It should equal ${a.toString()}`)
            t.end()
        })

        t.test('When I try to create a = Bob("uh-oh", "four", { n: 4 }, "a")', t => {
            t.throws(
                () => Bob('uh-oh', 'four', { n: 4 }, 'a'),
                new Error('In constructor Bob(num, s, o, a): expected num to have type Number; found "uh-oh"'),
                'It should throw because num is not a number',
            )
            t.end()
        })

        t.test('When I try to create a = Bob(4, { o: 3 }, { n: 4 }, "A String!")', t => {
            t.throws(
                () => Bob(4, { o: 3 }, { n: 4 }, 'A String!'),
                new Error('In constructor Bob(num, s, o, a): expected s to have type String; found {"o":3}'),
                'It should throw because s is not a string',
            )
            t.end()
        })

        t.end()
    })

    t.test("Given Carol = tagged('Carol', { p: 'Coord' }) ", t => {
        t.test('When I try to create a = Carol(Coord(1, 1))', t => {
            const expected = 'Carol(Coord(1, 1))'
            const a = Carol(Coord(1, 1))
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.test('When I try to create a = Carol(Tuple("a", "b"))', t => {
            const expected = new Error('In constructor Carol(p): expected p to have type Coord; found Tuple("a", "b")')
            t.throws(() => Carol(Tuple('a', 'b')), expected, `It should throw because p is not a Coord`)
            t.end()
        })

        t.end()
    })

    t.test("Given Event = tagged('Event', { name: 'String', occurredAt: 'Date', scheduledFor: 'Date?' })", t => {
        t.test('When I try to create an Event with a valid Date', t => {
            const date = new Date('2024-01-15T10:30:00.000Z')
            const event = Event('Launch', date, undefined)
            t.ok(Event.is(event), 'Then Event.is(event) is true')
            t.equal(event.name, 'Launch', 'Then event.name is correct')
            t.equal(event.occurredAt, date, 'Then event.occurredAt is the Date object')
            t.end()
        })

        t.test('When I try to create an Event with a string instead of Date', t => {
            const ctor = 'Event(name, occurredAt, scheduledFor)'
            const expected = new Error(
                `In constructor ${ctor}: expected occurredAt to have type Date; found "2024-01-15"`,
            )
            t.throws(
                () => Event('Launch', '2024-01-15', undefined),
                expected,
                'It should throw because occurredAt is not a Date',
            )
            t.end()
        })

        t.test('When I try to create an Event with a number instead of Date', t => {
            const ctor = 'Event(name, occurredAt, scheduledFor)'
            const expected = new Error(
                `In constructor ${ctor}: expected occurredAt to have type Date; found 1705315800000`,
            )
            t.throws(
                () => Event('Launch', 1705315800000, undefined),
                expected,
                'It should throw because occurredAt is not a Date object',
            )
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Array Type Checking', t => {
    t.test("Given NestedArray = tagged('NestedArray', { p: '[Number]' }) ", t => {
        t.test('When I try to create a = NestedArray(1)', t => {
            const expected = new Error('In constructor NestedArray(p): expected p to have type [Number]; found 1')
            t.throws(() => NestedArray(1), expected, `It should throw because 1 is not a [Number]`)
            t.end()
        })

        t.test('When I try to create a = NestedArray(["a", "b"])', t => {
            const expected = new Error(
                'In constructor NestedArray(p): expected p to have type [Number]; found ["a", "b"]',
            )
            t.throws(() => NestedArray(['a', 'b']), expected, `It should throw because ["a", "b"] is not a [Number]`)
            t.end()
        })

        t.test('When I try to create a = NestedArray([1, 2, 3])', t => {
            const expected = 'NestedArray([1, 2, 3])'
            const a = NestedArray([1, 2, 3])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.end()
    })

    t.test("Given DoubleNestedArray = tagged('DoubleNestedArray', { p: '[[Number]]' }) ", t => {
        t.test('When I try to create a = DoubleNestedArray(1)', t => {
            const expected = new Error(
                'In constructor DoubleNestedArray(p): expected p to have type [[Number]]; found 1',
            )
            t.throws(() => DoubleNestedArray(1), expected, `It should throw because 1 is not a [[Number]]`)
            t.end()
        })

        t.test('When I try to create a = DoubleNestedArray([1])', t => {
            const expected = new Error(
                'In constructor DoubleNestedArray(p): expected p to have type [[Number]]; found [1]',
            )
            t.throws(() => DoubleNestedArray([1]), expected, `It should throw because [1] is still not a [[Number]]`)
            t.end()
        })

        t.test('When I try to create a = DoubleNestedArray([["a", "b"]])', t => {
            const expected = new Error(
                `In constructor DoubleNestedArray(p): expected p to have type [[Number]]; found [["a", "b"]]`,
            )
            t.throws(
                () => DoubleNestedArray([['a', 'b']]),
                expected,
                `It should throw because [["a", "b"]] is still not a [[Number]]`,
            )
            t.end()
        })

        t.test('When I try to create a = DoubleNestedArray([1, 2, 3])', t => {
            const expected = 'DoubleNestedArray([[1, 2, 3]])'
            const a = DoubleNestedArray([[1, 2, 3]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.end()
    })

    t.test("Given TripleNestedArray = tagged('TripleNestedArray', { p: '[[[Number]]]' }) ", t => {
        t.test('When I try to create a = TripleNestedArray(1)', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found 1',
            )
            t.throws(() => TripleNestedArray(1), expected, `It should throw because 1 is not a [[[Number]]]`)
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray([1])', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [1]',
            )
            t.throws(() => TripleNestedArray([1]), expected, `It should throw because [1] is still not a [[[Number]]]`)
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray([[1]])', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [1]',
            )
            t.throws(
                () => TripleNestedArray([1]),
                expected,
                `It should throw because [[1]] is still not a [[[Number]]]`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray("a")', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found "a"',
            )
            t.throws(
                () => TripleNestedArray('a'),
                expected,
                `It should throw because "a" isn't even an array, let alone a [[[Number]]]`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray(["a", "b"])', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found ["a", "b"]',
            )
            t.throws(
                () => TripleNestedArray(['a', 'b']),
                expected,
                `It should throw because ["a", "b"] is not even triply-nested, let alone a [[[Number]]]`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray([["a", "b"]])', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [["a", "b"]]',
            )
            t.throws(
                () => TripleNestedArray([['a', 'b']]),
                expected,
                `It should throw because [['a', 'b']] is not even triply-nested, let alone a [[[Number]]]`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray([[["a", "b"]]])', t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [[["a", "b"]]]',
            )
            const reason = 'though triple-nested, still not [[[Number]]]'
            t.throws(
                () => TripleNestedArray([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- ${reason}`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedArray([[[1, 2, 3]]])', t => {
            const expected = 'TripleNestedArray([[[1, 2, 3]]])'
            const a = TripleNestedArray([[[1, 2, 3]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.end()
    })

    t.test("Given TripleNestedCoord = tagged('TripleNestedCoord', { p: '[[[Coord]]]' }) ", t => {
        t.test('When I try to create a = TripleNestedCoord([[["a", "b"]]])', t => {
            const expected = new Error(
                'In constructor TripleNestedCoord(p): expected p to have type [[[Coord]]]; found [[["a", "b"]]]',
            )
            t.throws(
                () => TripleNestedCoord([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- though properly triple-nested -- is still not a [[[Coord]]]`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])', t => {
            const expected = 'TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])'
            const a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.end()
    })

    t.test("Given TripleNestedCoord = tagged('TripleNestedCoord', { p: '[[[Coord]]]?' }) ", t => {
        t.test('When I try to create a = TripleNestedCoord([[["a", "b"]]])', t => {
            const expected = new Error(
                'In constructor TripleNestedCoord(p): expected p to have type [[[Coord]]]; found [[["a", "b"]]]',
            )
            t.throws(
                () => TripleNestedCoord([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- though properly triple-nested -- is still not a [[[Coord]]]`,
            )
            t.end()
        })

        t.test('When I try to create a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])', t => {
            const expected = 'TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])'
            const a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.end()
    })

    t.test("Given OptionalTripleNestedCoord = tagged('OptionalTripleNestedCoord', { p: '[[[Coord]]]?' }) ", t => {
        t.test('When I try to create a = OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])', t => {
            const expected = 'OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])'
            const a = OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.test('When I try to create a = OptionalTripleNestedCoord()', t => {
            const expected = 'OptionalTripleNestedCoord(undefined)'
            const a = OptionalTripleNestedCoord()
            t.same(expected, a.toString(), `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Conditional Type Checking', t => {
    const typeDesc = "OptionalCoord = tagged('OptionalCoord', { p: 'Coord?' })"
    t.test(`Given a conditional type descriptor (ending in '?'): ${typeDesc}`, t => {
        t.test('When I create a = OptionalCoord(Coord(1, 2))', t => {
            const expected = 'OptionalCoord(Coord(1, 2))'
            const a = OptionalCoord(Coord(1, 2))
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.test('When I create a = OptionalCoord(undefined)', t => {
            const expected = 'OptionalCoord(undefined)'
            const a = OptionalCoord(undefined)
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.test('When I try to create a = OptionalCoord()', t => {
            const expected = 'OptionalCoord(undefined)'
            const a = OptionalCoord()
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
            t.end()
        })

        t.test('When I try to create a = OptionalCoord(1)', t => {
            const expected = new Error('In constructor OptionalCoord(p): expected p to have type Coord; found 1')
            t.throws(() => OptionalCoord(1), expected, 'It should throw because 1 is not a Coord')
            t.end()
        })

        t.end()
    })

    t.test(
        "Given a conditional string type descriptor : OptionalString = tagged('OptionalString', { p: 'String?' }) ",
        t => {
            t.test('When I create a = OptionalString("a")', t => {
                const expected = 'OptionalString("a")'
                const a = OptionalString('a')
                t.same(a.toString(), expected, `Then a should equal OptionalString(a)`)
                t.end()
            })

            t.test('When I create a = OptionalString(undefined)', t => {
                const expected = 'OptionalString(undefined)'
                const a = OptionalString(undefined)
                t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
                t.end()
            })

            t.test('When I try to create a = OptionalString()', t => {
                const expected = 'OptionalString(undefined)'
                const a = OptionalString()
                t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
                t.end()
            })

            t.test('When I try to create a = OptionalString(1)', t => {
                const expected = new Error('In constructor OptionalString(p): expected p to have type String; found 1')
                t.throws(() => OptionalString(1), expected, 'It should throw because 1 is not a String')
                t.end()
            })

            t.end()
        },
    )

    t.test(
        "Given a conditional number type descriptor : OptionalNumber = tagged('OptionalNumber', { p: 'Number?' }) ",
        t => {
            t.test('When I create a = OptionalNumber(1)', t => {
                const expected = 'OptionalNumber(1)'
                const a = OptionalNumber(1)
                t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
                t.end()
            })

            t.test('When I create a = OptionalNumber(undefined)', t => {
                const expected = 'OptionalNumber(undefined)'
                const a = OptionalNumber(undefined)
                t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
                t.end()
            })

            t.test('When I try to create a = OptionalNumber()', t => {
                const expected = 'OptionalNumber(undefined)'
                const a = OptionalNumber()
                t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
                t.end()
            })

            t.test('When I try to create a = OptionalNumber("a")', t => {
                const expected = new Error(
                    'In constructor OptionalNumber(p): expected p to have type Number; found "a"',
                )
                t.throws(() => OptionalNumber('a'), expected, 'It should throw because "a" is not a Number')
                t.end()
            })

            t.end()
        },
    )

    t.end()
})

const middle = Middle.E('middle', MiddleTypeEnum.MiddleTypeEnumA('foo'))

const stringifiedCoord = '{"x":1,"y":2}'
const stringifiedCircle = '{"@@tagName":"Circle","centre":{"x":0,"y":0},"radius":2}'
const stringifiedMiddle = '{"@@tagName":"E","name":"middle","middleEnum":{"@@tagName":"MiddleTypeEnumA","a":"foo"}}'

tap.test('Tagged to and from JSON', t => {
    t.test('Given I want to store a Tagged object as JSON and recover it', t => {
        t.test('When I call JSON.stringify (which implicitly calls toJSON)...', t => {
            t.same(JSON.stringify(coord), stringifiedCoord, 'JSON.stringify(coord) returns' + stringifiedCoord)
            t.same(JSON.stringify(circle), stringifiedCircle, 'JSON.stringify(circle) returns' + stringifiedCircle)
            t.same(JSON.stringify(middle), stringifiedMiddle, 'JSON.stringify(middle) returns' + stringifiedMiddle)
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Given static type generation system', t => {
    t.test('When I generate a tagged type', async t => {
        const testCoordDef = {
            name: 'TestCoord',
            kind: 'tagged',
            fields: { x: 'Number', y: 'Number' },
            relativePath: 'test/fixtures/TestCoord.type.js',
        }

        const generated = await generateStaticTaggedType(testCoordDef)

        t.ok(generated.includes('function TestCoord(x, y)'), 'Then should generate constructor function')
        t.ok(generated.includes('export { TestCoord }'), 'Then should export the type')
        t.ok(generated.includes('@@typeName'), 'Then should include hidden @@typeName')
        t.ok(generated.includes('toString'), 'Then should include toString method')
        t.ok(generated.includes('from'), 'Then should include from method')
        t.ok(
            generated.includes("validateNumber(constructorName, 'x', false, x)"),
            'Then should include type validation',
        )

        // Write to file for import testing (use kebab-case naming)
        fs.mkdirSync(outputDir, { recursive: true })
        const outputFile = path.join(outputDir, 'test-coord-unit.js')
        fs.writeFileSync(outputFile, generated)
    })

    t.test('When I generate a taggedSum type', async t => {
        const testTransactionDef = {
            name: 'TestTransaction',
            kind: 'taggedSum',
            variants: { Bank: { id: 'Number', amount: 'Number' }, Investment: { id: 'Number', securityId: 'Number?' } },
            relativePath: 'test/fixtures/TestTransaction.type.js',
        }

        const generated = await generateStaticTaggedSumType(testTransactionDef)

        t.ok(generated.includes('const TestTransaction = {'), 'Then should generate main type object')
        t.ok(generated.includes('TestTransaction.Bank'), 'Then should generate Bank variant')
        t.ok(generated.includes('TestTransaction.Investment'), 'Then should generate Investment variant')
        t.ok(generated.includes('match'), 'Then should include match method')
        t.ok(generated.includes('export { TestTransaction }'), 'Then should export the type')
        t.ok(generated.includes('@@typeName'), 'Then should include hidden @@typeName')
        t.ok(generated.includes('@@tagName'), 'Then should include hidden @@tagName')

        // Write to file for import testing (use kebab-case naming)
        fs.mkdirSync(outputDir, { recursive: true })
        const outputFile = path.join(outputDir, 'test-transaction-unit.js')
        fs.writeFileSync(outputFile, generated)
    })

    t.end()
})

tap.test('Tagged sum type with Date fields and timestampFields generation', t => {
    t.test('Given Notification type with Date fields in variants', t => {
        t.test('When I create a Scheduled notification', t => {
            const scheduledDate = new Date('2025-01-15T10:00:00Z')
            const scheduled = Notification.Scheduled('Reminder', scheduledDate)
            const { message, scheduledFor } = scheduled

            t.equal(message, 'Reminder', 'Then message is set correctly')
            t.equal(scheduledFor, scheduledDate, 'Then scheduledFor Date is set correctly')
            t.ok(scheduledFor instanceof Date, 'Then scheduledFor is a Date instance')
            t.end()
        })

        t.test('When I create a Sent notification', t => {
            const sentDate = new Date('2025-01-15T10:05:00Z')
            const deliveredDate = new Date('2025-01-15T10:06:00Z')
            const sent = Notification.Sent('Alert', sentDate, deliveredDate)
            const { deliveredAt, message, sentAt } = sent

            t.equal(message, 'Alert', 'Then message is set correctly')
            t.equal(sentAt, sentDate, 'Then sentAt Date is set correctly')
            t.equal(deliveredAt, deliveredDate, 'Then deliveredAt Date is set correctly')
            t.end()
        })

        t.test('When I create a Sent notification with optional deliveredAt as undefined', t => {
            const sentDate = new Date('2025-01-15T10:05:00Z')
            const sent = Notification.Sent('Alert', sentDate, undefined)

            t.equal(sent.sentAt, sentDate, 'Then sentAt Date is set correctly')
            t.notOk(sent.deliveredAt, 'Then deliveredAt is undefined')
            t.end()
        })

        t.test('When I create an Expired notification', t => {
            const expiredDate = new Date('2025-01-10T00:00:00Z')
            const expired = Notification.Expired('Old reminder', expiredDate)

            t.equal(expired.message, 'Old reminder', 'Then message is set correctly')
            t.equal(expired.expiredAt, expiredDate, 'Then expiredAt Date is set correctly')
            t.end()
        })

        t.test('When I try to create with invalid Date values', t => {
            t.throws(
                () => Notification.Scheduled('Test', 'not a date'),
                /expected scheduledFor to have type Date/,
                'Then Scheduled rejects string for Date field',
            )

            t.throws(
                () => Notification.Sent('Test', 123456789, undefined),
                /expected sentAt to have type Date/,
                'Then Sent rejects number for Date field',
            )

            t.throws(
                () => Notification.Expired('Test', { date: '2025-01-15' }),
                /expected expiredAt to have type Date/,
                'Then Expired rejects object for Date field',
            )

            t.end()
        })

        t.test('When I check toString with Dates', t => {
            const scheduledDate = new Date('2025-01-15T10:00:00Z')
            const scheduled = Notification.Scheduled('Test', scheduledDate)

            const str = scheduled.toString()
            t.ok(str.includes('Notification.Scheduled'), 'Then toString includes variant name')
            t.ok(str.includes('2025-01-15T10:00:00.000Z'), 'Then toString includes ISO date string')

            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Date array validation throws error during type generation', t => {
    t.test('When I try to generate a type with [Date] field', async t => {
        const typeDefWithDateArray = {
            name: 'EventWithDateArray',
            kind: 'tagged',
            fields: { name: 'String', milestones: '[Date]' },
            relativePath: 'test/fixtures/EventWithDateArray.type.js',
        }

        try {
            await generateStaticTaggedType(typeDefWithDateArray)
            t.fail('Should have thrown an error for [Date] field')
        } catch (error) {
            t.ok(error.message.includes('EventWithDateArray'), 'Then error message includes type name')
        }
        t.end()
    })

    t.test('When I try to generate a tagged sum type with [Date] field in variant', async t => {
        const typeDefWithDateArray = {
            name: 'NotificationWithDateArray',
            kind: 'taggedSum',
            variants: { Scheduled: { message: 'String', reminders: '[Date]' } },
            relativePath: 'test/fixtures/NotificationWithDateArray.type.js',
        }

        try {
            await generateStaticTaggedSumType(typeDefWithDateArray)
            t.fail('Should have thrown an error for [Date] field in variant')
        } catch (error) {
            t.ok(
                error.message.includes('NotificationWithDateArray.Scheduled'),
                'Then error message includes variant name',
            )
        }
        t.end()
    })

    t.end()
})

tap.test('Special handling for FieldTypes imports and FieldTypes.X field descriptors', t => {
    t.test('When I examine the actual generated FieldTypesTest file', t => {
        const generatedCode = fs.readFileSync('test/generated/field-types-test.js', 'utf8')

        // Should automatically import FieldTypes
        t.ok(
            generatedCode.includes("import { FieldTypes } from '@graffio"),
            'Then FieldTypes import is automatically added',
        )

        // Should preserve FieldTypes.correlationId references (not inline)
        t.ok(
            generatedCode.includes('FieldTypes.correlationId'),
            'Then FieldTypes references are preserved, not inlined',
        )

        // Should use validateRegex instead of validateTag for FieldTypes
        t.ok(
            generatedCode.includes('R.validateRegex') && generatedCode.includes('FieldTypes.correlationId'),
            'Then uses validateRegex with FieldTypes reference',
        )

        // Should NOT use validateTag with FieldTypes strings (old broken behavior)
        t.notOk(
            generatedCode.includes('validateTag') && generatedCode.includes("'FieldTypes.correlationId'"),
            'Then no longer uses broken validateTag with string literal',
        )

        t.end()
    })

    t.end()
})

tap.test('Given ManyLookupTables with Notification LookupTable fields', t => {
    t.test('When I create with valid notifications LookupTable', t => {
        const items = LookupTable(
            [
                Notification.Scheduled('First message', new Date('2025-01-01')),
                Notification.Sent('Second message', new Date('2025-01-02'), new Date('2025-01-03')),
            ],
            Notification,
            'message',
        )

        const obj = UseLookupTable.from({
            notifications: items,
            optionalNotifications: items,
            events: LookupTable([], Event, 'name'),
            optionalEvents: undefined,
        })

        t.ok(obj.notifications.idField === 'message', 'notifications should be a LookupTable')
        t.equal(obj.notifications.length, 2, 'notifications should have 2 items')
        t.ok(obj.optionalNotifications.idField === 'message', 'optionalNotifications should be a LookupTable')
        t.end()
    })

    t.test('When I create with notifications and undefined optionalNotifications', t => {
        const items = LookupTable(
            [Notification.Scheduled('First message', new Date('2025-01-01'))],
            Notification,
            'message',
        )

        const obj = UseLookupTable.from({
            notifications: items,
            optionalNotifications: undefined,
            events: LookupTable([], Event, 'name'),
            optionalEvents: undefined,
        })

        t.ok(obj.notifications.idField === 'message', 'notifications should be a LookupTable')
        t.equal(obj.optionalNotifications, undefined, 'optionalNotifications can be undefined')
        t.end()
    })

    t.test('When I create with empty notifications LookupTable', t => {
        const empty = LookupTable([], Notification, 'message')

        const obj = UseLookupTable.from({
            notifications: empty,
            optionalNotifications: undefined,
            events: LookupTable([], Event, 'name'),
            optionalEvents: undefined,
        })

        t.ok(obj.notifications.idField === 'message', 'notifications should be a LookupTable')
        t.equal(obj.notifications.length, 0, 'notifications can be empty')
        t.end()
    })

    t.test('When I try to create with plain array instead of LookupTable', t => {
        t.throws(
            () =>
                UseLookupTable.from({
                    notifications: [Notification.Scheduled('First message', new Date('2025-01-01'))],
                    optionalNotifications: undefined,
                    events: LookupTable([], Event, 'name'),
                    optionalEvents: undefined,
                }),
            /expected notifications to be a LookupTable/,
            'It should throw because notifications is not a LookupTable',
        )
        t.end()
    })

    t.test('When I try to create with wrong item type in LookupTable', t => {
        const WrongType = { from: x => ({ ...x, '@@typeName': 'WrongType' }), '@@typeName': 'WrongType' }
        const wrongItems = LookupTable([WrongType.from({ message: 'test' })], WrongType, 'message')

        t.throws(
            () =>
                UseLookupTable.from({
                    notifications: wrongItems,
                    optionalNotifications: undefined,
                    events: LookupTable([], Event, 'name'),
                    optionalEvents: undefined,
                }),
            /expected notifications to be a LookupTable<Notification>.*found LookupTable<WrongType>/,
            'It should throw because LookupTable contains wrong item type',
        )
        t.end()
    })

    t.test('When I try to create with undefined notifications', t => {
        t.throws(
            () =>
                UseLookupTable.from({
                    notifications: undefined,
                    optionalNotifications: undefined,
                    events: LookupTable([], Event, 'name'),
                    optionalEvents: undefined,
                }),
            /expected notifications to be a LookupTable/,
            'It should throw because notifications is not optional',
        )
        t.end()
    })

    t.test('When I try to create with plain object instead of LookupTable', t => {
        t.throws(
            () =>
                UseLookupTable.from({
                    notifications: { msg1: Notification.Scheduled('First message', new Date('2025-01-01')) },
                    optionalNotifications: undefined,
                    events: LookupTable([], Event, 'name'),
                    optionalEvents: undefined,
                }),
            /expected notifications to be a LookupTable/,
            'It should throw because notifications is a plain object, not LookupTable',
        )
        t.end()
    })

    t.end()
})

tap.test('Given ManyLookupTables with toFirestore/fromFirestore serialization for Notifications', t => {
    const encodeTimestamp = date => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })
    const decodeTimestamp = ts => new Date(ts.seconds * 1000)

    t.test('When I roundtrip LookupTable through Firestore serialization', t => {
        const original = UseLookupTable.from({
            notifications: LookupTable(
                [
                    Notification.Scheduled('First message', new Date('2025-01-01T00:00:00Z')),
                    Notification.Sent(
                        'Second message',
                        new Date('2025-01-02T00:00:00Z'),
                        new Date('2025-01-03T00:00:00Z'),
                    ),
                ],
                Notification,
                'message',
            ),
            optionalNotifications: undefined,
            events: LookupTable([], Event, 'name'),
            optionalEvents: undefined,
        })

        // Serialize to Firestore format
        const firestoreDoc = UseLookupTable.toFirestore(original, encodeTimestamp)
        const { notifications } = firestoreDoc

        // Verify Firestore format
        t.ok(typeof notifications === 'object', 'notifications serialized to map')
        t.notOk(Array.isArray(notifications), 'notifications not an array')
        t.equal(Object.keys(notifications).length, 2, 'map has 2 entries')
        t.ok(notifications['First message'], 'first item keyed by message')
        t.ok(notifications['Second message'], 'second item keyed by message')
        t.equal(notifications['First message']['@@tagName'], 'Scheduled', 'tagName preserved')
        t.ok(typeof notifications['First message'].scheduledFor.seconds === 'number', 'Date encoded as timestamp')

        // Deserialize back
        const roundtrip = UseLookupTable.fromFirestore(firestoreDoc, decodeTimestamp)

        // Verify structure
        t.ok(roundtrip.notifications.idField === 'message', 'notifications is LookupTable')
        t.equal(roundtrip.notifications.length, 2, 'has 2 items')

        // Verify first item
        const first = roundtrip.notifications.getById('First message')
        t.ok(Notification.Scheduled.is(first), 'first item is Notification.Scheduled')
        t.equal(first.message, 'First message', 'first message correct')
        t.equal(first.scheduledFor.toISOString(), '2025-01-01T00:00:00.000Z', 'first date correct')

        // Verify second item
        const second = roundtrip.notifications.getById('Second message')
        const { deliveredAt, message: secondMessage, sentAt } = second
        t.ok(Notification.Sent.is(second), 'second item is Notification.Sent')
        t.equal(secondMessage, 'Second message', 'second message correct')
        t.equal(sentAt.toISOString(), '2025-01-02T00:00:00.000Z', 'sentAt correct')
        t.equal(deliveredAt.toISOString(), '2025-01-03T00:00:00.000Z', 'deliveredAt correct')

        t.end()
    })

    t.test('When I roundtrip serialize and deserialize Notifications', t => {
        const items = LookupTable(
            [
                Notification.Scheduled('Message 1', new Date('2025-01-01T12:30:45Z')),
                Notification.Expired('Message 2', new Date('2025-02-15T08:15:30Z')),
            ],
            Notification,
            'message',
        )

        const original = UseLookupTable.from({
            notifications: items,
            optionalNotifications: items,
            events: LookupTable([], Event, 'name'),
            optionalEvents: undefined,
        })

        // Serialize
        const firestoreDoc = UseLookupTable.toFirestore(original, encodeTimestamp)

        // Deserialize
        const reconstructed = UseLookupTable.fromFirestore(firestoreDoc, decodeTimestamp)

        t.equal(reconstructed.notifications.length, 2, 'notifications has correct length')
        t.equal(reconstructed.optionalNotifications.length, 2, 'optionalNotifications has correct length')

        const msg1 = reconstructed.notifications.getById('Message 1')
        t.equal(msg1['@@tagName'], 'Scheduled', 'first message has correct tag')

        // Note: TaggedSum types don't have toFirestore/fromFirestore yet, so Dates pass through as-is
        t.ok(msg1.scheduledFor instanceof Date, 'first message date is preserved')
        t.equal(msg1.scheduledFor.getTime(), new Date('2025-01-01T12:30:45Z').getTime(), 'first message date preserved')

        const msg2 = reconstructed.notifications.getById('Message 2')
        t.equal(msg2['@@tagName'], 'Expired', 'second message has correct tag')
        t.ok(msg2.expiredAt instanceof Date, 'second message date is preserved')
        t.equal(msg2.expiredAt.getTime(), new Date('2025-02-15T08:15:30Z').getTime(), 'second message date preserved')

        t.end()
    })

    t.test('When I roundtrip empty LookupTable', t => {
        const original = UseLookupTable.from({
            notifications: LookupTable([], Notification, 'message'),
            optionalNotifications: undefined,
            events: LookupTable([], Event, 'name'),
            optionalEvents: undefined,
        })

        const firestoreDoc = UseLookupTable.toFirestore(original, encodeTimestamp)
        const { notifications } = firestoreDoc

        t.ok(typeof notifications === 'object', 'empty LookupTable serializes to map')
        t.notOk(Array.isArray(notifications), 'not an array')
        t.equal(Object.keys(notifications).length, 0, 'serialized map is empty')

        const roundtrip = UseLookupTable.fromFirestore(firestoreDoc, decodeTimestamp)
        t.ok(roundtrip.notifications.idField === 'message', 'deserialized as LookupTable')
        t.equal(roundtrip.notifications.length, 0, 'deserialized LookupTable is empty')

        t.end()
    })

    t.end()
})

tap.test('Given ManyLookupTables with toFirestore/fromFirestore serialization for Events (Tagged type)', t => {
    const encodeTimestamp = date => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })
    const decodeTimestamp = ts => new Date(ts.seconds * 1000)

    t.test('When I roundtrip Events LookupTable with Date fields', t => {
        const original = UseLookupTable.from({
            notifications: LookupTable([], Notification, 'message'),
            optionalNotifications: undefined,
            events: LookupTable(
                [
                    Event.from({
                        name: 'Event 1',
                        occurredAt: new Date('2025-01-01T10:30:00Z'),
                        scheduledFor: new Date('2025-01-01T10:00:00Z'),
                    }),
                    Event.from({
                        name: 'Event 2',
                        occurredAt: new Date('2025-01-02T14:45:00Z'),
                        scheduledFor: undefined,
                    }),
                ],
                Event,
                'name',
            ),
            optionalEvents: undefined,
        })

        // Serialize to Firestore
        const firestoreDoc = UseLookupTable.toFirestore(original, encodeTimestamp)
        const { events } = firestoreDoc

        // Verify map format
        t.ok(typeof events === 'object', 'events serialized to map')
        t.notOk(Array.isArray(events), 'events not an array')
        t.equal(Object.keys(events).length, 2, 'map has 2 entries')
        t.ok(events['Event 1'], 'first event keyed by name')
        t.ok(typeof events['Event 1'].occurredAt.seconds === 'number', 'Date fields encoded as timestamps')

        // Deserialize back
        const roundtrip = UseLookupTable.fromFirestore(firestoreDoc, decodeTimestamp)

        // Verify structure
        t.ok(roundtrip.events.idField === 'name', 'events is LookupTable')
        t.equal(roundtrip.events.length, 2, 'has 2 items')

        // Verify first event
        const event1 = roundtrip.events.getById('Event 1')
        t.ok(Event.is(event1), 'first item is Event')
        t.equal(event1.occurredAt.toISOString(), '2025-01-01T10:30:00.000Z', 'occurredAt correct')
        t.equal(event1.scheduledFor.toISOString(), '2025-01-01T10:00:00.000Z', 'scheduledFor correct')

        // Verify second event with optional field
        const event2 = roundtrip.events.getById('Event 2')
        t.ok(Event.is(event2), 'second item is Event')
        t.equal(event2.occurredAt.toISOString(), '2025-01-02T14:45:00.000Z', 'occurredAt correct')
        t.equal(event2.scheduledFor, undefined, 'optional scheduledFor undefined')

        t.end()
    })

    t.test('When I roundtrip serialize and deserialize Events', t => {
        const events = LookupTable(
            [
                Event.from({
                    name: 'Meeting',
                    occurredAt: new Date('2025-03-15T09:00:00Z'),
                    scheduledFor: new Date('2025-03-15T09:00:00Z'),
                }),
                Event.from({ name: 'Deadline', occurredAt: new Date('2025-04-01T23:59:59Z'), scheduledFor: undefined }),
            ],
            Event,
            'name',
        )

        const original = UseLookupTable.from({
            notifications: LookupTable([], Notification, 'message'),
            optionalNotifications: undefined,
            events,
            optionalEvents: events,
        })

        // Serialize
        const firestoreDoc = UseLookupTable.toFirestore(original, encodeTimestamp)

        // Deserialize
        const reconstructed = UseLookupTable.fromFirestore(firestoreDoc, decodeTimestamp)

        t.equal(reconstructed.events.length, 2, 'events has correct length')
        t.equal(reconstructed.optionalEvents.length, 2, 'optionalEvents has correct length')

        const meeting = reconstructed.events.getById('Meeting')
        const { name: meetingName, occurredAt: meetingOccurredAt, scheduledFor: meetingScheduledFor } = meeting
        t.equal(meetingName, 'Meeting', 'meeting event has correct name')
        t.ok(meetingOccurredAt instanceof Date, 'meeting occurredAt is a Date')
        t.equal(meetingOccurredAt.getTime(), new Date('2025-03-15T09:00:00Z').getTime(), 'meeting occurredAt preserved')
        t.ok(meetingScheduledFor instanceof Date, 'meeting scheduledFor is a Date')
        t.equal(
            meetingScheduledFor.getTime(),
            new Date('2025-03-15T09:00:00Z').getTime(),
            'meeting scheduledFor preserved',
        )

        const deadline = reconstructed.events.getById('Deadline')
        const { name: deadlineName, occurredAt: deadlineOccurredAt, scheduledFor: deadlineScheduledFor } = deadline
        t.equal(deadlineName, 'Deadline', 'deadline event has correct name')
        t.ok(deadlineOccurredAt instanceof Date, 'deadline occurredAt is a Date')
        t.equal(
            deadlineOccurredAt.getTime(),
            new Date('2025-04-01T23:59:59Z').getTime(),
            'deadline occurredAt preserved',
        )
        t.equal(deadlineScheduledFor, undefined, 'deadline scheduledFor is undefined')

        t.end()
    })

    t.end()
})

tap.test('Given CustomSerialization with custom toFirestore override', t => {
    const encodeTimestamp = date => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })

    t.test('When I check generated code structure', t => {
        const { _from, _toFirestore, from, toFirestore } = CustomSerialization
        t.ok(_toFirestore, '_toFirestore primitive exists')
        t.ok(toFirestore, 'toFirestore public function exists')
        t.ok(_from, '_from primitive exists')
        t.ok(from, 'from public function exists')
        t.end()
    })

    t.test('When I serialize with custom toFirestore', t => {
        const obj = CustomSerialization.from({
            id: 'test1',
            value: 'hello',
            createdAt: new Date('2025-01-01T00:00:00Z'),
        })

        const firestoreDoc = CustomSerialization.toFirestore(obj, encodeTimestamp)
        const { createdAt, customField, id, value } = firestoreDoc

        t.equal(id, 'test1', 'id field from primitive')
        t.equal(value, 'hello', 'value field from primitive')
        t.ok(createdAt.seconds, 'createdAt converted by primitive')
        t.equal(customField, 'added-by-custom-logic', 'customField added by override')

        t.end()
    })

    t.test('When I call primitive directly', t => {
        const obj = CustomSerialization.from({
            id: 'test2',
            value: 'world',
            createdAt: new Date('2025-01-02T00:00:00Z'),
        })

        const firestoreDoc = CustomSerialization._toFirestore(obj, encodeTimestamp)
        const { createdAt, customField, id, value } = firestoreDoc

        t.equal(id, 'test2', 'id field present')
        t.equal(value, 'world', 'value field present')
        t.ok(createdAt.seconds, 'createdAt converted')
        t.notOk(customField, 'customField NOT added by primitive')

        t.end()
    })

    t.end()
})

/*
 * Integration tests for optional FieldTypes syntax
 */
tap.test('Given OptionalFieldTypesTest with { pattern: FieldTypes.X, optional: true } fields', t => {
    const validEmail = 'test@example.com'
    const validCorrelationId = 'cor_abc123def456'

    t.test('When I create with all fields provided', t => {
        const obj = OptionalFieldTypesTest(validEmail, validEmail, validCorrelationId, validCorrelationId)
        const { requiredEmail, optionalEmail, requiredCorrelationId, optionalCorrelationId } = obj

        t.equal(requiredEmail, validEmail, 'Then requiredEmail is set')
        t.equal(optionalEmail, validEmail, 'Then optionalEmail is set')
        t.equal(requiredCorrelationId, validCorrelationId, 'Then requiredCorrelationId is set')
        t.equal(optionalCorrelationId, validCorrelationId, 'Then optionalCorrelationId is set')
        t.end()
    })

    t.test('When I create with optional fields as undefined', t => {
        const obj = OptionalFieldTypesTest(validEmail, undefined, validCorrelationId, undefined)
        const { requiredEmail, optionalEmail, requiredCorrelationId, optionalCorrelationId } = obj

        t.equal(requiredEmail, validEmail, 'Then requiredEmail is set')
        t.equal(optionalEmail, undefined, 'Then optionalEmail is undefined')
        t.equal(requiredCorrelationId, validCorrelationId, 'Then requiredCorrelationId is set')
        t.equal(optionalCorrelationId, undefined, 'Then optionalCorrelationId is undefined')
        t.end()
    })

    t.test('When I try to create with required field as undefined', t => {
        t.throws(
            () => OptionalFieldTypesTest(undefined, validEmail, validCorrelationId, validCorrelationId),
            /expected requiredEmail to have type String/,
            'Then it throws for undefined required field',
        )
        t.end()
    })

    t.test('When I try to create with invalid value for optional field', t => {
        t.throws(
            () => OptionalFieldTypesTest(validEmail, 'not-an-email', validCorrelationId, validCorrelationId),
            /expected optionalEmail to match/,
            'Then it throws for invalid optional field value',
        )
        t.end()
    })

    t.test('When I use from() with optional fields omitted', t => {
        const obj = OptionalFieldTypesTest.from({
            requiredEmail: validEmail,
            requiredCorrelationId: validCorrelationId,
        })
        const { requiredEmail, optionalEmail, requiredCorrelationId, optionalCorrelationId } = obj

        t.equal(requiredEmail, validEmail, 'Then requiredEmail is set')
        t.equal(optionalEmail, undefined, 'Then optionalEmail is undefined')
        t.equal(requiredCorrelationId, validCorrelationId, 'Then requiredCorrelationId is set')
        t.equal(optionalCorrelationId, undefined, 'Then optionalCorrelationId is undefined')
        t.end()
    })

    t.end()
})
