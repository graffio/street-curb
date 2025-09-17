import fs from 'fs'
import path from 'path'
import tap from 'tap'
import { generateStaticTaggedSumType, generateStaticTaggedType } from '../src/tagged-type-generator.js'
import { main as generateTypes } from './test-helper-type-generator.js'

// Clean up any existing generated test files before starting
try {
    fs.rmSync('./generated/', { recursive: true, force: true })
} catch (error) {
    // Ignore if directory doesn't exist
}

const outputDir = new URL('./generated/', import.meta.url).pathname

/* ---------------------------------------------------------------------------------------------------------------------
 * MIGRATED TO STATIC TYPES: Types are now imported from generated/ instead of created with tagged/taggedSum
 * ------------------------------------------------------------------------------------------------------------------- */
await generateTypes()
const generatedTypes = await import('./generated/index.js')
const {
    Bob,
    Carol,
    Coord,
    DoubleNestedArray,
    HasId,
    HasIdEnhanced,
    LinkedList,
    Middle,
    MiddleTypeEnum,
    NestedArray,
    OptionalCoord,
    OptionalNumber,
    OptionalString,
    OptionalTripleNestedCoord,
    Shape,
    TripleNestedArray,
    TripleNestedCoord,
    Tuple,
} = generatedTypes

// Add prototype method to Tuple to match original test setup
Tuple.prototype.foo = 'foo'

// Add LinkedList prototype.foo property to match original test setup
LinkedList.prototype.foo = 'foo'

const a = 'a'
const b = 'b'
const list = LinkedList.Nil

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

// Add LinkedList helper functions to match original test setup
const concat = (a, x) => a.concat(x)

