// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles IndexedDB persistence for table layouts (debounced) and tab layout
// COMPLEXITY: export-structure — post is a function, not a namespace; lowercase matches usage pattern

import { debounce } from '@graffio/functional'
import { currentStore, Selectors as S } from '../store/index.js'
import { Action } from '../types/action.js'
import { IndexedDbStorage } from './data-sources/indexed-db-storage.js'
import { handleInitializeSystem } from './handlers/handle-initialize-system.js'
import { handleOpenFile } from './handlers/handle-open-file.js'
import { handleReopenFile } from './handlers/handle-reopen-file.js'

const TABLE_LAYOUT_PERSIST_DELAY_MS = 500

// COMPLEXITY: cohesion-structure — side-effect functions (persist*, handle*) don't fit P/T/F/V/A groups

// Writes table layouts to IndexedDB (fire-and-forget)
// @sig persistTableLayouts :: () -> ()
const persistTableLayouts = () => IndexedDbStorage.persistTableLayouts(S.tableLayouts(currentStore().getState()))

// Module-level debounced function preserves timeout state across post() calls
// @sig debouncedPersistTableLayouts :: () -> ()
const debouncedPersistTableLayouts = debounce(TABLE_LAYOUT_PERSIST_DELAY_MS, persistTableLayouts)

// Dispatches an Action to Redux and handles persistence side effects
// @sig post :: Action -> void
const post = action => {
    // Sends action to Redux store with type string for devtools
    // @sig dispatch :: Action -> ()
    const dispatch = a => currentStore().dispatch({ type: a.constructor.toString(), action: a })

    // Writes tab layout to IndexedDB (fire-and-forget)
    // @sig persistTabLayout :: () -> ()
    const persistTabLayout = () => {
        const tabLayout = S.tabLayout(currentStore().getState())
        if (tabLayout) IndexedDbStorage.persistTabLayout(tabLayout)
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

    // Writes account list preferences to IndexedDB (fire-and-forget)
    // @sig persistAccountListPrefs :: () -> ()
    const persistAccountListPrefs = () => {
        const state = currentStore().getState()
        const sortMode = S.UI.sortMode(state)['@@tagName']
        const collapsedSections = [...S.UI.collapsedSections(state)]
        IndexedDbStorage.persistAccountListPrefs({ sortMode, collapsedSections })
    }

    // Dispatches and persists account list preferences (immediate)
    // @sig handleAccountListAction :: () -> ()
    const handleAccountListAction = () => {
        dispatch(action)
        persistAccountListPrefs()
    }

    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // prettier-ignore
    action.match({
        LoadFile               : () => dispatch(action),
        SetTransactionFilter   : () => dispatch(action),
        ResetTransactionFilters: () => dispatch(action),
        ToggleAccountFilter    : () => dispatch(action),
        ToggleSecurityFilter   : () => dispatch(action),
        ToggleActionFilter     : () => dispatch(action),
        AddCategoryFilter      : () => dispatch(action),
        RemoveCategoryFilter   : () => dispatch(action),
        SetViewUiState         : () => dispatch(action),
        SetFilterPopoverOpen   : () => dispatch(action),
        SetFilterPopoverSearch : () => dispatch(action),
        SetTableLayout         : handleSetTableLayout,
        EnsureTableLayout      : handleSetTableLayout,

        // Tab layout actions (all persist to IndexedDB)
        OpenView          : handleTabLayoutAction,
        CloseView         : handleTabLayoutAction,
        MoveView          : handleTabLayoutAction,
        CreateTabGroup    : handleTabLayoutAction,
        CloseTabGroup     : handleTabLayoutAction,
        SetActiveView     : handleTabLayoutAction,
        SetActiveTabGroup : handleTabLayoutAction,
        SetTabGroupWidth  : handleTabLayoutAction,

        // Account list actions (all persist to IndexedDB)
        SetAccountListSortMode : handleAccountListAction,
        ToggleSectionCollapsed : handleAccountListAction,

        // Global UI actions (no persistence needed)
        SetShowReopenBanner : () => dispatch(action),
        SetShowDrawer       : () => dispatch(action),
        SetLoadingStatus    : () => dispatch(action),

        // Drag state actions (no persistence needed)
        SetDraggingView : () => dispatch(action),
        SetDropTarget   : () => dispatch(action),

        // Page title actions (no persistence needed)
        SetPageTitle : () => dispatch(action),

        // Effect-only actions (handlers dispatch directly to Redux, bypassing post)
        InitializeSystem : () => handleInitializeSystem(dispatch),
        OpenFile         : () => handleOpenFile(dispatch),
        ReopenFile       : () => handleReopenFile(dispatch),
    })
}

export { post }
