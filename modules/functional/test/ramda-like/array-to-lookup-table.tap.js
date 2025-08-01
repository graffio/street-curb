import { tap } from '@qt/test-helpers'
import { arrayToLookupTable } from '../../index.js'

const a = [
    { id: 'id-0', a: 10 },
    { id: 'id-1', a: 20 },
]

const expected1 = { 'id-0': { id: 'id-0', a: 10 }, 'id-1': { id: 'id-1', a: 20 } }

const expected2 = { 10: { id: 'id-0', a: 10 }, 20: { id: 'id-1', a: 20 } }

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const as = toString(a)
const expected1s = toString(expected1)
const expected2s = toString(expected2)

const tests = {
    [`Given array a = ${as}`]: {
        'When I call arrayToLookupTable(a => a.id, a)': t => {
            t.sameR(
                `Then I should get ${expected1s}`,
                expected1,
                arrayToLookupTable(a => a.id, a),
            )
        },
        'When I call arrayToLookupTable(a => a.a, a)': t => {
            t.sameR(
                `Then I should get ${expected2s}`,
                expected2,
                arrayToLookupTable(a => a.a, a),
            )
        },
    },
}

tap.describeTests({ mergeDeepRight: tests })
