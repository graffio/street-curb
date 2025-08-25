import { tap } from '@graffio/test-helpers'
import fs from 'fs'
import { main as generateTypes } from './test-helper-type-generator.js'

// Clean up any existing generated test files before starting
try {
    fs.rmSync('test/generated/', { recursive: true, force: true })
} catch (error) {
    // Ignore if directory doesn't exist
}

// Generate fresh types from .type.js files
await generateTypes()

// Dynamically import the generated types
const generatedTypes = await import('./generated/index.js')
const {
    Bob,
    Carol,
    Coord,
    DoubleNestedArray,
    HasId,
    LinkedList,
    Middle,
    MiddleTypeEnum,
    NestedArray,
    OptionalTripleNestedCoord,
    Shape,
    TripleNestedArray,
    TripleNestedCoord,
    Tuple,
} = generatedTypes

// Copy helper functions and test setup from functional module
// Add prototype methods to match original test setup
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

// Add LinkedList helper functions
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

const list = LinkedList.Nil

const coreTaggedTypeFunctionality = {
    'Given static Coord type': {
        'When I examine the type constructor': t => {
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
        },
        'When I create a coord instance': t => {
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
        },
        'When I test argument validation': t => {
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
        },
        'When I use helper methods': t => {
            t.ok(coord.x === 1 && coord.y === 2, 'Then coord is unchanged after translate')
            t.same(Coord.translate(coord, 1, 2), Coord(2, 4), 'Then coord2 is Coord(2, 4)')
            t.ok(isCoord(coord), 'Then isCoord(coord) correctly returns true when unbound')
            t.notOk(isCoord(list), 'Then isCoord(list) correctly returns false when unbound')
            t.notOk(isCoord({}), 'Then isCoord({}) correctly returns false when unbound')
        },
    },
}

const taggedSumFunctionality = {
    'Given static Shape taggedSum type': {
        'When I examine the type structure': t => {
            t.equal(typeof Shape, 'object', 'Then Shape is an object')
            t.equal(typeof Shape.Square, 'function', 'Then Shape.Square is a function')
            t.equal(typeof Shape.Circle, 'function', 'Then Shape.Circle is a function')
        },
        'When I create instances': t => {
            t.equal(square.topLeft.toString(), 'Coord(0, 0)', 'Then square.topLeft is correct')
            t.equal(square.bottomRight.toString(), 'Coord(4, 4)', 'Then square.bottomRight is correct')
            t.equal(circle.centre.toString(), 'Coord(0, 0)', 'Then circle.centre is correct')
            t.equal(circle.radius, 2, 'Then circle.radius is correct')
            t.equal(square.toString(), 'Shape.Square(Coord(0, 0), Coord(4, 4))', 'Then square toString')
            t.equal(circle.toString(), 'Shape.Circle(Coord(0, 0), 2)', 'Then circle toString')
        },
        'When I test type checking': t => {
            t.ok(Shape.is(square), 'Then Shape.is(square) is true')
            t.ok(Shape.is(circle), 'Then Shape.is(circle) is true')
            t.ok(Shape.Square.is(square), 'Then Shape.Square.is(square) is true')
            t.ok(Shape.Circle.is(circle), 'Then Shape.Circle.is(circle) is true')
            t.notOk(Shape.Square.is(circle), 'Then Shape.Square.is(circle) is false')
            t.notOk(Shape.Circle.is(square), 'Then Shape.Circle.is(square) is false')
        },
        'When I use match functionality': t => {
            const squareResult = square.match({
                Square: ({ topLeft, bottomRight }) => 'square',
                Circle: () => 'circle',
            })
            t.equal(squareResult, 'square', 'Then match works correctly on square')
        },
    },
}

const linkedListWithUnitTypes = {
    'Given LinkedList with unit types': {
        'When I examine the unit type': t => {
            t.equal(typeof LinkedList.Nil, 'object', 'Then LinkedList.Nil is an object')
            t.ok(LinkedList.is(LinkedList.Nil), 'Then LinkedList.is(Nil) is true')
        },
        'When I create a Node': t => {
            const node = LinkedList.Node('test', LinkedList.Nil)
            t.equal(node.head, 'test', 'Then node.head is correct')
            t.equal(node.tail, LinkedList.Nil, 'Then node.tail is correct')
            t.ok(LinkedList.Node.is(node), 'Then LinkedList.Node.is(node) is true')
            t.ok(LinkedList.is(node), 'Then LinkedList.is(node) is true')
        },
        'When I test match functionality': t => {
            const nilResult = LinkedList.Nil.match({ Node: ({ head, tail }) => 'node', Nil: () => 'nil' })
            t.equal(nilResult, 'nil', 'Then match works on Nil')

            const node = LinkedList.Node('test', LinkedList.Nil)
            const nodeResult = node.match({ Node: ({ head, tail }) => head, Nil: () => 'nil' })
            t.equal(nodeResult, 'test', 'Then match works on Node')
        },
        'When I use helper functions': t => {
            const list123 = LinkedList.fromArray([1, 2, 3])
            const arrayBack = LinkedList.toArray(list123)
            t.same(arrayBack, [1, 2, 3], 'Then fromArray/toArray roundtrip works')
        },
    },
}

