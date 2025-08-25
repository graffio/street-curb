import { tap } from '@graffio/test-helpers'
import mapAccum from '../../src/ramda-like/map-accum.js'

const add = (a, b) => [a + b, a + b]
const mult = (a, b) => [a * b, a * b]
const concat = (a, b) => [a.concat(b), a.concat(b)]

tap.describeTests({
    mapAccum: {
        'Given reducer add(a, b) -> [a + b, a + b]': {
            'When I mapAccum(add, 0, [1, 2, 3, 4])': t => {
                const actual = mapAccum(add, 0, [1, 2, 3, 4])
                t.sameR('Then I should get both the accumulated result 10', actual[0], 10)
                t.sameR('And the partial results [1, 3, 6, 10]', actual[1], [1, 3, 6, 10])
            },
        },
        'returns the list and accumulator for an empty array': t => {
            t.same(mapAccum(add, 0, []), [0, []])
            t.same(mapAccum(mult, 1, []), [1, []])
            t.same(mapAccum(concat, [], []), [[], []])
        },
    },
})
