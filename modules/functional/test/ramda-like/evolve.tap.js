import { tap } from '@graffio/test-helpers'
import { equals } from '../../index.js'
import evolve from '../../src/ramda-like/evolve.js'

const o = { timestamp: 10000, num: 1, b: { timestamp: 10001, num: 2, c: { timestamp: 10002, num: 3 } } }
const s = tap.stringify(o)

const expected1 = { timestamp: 20000, num: 1, b: { timestamp: 20001, num: 2, c: { timestamp: 20002, num: 3 } } }

const expected2 = { timestamp: 10000, num: 1, b: { timestamp: 10001, num: 2, c: { timestamp: 10002, num: 10003 } } }

const f1 = (path, k, v) => (k === 'timestamp' ? v + 10000 : v)
const f2 = (path, k, v) => (equals(path, ['b', 'c', 'num']) ? v + 10000 : v)

tap.describeTests({
    Evolve: {
        [`Given o = ${s} and f1 = (path, k, v) => k === 'timestamp' ? v + 10000 : v`]: {
            [`When I evolve(f1, o)`]: t => {
                t.sameR(`Then I should get ${tap.stringify(expected1)}`, evolve(f1, o), expected1)
            },
        },
        [`Given o = ${s} and f2 = (path, k, v) => equals(path, ['b', 'c', 'num'] ? v + 10000 : v`]: {
            [`When I evolve(f2, o)`]: t => {
                t.sameR(`Then I should get ${tap.stringify(expected2)}`, evolve(f2, o), expected2)
            },
        },
    },
})
