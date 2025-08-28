import tap from 'tap'
import { renameKeys } from '../../index.js'

const o = { a: 1, b: 2 }

tap.test('renameKeys', t => {
    t.test(`Given object o = ${JSON.stringify(o)}`, t => {
        t.test(`When I call renameKeys({ a: 'c' }, o)`, t => {
            const expected = { c: 1, b: 2 }
            t.same(renameKeys({ a: 'c' }, o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I call renameKeys({ a: ['c', o => o.a * 7] }, o)`, t => {
            const expected = { c: 7, b: 2 }
            t.same(renameKeys({ a: ['c', o => o.a * 7] }, o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
