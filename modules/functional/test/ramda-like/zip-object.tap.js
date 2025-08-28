import tap from 'tap'
import { zipObject } from '../../index.js'

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const keys = ['a', 'b', 'c']
const values = [1, 2, 3]
const expected = { a: 1, b: 2, c: 3 }

tap.test('zipObject', t => {
    t.test(`Given array keys = ${toString(keys)} and array values = ${toString(values)}`, t => {
        t.test('When I zipObject(keys, values)', t => {
            t.same(zipObject(keys, values), expected, `Then I should get object ${toString(expected)}`)
            t.end()
        })
        t.end()
    })

    t.end()
})
