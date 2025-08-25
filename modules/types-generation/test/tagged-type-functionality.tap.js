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

/* ---------------------------------------------------------------------------------------------------------------------
 * MIGRATED TO STATIC TYPES: Types are now imported from generated/ instead of created with tagged/taggedSum
 * ------------------------------------------------------------------------------------------------------------------- */
// MIGRATED TO STATIC TYPES: Using generated static types instead of types-runtime tagged/taggedSum
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
    OptionalCoord,
    OptionalNumber,
    OptionalString,
    OptionalTripleNestedCoord,
    Shape,
    TripleNestedArray,
    TripleNestedCoord,
    Tuple,
} = generatedTypes

/* ---------------------------------------------------------------------------------------------------------------------
 * MIGRATED TO STATIC TYPES: Types are now imported from generated/ instead of created with tagged/taggedSum
 * ------------------------------------------------------------------------------------------------------------------- */

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

// Optional types are now imported as static types from generated/

/* ---------------------------------------------------------------------------------------------------------------------
 * Test tagged
 * ------------------------------------------------------------------------------------------------------------------- */
const testTagged = {
    Then: t => {
        t.same(typeof Coord, 'function', 'The Type Constructor is a function')
        t.same(Coord.name, 'Coord', 'The name of the Type Constructor function is "Coord"')
        t.same(Coord.constructor, Function, 'Coord.constructor, as with all functions, is the native JS Function')
        t.same(Coord.prototype.constructor, Coord, 'Coord.prototype.constructor points back to Coord')
        t.same(Coord.toString(), `Coord`, 'Coord.toString() returns "Coord"')
        t.notOk(Coord.is({}), 'Coord.is({}) correctly returns false')
        t.notOk({} instanceof Coord, '{} instanceof Coord correctly returns false')
    },

    'When I create coord = Coord(1, 2)': t => {
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
    },

    'When I instead try to create coord = Coord(1)': t => {
        t.throws(
            () => Coord(1),
            new TypeError(`In constructor Coord(x, y): expected 2 arguments, found 1`),
            'I get the error',
        )
    },

    'When I instead try to create coord = Coord(1, 2, 3)': t => {
        t.throws(
            () => Coord(1, 2, 3),
            new TypeError(`In constructor Coord(x, y): expected 2 arguments, found 3`),
            'I get the error',
        )
    },

    'When I translate coord2 = Coord.translate(coord, 1, 2)': t => {
        t.ok(coord.x === 1 && coord.y === 2, 'coord is unchanged')
        t.same(Coord.translate(coord, 1, 2), Coord(2, 4), 'coord2 is Coord(2, 4)')
    },

    'When I define isCoord = Coord.is and list = List.Nil': t => {
        t.ok(isCoord(coord), 'isCoord(coord) correctly returns true even when used as an unbound variable')
        t.notOk(isCoord(list), 'isCoord(list) correctly returns false even when used as an unbound variable')
        t.notOk(isCoord({}), 'isCoord({}) correctly returns false even when used as an unbound variable')
    },

    'When I create a Coord from an object: coord1 = Coord.from({ x: 1, y: 2 })': t => {
        const coord1 = Coord.from({ x: 1, y: 2 })
        t.same(coord1, Coord(1, 2), 'coord1 is Coord(1, 2)')
    },

    'When I create a Coord from an object: coord1 = Coord.from({ x: 1, y: 2, z: 3 })': t => {
        const coord1 = Coord.from({ x: 1, y: 2, z: 3 })
        t.same(coord1, Coord(1, 2), 'coord1 is Coord(1, 2) because the z is ignored')
    },

    'When I instead try to create a Coord from an object: coord1 = Coord.from({ x: 1 })': t => {
        t.throws(
            () => Coord.from({ x: 1 }),
            new TypeError('In constructor Coord(x, y): expected y to have type Number; found undefined)'),
            'I get the error',
        )
    },
}

tap.describeTests({ Tagged: { "Given Coord = tagged('Coord', { x: 'Number', y: 'Number' })": testTagged } })

