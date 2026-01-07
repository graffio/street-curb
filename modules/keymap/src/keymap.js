// ABOUTME: Key normalization utility for keyboard events
// ABOUTME: Converts KeyboardEvent to normalized key string with modifiers

const P = {
    // Special keys that should not be lowercased
    // @sig isSpecialKey :: String -> Boolean
    isSpecialKey: key => key.length > 1,

    // Checks if key is a letter (where shift changes case)
    // @sig isLetter :: String -> Boolean
    isLetter: key => key.length === 1 && /[a-zA-Z]/.test(key),
}

// Converts a KeyboardEvent to a normalized key string with modifiers in alphabetical order
// @sig normalizeKey :: KeyboardEvent -> String
const normalizeKey = event => {
    const { altKey, metaKey, ctrlKey, shiftKey, key } = event
    const modifiers = []
    if (altKey) modifiers.push('alt')
    if (metaKey) modifiers.push('cmd')
    if (ctrlKey) modifiers.push('ctrl')

    // Only add shift for letters (where it changes case) and special keys, not for symbols like ? ! @
    if (shiftKey && (P.isLetter(key) || P.isSpecialKey(key))) modifiers.push('shift')

    const normalizedKey = P.isSpecialKey(key) ? key : key.toLowerCase()
    return modifiers.length > 0 ? `${modifiers.join('+')}+${normalizedKey}` : normalizedKey
}

export { normalizeKey }
