// ABOUTME: Keymap - a component's keyboard binding registration
// ABOUTME: Priority-based resolution; higher priority keymaps are checked first

import { uniqBy } from '@graffio/functional'
import { Intent } from './intent.js'

export const Keymap = {
    name: 'Keymap',
    kind: 'tagged',
    fields: {
        id: 'String', // Unique identifier (e.g., 'register-123')
        priority: 'Number', // Higher = checked first (100=modal, 50=panel, 10=view, 0=global)
        blocking: 'Boolean?', // If true, unhandled keys are swallowed
        activeWhen: 'Any?', // Optional predicate: (activeViewId) => boolean
        intents: '{Intent:description}', // LookupTable of intents keyed by description
    },
}

// Checks if a keymap should respond based on its activeWhen predicate
// Returns true if no predicate exists or if the predicate returns true for the given view
// @sig Keymap.isActive :: (Keymap, String?) -> Boolean
Keymap.isActive = (keymap, activeViewId) => !keymap.activeWhen || keymap.activeWhen(activeViewId)

// Searches the keymap's intents for one that matches the given key
// @sig Keymap.findMatchingIntent :: (Keymap, String) -> Intent | undefined
Keymap.findMatchingIntent = (keymap, key) => keymap.intents.find(intent => Intent.hasKey(intent, key))

// Resolves a key press within a single keymap
// Returns the matching intent's description and action, { blocked: true } if the keymap blocks, or null
// @sig Keymap.resolveKey :: (Keymap, String, String?) -> { description, action } | { blocked } | null
Keymap.resolveKey = (keymap, key, activeViewId) => {
    if (!Keymap.isActive(keymap, activeViewId)) return null

    const intent = Keymap.findMatchingIntent(keymap, key)
    if (intent) return { description: intent.description, action: intent.action }

    return keymap.blocking ? { blocked: true } : null
}

// @sig Keymap.resolve :: (String, [Keymap], String?) -> { description, action } | { blocked: true } | null
Keymap.resolve = (key, keymaps, activeId) =>
    keymaps.reduce((found, keymap) => found ?? Keymap.resolveKey(keymap, key, activeId), null)

// Gathers all active keybindings across keymaps, stopping at a blocking keymap
// Assumes keymaps are sorted by priority (highest first); first occurrence of each description wins
// @sig Keymap.collectAvailable :: ([Keymap], String?) -> [{ description, keys, from }]
Keymap.collectAvailable = (keymaps, activeId) => {
    const activeKeymaps = keymaps.filter(km => Keymap.isActive(km, activeId))
    const blockingIndex = activeKeymaps.findIndex(km => km.blocking)
    const relevantKeymaps = blockingIndex === -1 ? activeKeymaps : activeKeymaps.slice(0, blockingIndex + 1)

    const allIntents = relevantKeymaps.flatMap(keymap =>
        keymap.intents.map(intent => ({ description: intent.description, keys: intent.keys, from: keymap.id })),
    )

    return uniqBy(intent => intent.description)(allIntents)
}