/* ---------------------------------------------------------------------------------------------------------------------
 * Test taggedSum
 * ------------------------------------------------------------------------------------------------------------------- */
const testTaggedSum = {
    Then: t => {
        t.same(typeof Shape, 'object', 'Shape is an object')
        t.same(Shape['@@typeName'], 'Shape', "Shape's '@@typeName' is 'Shape'")
        t.same(Shape['@@tagNames'], ['Square', 'Circle'], "Shape's '@@tagNames' are ['Square', 'Circle']")
        t.same(typeof Shape.Square, 'function', 'Shape.Square is a function')
        t.same(Object.keys(Shape.prototype), ['match', 'constructor'], 'Shape.prototype defines match and constructor')
        t.same(Shape.Square.toString(), `Shape.Square`, 'Shape.Square.toString() returns "Shape.Square"')
        t.notOk(Shape.Square.is({}), 'Shape.Square.is({}) correctly returns false')
    },

    'When I create square = Shape.Square(Coord(0, 0), Coord(4, 4) circle = Shape.Circle(Coord(0, 0), 2)': t => {
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
    },

    'When I instead try to create a Square with too few or too many parameters': t => {
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
    },

    'When I translate square and circle by (1, 2)': t => {
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
    },

    'When I ask about instanceof': t => {
        t.ok(square instanceof Shape.Square, 'square is an instanceof Shape.Square')
    },
}

tap.describeTests({ TaggedSum: { 'Given Shape as a taggedSum with Square and Circle constructors': testTaggedSum } })

const additionalLinkedListTests = {
    'Given LinkedList with static types': {
        'When I try to create with wrong argument count': t => {
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
        },
        'When I try to use match with missing constructors': t => {
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
        },
        'When I use LinkedList methods': t => {
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
        },
        'When I build from object': t => {
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
        },
        'When I use pre-bound .is() methods': t => {
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
        },
    },
}

tap.describeTests({ 'Additional LinkedList Tests': additionalLinkedListTests })

/* ---------------------------------------------------------------------------------------------------------------------
 * Test List
 * ------------------------------------------------------------------------------------------------------------------- */
const list123 = LinkedList.fromArray([1, 2, 3])
const linkedListTests = {
    'Given an array [1, 2, 3]': {
        'When I convert it to a List: list123 = List.fromArray([1, 2, 3])': t => {
            const expected = LinkedList.Node(1, LinkedList.Node(2, LinkedList.Node(3, LinkedList.Nil)))

            t.same(list123, expected, `I should get ${expected.toString()}`)
        },
        'When I reverse the list': t => {
            const expected = LinkedList.Node(3, LinkedList.Node(2, LinkedList.Node(1, LinkedList.Nil)))

            t.same(LinkedList.reverse(list123), expected, `I should get ${expected.toString()}`)
        },
        'When I convert it back to an array': t => {
            t.same(LinkedList.toArray(list123), [1, 2, 3], `I should get [1, 2, 3]`)
        },
    },
}
tap.describeTests({ 'LinkedList tests': linkedListTests })

/* ---------------------------------------------------------------------------------------------------------------------
 * Type checking
 * ------------------------------------------------------------------------------------------------------------------- */

