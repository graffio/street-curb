import { tap } from '@qt/test-helpers'
import { renameKeys } from '../../index.js'

const o = { a: 1, b: 2 }

const s = tap.stringify
const tests = {
    [`Given object o = ${tap.stringify(o)}`]: {
        [`When I call renameKeys({ a: 'c' }, o)`]: t => {
            const expected = { c: 1, b: 2 }
            t.sameR(`Then I should get ${s(expected)}`, expected, renameKeys({ a: 'c' }, o))
        },
        [`When I call renameKeys({ a: ['c', o => o.a * 7] }, o)`]: t => {
            const expected = { c: 7, b: 2 }
            t.sameR(`Then I should get ${s(expected)}`, expected, renameKeys({ a: ['c', o => o.a * 7] }, o))
        },
    },
}

tap.describeTests({ aperture: tests })
