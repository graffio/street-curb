// ABOUTME: Global keymap routing service
// ABOUTME: Resolves keypresses to actions via ActionRegistry + DEFAULT_BINDINGS

import { KeymapModule } from '@graffio/keymap'

const { ActionRegistry, normalizeKey } = KeymapModule

// prettier-ignore
const DEFAULT_BINDINGS = {
    ArrowDown : 'navigate:down',
    ArrowUp   : 'navigate:up',
    j         : 'navigate:down',
    k         : 'navigate:up',
    Escape    : 'dismiss',
    Enter     : 'select',
    '?'       : 'toggle-shortcuts',
    ArrowLeft : 'navigate:left',
    ArrowRight: 'navigate:right',
    t         : 'date:today',
    '['       : 'date:decrement-day',
    ']'       : 'date:increment-day',
    Tab       : 'navigate:next-apply',
    a         : 'filter:accounts',
    c         : 'filter:categories',
    d         : 'filter:date',
    x         : 'filter:actions',
    h         : 'filter:securities',
    g         : 'filter:group-by',
    f         : 'filter:search',
    '/'       : 'filter:search',
    s             : 'search:open',
    'shift+Enter' : 'search:prev',
}

const GROUP_NAMES = {
    navigate: 'Navigation',
    filter: 'Filters',
    search: 'Search',
    date: 'Date',
    dismiss: 'Search',
    select: 'Navigation',
}

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

    // Inverts DEFAULT_BINDINGS: { key: actionId } → { actionId: [key1, key2] }
    // @sig toReverseBindings :: () -> { [actionId]: [String] }
    toReverseBindings: () =>
        Object.entries(DEFAULT_BINDINGS).reduce((acc, [key, actionId]) => {
            acc[actionId] = [...(acc[actionId] || []), key]
            return acc
        }, {}),

    // Derives group name from action ID prefix
    // @sig toGroupName :: String -> String
    toGroupName: actionId => {
        const prefix = actionId.includes(':') ? actionId.slice(0, actionId.indexOf(':')) : actionId
        return GROUP_NAMES[prefix] || 'Global'
    },

    // Deduplicates actions by id, keeping first occurrence
    // @sig toUniqueActions :: [{ id }] -> [{ id }]
    toUniqueActions: actions => [...new Map(actions.map(a => [a.id, a])).values()],

    // Maps a registered action to a display intent using reverse bindings
    // @sig toIntent :: { [actionId]: [String] } -> { id, description } -> { description, keys, from }
    toIntent:
        reverseBindings =>
        ({ id, description }) => ({ description, keys: reverseBindings[id], from: T.toGroupName(id) }),

    // Collects display intents for KeymapDrawer from ActionRegistry + DEFAULT_BINDINGS
    // @sig toAvailableIntents :: String|null -> [{ description, keys, from }]
    toAvailableIntents: activeViewId => {
        const reverseBindings = T.toReverseBindings()
        const actions = T.toUniqueActions(ActionRegistry.collectForContext(activeViewId))
        return actions.filter(a => reverseBindings[a.id]).map(T.toIntent(reverseBindings))
    },
}

const E = {
    // Creates keydown listener effect for global keyboard handling
    // @sig keydownEffect :: (KeyboardEvent -> void) -> () -> () -> void
    keydownEffect: handler => () => {
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    },

    // Handles keydown events — resolves via ActionRegistry with DEFAULT_BINDINGS
    // @sig handleKeydown :: TabLayout -> KeyboardEvent -> void
    handleKeydown: tabLayout => event => {
        if (P.isInputElement(event.target)) return

        const key = normalizeKey(event)
        const activeViewId = T.toActiveViewId(tabLayout)
        const actionId = DEFAULT_BINDINGS[key]
        if (!actionId) return

        const action = ActionRegistry.resolve(actionId, activeViewId)
        if (!action) return

        event.preventDefault()
        action.execute()
    },

    // Collects display intents for KeymapDrawer
    // @sig collectAvailableIntents :: String|null -> [{ description, keys, from }]
    collectAvailableIntents: T.toAvailableIntents,
}

export { E as KeymapRouting }
