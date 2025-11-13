import tap from 'tap'
import dissoc from '../../src/ramda-like/dissoc.js'

const o = { a: 1, b: 2, c: 3 }
const expected = { a: 1, c: 3 }

tap.test('Dissoc', t => {
    t.test(`Given o = ${JSON.stringify(o)}`, t => {
        t.test(`When I dissoc('b', o)`, t => {
            const result = dissoc('b', o)
            t.same(result, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
