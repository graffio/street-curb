import tap from 'tap'
import { mergeDeepWithKey } from '../../index.js'

const o1 = { a: 'a', b: 'b1', c: { d: 'd1', e: 2 } }
const o2 = { b: 'b2', c: { d: 'd2', e: 3 } }
const expected1 = { a: 'a', b: 'b2', c: { d: 'd2', e: 5 } }
const expected2 = { a: 'a', b: 'b1', c: { d: 'd1', e: 5 } }

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const o1s = toString(o1)
const o2s = toString(o2)
const expected1s = toString(expected1)
const expected2s = toString(expected2)

const concatEValues = (k, l, r) => (k === 'e' ? l + r : r)

tap.test('mergeDeepWithKey', t => {
    t.test(`Given o1 = ${o1s} and o2 = ${o2s} and f that adds just 'e' values`, t => {
        t.test('When I call mergeDeepWithKey(f, o1, o2)', t => {
            t.same(mergeDeepWithKey(concatEValues, o1, o2), expected1, `Then I should get ${expected1s}`)
            t.end()
        })

        t.test('But when I reverse o1 and o2 and call mergeDeepWithKey(f, o2, o1)', t => {
            t.same(mergeDeepWithKey(concatEValues, o2, o1), expected2, `Then I should get ${expected2s}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
