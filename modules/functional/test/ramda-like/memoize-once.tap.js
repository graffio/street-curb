import { tap } from '@graffio/test-helpers'
import memoizeOnce from '../../src/ramda-like/memoize-once.js'

tap.describeTests({
    'ramda-like memoizeOnce': {
        'Given function add (x, y) => x + y and cacheKeyF = (x,y) => x + "|" +y and m = memoizeOnce(cacheKeyF, add) ': {
            'When I call m(2, 3)': t => {
                const cacheF = (x, y) => `${x}|${y}`

                let count = 0

                const add = (x, y) => {
                    count++
                    return x + y
                }

                const m = memoizeOnce(cacheF, add)
                let actual = m(2, 3)

                t.sameR('Then add should have been called once', count, 1)
                t.sameR('And I should get the result 5', actual, 5)

                actual = m(2, 3)

                t.sameR('And if I call m(2,3) again, add should still only have been called once', count, 1)
                t.sameR('And I should get the cached result 5', actual, 5)

                actual = m(4, 3)

                t.sameR(
                    'And if I call m(4,3), add should now have been called twice, and 2+3 should have been pushed out of the cache',
                    count,
                    2,
                )
                t.sameR('And I should get the result 7', actual, 7)

                actual = m(2, 3)

                t.sameR(
                    'And if I call m(2,3) once again, add should now have been called three times since 2+3 was pushed out of the cache by 4+3',
                    count,
                    3,
                )
                t.sameR('And I should get the result 5', actual, 5)
            },
        },
    },
})
