import { tap } from '@qt/test-helpers'
import equals from '../../src/ramda-like/equals.js'

/* eslint-disable no-new-wrappers, prefer-regex-literals */

const a = []
const b = a

let supportsSticky = false
try {
    RegExp('', 'y')
    supportsSticky = true
} catch (e) {}

let supportsUnicode = false
try {
    RegExp('', 'u')
    supportsUnicode = true
} catch (e) {}

const listA = [1, 2, 3]
const listB = [1, 3, 2]

// recursive data structure
const c = {}
const d = {}
const e = []
const f = []
c.v = c
d.v = d
e.push(e)
f.push(f)
const nestA = { a: [1, 2, { c: 1 }], b: 1 }
const nestB = { a: [1, 2, { c: 1 }], b: 1 }
const nestC = { a: [1, 2, { c: 2 }], b: 1 }

tap.describeTests({
    'ramda-like equals': {
        'tests for deep equality of its operands': t => {
            t.ok(equals(100, 100), '100 equals 100')
            t.notOk(equals(100, '100', "100 doesn't equal '100'"))
            t.ok(equals([], []), '[] equals []')
            t.ok(equals(a, b), 'two variables pointing at the same empty array are equals')
        },
        'considers equal Boolean primitives equal': t => {
            t.ok(equals(true, true), 'true equals true')
            t.ok(equals(false, false), 'false equals false')
            t.notOk(equals(true, false), 'true does not equals false')
            t.notOk(equals(false, true), 'false does not equals true')
        },
        'considers equivalent Boolean objects equal': t => {
            t.ok(equals(new Boolean(true), new Boolean(true)), 'wrapped true equals different wrapped true')
            t.ok(equals(new Boolean(false), new Boolean(false)), 'wrapped false equals different wrapped false')
            t.notOk(equals(new Boolean(true), new Boolean(false)), 'wrapped true does not equals wrapped false')
            t.notOk(equals(new Boolean(false), new Boolean(true)), 'wrapped false does not equals wrapped true')
        },
        'never considers Boolean primitive equal to Boolean object': t => {
            t.notOk(equals(true, new Boolean(true)), 'true does not equals wrapped true')
            t.notOk(equals(new Boolean(true), true), 'wrapped true does not equals true')
            t.notOk(equals(false, new Boolean(false)), 'false does not equals wrapped false')
            t.notOk(equals(new Boolean(false), false), 'wrapped false does not equals false')
        },
        'considers equal number primitives equal': t => {
            t.ok(equals(0, 0), '0 equals 1')
            t.notOk(equals(0, 1), '0 does not equals 1')
            t.notOk(equals(1, 0), '1 does not equals 0')
        },
        'considers equivalent Number objects equal': t => {
            t.ok(equals(new Number(0), new Number(0)), 'wrapped 0 equals different wrapped 0')
            t.notOk(equals(new Number(0), new Number(1)), 'wrapped 0 does not equals wrapped 1')
            t.notOk(equals(new Number(1), new Number(0)), 'wrapped 1 does not equals wrapped 0')
        },
        'never considers number primitive equal to Number object': t => {
            t.notOk(equals(0, new Number(0)), '0 does not equals wrapped 0')
            t.notOk(equals(new Number(0), 0), 'wrapped 0 does not equals 0')
        },
        'considers equal string primitives equal': t => {
            t.ok(equals('', ''), '"" equals different ""')
            t.notOk(equals('', 'x'), 'empty string does not equals "x"')
            t.notOk(equals('x', ''), '"x" does not equals ""')
            t.ok(equals('foo', 'foo'), '"foo" equals "foo"')
            t.notOk(equals('foo', 'bar'), '"foo" does not equals "bar"')
            t.notOk(equals('bar', 'foo'), '"bar" does not equals "foo"')
        },
        'considers equivalent String objects equal': t => {
            t.ok(equals(new String(''), new String('')), 'wrapped "" equals different wrapped ""')
            t.notOk(equals(new String(''), new String('x')), 'wrapped "" does not equals wrapped "x"')
            t.notOk(equals(new String('x'), new String('')), 'wrapped "x" does not equals wrapped ""')
            t.ok(equals(new String('foo'), new String('foo')), 'wrapped "foo" equals different wrapped "foo"')
            t.notOk(equals(new String('fo'), new String('ba')), 'wrapped "foo" does not equals different wrapped "bar"')
            t.notOk(equals(new String('ba'), new String('fo')), 'wrapped "bar" does not equals different wrapped "foo"')
        },
        'never considers string primitive equal to String object': t => {
            t.notOk(equals('', new String('')), "'' does not equals new String(''))")
            t.notOk(equals(new String(''), ''), "new String('') does not equals '')")
            t.notOk(equals('x', new String('x')), "'x' does not equals new String('x'))")
            t.notOk(equals(new String('x'), 'x'), "new String('x') does not equals 'x')")
        },

        'handles objects': t => {
            t.ok(equals({}, {}), '{} equals {})')
            t.ok(equals({ a: 1, b: 2 }, { a: 1, b: 2 }), '{ a: 1, b: 2 }, { a: 1 equals b: 2 })')
            t.ok(equals({ a: 2, b: 3 }, { b: 3, a: 2 }), '{ a: 2, b: 3 }, { b: 3 equals a: 2 })')
            t.notOk(equals({ a: 2, b: 3 }, { a: 3, b: 3 }), '{ a: 2, b: 3 }, { a: 3 does not equals b: 3 })')
            t.notOk(
                equals({ a: 2, b: 3, c: 1 }, { a: 2, b: 3 }),
                '{ a: 2, b: 3, c: 1 }, { a: 2 does not equals b: 3 })',
            )
        },
        'considers equivalent Arguments objects equal': t => {
            const a = (function () {
                return arguments
            })()
            const b = (function () {
                return arguments
            })()
            const c = (function () {
                return arguments
            })(1, 2, 3)
            const d = (function () {
                return arguments
            })(1, 2, 3)

            t.ok(equals(a, b), 'empty arguments object for two different functions are equals')
            t.ok(equals(b, a), 'empty arguments object for two different functions are equals')
            t.ok(equals(c, d), 'non-empty arguments object for two different functions are equals')
            t.ok(equals(d, c), 'non-empty arguments object for two different functions are equals')
            t.notOk(equals(a, c), 'empty arguments object does not equal non-empty arguments')
            t.notOk(equals(c, a), 'empty arguments object does not equal non-empty arguments')
        },
        'considers equivalent Error objects equal': t => {
            t.ok(equals(new Error('XXX'), new Error('XXX')), "new Error('XXX') equals new Error('XXX'))")
            t.notOk(equals(new Error('XXX'), new Error('YYY')), "new Error('XXX') does not equals new Error('YYY'))")
            t.notOk(
                equals(new Error('XXX'), new TypeError('XXX')),
                "new Error('XXX') does not equals new TypeError('XXX'))",
            )
            t.notOk(
                equals(new Error('XXX'), new TypeError('YYY')),
                "new Error('XXX') does not equals new TypeError('YYY'))",
            )
        },
        'handles regex': t => {
            t.ok(equals(/\s/, /\s/), '/s/ equals /s/)')
            t.notOk(equals(/\s/, /\d/), '/s/ does not equals /d/)')
            t.ok(equals(/a/gi, /a/gi), '/a/gi equals /a/gi)')
            t.ok(equals(/a/gim, /a/gim), '/a/gim equals /a/gim)')
            t.notOk(equals(/a/gi, /a/i), '/a/gi does not equals /a/i)')

            if (supportsSticky) {
                t.ok(equals(/\s/y, /\s/y), '/s/y equals /s/y)')
                t.ok(equals(/a/gimy, /a/gimy), '/a/gimy equals /a/gimy)')
            }

            if (supportsUnicode) {
                t.ok(equals(/\s/u, /\s/u), '/s/u equals /s/u)')
                t.ok(equals(/a/gimu, /a/gimu), '/a/gimu equals /a/gimu)')
            }
        },
        'handles lists': t => {
            t.notOk(equals([], {}), '[] does not equals {})')
            t.notOk(equals(listA, listB), '[1,2,3] does not equals [1,3,2])')
        },
        'handles recursive data structures': t => {
            t.ok(equals(c, d), 'recursive objects are equals')
            t.ok(equals(e, f), 'recursive arrays are equals')
            t.ok(equals(nestA, nestB), 'nested objects are equals')
            t.notOk(equals(nestA, nestC), 'nested objects that differ only at deep values are not equals')
        },
        'handles dates': t => {
            t.ok(equals(new Date(0), new Date(0)), 'new Date(0) equals new Date(0))')
            t.ok(equals(new Date(1), new Date(1)), 'new Date(1) equals new Date(1))')
            t.notOk(equals(new Date(0), new Date(1)), 'new Date(0) does not equals new Date(1))')
            t.notOk(equals(new Date(1), new Date(0)), 'new Date(1) does not equals new Date(0))')
        },

        'requires that both objects have the same enumerable properties with the same values': t => {
            const a1 = []
            const a2 = []
            a2.x = 0

            const b1 = new Boolean(false)
            const b2 = new Boolean(false)
            b2.x = 0

            const d1 = new Date(0)
            const d2 = new Date(0)
            d2.x = 0

            const n1 = new Number(0)
            const n2 = new Number(0)
            n2.x = 0

            const r1 = /(?:)/
            const r2 = /(?:)/
            r2.x = 0

            const s1 = new String('')
            const s2 = new String('')
            s2.x = 0

            t.notOk(
                equals(a1, a2),
                'an array with a random extra key does not equals another otherwise equal array without the extra key',
            )
            t.notOk(
                equals(b1, b2),
                'a Boolean with a random extra key does not equals another otherwise equal Boolean without the extra key',
            )
            t.notOk(
                equals(d1, d2),
                'a Date with a random extra key does not equals another otherwise equal Date without the extra key',
            )
            t.notOk(
                equals(n1, n2),
                'a Number with a random extra key does not equals another otherwise equal Number without the extra key',
            )
            t.notOk(
                equals(r1, r2),
                'a RegEx with a random extra key does not equals another otherwise equal RegEx without the extra key',
            )
            t.notOk(
                equals(s1, s2),
                'a String with a random extra key does not equals another otherwise equal String without the extra key',
            )
        },
        'handles typed arrays': t => {
            const typArr1 = new ArrayBuffer(10)
            const typArr2 = new ArrayBuffer(10)
            const typArr3 = new ArrayBuffer(10)
            const intTypArr = new Int8Array(typArr1)

            typArr1[0] = 1
            typArr2[0] = 1
            typArr3[0] = 0

            t.ok(equals(typArr1, typArr2), 'ArrayBuffers with the same contents are equals')
            t.notOk(equals(typArr1, typArr3), 'ArrayBuffers with different contents are not equals')
            t.notOk(equals(typArr1, intTypArr), 'ArrayBuffer is not equals Int8Array')
        },
        'compares Promise objects by identity': t => {
            const p = Promise.resolve(42)
            const q = Promise.resolve(42)
            t.ok(equals(p, p), 'A Promise equals itself')
            t.notOk(equals(p, q), 'A Promise resolving to 42 does not equals a different Promise resolving to 42')
        },
        'compares Map objects by value': t => {
            const map12 = new Map([
                [1, 'a'],
                [2, 'b'],
            ])
            const map21 = new Map([
                [2, 'b'],
                [1, 'a'],
            ])

            t.ok(equals(new Map([]), new Map([])), 'new Map([]) equals new Map([]))')
            t.ok(equals(new Map([[1, 'a']]), new Map([[1, 'a']])), "new Map([[1, 'a']]), new Map([[1, 'a']]))")

            t.notOk(equals(new Map([]), new Map([[1, 'a']])), "new Map([]) does not equals new Map([[1, 'a'])")
            t.notOk(equals(new Map([[1, 'a']]), new Map([])), "new Map([[1, 'a']]) does not equals new Map([]))")
            t.ok(equals(map12, map21), 'Maps with keys in different orders are equals')
            t.notOk(
                equals(new Map([[1, 'a']]), new Map([[2, 'a']])),
                "new Map([[1, 'a']]), new Map([[2 does not equals 'a']]))",
            )
            t.notOk(
                equals(new Map([[1, 'a']]), new Map([[1, 'b']])),
                "new Map([[1, 'a']]), new Map([[1 does not equals 'b']]))",
            )
            t.ok(
                equals(
                    new Map([
                        [1, 'a'],
                        [2, new Map([[3, 'c']])],
                    ]),
                    new Map([
                        [1, 'a'],
                        [2, new Map([[3, 'c']])],
                    ]),
                ),
                'Maps recursively including equal objects are equals',
            )
            t.notOk(
                equals(
                    new Map([
                        [1, 'a'],
                        [2, new Map([[3, 'c']])],
                    ]),
                    new Map([
                        [1, 'a'],
                        [2, new Map([[3, 'd']])],
                    ]),
                ),
                'Maps recursively including unequal objects are not equals',
            )
            t.ok(
                equals(
                    new Map([
                        [
                            [1, 2, 3],
                            [4, 5, 6],
                        ],
                    ]),
                    new Map([
                        [
                            [1, 2, 3],
                            [4, 5, 6],
                        ],
                    ]),
                ),
                'Maps recursively including equal arrays are equals',
            )
            t.notOk(
                equals(
                    new Map([
                        [
                            [1, 2, 3],
                            [4, 5, 6],
                        ],
                    ]),
                    new Map([
                        [
                            [1, 2, 3],
                            [7, 8, 9],
                        ],
                    ]),
                ),
                'Maps recursively including nonequal arrays are not equals',
            )
        },
        'compares Set objects by value': t => {
            t.ok(equals(new Set([]), new Set([])), 'Empty Sets are equals')
            t.notOk(equals(new Set([]), new Set([1])), 'An empty Sets does not equals one with contents')
            t.notOk(equals(new Set([1]), new Set([])), 'An empty Sets does not equals one with contents')
            t.ok(
                equals(new Set([1, 2]), new Set([2, 1])),
                'Two Sets are equals despite the order the values were array',
            )
            t.ok(
                equals(new Set([1, new Set([2, new Set([3])])]), new Set([1, new Set([2, new Set([3])])])),
                'Two Sets with the same deeply nested values are equals',
            )
            t.notOk(
                equals(new Set([1, new Set([2, new Set([3])])]), new Set([1, new Set([2, new Set([4])])])),
                'Two Sets with the different deeply nested value are not equals',
            )
            t.ok(
                equals(
                    new Set([
                        [1, 2, 3],
                        [4, 5, 6],
                    ]),
                    new Set([
                        [1, 2, 3],
                        [4, 5, 6],
                    ]),
                ),
                'Two Sets with the same deeply nested values are equals',
            )
            t.notOk(
                equals(
                    new Set([
                        [1, 2, 3],
                        [4, 5, 6],
                    ]),
                    new Set([
                        [1, 2, 3],
                        [7, 8, 9],
                    ]),
                ),
                'Two Sets with the different deeply nested value are not equals',
            )
        },
        'compares WeakMap objects by identity': t => {
            const m = new WeakMap([])
            t.ok(equals(m, m), 'A WeakMap equals itself')
            t.notOk(equals(m, new WeakMap([])), 'A WeakMap does not equals another with identical contents')
        },
        'compares WeakSet objects by identity': t => {
            const s = new WeakSet([])
            t.ok(equals(s, s), 'A WeakSet equals itself')
            t.notOk(equals(s, new WeakSet([])), 'A WeakSet does not equals another with identical contents')
        },
    },
})
