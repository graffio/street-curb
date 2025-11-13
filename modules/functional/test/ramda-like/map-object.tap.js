import tap from 'tap'
import { mapObject } from '../../index.js'

tap.test('Map object', t => {
    t.test('Given object o = { a: 1, b: 2 } and function times2', t => {
        t.test('When I mapObject(times2, o)', t => {
            const result = mapObject(x => 2 * x, { a: 1, b: 2 })
            t.same(result, { a: 2, b: 4 }, 'Then I should get { a: 2, b: 4 }')
            t.end()
        })

        t.end()
    })

    t.end()
})
