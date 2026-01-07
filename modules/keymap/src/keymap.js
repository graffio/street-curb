// ABOUTME: Key normalization utility for keyboard events
// ABOUTME: Converts KeyboardEvent to normalized key string with modifiers

const P = {
    // Special keys that should not be lowercased
    isSpecialKey: key => key.length > 1,
}

// Converts a KeyboardEvent to a normalized key string with modifiers in alphabetical order
// @sig normalizeKey :: KeyboardEvent -> String
const normalizeKey = event => {
    const { altKey, metaKey, ctrlKey, shiftKey, key } = event
    const modifiers = []
    if (altKey) modifiers.push('alt')
    if (metaKey) modifiers.push('cmd')
    if (ctrlKey) modifiers.push('ctrl')
    if (shiftKey) modifiers.push('shift')

    const normalizedKey = P.isSpecialKey(key) ? key : key.toLowerCase()
    return modifiers.length > 0 ? `${modifiers.join('+')}+${normalizedKey}` : normalizedKey
}

export { normalizeKey }
