// ABOUTME: Keymap - a component's keyboard binding registration
// ABOUTME: Priority-based resolution; higher priority keymaps are checked first

import { Intent } from './intent.type.js'

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

Keymap.isActive = (keymap, activeViewId) => !keymap.activeWhen || keymap.activeWhen(activeViewId)

Keymap.findMatchingIntent = (keymap, key) => keymap.intents.find(intent => Intent.hasKey(intent, key))

Keymap.resolveKey = (keymap, key, activeViewId) => {
    if (!Keymap.isActive(keymap, activeViewId)) return null
    const intent = Keymap.findMatchingIntent(keymap, key)
    if (intent) return { description: intent.description, action: intent.action }
    if (keymap.blocking) return { blocked: true }
    return null
}

Keymap.collectIntents = (keymap, activeViewId, seen) => {
    if (!Keymap.isActive(keymap, activeViewId)) return []
    return keymap.intents
        .filter(intent => !seen.has(intent.description))
        .map(intent => {
            seen.add(intent.description)
            return { description: intent.description, keys: intent.keys, from: keymap.id }
        })
}

// Collection-level operations (operate on [Keymap])

// Finds the first matching intent for a key across all active keymaps
// @sig Keymap.resolve :: (String, [Keymap], String?) -> { description, action } | { blocked: true } | null
Keymap.resolve = (key, keymaps, activeId) =>
    keymaps.reduce((found, keymap) => found ?? Keymap.resolveKey(keymap, key, activeId), null)

// Gathers all active keybindings across keymaps, stopping at a blocking keymap
// @sig Keymap.collectAvailable :: ([Keymap], String?) -> [{ description, keys, from }]
Keymap.collectAvailable = (keymaps, activeId) => {
    const seen = new Set()
    const accumulate = (acc, keymap) => {
        if (acc.blocked) return acc
        const collected = Keymap.collectIntents(keymap, activeId, seen)
        const isBlocking = keymap.blocking && Keymap.isActive(keymap, activeId)
        return { result: acc.result.concat(collected), blocked: isBlocking }
    }
    return keymaps.reduce(accumulate, { result: [], blocked: false }).result
}
