// ABOUTME: Memoization utilities for Redux selectors
// ABOUTME: Caches selector results based on relevant state keys to avoid recomputation

import pick from './pick.js'

/*
 * Memoize a Redux selector based on specific state keys.
 * Only recomputes when relevant state keys or args change.
 *
 * Example:
 *     const geometriesForSelectedCanvas = memoizeReduxState(
 *         ['selectedCanvas', 'showArchivedGeometries', 'geometries'],
 *         _geometriesForSelectedCanvas
 *     )
 *
 * As a special case, if keys is an empty array, the entire state must match.
 *
 * Note: Uses for-loops intentionally for performance in this hot code path.
 *
 * @sig memoizeReduxState :: ([String], (State, ...args) -> a) -> (State, ...args) -> a
 */

const memoizeReduxState = (keys, f) => {
    // Checks whether relevant state keys still match the previous invocation
    // @sig stateMatches :: State -> Boolean
    const stateMatches = state => {
        if (keys.length === 0) return state === previousState
        // eslint-disable-next-line no-restricted-syntax -- memoizer must access state directly
        return keys.every(key => state[key] === previousState[key])
    }

    let previousState = {}
    let previousArgsStringified
    let previousValue

    // Returns cached result when state keys and args are unchanged
    // @sig memoizedSelector :: (State, ...args) -> a
    return (state, ...args) => {
        const newArgsStringified = JSON.stringify(args)
        if (stateMatches(state) && newArgsStringified === previousArgsStringified) return previousValue

        previousState = pick(keys, state)
        previousArgsStringified = newArgsStringified
        previousValue = f(state, ...args)
        return previousValue
    }
}

/*
 * Memoize a selector that depends on both global state AND per-key state within a LookupTable.
 *
 * Problem: A selector like `filteredTransactions(state, viewId)` depends on:
 *   - Global state: `transactions`, `categories` (shared across all views)
 *   - Per-view state: `transactionFilters.get(viewId)` (unique to each view)
 *
 * Standard memoization fails here because:
 *   - Single-value cache: switching views thrashes the cache, recomputing on every switch
 *   - Checking entire `transactionFilters`: changing view B's filters invalidates view A's cache
 *
 * This function maintains a separate cache entry per key (e.g., per viewId). Each entry
 * is invalidated only when:
 *   1. Any global state key changes (e.g., `transactions` or `categories`), OR
 *   2. The keyed state for THAT SPECIFIC key changes (e.g., `transactionFilters.get(viewId)`)
 *
 * Changing view B's filters does NOT invalidate view A's cached result.
 *
 * When multiple callers share the same (key, keyedValue) but pass different ...rest args,
 * the memoizer disambiguates lazily — rest args are only serialized when the cheap
 * keyedValue check passes, avoiding expensive JSON.stringify on every call.
 *
 * Example:
 *     const filteredTransactions = memoizeReduxStatePerKey(
 *         ['transactions', 'categories'],
 *         'transactionFilters',
 *         computeFilteredTransactions
 *     )
 *     // filteredTransactions(state, 'view_1') - caches under 'view_1'
 *     // filteredTransactions(state, 'view_2') - caches under 'view_2', doesn't invalidate 'view_1'
 *
 * @sig memoizeReduxStatePerKey :: ([String], String, (State, Key, ...args) -> a) -> (State, Key, ...args) -> a
 */
const memoizeReduxStatePerKey = (globalKeys, keyedStateKey, f) => {
    // Checks whether any global state key has a new reference
    // @sig globalStateChanged :: State -> Boolean
    const globalStateChanged = state =>
        // eslint-disable-next-line no-restricted-syntax -- memoizer must access state directly
        globalKeys.some(key => state[key] !== previousGlobalState[key])

    const cacheByKey = new Map()
    let previousGlobalState = {}

    // Returns cached result per key when global state, keyed state, and rest args match
    // @sig memoizedSelector :: (State, Key, ...args) -> a
    return (state, key, ...rest) => {
        // eslint-disable-next-line no-restricted-syntax -- memoizer must access state directly
        const keyedState = state[keyedStateKey]
        const keyedValue = keyedState?.get ? keyedState.get(key) : keyedState?.[key]

        if (globalStateChanged(state)) {
            cacheByKey.clear()
            previousGlobalState = pick(globalKeys, state)
        }

        const cached = cacheByKey.get(key)
        const { keyedValue: cachedKeyed, restStringified: cachedRest, value: cachedValue } = cached || {}

        // Lazy rest-arg stringify: only serialize when cheap keyedValue check passes
        const cheapHit = cached && cachedKeyed === keyedValue
        const restMatch = cheapHit && (rest.length > 0 ? JSON.stringify(rest) : '') === cachedRest
        if (restMatch) return cachedValue

        const value = f(state, key, ...rest)
        const restStringified = rest.length > 0 ? JSON.stringify(rest) : ''
        cacheByKey.set(key, { keyedValue, restStringified, value })
        return value
    }
}

const MemoizeReduxState = { memoizeReduxState, memoizeReduxStatePerKey }

export { MemoizeReduxState }
