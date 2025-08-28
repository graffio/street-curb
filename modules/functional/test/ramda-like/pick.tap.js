import tap from 'tap'
import { pick } from '../../index.js'

const o = { a: 1, b: 2, c: 3 }
const expected = { a: 1, c: 3 }

tap.test('pick', t => {
    t.test(`Given o = ${JSON.stringify(o)}`, t => {
        t.test(`When I pick(['a', 'c', 'd'], o)`, t => {
            t.same(pick(['a', 'c', 'd'], o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })
        t.end()
    })

    t.end()
})