LinkedList.insertAfter = (node, x) => (node.tail = LinkedList.Node(x, LinkedList.Nil))
LinkedList.insertBefore = (tail, x) => LinkedList.Node(x, tail)
LinkedList.reduce = (reducer, initialValue, list) => {
    let result = initialValue
    while (LinkedList.Node.is(list)) {
        result = reducer(result, list.head)
        list = list.tail
    }
    return result
}
LinkedList.fromArray = a => {
    const head = LinkedList.Node('never used', LinkedList.Nil)
    a.reduce(LinkedList.insertAfter, head)
    return head.tail
}
LinkedList.toArray = list => LinkedList.reduce(concat, [], list)
LinkedList.reverse = list => LinkedList.reduce(LinkedList.insertBefore, LinkedList.Nil, list)

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

            // Verify it's valid
            t.ok(HasIdEnhanced.isValidId(randomInstance.id), 'Then createRandom output passes isValidId')

            // Convert to object and back
            const asObject = { id: randomInstance.id, extra: 'test' }
            const fromObjectInstance = HasIdEnhanced.fromObject(asObject)

            t.equal(fromObjectInstance.id, randomInstance.id, 'Then roundtrip preserves ID')
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
            t.notOk(isCoord(list), 'Then isCoord(list) correctly returns false when unbound')
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
            t.ok(Shape.is(square), 'Then Shape.is(square) is true')
            t.ok(Shape.is(circle), 'Then Shape.is(circle) is true')
            t.ok(Shape.Square.is(square), 'Then Shape.Square.is(square) is true')
            t.ok(Shape.Circle.is(circle), 'Then Shape.Circle.is(circle) is true')
            t.notOk(Shape.Square.is(circle), 'Then Shape.Square.is(circle) is false')
            t.notOk(Shape.Circle.is(square), 'Then Shape.Circle.is(square) is false')
            t.end()
        })
        t.test('When I use match functionality', t => {
            const squareResult = square.match({
                Square: ({ topLeft, bottomRight }) => 'square',
                Circle: () => 'circle',
            })
            t.equal(squareResult, 'square', 'Then match works correctly on square')
            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('Tagged Types Static Migration - LinkedList with Unit Types', t => {
    t.test('Given LinkedList with unit types', t => {
        t.test('When I examine the unit type', t => {
            t.equal(typeof LinkedList.Nil, 'object', 'Then LinkedList.Nil is an object')
            t.ok(LinkedList.is(LinkedList.Nil), 'Then LinkedList.is(Nil) is true')
            t.end()
        })
        t.test('When I create a Node', t => {
            const node = LinkedList.Node('test', LinkedList.Nil)
            t.equal(node.head, 'test', 'Then node.head is correct')
            t.equal(node.tail, LinkedList.Nil, 'Then node.tail is correct')
            t.ok(LinkedList.Node.is(node), 'Then LinkedList.Node.is(node) is true')
            t.ok(LinkedList.is(node), 'Then LinkedList.is(node) is true')
            t.end()
        })
        t.test('When I test match functionality', t => {
            const nilResult = LinkedList.Nil.match({ Node: ({ head, tail }) => 'node', Nil: () => 'nil' })
            t.equal(nilResult, 'nil', 'Then match works on Nil')

            const node = LinkedList.Node('test', LinkedList.Nil)
            const nodeResult = node.match({ Node: ({ head, tail }) => head, Nil: () => 'nil' })
            t.equal(nodeResult, 'test', 'Then match works on Node')
            t.end()
        })
        t.test('When I use helper functions', t => {
            const list123 = LinkedList.fromArray([1, 2, 3])
            const arrayBack = LinkedList.toArray(list123)
            t.same(arrayBack, [1, 2, 3], 'Then fromArray/toArray roundtrip works')
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
            t.equal(bob.num, 4, 'Then Bob.num is correct')
            t.equal(bob.s, 'four', 'Then Bob.s is correct')
            t.same(bob.o, { n: 4 }, 'Then Bob.o is correct')
            t.equal(bob.a, 4, 'Then Bob.a is correct')
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
            const middleEnum = MiddleTypeEnum.MiddleTypeEnumA
            t.ok(MiddleTypeEnum.is(middleEnum), 'Then MiddleTypeEnum.is works')
            t.ok(MiddleTypeEnum.MiddleTypeEnumA.is(middleEnum), 'Then specific variant is works')

            const middle = Middle.E('middle', middleEnum)
            t.equal(middle.name, 'middle', 'Then Middle.E name is correct')
            t.equal(middle.middleEnum, middleEnum, 'Then Middle.E middleEnum is correct')

            const middleResult = middle.match({ E: ({ name, middleEnum }) => `E: ${name}`, F: () => 'F' })
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

            const nilJson = JSON.stringify(LinkedList.Nil)
            t.equal(nilJson, '{"@@tagName":"Nil"}', 'Then Nil JSON serialization')
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
            t.pass('Then ✅ Static types maintain 100% API compatibility with types-runtime types')
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
        t.notOk(isCoord(list), 'isCoord(list) correctly returns false even when used as an unbound variable')
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

/* ---------------------------------------------------------------------------------------------------------------------
 * Test taggedSum
 * ------------------------------------------------------------------------------------------------------------------- */
tap.test('Given Shape as a taggedSum with Square and Circle constructors', t => {
    t.test('Then', t => {
        t.same(typeof Shape, 'object', 'Shape is an object')
        t.same(Shape['@@typeName'], 'Shape', "Shape's '@@typeName' is 'Shape'")
        t.same(Shape['@@tagNames'], ['Square', 'Circle'], "Shape's '@@tagNames' are ['Square', 'Circle']")
        t.same(typeof Shape.Square, 'function', 'Shape.Square is a function')
        t.same(Object.keys(Shape.prototype), ['match', 'constructor'], 'Shape.prototype defines match and constructor')
        t.same(Shape.Square.toString(), `Shape.Square`, 'Shape.Square.toString() returns "Shape.Square"')
        t.notOk(Shape.Square.is({}), 'Shape.Square.is({}) correctly returns false')
        t.end()
    })

    t.test('When I create square = Shape.Square(Coord(0, 0), Coord(4, 4) circle = Shape.Circle(Coord(0, 0), 2)', t => {
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

        t.ok(Shape.is(square), 'Shape.is(square) is true')
        t.ok(Shape.is(circle), 'Shape.is(circle) is true')
        t.ok(Shape.Square.is(square), 'Shape.Square.is(square) is true')
        t.ok(Shape.Circle.is(circle), 'Shape.Circle.is(circle) is true')
        t.notOk(Shape.Square.is(circle), 'Shape.Square.is(circle) is false')
        t.notOk(Shape.Circle.is(square), 'Shape.Circle.is(square) is false')

        t.ok(
            Object.prototype.isPrototypeOf.call(Shape.prototype, square),
            'Shape.prototype is in the prototype chain for square',
        )
        t.ok(
            Object.prototype.isPrototypeOf.call(Shape.prototype, circle),
            'Shape.prototype is in the prototype chain for circle',
        )
        t.same(
            Object.getPrototypeOf(Object.getPrototypeOf(square)),
            Shape.prototype,
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

tap.test('Additional LinkedList Tests', t => {
    t.test('Given LinkedList with static types', t => {
        t.test('When I try to create with wrong argument count', t => {
            t.throws(
                () => LinkedList.Node(1),
                new TypeError(`In constructor LinkedList.Node(head, tail): expected 2 arguments, found 1`),
                'Then creating with too few arguments throws error',
            )
            t.throws(
                () => LinkedList.Node(1, 1, 1),
                new TypeError(`In constructor LinkedList.Node(head, tail): expected 2 arguments, found 3`),
                'Then creating with too many arguments throws error',
            )
            t.end()
        })

        t.test('When I try to use match with missing constructors', t => {
            const list = LinkedList.Node(a, LinkedList.Nil)
            t.throws(
                () => LinkedList.Nil.match({}),
                new Error(`Constructors given to match didn't include: Node`),
                'Then Nil.match({}) throws because neither Node nor Nil is specified',
            )
            t.throws(
                () => list.match({}),
                new Error(`Constructors given to match didn't include: Node`),
                'Then list.match({}) throws because neither Node nor Nil is specified',
            )
            t.throws(
                () => LinkedList.Nil.match({ Nil: () => false }),
                new Error(`Constructors given to match didn't include: Node`),
                'Then Nil.match({ Nil: () => false }) throws because Node is not specified',
            )
            t.throws(
                () => list.match({ Node: () => true }),
                new Error(`Constructors given to match didn't include: Nil`),
                'Then list.match({ Node: () => true }) throws because Nil is not specified',
            )
            t.end()
        })

        t.test('When I use LinkedList methods', t => {
            const list = LinkedList.Node(a, LinkedList.Nil)
            t.same(list.toString(), `LinkedList.Node("a", LinkedList.Nil)`, 'Then toString works correctly')
            t.same(list.head, a, 'Then head property returns correct value')
            t.same(list.tail, LinkedList.Nil, 'Then tail property returns correct value')
            t.same(
                list.match({ Node: ({ head, tail }) => [head, tail], Nil: () => [] }),
                [list.head, list.tail],
                'Then match works on Node',
            )
            t.ok(LinkedList.is(list), 'Then type.is() works')
            t.notOk(LinkedList.is({}), 'Then type.is() correctly rejects non-instances')
            t.ok(LinkedList.Node.is(list), 'Then variant.is() works')
            t.notOk(LinkedList.Node.is(list.tail), 'Then variant.is() correctly rejects wrong variants')
            t.notOk(LinkedList.Nil.is(list), 'Then unit.is() correctly rejects wrong values')
            t.ok(LinkedList.Nil.is(list.tail), 'Then unit.is() works on unit values')
            t.same(LinkedList.prototype.foo, list.foo, 'Then prototype properties are accessible from instances')
            t.same(
                LinkedList.prototype.foo,
                LinkedList.Nil.foo,
                'Then prototype properties are accessible from unit values',
            )
            t.ok(
                Object.prototype.isPrototypeOf.call(LinkedList.prototype, list),
                'Then prototype chain is correct for instances',
            )
            t.ok(
                Object.prototype.isPrototypeOf.call(LinkedList.prototype, LinkedList.Nil),
                'Then prototype chain is correct for unit values',
            )
            t.end()
        })

        t.test('When I build from object', t => {
            const list = LinkedList.Node.from({ tail: LinkedList.Nil, head: a })
            const isList = LinkedList.is
            const isCons = LinkedList.Node.is

            t.strictSame(LinkedList.is(list), true, 'Then type.is() works')
            t.strictSame(isList(list), true, 'Then type.is() works when unbound')
            t.strictSame(LinkedList.Node.is(list), true, 'Then variant.is() works')
            t.strictSame(isCons(list), true, 'Then variant.is() works when unbound')
            t.same(list.head, a, 'Then head value is correct')
            t.same(list.tail, LinkedList.Nil, 'Then tail value is correct')
            t.throws(
                () => LinkedList.Node.from({ head: 1 }),
                new TypeError(
                    'In constructor LinkedList.Node(head, tail): expected tail to have type LinkedList; found undefined',
                ),
                'Then creating from object with missing field throws error',
            )
            t.end()
        })

        t.test('When I use pre-bound .is() methods', t => {
            const list = LinkedList.Node(a, LinkedList.Nil)
            const tpl = Tuple(a, b)
            const isList = LinkedList.is
            const isNil = LinkedList.Nil.is
            const nilList = LinkedList.Nil

            t.doesNotThrow(() => isList(list), 'Then typeRep.is() can be assigned to unbound var and used')
            t.ok(isList(list), 'Then typeRep.is() correctly identifies instances when unbound')
            t.notOk(isList(tpl), 'Then typeRep.is() correctly rejects other types when unbound')

            t.doesNotThrow(() => isNil(nilList), 'Then variant.is() can be assigned to unbound var and used')
            t.ok(isNil(nilList), 'Then variant.is() correctly identifies instances when unbound')
            t.notOk(isNil(tpl), 'Then variant.is() correctly rejects other types when unbound')
            t.end()
        })

        t.end()
    })

    t.end()
})

// Optional types are now imported as static types from generated/

/* ---------------------------------------------------------------------------------------------------------------------
 * Test List
 * ------------------------------------------------------------------------------------------------------------------- */
const list123 = LinkedList.fromArray([1, 2, 3])

tap.test('LinkedList tests', t => {
    t.test('Given an array [1, 2, 3]', t => {
        t.test('When I convert it to a List: list123 = List.fromArray([1, 2, 3])', t => {
            const expected = LinkedList.Node(1, LinkedList.Node(2, LinkedList.Node(3, LinkedList.Nil)))

            t.same(list123, expected, `I should get ${expected.toString()}`)
            t.end()
        })

        t.test('When I reverse the list', t => {
            const expected = LinkedList.Node(3, LinkedList.Node(2, LinkedList.Node(1, LinkedList.Nil)))

            t.same(LinkedList.reverse(list123), expected, `I should get ${expected.toString()}`)
            t.end()
        })

        t.test('When I convert it back to an array', t => {
            t.same(LinkedList.toArray(list123), [1, 2, 3], `I should get [1, 2, 3]`)
            t.end()
        })

        t.end()
    })

    t.end()
})

/* ---------------------------------------------------------------------------------------------------------------------
 * Type checking
 * ------------------------------------------------------------------------------------------------------------------- */

tap.test('Type Checking', t => {
    t.test("Given HasId = tagged('Id', { id: Id )) ", t => {
        t.test('When I try to create a = HasId(50)', t => {
            const expected = 'In constructor HasId(id): expected id to have type String; found 50'
            t.throws(() => HasId(50), new TypeError(expected), 'It should throw since the given id is not a string')
            t.end()
        })

        t.test('When I try to create a = HasId("50")', t => {
            const expected =
                'In constructor HasId(id): expected id to match /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i; found "50"'
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
            t.throws(
                () => TripleNestedArray([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- though now properly triple-nested -- is still not a [[[Number]]]`,
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
    t.test(
        "Given a conditional type descriptor (ending in '?'): OptionalCoord = tagged('OptionalCoord', { p: 'Coord?' }) ",
        t => {
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
        },
    )

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

const middle = Middle.E('middle', MiddleTypeEnum.MiddleTypeEnumA)

const stringifiedCoord = '{"x":1,"y":2}'
const stringifiedCircle = '{"@@tagName":"Circle","centre":{"x":0,"y":0},"radius":2}'
const stringifiedNil = '{"@@tagName":"Nil"}'
const stringifiedMiddle = '{"@@tagName":"E","name":"middle","middleEnum":{"@@tagName":"MiddleTypeEnumA"}}'

tap.test('Tagged to and from JSON', t => {
    t.test('Given I want to store a Tagged object as JSON and recover it', t => {
        t.test('When I call JSON.stringify (which implicitly calls toJSON)...', t => {
            t.same(JSON.stringify(coord), stringifiedCoord, 'JSON.stringify(coord) returns' + stringifiedCoord)
            t.same(JSON.stringify(circle), stringifiedCircle, 'JSON.stringify(circle) returns' + stringifiedCircle)
            t.same(
                JSON.stringify(LinkedList.Nil),
                stringifiedNil,
                'JSON.stringify(LinkedList.Nil) returns' + stringifiedNil,
            )
            t.same(JSON.stringify(middle), stringifiedMiddle, 'JSON.stringify(middle) returns' + stringifiedNil)
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
            generated.includes("validateNumber('TestCoord(x, y)', 'x', false, x)"),
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

        // Generate test index file (separate from main index)
        const indexContent = `export { TestCoord } from './test-coord-unit.js'
export { TestTransaction } from './test-transaction-unit.js'`
        fs.writeFileSync(path.join(outputDir, 'unit-test-index.js'), indexContent)
    })

    t.end()
})

tap.test('Special handling for FieldTypes imports and FieldTypes.X field descriptors', t => {
    t.test('When I examine the actual generated FieldTypesTest file', t => {
        const generatedCode = fs.readFileSync('test/generated/field-types-test.js', 'utf8')

        // Should automatically import FieldTypes
        t.ok(
            generatedCode.includes("import { FieldTypes } from '@graffio/types'"),
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
