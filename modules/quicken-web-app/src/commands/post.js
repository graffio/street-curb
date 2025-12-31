// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles IndexedDB persistence for table layouts (debounced) and tab layout

import { debounce } from '@graffio/functional'
import { set } from '../services/storage.js'
import { currentStore, Selectors as S } from '../store/index.js'
import { Action } from '../types/action.js'

const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'
const TABLE_LAYOUT_PERSIST_DELAY_MS = 500

// COMPLEXITY: Side-effect functions (persist*, handle*) don't fit P/T/F/V/A cohesion patterns

// Writes table layouts to IndexedDB (fire-and-forget)
// @sig persistTableLayouts :: () -> ()
const persistTableLayouts = () => set(TABLE_LAYOUTS_KEY, S.tableLayouts(currentStore().getState()))

// Module-level debounced function preserves timeout state across post() calls
// @sig debouncedPersistTableLayouts :: () -> ()
const debouncedPersistTableLayouts = debounce(TABLE_LAYOUT_PERSIST_DELAY_MS, persistTableLayouts)

// @sig post :: Action -> void
const post = action => {
    // @sig dispatch :: Action -> ()
    const dispatch = a => currentStore().dispatch({ type: a.constructor.toString(), action: a })

    // Writes tab layout to IndexedDB (fire-and-forget)
    // @sig persistTabLayout :: () -> ()
    const persistTabLayout = () => {
        const tabLayout = S.tabLayout(currentStore().getState())
        if (tabLayout) set(TAB_LAYOUT_KEY, tabLayout)
    }

    // Dispatches and persists table layout (debounced)
    // @sig handleSetTableLayout :: () -> ()
    const handleSetTableLayout = () => {
        dispatch(action)
        debouncedPersistTableLayouts()
    }

    // Dispatches and persists tab layout (immediate)
    // @sig handleTabLayoutAction :: () -> ()
    const handleTabLayoutAction = () => {
        dispatch(action)
        persistTabLayout()
    }

    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // prettier-ignore
    action.match({
        LoadFile               : () => dispatch(action),
        SetTransactionFilter   : () => dispatch(action),
        ResetTransactionFilters: () => dispatch(action),
        SetTableLayout         : handleSetTableLayout,

        // Tab layout actions (all persist to IndexedDB)
        OpenView          : handleTabLayoutAction,
        CloseView         : handleTabLayoutAction,
        MoveView          : handleTabLayoutAction,
        CreateTabGroup    : handleTabLayoutAction,
        CloseTabGroup     : handleTabLayoutAction,
        SetActiveView     : handleTabLayoutAction,
        SetActiveTabGroup : handleTabLayoutAction,
        SetTabGroupWidth  : handleTabLayoutAction,
    })
}

export { post }
