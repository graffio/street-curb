/*
 * A "channel" is variation on a React context, that allows components to communicate with each other.
 * A channel wraps an object o and a component can:
 *
 * - create the channel along with an initial value of o
 * - subscribe to changes to fields of o
 * - update fields of o
 *
 * A component which has subscribed to a field will be rerendered using the normal "hook" mechanism.
 * Changes to other fields have no effect. This is different from using a context, where each component
 * would be rerendered whenever ANY field of o changed.
 */

import { useEffect, useState } from 'react'
import equals from '../../../functional/src/ramda-like/equals.js'
import memoizeOnceWithIdenticalParams from '../../../functional/src/ramda-like/memoize-once-with-identical-params.js'
import pick from '../../../functional/src/ramda-like/pick.js'

// Memoized pick - returns same object reference for same inputs
const memoizedPick = memoizeOnceWithIdenticalParams(pick)

/**
 * Create a selector function from keys parameter
 * @sig _createSelector :: (String | [String] | undefined) -> (State -> SelectedState)
 */
const _createSelector = keys => {
    if (!keys) return state => state // No keys = full state
    if (typeof keys === 'string') return state => state[keys] // Single key
    if (Array.isArray(keys)) return state => memoizedPick(keys, state) // Multiple keys using memoized pick
    throw new Error('Selector must be undefined, string, or array of strings')
}

/**
 * Generic module-level communication channel with selective re-rendering
 * Avoids prop drilling and React Context performance issues
 * @sig createChannel :: (InitialState) -> Channel
 */
const createChannel = initialState => {
    const getState = () => state

    const setState = updater => {
        const oldState = state
        const newState = typeof updater === 'function' ? updater(state) : { ...state, ...updater }

        // Only keep properties that exist in initial state (defensive)
        // that is, if updater sets a new key 'x' then DON'T set 'x' in the state because it wasn't there originally
        state = memoizedPick(Object.keys(initialState), newState)

        /* Notify only subscribers whose selected data changed
         *
         * The selector is a function that returns a subset of the object's state (it was generated from the keys
         * the caller said it was "interested in" in useChannel)
         *
         * If the result of the selector is not identical to last time, it must be because one of the
         * interesting values has changed
         */
        subscribers.forEach((callbacks, selector) => {
            const oldValue = selector(oldState)
            const newValue = selector(state)

            // Use deep equality check to handle objects returned by pick
            if (!equals(oldValue, newValue)) callbacks.forEach(callback => callback(newValue))
        })
    }

    const subscribe = (selector, callback) => {
        if (!subscribers.has(selector)) subscribers.set(selector, new Set())
        subscribers.get(selector).add(callback)

        // Return unsubscribe function
        return () => subscribers.get(selector).delete(callback)
    }

    let state = initialState
    const subscribers = new Map() // selector -> Set of callbacks
    return { getState, setState, subscribe }
}

/**
 * Hook for subscribing / updating a channel
 *
 * If no keys were specified, the component only wants write access, no subscriptions
 *
 * Examples:
 *
 *  useChannel(channel)                        -> [fullState,         setState] - for write access
 *  useChannel(channel, 'title')               -> [titleValue,        setState] - single property
 *  useChannel(channel, ['title', 'subtitle']) -> [{title, subtitle}, setState] - multiple properties
 *
 * @sig useChannel :: (Channel, String | [String] | undefined) -> [SelectedState, SetState]
 *  SelectedState = Any
 */
const useChannel = (channel, keys) => {
    const selector = _createSelector(keys)
    const [state, setState] = useState(() => selector(channel.getState()))

    // Subscribe to changes iff keys were specified
    useEffect(() => {
        if (keys) return channel.subscribe(selector, setState) // call to subscribe returns an unsubscriber
    }, [channel, selector, keys])

    return [state, channel.setState]
}

export {
    createChannel,
    useChannel,

    // for tests only
    _createSelector,
}
