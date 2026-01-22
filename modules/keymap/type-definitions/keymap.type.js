// ABOUTME: Keymap - a component's keyboard binding registration
// ABOUTME: Priority-based resolution; higher priority keymaps are checked first

import { Intent } from './intent.js'

export const Keymap = {
    name: 'Keymap',
    kind: 'tagged',
    fields: {
        id: 'String', // Unique identifier for unregistration (e.g., 'reg_acc_123')
        name: 'String', // Display name for UI (e.g., 'Register', 'Global')
        priority: 'Number', // Higher = checked first (100=modal, 50=panel, 10=view, 0=global)
        blocking: 'Boolean?', // If true, unhandled keys are swallowed
        activeForViewId: 'String?', // If set, keymap only active when this viewId is current
        intents: '{Intent:description}', // LookupTable of intents keyed by description
    },
}

// Checks if a keymap should respond based on activeForViewId
// Returns true if no viewId restriction or if activeViewId matches
// @sig Keymap.isActive :: (Keymap, String?) -> Boolean
Keymap.isActive = (keymap, activeViewId) => !keymap.activeForViewId || keymap.activeForViewId === activeViewId

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

// Resolves a key press across all keymaps, returning the first match or block
// @sig Keymap.resolve :: (String, [Keymap], String?) -> { description, action } | { blocked: true } | null
Keymap.resolve = (key, keymaps, activeId) =>
    keymaps.reduce((found, keymap) => found ?? Keymap.resolveKey(keymap, key, activeId), null)

// Gathers all active keybindings across keymaps, stopping at a blocking keymap
// Assumes keymaps are sorted by priority (highest first); merges keys for intents with same description
// @sig Keymap.collectAvailable :: ([Keymap], String?) -> [{ description, keys, from }]
Keymap.collectAvailable = (keymaps, activeId) => {
    const activeKeymaps = keymaps.filter(km => Keymap.isActive(km, activeId))
    const blockingIndex = activeKeymaps.findIndex(km => km.blocking)
    const relevantKeymaps = blockingIndex === -1 ? activeKeymaps : activeKeymaps.slice(0, blockingIndex + 1)

    const allIntents = relevantKeymaps.flatMap(keymap =>
        keymap.intents.map(intent => ({ description: intent.description, keys: intent.keys, from: keymap.name })),
    )

    // Merge intents with same description, combining their keys
    return allIntents.reduce((acc, intent) => {
        const existing = acc.find(i => i.description === intent.description)
        if (existing) existing.keys = [...existing.keys, ...intent.keys]
        else acc.push({ ...intent })
        return acc
    }, [])
}
