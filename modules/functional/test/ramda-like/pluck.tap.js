import tap from 'tap'
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

tap.test('pluck', t => {
    t.test(`Given array a1 = ${a1s}`, t => {
        t.test("When I call pluck('a', a1)", t => {
            t.same(pluck('a', a1), expected1, `Then I should get ${expected1s}`)
            t.end()
        })
        t.end()
    })

    t.test(`Given array a2 = ${a2s}`, t => {
        t.test('When I call pluck(0, a2)', t => {
            t.same(pluck(0, a2), expected2, `Then I should get ${expected2s}`)
            t.end()
        })
        t.end()
    })

    t.end()
})