const typeChecking = {
    "Given HasId = tagged('Id', { id: Id )) ": {
        'When I try to create a = HasId(50)': t => {
            const expected = 'In constructor HasId(id): expected id to have type String; found 50'
            t.throws(() => HasId(50), new TypeError(expected), 'It should throw since the given id is not a string')
        },
        'When I try to create a = HasId("50")': t => {
            const expected =
                'In constructor HasId(id): expected id to match /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i; found "50"'
            t.throws(() => HasId('50'), new TypeError(expected), 'It should throw since the given id is not a UUID')
        },
        'When I try to create a = HasId("00000000-1234-1234-123456789012")': t => {
            const id = '00000000-1234-1234-0000-123456789012'
            t.same(HasId(id).id, id, 'It should succeed since the id is a valid UUID')
        },
    },

    "Given Bob = tagged('Bob', { num: 'Number', s: 'String', o: 'Object', a: 'Any' }) ": {
        "When I try to create a = Bob(4, 'four', { n: 4 }, 4)": t => {
            const expected = { num: 4, s: 'four', o: { n: 4 }, a: 4 }
            const a = Bob(4, 'four', { n: 4 }, 4)
            t.same(a, expected, `It should equal ${a.toString()}`)
        },
        'When I try to create a = Bob("uh-oh", "four", { n: 4 }, "a")': t => {
            t.throws(
                () => Bob('uh-oh', 'four', { n: 4 }, 'a'),
                new Error('In constructor Bob(num, s, o, a): expected num to have type Number; found "uh-oh"'),
                'It should throw because num is not a number',
            )
        },
        'When I try to create a = Bob(4, { o: 3 }, { n: 4 }, "A String!")': t => {
            t.throws(
                () => Bob(4, { o: 3 }, { n: 4 }, 'A String!'),
                new Error('In constructor Bob(num, s, o, a): expected s to have type String; found {"o":3}'),
                'It should throw because s is not a string',
            )
        },
    },

    "Given Carol = tagged('Carol', { p: 'Coord' }) ": {
        'When I try to create a = Carol(Coord(1, 1))': t => {
            const expected = 'Carol(Coord(1, 1))'
            const a = Carol(Coord(1, 1))
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = Carol(Tuple("a", "b"))': t => {
            const expected = new Error('In constructor Carol(p): expected p to have type Coord; found Tuple("a", "b")')
            t.throws(() => Carol(Tuple('a', 'b')), expected, `It should throw because p is not a Coord`)
        },
    },
}

