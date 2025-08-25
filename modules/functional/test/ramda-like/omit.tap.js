import { tap } from '@graffio/test-helpers'
import { omit } from '../../index.js'

const o = { a: 1, b: 2, c: 3 }
const expected = { b: 2 }

tap.describeTests({
    omit: {
        [`Given o = ${tap.stringify(o)}`]: {
            [`When I omit(['a', 'c', 'd'], o)`]: t => {
                t.sameR(`Then I should get ${tap.stringify(expected)}`, omit(['a', 'c', 'd'], o), expected)
            },
        },
    },
})
