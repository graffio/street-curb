import tap from 'tap'
import memoizeOnce from '../../src/ramda-like/memoize-once.js'

tap.test('memoizeOnce', t => {
    t.test(
        'Given function add (x, y) => x + y and cacheKeyF = (x,y) => x + "|" +y and m = memoizeOnce(cacheKeyF, add)',
        t => {
            t.test('When I call m(2, 3)', t => {
                const cacheF = (x, y) => `${x}|${y}`

                let count = 0

                const add = (x, y) => {
                    count++
                    return x + y
                }

                const m = memoizeOnce(cacheF, add)
                let actual = m(2, 3)

                t.same(count, 1, 'Then add should have been called once')
                t.same(actual, 5, 'And I should get the result 5')

                actual = m(2, 3)

                t.same(count, 1, 'And if I call m(2,3) again, add should still only have been called once')
                t.same(actual, 5, 'And I should get the cached result 5')

                actual = m(4, 3)

                t.same(
                    count,
                    2,
                    'And if I call m(4,3), add should now have been called twice, and 2+3 should have been pushed out of the cache',
                )
                t.same(actual, 7, 'And I should get the result 7')

                actual = m(2, 3)

                t.same(
                    count,
                    3,
                    'And if I call m(2,3) once again, add should now have been called three times since 2+3 was pushed out of the cache by 4+3',
                )
                t.same(actual, 5, 'And I should get the result 5')

                t.end()
            })

            t.end()
        },
    )

    t.end()
})
