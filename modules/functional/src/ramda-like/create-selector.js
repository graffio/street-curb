// ABOUTME: Creates auto-currying selectors for Redux state access
// ABOUTME: Enables both S.foo(state, arg) and S.foo(arg)(state) usage patterns
// COMPLEXITY: Single-function utility module - cohesion groups not applicable

/**
 * Creates a selector that can be called either curried or uncurried.
 * State is always the first parameter in the underlying function.
 *
 * @sig createSelector :: ((State, ...args) -> a) -> (State, ...args) -> a | (...args) -> State -> a
 *
 * @example
 * const selectItem = createSelector((state, id) => state.items[id])
 *
 * // Uncurried - in other selectors, tests, reducers
 * selectItem(state, 'foo')
 *
 * // Curried - with useSelector in components
 * useSelector(selectItem('foo'))
 */
const createSelector =
    fn =>
    (...args) =>
        args.length >= fn.length ? fn(...args) : state => fn(state, ...args)

export default createSelector
