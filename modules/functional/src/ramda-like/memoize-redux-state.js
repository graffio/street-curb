/*
 * Given function an array of keys and a Redux selector f, of the form (state, ...args) return a new function
 * that will call f with the same arguments, but only if the state or args have changed.
 *
 * The state has changed if any state[key] is not the same as the previous state[key] for any key in keys.
 * The args have changed if JSON.stringify(args) is not the same as the previously
 *
 * Example:
 *
 *  // It's expensive to call _geometriesForSelectedCanvas, and it changes "rarely" and each call with the same
 *  // inputs will return a *different* array filled with the same Geometries, so memoize!
 *  const geometriesForSelectedCanvas = memoizeReduxState(
 *      ['selectedCanvas', 'showArchivedGeometries', 'geometries'],
 *      _geometriesForSelectedCanvas
 *  )
 *
 * geometriesForSelectedCanvas(state) calls _geometriesForSelectedCanvas only if any of the following have changed:
 *
 * As a special case, if keys is an empty array, the entire state has to match
 *
 * - state.selectedCanvas
 * - state.showArchivedGeometries
 * - state.geometries
 */

import pick from './pick.js'

const memoizeReduxState = (keys, f) => {
    let previousState = {}
    let previousArgsStringified
    let previousValue

    const stateMatches = state => {
        // special case: match ENTIRE state
        if (keys.length === 0) return state === previousState

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            if (state[key] !== previousState[key]) return false
        }
        return true
    }

    return (state, ...args) => {
        const newArgsStringified = JSON.stringify(args)
        const cantUsedMemoized = !stateMatches(state) || newArgsStringified !== previousArgsStringified

        if (cantUsedMemoized) {
            previousState = pick(keys, state)
            previousArgsStringified = newArgsStringified
            previousValue = f(state, ...args)
        }

        return previousValue
    }
}

export default memoizeReduxState