const arrayTypeChecking = {
    "Given NestedArray = tagged('NestedArray', { p: '[Number]' }) ": {
        'When I try to create a = NestedArray(1)': t => {
            const expected = new Error('In constructor NestedArray(p): expected p to have type [Number]; found 1')
            t.throws(() => NestedArray(1), expected, `It should throw because 1 is not a [Number]`)
        },
        'When I try to create a = NestedArray(["a", "b"])': t => {
            const expected = new Error(
                'In constructor NestedArray(p): expected p to have type [Number]; found ["a", "b"]',
            )
            t.throws(() => NestedArray(['a', 'b']), expected, `It should throw because ["a", "b"] is not a [Number]`)
        },
        'When I try to create a = NestedArray([1, 2, 3])': t => {
            const expected = 'NestedArray([1, 2, 3])'
            const a = NestedArray([1, 2, 3])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
    },

    "Given DoubleNestedArray = tagged('DoubleNestedArray', { p: '[[Number]]' }) ": {
        'When I try to create a = DoubleNestedArray(1)': t => {
            const expected = new Error(
                'In constructor DoubleNestedArray(p): expected p to have type [[Number]]; found 1',
            )
            t.throws(() => DoubleNestedArray(1), expected, `It should throw because 1 is not a [[Number]]`)
        },
        'When I try to create a = DoubleNestedArray([1])': t => {
            const expected = new Error(
                'In constructor DoubleNestedArray(p): expected p to have type [[Number]]; found [1]',
            )
            t.throws(() => DoubleNestedArray([1]), expected, `It should throw because [1] is still not a [[Number]]`)
        },
        'When I try to create a = DoubleNestedArray([["a", "b"]])': t => {
            const expected = new Error(
                `In constructor DoubleNestedArray(p): expected p to have type [[Number]]; found [["a", "b"]]`,
            )
            t.throws(
                () => DoubleNestedArray([['a', 'b']]),
                expected,
                `It should throw because [["a", "b"]] is still not a [[Number]]`,
            )
        },
        'When I try to create a = DoubleNestedArray([1, 2, 3])': t => {
            const expected = 'DoubleNestedArray([[1, 2, 3]])'
            const a = DoubleNestedArray([[1, 2, 3]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
    },

    "Given TripleNestedArray = tagged('TripleNestedArray', { p: '[[[Number]]]' }) ": {
        'When I try to create a = TripleNestedArray(1)': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found 1',
            )
            t.throws(() => TripleNestedArray(1), expected, `It should throw because 1 is not a [[[Number]]]`)
        },
        'When I try to create a = TripleNestedArray([1])': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [1]',
            )
            t.throws(() => TripleNestedArray([1]), expected, `It should throw because [1] is still not a [[[Number]]]`)
        },
        'When I try to create a = TripleNestedArray([[1]])': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [1]',
            )
            t.throws(
                () => TripleNestedArray([1]),
                expected,
                `It should throw because [[1]] is still not a [[[Number]]]`,
            )
        },

        'When I try to create a = TripleNestedArray("a")': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found "a"',
            )
            t.throws(
                () => TripleNestedArray('a'),
                expected,
                `It should throw because "a" isn't even an array, let alone a [[[Number]]]`,
            )
        },
        'When I try to create a = TripleNestedArray(["a", "b"])': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found ["a", "b"]',
            )
            t.throws(
                () => TripleNestedArray(['a', 'b']),
                expected,
                `It should throw because ["a", "b"] is not even triply-nested, let alone a [[[Number]]]`,
            )
        },
        'When I try to create a = TripleNestedArray([["a", "b"]])': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [["a", "b"]]',
            )
            t.throws(
                () => TripleNestedArray([['a', 'b']]),
                expected,
                `It should throw because [['a', 'b']] is not even triply-nested, let alone a [[[Number]]]`,
            )
        },
        'When I try to create a = TripleNestedArray([[["a", "b"]]])': t => {
            const expected = new Error(
                'In constructor TripleNestedArray(p): expected p to have type [[[Number]]]; found [[["a", "b"]]]',
            )
            t.throws(
                () => TripleNestedArray([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- though now properly triple-nested -- is still not a [[[Number]]]`,
            )
        },
        'When I try to create a = TripleNestedArray([[[1, 2, 3]]])': t => {
            const expected = 'TripleNestedArray([[[1, 2, 3]]])'
            const a = TripleNestedArray([[[1, 2, 3]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
    },

    "Given TripleNestedCoord = tagged('TripleNestedCoord', { p: '[[[Coord]]]' }) ": {
        'When I try to create a = TripleNestedCoord([[["a", "b"]]])': t => {
            const expected = new Error(
                'In constructor TripleNestedCoord(p): expected p to have type [[[Coord]]]; found [[["a", "b"]]]',
            )
            t.throws(
                () => TripleNestedCoord([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- though properly triple-nested -- is still not a [[[Coord]]]`,
            )
        },
        'When I try to create a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])': t => {
            const expected = 'TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])'
            const a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
    },

    "Given TripleNestedCoord = tagged('TripleNestedCoord', { p: '[[[Coord]]]?' }) ": {
        'When I try to create a = TripleNestedCoord([[["a", "b"]]])': t => {
            const expected = new Error(
                'In constructor TripleNestedCoord(p): expected p to have type [[[Coord]]]; found [[["a", "b"]]]',
            )
            t.throws(
                () => TripleNestedCoord([[['a', 'b']]]),
                expected,
                `It should throw because [[["a", "b"]]] -- though properly triple-nested -- is still not a [[[Coord]]]`,
            )
        },
        'When I try to create a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])': t => {
            const expected = 'TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])'
            const a = TripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
    },

    "Given OptionalTripleNestedCoord = tagged('OptionalTripleNestedCoord', { p: '[[[Coord]]]?' }) ": {
        'When I try to create a = OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])': t => {
            const expected = 'OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])'
            const a = OptionalTripleNestedCoord([[[Coord(1, 2), Coord(3, 4)]]])
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalTripleNestedCoord()': t => {
            const expected = 'OptionalTripleNestedCoord(undefined)'
            const a = OptionalTripleNestedCoord()
            t.same(expected, a.toString(), `Then a should equal ${a.toString()}`)
        },
    },
}

const conditionalTypeChecking = {
    "Given a conditional type descriptor (ending in '?'): OptionalCoord = tagged('OptionalCoord', { p: 'Coord?' }) ": {
        'When I create a = OptionalCoord(Coord(1, 2))': t => {
            const expected = 'OptionalCoord(Coord(1, 2))'
            const a = OptionalCoord(Coord(1, 2))
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I create a = OptionalCoord(undefined)': t => {
            const expected = 'OptionalCoord(undefined)'
            const a = OptionalCoord(undefined)
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalCoord()': t => {
            const expected = 'OptionalCoord(undefined)'
            const a = OptionalCoord()
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalCoord(1)': t => {
            const expected = new Error('In constructor OptionalCoord(p): expected p to have type Coord; found 1')
            t.throws(() => OptionalCoord(1), expected, 'It should throw because 1 is not a Coord')
        },
    },
    "Given a conditional string type descriptor : OptionalString = tagged('OptionalString', { p: 'String?' }) ": {
        'When I create a = OptionalString("a")': t => {
            const expected = 'OptionalString("a")'
            const a = OptionalString('a')
            t.same(a.toString(), expected, `Then a should equal OptionalString(a)`)
        },
        'When I create a = OptionalString(undefined)': t => {
            const expected = 'OptionalString(undefined)'
            const a = OptionalString(undefined)
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalString()': t => {
            const expected = 'OptionalString(undefined)'
            const a = OptionalString()
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalString(1)': t => {
            const expected = new Error('In constructor OptionalString(p): expected p to have type String; found 1')
            t.throws(() => OptionalString(1), expected, 'It should throw because 1 is not a String')
        },
    },
    "Given a conditional number type descriptor : OptionalNumber = tagged('OptionalNumber', { p: 'Number?' }) ": {
        'When I create a = OptionalNumber(1)': t => {
            const expected = 'OptionalNumber(1)'
            const a = OptionalNumber(1)
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I create a = OptionalNumber(undefined)': t => {
            const expected = 'OptionalNumber(undefined)'
            const a = OptionalNumber(undefined)
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalNumber()': t => {
            const expected = 'OptionalNumber(undefined)'
            const a = OptionalNumber()
            t.same(a.toString(), expected, `Then a should equal ${a.toString()}`)
        },
        'When I try to create a = OptionalNumber("a")': t => {
            const expected = new Error('In constructor OptionalNumber(p): expected p to have type Number; found "a"')
            t.throws(() => OptionalNumber('a'), expected, 'It should throw because "a" is not a Number')
        },
    },
}

const middle = Middle.E('middle', MiddleTypeEnum.MiddleTypeEnumA)

const stringifiedCoord = '{"x":1,"y":2}'
const stringifiedCircle = '{"@@tagName":"Circle","centre":{"x":0,"y":0},"radius":2}'
const stringifiedNil = '{"@@tagName":"Nil"}'
const stringifiedMiddle = '{"@@tagName":"E","name":"middle","middleEnum":{"@@tagName":"MiddleTypeEnumA"}}'

const toAndFromJson = {
    'Given I want to store a Tagged object as JSON and recover it': {
        'When I call JSON.stringify (which implicitly calls toJSON)...': t => {
            t.same(JSON.stringify(coord), stringifiedCoord, 'JSON.stringify(coord) returns' + stringifiedCoord)
            t.same(JSON.stringify(circle), stringifiedCircle, 'JSON.stringify(circle) returns' + stringifiedCircle)
            t.same(
                JSON.stringify(LinkedList.Nil),
                stringifiedNil,
                'JSON.stringify(LinkedList.Nil) returns' + stringifiedNil,
            )
            t.same(JSON.stringify(middle), stringifiedMiddle, 'JSON.stringify(middle) returns' + stringifiedNil)
        },
    },
}

tap.describeTests({ 'Type Checking': typeChecking })
tap.describeTests({ 'Array Type Checking': arrayTypeChecking })
tap.describeTests({ 'Conditional Type Checking': conditionalTypeChecking })
tap.describeTests({ 'Tagged to and from JSON': toAndFromJson })
