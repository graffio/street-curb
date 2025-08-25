import { tap } from '@graffio/test-helpers'
import { mergeWithKey } from '../../index.js'

const o1 = { a: 'a', b: 'b1', e: 2 }
const o2 = { b: 'b2', e: 3 }
const expected1 = { a: 'a', b: 'b2', e: 5 }
const expected2 = { a: 'a', b: 'b1', e: 5 }

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const o1s = toString(o1)
const o2s = toString(o2)
const expected1s = toString(expected1)
const expected2s = toString(expected2)

const concatEValues = (k, l, r) => (k === 'e' ? l + r : r)

const tests = {
    [`"Given o1 = ${o1s} and o2 = ${o2s} and f that adds just 'e' values`]: {
        'When I call mergeWithKey(f, o1, o2)': t => {
            t.sameR(`Then I should get ${expected1s}`, expected1, mergeWithKey(concatEValues, o1, o2))
        },
        'But when I reverse o1 and o2 and call mergeWithKey(f, o2, o1)': t => {
            t.sameR(`Then I should get ${expected2s}`, expected2, mergeWithKey(concatEValues, o2, o1))
        },
    },
}

tap.describeTests({ mergeWithKey: tests })
