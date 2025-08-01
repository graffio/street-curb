import { tap } from '@qt/test-helpers'
import dissoc from '../../src/ramda-like/dissoc.js'

const o = { a: 1, b: 2, c: 3 }
const expected = { a: 1, c: 3 }

tap.describeTests({
    Dissoc: {
        [`Given o = ${tap.stringify(o)}`]: {
            [`When I dissoc('b', o)`]: t => {
                t.sameR(`Then I should get ${tap.stringify(expected)}`, dissoc('b', o), expected)
            },
        },
    },
})
