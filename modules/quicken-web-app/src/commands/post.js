// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles localStorage persistence for table layouts (debounced) and tab layout

import { debounce } from '@graffio/functional'
import { Selectors as S, store } from '../store/index.js'
import { Action } from '../types/action.js'

const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'
const TABLE_LAYOUT_PERSIST_DELAY_MS = 500

// Writes table layouts to localStorage
// @sig writeTableLayouts :: () -> ()
const writeTableLayouts = () => {
    try {
        window.localStorage.setItem(TABLE_LAYOUTS_KEY, JSON.stringify(S.tableLayouts(store.getState())))
    } catch {
        console.warn('Failed to write tableLayouts to localStorage')
    }
}

// Module-level debounced function preserves timeout state across post() calls
// @sig debouncedWriteTableLayouts :: () -> ()
const debouncedWriteTableLayouts = debounce(TABLE_LAYOUT_PERSIST_DELAY_MS, writeTableLayouts)

// @sig post :: Action -> void
const post = action => {
    // @sig dispatch :: Action -> ()
    const dispatch = a => store.dispatch({ type: a.constructor.toString(), action: a })

    // Writes tab layout to localStorage
    // @sig writeTabLayout :: () -> ()
    const writeTabLayout = () => {
        try {
            const tabLayout = S.tabLayout(store.getState())
            if (tabLayout) window.localStorage.setItem(TAB_LAYOUT_KEY, JSON.stringify(tabLayout))
        } catch {
            console.warn('Failed to write tabLayout to localStorage')
        }
    }

    // Dispatches and persists table layout (debounced)
    // @sig handleSetTableLayout :: () -> ()
    const handleSetTableLayout = () => {
        dispatch(action)
        debouncedWriteTableLayouts()
    }

    // Dispatches and persists tab layout (immediate)
    // @sig handleTabLayoutAction :: () -> ()
    const handleTabLayoutAction = () => {
        dispatch(action)
        writeTabLayout()
    }

    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // prettier-ignore
    action.match({
        LoadFile               : () => dispatch(action),
        SetTransactionFilter   : () => dispatch(action),
        ResetTransactionFilters: () => dispatch(action),
        SetTableLayout         : handleSetTableLayout,

        // Tab layout actions (all persist to localStorage)
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
