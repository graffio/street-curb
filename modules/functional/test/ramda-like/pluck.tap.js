import { tap } from '@qt/test-helpers'
import { pluck } from '../../index.js'

const a1 = [{ a: 1 }, { a: 2 }]
const a2 = [
    [0, 1],
    [2, 3],
]

const expected1 = [1, 2]
const expected2 = [0, 2]

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const a1s = toString(a1)
const a2s = toString(a2)
const expected1s = toString(expected1)
const expected2s = toString(expected2)

const tests = {
    [`Given array a1 = ${a1s}`]: {
        "When I call pluck('a', a1)": t => {
            t.sameR(`Then I should get ${expected1s}`, expected1, pluck('a', a1))
        },
    },
    [`Given array a2 = ${a2s}`]: {
        'When I call pluck(0, a2)': t => {
            t.sameR(`Then I should get ${expected2s}`, expected2, pluck(0, a2))
        },
    },
}

tap.describeTests({ mergeDeepRight: tests })
