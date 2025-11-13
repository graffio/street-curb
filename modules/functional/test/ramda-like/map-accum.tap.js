import tap from 'tap'
import mapAccum from '../../src/ramda-like/map-accum.js'

const add = (a, b) => [a + b, a + b]
const mult = (a, b) => [a * b, a * b]
const concat = (a, b) => [a.concat(b), a.concat(b)]

tap.test('mapAccum', t => {
    t.test('Given reducer add(a, b) -> [a + b, a + b]', t => {
        t.test('When I mapAccum(add, 0, [1, 2, 3, 4])', t => {
            const actual = mapAccum(add, 0, [1, 2, 3, 4])
            t.same(actual[0], 10, 'Then I should get both the accumulated result 10')
            t.same(actual[1], [1, 3, 6, 10], 'And the partial results [1, 3, 6, 10]')
            t.end()
        })

        t.end()
    })

    t.test('returns the list and accumulator for an empty array', t => {
        t.same(mapAccum(add, 0, []), [0, []])
        t.same(mapAccum(mult, 1, []), [1, []])
        t.same(mapAccum(concat, [], []), [[], []])
        t.end()
    })

    t.end()
})
