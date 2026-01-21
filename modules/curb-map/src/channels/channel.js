// ABOUTME: Generic channel for module-level component communication
// ABOUTME: Selective re-rendering based on subscribed keys (used by dragStateChannel)
// COMPLEXITY: function-declaration-ordering — createChannel is a factory, not a React component

import { equals, memoizeOnceWithIdenticalParams, pick } from '@graffio/functional'
import { useEffect, useState } from 'react'

const memoizedPick = memoizeOnceWithIdenticalParams(pick)

const F = {
    // Create a selector function from keys parameter
    // @sig createSelector :: (String | [String] | undefined) -> (State -> SelectedState)

    createSelector: keys => {
        if (!keys) return state => state
        // eslint-disable-next-line no-restricted-syntax -- channel state, not Redux state
        if (typeof keys === 'string') return state => state[keys]
        if (Array.isArray(keys)) return state => memoizedPick(keys, state)
        throw new Error('Selector must be undefined, string, or array of strings')
    },

    // Notify subscriber if selected value changed
    // @sig notifyIfChanged :: (Function, Set, State, State) -> void
    notifyIfChanged: (selector, callbacks, oldState, newState) => {
        const oldValue = selector(oldState)
        const newValue = selector(newState)
        if (!equals(oldValue, newValue)) callbacks.forEach(callback => callback(newValue))
    },
}

// Generic module-level communication channel with selective re-rendering
// @sig createChannel :: InitialState -> Channel
const createChannel = initialState => {
    let state = initialState
    const subscribers = new Map()
    const keys = Object.keys(initialState)
    const getState = () => state

    // Updates state and notifies affected subscribers
    // @sig setState :: (State -> State | Object) -> void
    const setState = updater => {
        const oldState = state
        const newState = typeof updater === 'function' ? updater(state) : { ...state, ...updater }
        state = memoizedPick(keys, newState)
        subscribers.forEach((callbacks, selector) => F.notifyIfChanged(selector, callbacks, oldState, state))
    }

    const subscribe = (selector, callback) => {
        if (!subscribers.has(selector)) subscribers.set(selector, new Set())
        subscribers.get(selector).add(callback)
        return () => subscribers.get(selector).delete(callback)
    }

    return { getState, setState, subscribe }
}

// Hook for subscribing / updating a channel
// @sig useChannel :: (Channel, String | [String] | undefined) -> [SelectedState, SetState]
const useChannel = (channel, keys) => {
    const selector = F.createSelector(keys)
    const [state, setState] = useState(() => selector(channel.getState()))

    useEffect(() => (keys ? channel.subscribe(selector, setState) : undefined), [channel, selector, keys])

    return [state, channel.setState]
}

const Channel = { createChannel, useChannel }
export { Channel }
