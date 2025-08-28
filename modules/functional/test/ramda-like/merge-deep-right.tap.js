import tap from 'tap'
import { mergeDeepRight } from '../../index.js'

const o1 = { a: 'a', b: 'b1', c: { d: 'd1' } }
const o2 = { b: 'b2', c: { d: 'd2' } }
const expected1 = { a: 'a', b: 'b2', c: { d: 'd2' } }
const expected2 = { a: 'a', b: 'b1', c: { d: 'd1' } }

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const o1s = toString(o1)
const o2s = toString(o2)
const expected1s = toString(expected1)
const expected2s = toString(expected2)

tap.test('mergeDeepRight', t => {
    t.test(`Given o1 = ${o1s} and o2 = ${o2s}`, t => {
        t.test('When I call mergeDeepRight(o1, o2)', t => {
            const actual = mergeDeepRight(o1, o2)
            t.same(actual, expected1, `Then I should get ${expected1s}`)
            t.end()
        })

        t.test('But when I reverse o1 and o2 and call mergeDeepRight(o2, o1)', t => {
            const actual = mergeDeepRight(o2, o1)
            t.same(actual, expected2, `Then I should get ${expected2s}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
