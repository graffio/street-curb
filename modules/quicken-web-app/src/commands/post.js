// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects

import { store } from '../store/index.js'
import { Action } from '../types/action.js'

/**
 * Post a domain Action to Redux
 * Wraps Tagged action in plain object for Redux compatibility
 *
 * @sig post :: Action -> void
 */
const post = action => {
    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    store.dispatch({ type: action.constructor.toString(), payload: action })
}

export { post }
