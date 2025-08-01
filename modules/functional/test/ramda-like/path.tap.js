import { tap } from '@qt/test-helpers'
import path from '../../src/ramda-like/path.js'

const l3 = { a3: 'a3' }
const l2 = { a2: 'a2', l3 }
const o = { a1: 'a1', l2 }

tap.describeTests({
    Path: {
        [`Given o = ${tap.stringify(o)}`]: {
            [`When I call path('a1', o)`]: t => {
                const expected = 'a1'
                t.sameR(`Then I should get ${tap.stringify(expected)}`, path('a1')(o), expected)
            },
            [`When I call path('l2', o)`]: t => {
                const expected = o.l2
                t.sameR(`Then I should get ${tap.stringify(expected)}`, path('l2')(o), expected)
            },
            [`When I call path('l2.l3', o)`]: t => {
                const expected = o.l2.l3
                t.sameR(`Then I should get ${tap.stringify(expected)}`, path('l2.l3')(o), expected)
            },
            [`When I call path('l2.l3.a3', o)`]: t => {
                const expected = o.l2.l3.a3
                t.sameR(`Then I should get ${tap.stringify(expected)}`, path('l2.l3.a3')(o), expected)
            },
        },
    },
})
