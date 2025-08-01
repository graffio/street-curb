import { tap } from '@qt/test-helpers'
import { assocPath } from '../../index.js'
import memoizeReduxState from '../../src/ramda-like/memoize-redux-state.js'

const b0 = { x: 0, y: 0 }
const b1 = { x: 1, y: 1 }
const b2 = { x: 2, y: 2 }
const b3 = { x: 3, y: 3 }

let state = { a: 4, b: { b1, b2, b3 }, c: 'unused' }

let count = 0
const bsWithXHigherThan = (state, minimum) => {
    count++
    return Object.values(state.b).filter(b => b.x >= minimum)
}

tap.describeTests({
    'ramda-like memoizeReduxState': {
        "Given a state, a function f and m = memoizeReduxState(['a', b'], f) ": {
            'When I call m(state, 2)': t => {
                const m = memoizeReduxState(['a', 'b'], bsWithXHigherThan)

                let actual = m(state, 2)

                t.sameR('Then add should have been called once', count, 1)
                t.sameR('And I should get the result [b2, b3]', actual, [b2, b3])

                actual = m(state, 2)

                t.sameR('And if I call m(state, 2) again, f should still only have been called once', count, 1)
                t.sameR('And I should get the cached result [b2, b3]', actual, [b2, b3])

                actual = m(state, 1)

                t.sameR('And if I call m(state, 1), f should now have been called twice', count, 2)
                t.sameR('And I should get the result [b1, b2, b3]', actual, [b1, b2, b3])

                actual = m(state, 2)

                t.sameR(
                    'And if I call f(state, 2) once again, f should now have been called three times since the previous value was pushed out of the cache',
                    count,
                    3,
                )
                t.sameR('And I should get the result [b2, b3]', actual, [b2, b3])

                state = assocPath(['b', 'b0'], b0, state)
                actual = m(state, 2)

                t.sameR(
                    'And if I add b0 to state and call m(state, 2) again, f should now have been called four times since the state changed',
                    count,
                    4,
                )
                t.sameR('And I should get the result [b2, b3]', actual, [b2, b3])
            },
        },
    },
})
