import tap from 'tap'
import iterate from '../../src/ramda-like/iterate.js'

tap.test('iterate', t => {
    t.test('applies fn N times to seed', t => {
        const result = iterate(3, x => x * 2, 1)
        t.equal(result, 8)
        t.end()
    })

    t.test('returns seed when n is 0', t => {
        const result = iterate(0, x => x + 1, 42)
        t.equal(result, 42)
        t.end()
    })

    t.test('works with object seeds', t => {
        const result = iterate(3, acc => ({ count: acc.count + 1 }), { count: 0 })
        t.same(result, { count: 3 })
        t.end()
    })

    t.test('applies exactly N times', t => {
        let calls = 0
        iterate(
            5,
            x => {
                calls++
                return x
            },
            'start',
        )
        t.equal(calls, 5)
        t.end()
    })

    t.end()
})
