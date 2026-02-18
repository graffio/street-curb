import tap from 'tap'
import { assocPath } from '../../index.js'
import { MemoizeReduxState } from '../../src/ramda-like/memoize-redux-state.js'

const { memoizeReduxState } = MemoizeReduxState

const b0 = { x: 0, y: 0 }
const b1 = { x: 1, y: 1 }
const b2 = { x: 2, y: 2 }
const b3 = { x: 3, y: 3 }

let state = { a: 4, b: { b1, b2, b3 }, c: 'unused' }

let count = 0
const bsWithXHigherThan = (state, minimum) => {
    count++
    // eslint-disable-next-line no-restricted-syntax -- test fixture accesses state directly
    return Object.values(state.b).filter(b => b.x >= minimum)
}

tap.test('memoizeReduxState', t => {
    t.test("Given a state, a function f and m = memoizeReduxState(['a', b'], f)", t => {
        t.test('When I call m(state, 2)', t => {
            const m = memoizeReduxState(['a', 'b'], bsWithXHigherThan)

            let actual = m(state, 2)

            t.same(count, 1, 'Then add should have been called once')
            t.same(actual, [b2, b3], 'And I should get the result [b2, b3]')

            actual = m(state, 2)

            t.same(count, 1, 'And if I call m(state, 2) again, f should still only have been called once')
            t.same(actual, [b2, b3], 'And I should get the cached result [b2, b3]')

            actual = m(state, 1)

            t.same(count, 2, 'And if I call m(state, 1), f should now have been called twice')
            t.same(actual, [b1, b2, b3], 'And I should get the result [b1, b2, b3]')

            actual = m(state, 2)

            t.same(
                count,
                3,
                'And if I call f(state, 2) once again, f should now have been called three times since the previous value was pushed out of the cache',
            )
            t.same(actual, [b2, b3], 'And I should get the result [b2, b3]')

            state = assocPath(['b', 'b0'], b0, state)
            actual = m(state, 2)

            t.same(
                count,
                4,
                'And if I add b0 to state and call m(state, 2) again, f should now have been called four times since the state changed',
            )
            t.same(actual, [b2, b3], 'And I should get the result [b2, b3]')

            t.end()
        })

        t.end()
    })

    t.end()
})
