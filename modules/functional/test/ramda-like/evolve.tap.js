import tap from 'tap'
import { equals } from '../../index.js'
import evolve from '../../src/ramda-like/evolve.js'

const o = { timestamp: 10000, num: 1, b: { timestamp: 10001, num: 2, c: { timestamp: 10002, num: 3 } } }
const s = JSON.stringify(o)

const expected1 = { timestamp: 20000, num: 1, b: { timestamp: 20001, num: 2, c: { timestamp: 20002, num: 3 } } }

const expected2 = { timestamp: 10000, num: 1, b: { timestamp: 10001, num: 2, c: { timestamp: 10002, num: 10003 } } }

const f1 = (path, k, v) => (k === 'timestamp' ? v + 10000 : v)
const f2 = (path, k, v) => (equals(path, ['b', 'c', 'num']) ? v + 10000 : v)

tap.test('Evolve', t => {
    t.test(`Given o = ${s} and f1 = (path, k, v) => k === 'timestamp' ? v + 10000 : v`, t => {
        t.test('When I evolve(f1, o)', t => {
            const result = evolve(f1, o)
            t.same(result, expected1, `Then I should get ${JSON.stringify(expected1)}`)
            t.end()
        })

        t.end()
    })

    t.test(`Given o = ${s} and f2 = (path, k, v) => equals(path, ['b', 'c', 'num'] ? v + 10000 : v`, t => {
        t.test('When I evolve(f2, o)', t => {
            const result = evolve(f2, o)
            t.same(result, expected2, `Then I should get ${JSON.stringify(expected2)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
