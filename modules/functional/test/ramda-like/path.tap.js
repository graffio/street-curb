import tap from 'tap'
import path from '../../src/ramda-like/path.js'

const l3 = { a3: 'a3' }
const l2 = { a2: 'a2', l3 }
const o = { a1: 'a1', l2 }

tap.test('Path', t => {
    t.test(`Given o = ${JSON.stringify(o)}`, t => {
        t.test(`When I call path('a1', o)`, t => {
            const expected = 'a1'
            t.same(path('a1')(o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I call path('l2', o)`, t => {
            const expected = o.l2
            t.same(path('l2')(o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I call path('l2.l3', o)`, t => {
            const expected = o.l2.l3
            t.same(path('l2.l3')(o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.test(`When I call path('l2.l3.a3', o)`, t => {
            const expected = o.l2.l3.a3
            t.same(path('l2.l3.a3')(o), expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
