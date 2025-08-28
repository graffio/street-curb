import tap from 'tap'
import { filterObject } from '../../index.js'

const o = { a: 1, b: 2, c: 1 }
const expected = { a: 1, c: 1 }

tap.test('filterObject', t => {
    t.test(`Given l = ${JSON.stringify(o)}`, t => {
        t.test('When I call filterObject(p => p === 1, o)', t => {
            const result = filterObject(p => p === 1, o)
            t.same(result, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
