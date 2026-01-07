// ABOUTME: Global keymap routing service
// ABOUTME: Resolves keypresses to actions using registered keymaps

import { KeymapModule } from '@graffio/keymap'

const { Keymap, normalizeKey } = KeymapModule

const P = {
    // Checks if the element is a text input that should receive keystrokes
    // @sig isInputElement :: Element -> Boolean
    isInputElement: el => {
        const { tagName, isContentEditable } = el
        return tagName === 'INPUT' || tagName === 'TEXTAREA' || isContentEditable
    },
}

const T = {
    // Gets the active view ID from the tab layout
    // @sig toActiveViewId :: TabLayout -> String | null
    toActiveViewId: tabLayout => {
        const activeGroup = tabLayout?.tabGroups?.find(g => g.id === tabLayout.activeTabGroupId)
        return activeGroup?.activeViewId ?? null
    },

    // Sorts keymaps by priority descending
    // @sig toSortedKeymaps :: [Keymap] -> [Keymap]
    toSortedKeymaps: keymaps => [...keymaps].sort((a, b) => b.priority - a.priority),
}

const E = {
    // Executes a resolved keymap action (function call or key translation)
    // @sig executeAction :: (Any, EventTarget) -> void
    executeAction: (action, target) => {
        if (typeof action === 'function') return action()
        if (typeof action === 'string') {
            const syntheticEvent = new window.KeyboardEvent('keydown', { key: action, bubbles: true })
            target.dispatchEvent(syntheticEvent)
        }
    },

    // Creates keydown listener effect for global keyboard handling
    // @sig keydownEffect :: (KeyboardEvent -> void) -> () -> () -> void
    keydownEffect: handler => () => {
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    },

    // Handles keydown events by resolving keymaps and executing actions
    // @sig handleKeydown :: ([Keymap], TabLayout) -> KeyboardEvent -> void
    handleKeydown: (keymaps, tabLayout) => event => {
        if (P.isInputElement(event.target)) return

        const key = normalizeKey(event)
        const activeViewId = T.toActiveViewId(tabLayout)
        const sortedKeymaps = T.toSortedKeymaps(keymaps)
        const result = Keymap.resolve(key, sortedKeymaps, activeViewId)

        if (!result) return
        if (result.blocked) return event.preventDefault()

        event.preventDefault()
        E.executeAction(result.action, event.target)
    },
}

export { E as KeymapRouting }
