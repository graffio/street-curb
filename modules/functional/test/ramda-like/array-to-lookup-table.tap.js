import tap from 'tap'
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

tap.test('mergeDeepRight', t => {
    t.test(`Given array a = ${as}`, t => {
        t.test('When I call arrayToLookupTable(a => a.id, a)', t => {
            const result = arrayToLookupTable(a => a.id, a)
            t.same(result, expected1, `Then I should get ${expected1s}`)
            t.end()
        })

        t.test('When I call arrayToLookupTable(a => a.a, a)', t => {
            const result = arrayToLookupTable(a => a.a, a)
            t.same(result, expected2, `Then I should get ${expected2s}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
