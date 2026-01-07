// ABOUTME: Intent - a named keyboard action with its trigger keys
// ABOUTME: Used by the keymap system to map keys to actions (translations or handlers)

export const Intent = {
    name: 'Intent',
    kind: 'tagged',
    fields: {
        description: 'String', // Human-readable label (e.g., 'Move down')
        keys: '[String]', // Normalized keys that trigger this (e.g., ['j', 'ArrowDown'])
        action: 'Any', // String (key translation) or Function (handler)
    },
}

Intent.hasKey = (intent, key) => intent.keys.includes(key)
