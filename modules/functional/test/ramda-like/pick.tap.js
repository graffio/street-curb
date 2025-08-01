import { tap } from '@qt/test-helpers'
import { pick } from '../../index.js'

const o = { a: 1, b: 2, c: 3 }
const expected = { a: 1, c: 3 }

tap.describeTests({
    pick: {
        [`Given o = ${tap.stringify(o)}`]: {
            [`When I pick(['a', 'c', 'd'], o)`]: t => {
                t.sameR(`Then I should get ${tap.stringify(expected)}`, pick(['a', 'c', 'd'], o), expected)
            },
        },
    },
})
