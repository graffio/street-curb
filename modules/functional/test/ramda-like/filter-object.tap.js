import { tap } from '@graffio/test-helpers'
import { filterObject } from '../../index.js'

const o = { a: 1, b: 2, c: 1 }
const expected = { a: 1, c: 1 }

const tests = {
    [`Given l = ${tap.stringify(o)}`]: {
        'When I call filterObject(p => p === 1, o)': t =>
            t.sameR(
                `Then I should get ${expected}`,
                filterObject(p => p === 1, o),
                expected,
            ),
    },
}

tap.describeTests({ filterObject: tests })
