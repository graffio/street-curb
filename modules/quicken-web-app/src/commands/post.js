// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles localStorage persistence for table layouts

import { Selectors as S, store } from '../store/index.js'
import { Action } from '../types/action.js'

const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'

// @sig dispatch :: Action -> ()
const dispatch = action => store.dispatch({ type: action.constructor.toString(), action })

// @sig handleSetTableLayout :: Action.SetTableLayout -> ()
const handleSetTableLayout = action => {
    dispatch(action)

    try {
        window.localStorage.setItem(TABLE_LAYOUTS_KEY, JSON.stringify(S.tableLayouts(store.getState())))
    } catch {
        console.warn('Failed to write tableLayouts to localStorage')
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Tab layout localStorage persistence
// ---------------------------------------------------------------------------------------------------------------------

// @sig persistTabLayout :: () -> ()
const persistTabLayout = () => {
    try {
        const tabLayout = S.tabLayout(store.getState())
        if (tabLayout) window.localStorage.setItem(TAB_LAYOUT_KEY, JSON.stringify(tabLayout))
    } catch {
        console.warn('Failed to write tabLayout to localStorage')
    }
}

// @sig handleTabLayoutAction :: Action -> ()
const handleTabLayoutAction = action => {
    dispatch(action)
    persistTabLayout()
}

// @sig post :: Action -> void
const post = action => {
    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // prettier-ignore
    action.match({
        LoadFile               : () => dispatch(action),
        SetTransactionFilter   : () => dispatch(action),
        ResetTransactionFilters: () => dispatch(action),
        SetTableLayout         : () => handleSetTableLayout(action),

        // Tab layout actions (all persist to localStorage)
        OpenView          : () => handleTabLayoutAction(action),
        CloseView         : () => handleTabLayoutAction(action),
        MoveView          : () => handleTabLayoutAction(action),
        CreateTabGroup    : () => handleTabLayoutAction(action),
        CloseTabGroup     : () => handleTabLayoutAction(action),
        SetActiveView     : () => handleTabLayoutAction(action),
        SetActiveTabGroup : () => handleTabLayoutAction(action),
        SetTabGroupWidth  : () => handleTabLayoutAction(action),
    })
}

export { post }
