// ABOUTME: App-specific keyboard binding configuration
// ABOUTME: Maps physical keys to action IDs and action prefixes to display group names

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

const KeymapConfig = { DEFAULT_BINDINGS, GROUP_NAMES }
export { KeymapConfig }
