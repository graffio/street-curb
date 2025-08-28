import tap from 'tap'
import mapReturningFirst from '../../src/ramda-like/map-returning-first.js'

tap.test('mapReturningFirst', t => {
    t.test('Given a = [0,1,3]', t => {
        t.test('When I mapReturningFirst(f, a) with f = x => x === 1 ? 2 * x : undefined', t => {
            const result = mapReturningFirst(x => (x === 1 ? 2 * x : undefined), [0, 1, 3])
            t.same(result, 2, 'Then I should get 2 because the first call to f that returns something returns 2')
            t.end()
        })

        t.test('When I mapReturningFirst(f, a) with f = x => x === 5 ? 2 * x : undefined', t => {
            const result = mapReturningFirst(x => (x === 5 ? 2 * x : undefined), [0, 1, 3])
            t.same(result, undefined, 'Then I should get undefined because every call to f returns undefined')
            t.end()
        })

        t.end()
    })

    t.end()
})
