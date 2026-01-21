// ABOUTME: Keymap-related selectors for keyboard shortcut handling
// ABOUTME: Computes available intents based on active view and registered keymaps

import { memoizeOnceWithIdenticalParams } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { activeViewId, keymaps } from './index.js'

const { Keymap } = KeymapModule

const T = {
    // Memoized intent collection to avoid returning new array references
    // @sig toAvailableIntents :: ([Keymap], String) -> [Intent]
    toAvailableIntents: memoizeOnceWithIdenticalParams((maps, viewId) => Keymap.collectAvailable(maps, viewId)),
}

// Collects available keyboard intents for the current view
// @sig availableIntents :: State -> [Intent]
const availableIntents = state => {
    const viewId = activeViewId(state)
    const maps = keymaps(state)
    return T.toAvailableIntents(maps, viewId)
}

const Keymaps = { availableIntents }

export { Keymaps }
