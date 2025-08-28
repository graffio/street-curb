import tap from 'tap'
import { asyncMapObject } from '../../index.js'

const f = async x => Promise.resolve(2 * x)

tap.test('Map object', t => {
    t.test('Given object o = { a: 1, b: 2 } and async f = x => Promise.resolve(2 * x)', t => {
        t.test('When I await asyncMapObject(f, o)', async t => {
            const actual = await asyncMapObject(f, { a: 1, b: 2 })
            t.same(actual, { a: 2, b: 4 }, 'Then I should get { a: 2, b: 4 }')
            t.end()
        })

        t.end()
    })

    t.end()
})
