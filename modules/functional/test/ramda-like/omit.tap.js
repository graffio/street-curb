import tap from 'tap'
import { omit } from '../../index.js'

const o = { a: 1, b: 2, c: 3 }
const expected = { b: 2 }

tap.test('omit', t => {
    t.test(`Given o = ${JSON.stringify(o)}`, t => {
        t.test(`When I omit(['a', 'c', 'd'], o)`, t => {
            t.same(omit(['a', 'c', 'd'], o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
