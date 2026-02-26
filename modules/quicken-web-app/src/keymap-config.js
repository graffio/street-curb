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
    s                 : 'search:open',
    n                 : 'search:next',
    'shift+Enter'     : 'search:prev',
    'shift+s'         : 'search:clear',
    'ctrl+shift+x'    : 'transfer:navigate',
    o                 : 'file:open',
    w                 : 'tab:close',
    '\\'              : 'tab:split',
}

const GROUP_NAMES = {
    navigate: 'Navigation',
    filter: 'Filters',
    search: 'Search',
    date: 'Date',
    dismiss: 'Search',
    select: 'Navigation',
    transfer: 'Transfer',
    file: 'File',
    tab: 'Tabs',
}

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
