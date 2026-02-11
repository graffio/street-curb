// ABOUTME: Public API for @graffio/keymap
// ABOUTME: Exports ActionRegistry, normalizeKey, and formatKey utilities

import { ActionRegistry } from './action-registry.js'
import { normalizeKey } from './keymap.js'

const KEY_SYMBOLS = {
    ArrowDown: '↓',
    ArrowUp: '↑',
    ArrowLeft: '←',
    ArrowRight: '→',
    Delete: 'Del',
    Backspace: '⌫',
    Escape: 'Esc',
    Enter: '↵',
    Tab: '⇥',
    ' ': 'Space',
}

const MODIFIER_SYMBOLS = { cmd: '⌘', ctrl: 'Ctrl+', alt: 'Alt+', shift: '⇧' }

const T = {
    // Formats a single key for display with symbols
    // @sig formatKey :: String -> String
    formatKey: key => {
        if (KEY_SYMBOLS[key]) return KEY_SYMBOLS[key]

        const parts = key.split('+')
        if (parts.length === 1) return key.length === 1 ? key.toUpperCase() : key

        const modifiers = parts.slice(0, -1)
        const baseKey = parts[parts.length - 1]
        const formattedMods = modifiers.map(m => MODIFIER_SYMBOLS[m] || `${m}+`).join('')
        const formattedKey = KEY_SYMBOLS[baseKey] || (baseKey.length === 1 ? baseKey.toUpperCase() : baseKey)
        return formattedMods + formattedKey
    },

    // Formats an array of keys joined with comma
    // @sig formatKeys :: [String] -> String
    formatKeys: keys => keys.map(T.formatKey).join(', '),
}

const KeymapModule = { ActionRegistry, normalizeKey, formatKey: T.formatKey, formatKeys: T.formatKeys }

export { KeymapModule }
