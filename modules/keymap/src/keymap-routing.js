// ABOUTME: Keymap routing — resolves keypresses to actions via ActionRegistry + bindings
// ABOUTME: Generic resolution functions parameterized by bindings and group names

import { ActionRegistry } from './action-registry.js'
import { normalizeKey } from './keymap.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Checks if the element is a text input that should receive keystrokes
    // @sig isInputElement :: Element -> Boolean
    isInputElement: el => {
        const { tagName, isContentEditable } = el
        return tagName === 'INPUT' || tagName === 'TEXTAREA' || isContentEditable
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Gets the active view ID from the tab layout
    // @sig toActiveViewId :: TabLayout -> String?
    toActiveViewId: tabLayout => {
        const activeGroup = tabLayout?.tabGroups?.find(g => g.id === tabLayout.activeTabGroupId)
        return activeGroup?.activeViewId
    },

    // Inverts bindings: { key: actionId } → { actionId: [key1, key2] }
    // @sig toReverseBindings :: Object -> Object
    toReverseBindings: bindings =>
        Object.entries(bindings).reduce((acc, [key, actionId]) => {
            acc[actionId] = [...(acc[actionId] || []), key]
            return acc
        }, {}),

    // Derives group name from action ID prefix
    // @sig toGroupName :: (Object, String) -> String
    toGroupName: (groupNames, actionId) => {
        const prefix = actionId.includes(':') ? actionId.slice(0, actionId.indexOf(':')) : actionId
        return groupNames[prefix] || 'Global'
    },

    // Deduplicates actions by id, keeping first occurrence
    // @sig toUniqueActions :: [{ id }] -> [{ id }]
    toUniqueActions: actions => [...new Map(actions.map(a => [a.id, a])).values()],

    // Maps a registered action to a display intent using reverse bindings and group names
    // @sig toIntent :: (Object, Object) -> { id, description } -> { description, keys, from }
    toIntent:
        (reverseBindings, groupNames) =>
        ({ id, description }) => ({ description, keys: reverseBindings[id], from: T.toGroupName(groupNames, id) }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Creates a keydown handler parameterized by bindings
// @sig handleKeydown :: Object -> (TabLayout, KeyboardEvent) -> void
const handleKeydown = bindings => (tabLayout, event) => {
    if (P.isInputElement(event.target)) return
    const key = normalizeKey(event)
    const activeViewId = T.toActiveViewId(tabLayout)
    const actionId = bindings[key]
    if (!actionId) return
    const action = ActionRegistry.resolve(actionId, activeViewId)
    if (!action) return
    event.preventDefault()
    action.execute()
}

// Collects display intents for KeymapDrawer parameterized by bindings and group names
// @sig toAvailableIntents :: (Object, Object, String?) -> [{ description, keys, from }]
const toAvailableIntents = (bindings, groupNames, activeViewId) => {
    const reverseBindings = T.toReverseBindings(bindings)
    const actions = T.toUniqueActions(ActionRegistry.collectForContext(activeViewId))
    return actions.filter(a => reverseBindings[a.id]).map(T.toIntent(reverseBindings, groupNames))
}

const KeymapRouting = { handleKeydown, toAvailableIntents }
export { KeymapRouting }
