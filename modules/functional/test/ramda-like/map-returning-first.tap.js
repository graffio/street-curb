import { tap } from '@qt/test-helpers'
import mapReturningFirst from '../../src/ramda-like/map-returning-first.js'

tap.describeTests({
    mapReturningFirst: {
        'Given a = [0,1,3]': {
            'When I mapReturningFirst(f, a) with f = x => x === 1 ? 2 * x : undefined': t => {
                t.sameR(
                    'Then I should get 2 because the first call to f that returns something returns 2',
                    mapReturningFirst(x => (x === 1 ? 2 * x : undefined), [0, 1, 3]),
                    2,
                )
            },
            'When I mapReturningFirst(f, a) with f = x => x === 5 ? 2 * x : undefined': t => {
                t.sameR(
                    'Then I should get undefined because every call to f returns undefined',
                    mapReturningFirst(x => (x === 5 ? 2 * x : undefined), [0, 1, 3]),
                    undefined,
                )
            },
        },
    },
})
