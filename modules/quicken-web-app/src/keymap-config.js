// ABOUTME: App-specific keyboard binding configuration and key routing utilities
// ABOUTME: Maps physical keys to action IDs and provides content-level key handler factory

import { KeymapModule } from '@graffio/keymap'

const { ActionRegistry, normalizeKey } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const GROUPS = {
    Accounts: {
        'shift+a'     : 'account:picker',
    },

    Date: {
        '['           : 'date:decrement-day',
        ']'           : 'date:increment-day',
        t             : 'date:today',
    },

    File: {
        o             : 'file:open',
        'shift+o'     : 'file:open-new',
        'shift+r'     : 'file:reopen',
    },

    Filters: {
        a             : 'filter:accounts',
        x             : 'filter:actions',
        c             : 'filter:categories',
        d             : 'filter:date',
        g             : 'filter:group-by',
        '/'           : 'filter:search',
        f             : 'filter:search',
        h             : 'filter:securities',
    },

    Global: {
        Escape        : 'dismiss',
        '?'           : 'toggle-shortcuts',
    },

    Navigation: {
        ArrowDown     : 'navigate:down',
        'ctrl+j'      : 'navigate:down',
        j             : 'navigate:down',
        ArrowLeft     : 'navigate:left',
        Tab           : 'navigate:next-apply',
        ArrowRight    : 'navigate:right',
        ArrowUp       : 'navigate:up',
        'ctrl+k'      : 'navigate:up',
        k             : 'navigate:up',
        Enter         : 'select',
        ' '           : 'row:toggle-expand',
    },

    Reports: {
        r             : 'report:picker',
    },

    Search: {
        'shift+s'     : 'search:clear',
        n             : 'search:next',
        s             : 'search:open',
        'shift+Enter' : 'search:prev',
    },

    Tabs: {
        w             : 'tab:close',
        'ctrl+h'      : 'tab:cycle-left',
        'ctrl+l'      : 'tab:cycle-right',
        'ctrl+shift+h': 'tab:move-left',
        'ctrl+shift+l': 'tab:move-right',
        'shift+t'     : 'tab:picker',
    },

    Transfer: {
        'ctrl+shift+x': 'transfer:navigate',
    },
}

const DEFAULT_BINDINGS = Object.assign({}, ...Object.values(GROUPS))

const GROUP_NAMES = Object.fromEntries(
    Object.entries(GROUPS).flatMap(([name, bindings]) => {
        const prefixes = [...new Set(Object.values(bindings).map(id => id.split(':')[0]))]
        return prefixes.map(p => [p, name])
    }),
)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Routes key events through DEFAULT_BINDINGS → ActionRegistry for a given context
// Context getter is called at event time so module-level state stays fresh
// @sig createContentKeyHandler :: (() -> String?) -> (KeyboardEvent -> void)
const createContentKeyHandler = getContext => e => {
    e.stopPropagation()
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    const actionId = DEFAULT_BINDINGS[normalizeKey(e)]
    if (!actionId) return
    const action = ActionRegistry.resolve(actionId, getContext())
    if (!action) return
    e.preventDefault()
    action.execute()
}

const KeymapConfig = { DEFAULT_BINDINGS, GROUP_NAMES, createContentKeyHandler }
export { KeymapConfig }