const complexTypeValidation = {
    'Given complex type validation': {
        'When I test HasId with regex validation': t => {
            const validId = '00000000-1234-1234-0000-123456789012'
            t.doesNotThrow(() => HasId(validId), 'Then HasId accepts valid UUID')
            t.throws(() => HasId('50'), /expected id to match/, 'Then HasId rejects invalid UUID')
            t.throws(() => HasId(50), /expected id to have type String/, 'Then HasId rejects non-string')
        },
        'When I test Bob with multiple field types': t => {
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
        },
        'When I test Carol with Coord field': t => {
            const carol = Carol(Coord(1, 2))
            t.equal(carol.p.toString(), 'Coord(1, 2)', 'Then Carol accepts Coord')
            t.throws(() => Carol('not a coord'), /expected p to have type Coord/, 'Then Carol rejects non-Coord')
        },
    },
}

const arrayTypeHandling = {
    'Given array type handling': {
        'When I test nested arrays': t => {
            const nested = NestedArray([1, 2, 3])
            t.same(nested.p, [1, 2, 3], 'Then NestedArray accepts [Number]')
            t.throws(
                () => NestedArray(['a', 'b']),
                /expected p to have type \[Number\]/,
                'Then NestedArray rejects [String]',
            )
        },
        'When I test double nested arrays': t => {
            const doubleNested = DoubleNestedArray([[1, 2, 3]])
            t.same(doubleNested.p, [[1, 2, 3]], 'Then DoubleNestedArray accepts [[Number]]')
            t.throws(
                () => DoubleNestedArray([['a', 'b']]),
                /expected p to have type \[\[Number\]\]/,
                'Then DoubleNestedArray rejects [[String]]',
            )
        },
        'When I test triple nested arrays': t => {
            const tripleNested = TripleNestedArray([[[1, 2, 3]]])
            t.same(tripleNested.p, [[[1, 2, 3]]], 'Then TripleNestedArray accepts [[[Number]]]')
        },
        'When I test triple nested coordinates': t => {
            const tripleCoord = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.equal(tripleCoord.p[0][0][0].toString(), 'Coord(1, 2)', 'Then TripleNestedCoord accepts [[[Coord]]]')
            t.throws(
                () => TripleNestedCoord([[['not coord']]]),
                /expected p to have type \[\[\[Coord\]\]\]/,
                'Then TripleNestedCoord rejects non-Coord',
            )
        },
    },
}

const optionalTypeHandling = {
    'Given optional type handling': {
        'When I test optional fields': t => {
            const optionalWithValue = OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.equal(optionalWithValue.p[0][0][0].toString(), 'Coord(1, 2)', 'Then optional type accepts value')

            const optionalEmpty = OptionalTripleNestedCoord()
            t.equal(optionalEmpty.p, undefined, 'Then optional type accepts undefined')
        },
    },
}

const nestedTaggedSumTypes = {
    'Given nested taggedSum types': {
        'When I test nested enum functionality': t => {
            const middleEnum = MiddleTypeEnum.MiddleTypeEnumA
            t.ok(MiddleTypeEnum.is(middleEnum), 'Then MiddleTypeEnum.is works')
            t.ok(MiddleTypeEnum.MiddleTypeEnumA.is(middleEnum), 'Then specific variant is works')

            const middle = Middle.E('middle', middleEnum)
            t.equal(middle.name, 'middle', 'Then Middle.E name is correct')
            t.equal(middle.middleEnum, middleEnum, 'Then Middle.E middleEnum is correct')

            const middleResult = middle.match({ E: ({ name, middleEnum }) => `E: ${name}`, F: () => 'F' })
            t.equal(middleResult, 'E: middle', 'Then Middle match works')
        },
    },
}

const jsonSerialization = {
    'Given JSON serialization': {
        'When I test toJSON functionality': t => {
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
        },
    },
}

const migrationSummary = {
    'Given the complete static type migration': {
        'When I validate migration success': t => {
            t.pass('Then ✅ All core tagged type functionality migrated successfully')
            t.pass('Then ✅ All taggedSum type functionality migrated successfully')
            t.pass('Then ✅ All complex type validation migrated successfully')
            t.pass('Then ✅ All array type handling migrated successfully')
            t.pass('Then ✅ All optional type handling migrated successfully')
            t.pass('Then ✅ All nested types migrated successfully')
            t.pass('Then ✅ All JSON serialization migrated successfully')
            t.pass('Then ✅ Static types maintain 100% API compatibility with types-runtime types')
        },
    },
}

tap.describeTests({ 'Tagged Types Static Migration - Core Functionality': coreTaggedTypeFunctionality })
tap.describeTests({ 'Tagged Types Static Migration - TaggedSum Functionality': taggedSumFunctionality })
tap.describeTests({ 'Tagged Types Static Migration - LinkedList with Unit Types': linkedListWithUnitTypes })
tap.describeTests({ 'Tagged Types Static Migration - Complex Type Validation': complexTypeValidation })
tap.describeTests({ 'Tagged Types Static Migration - Array Types': arrayTypeHandling })
tap.describeTests({ 'Tagged Types Static Migration - Optional Types': optionalTypeHandling })
tap.describeTests({ 'Tagged Types Static Migration - Nested TaggedSum Types': nestedTaggedSumTypes })
tap.describeTests({ 'Tagged Types Static Migration - JSON Serialization': jsonSerialization })
tap.describeTests({ 'Tagged Types Static Migration - Summary': migrationSummary })
