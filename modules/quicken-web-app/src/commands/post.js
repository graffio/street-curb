// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles IndexedDB persistence for table layouts (debounced) and tab layout (immediate + debounced)
import { debounce } from '@graffio/functional'
import { currentStore, Selectors as S } from '../store/index.js'
import { Action } from '../types/action.js'
import { IndexedDbStorage } from './data-sources/indexed-db-storage.js'
import { handleInitializeSystem } from './operations/handle-initialize-system.js'
import { handleOpenFile } from './operations/handle-open-file.js'
import { handleReopenFile } from './operations/handle-reopen-file.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Writes table layouts to IndexedDB (fire-and-forget)
    // @sig persistTableLayouts :: () -> ()
    persistTableLayouts: () => IndexedDbStorage.persistTableLayouts(S.tableLayouts(currentStore().getState())),

    // Writes tab layout to IndexedDB (guard: tabLayout is null before LoadFile completes)
    // @sig persistTabLayout :: () -> ()
    persistTabLayout: () => {
        const tabLayout = S.tabLayout(currentStore().getState())
        if (tabLayout) IndexedDbStorage.persistTabLayout(tabLayout)
    },
}

E.debouncedPersistTableLayouts = debounce(500, E.persistTableLayouts)
E.debouncedPersistTabLayout = debounce(500, E.persistTabLayout)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Dispatches an Action to Redux and handles persistence side effects
// @sig post :: Action -> void
const post = action => {
    // Sends action to Redux store with type string for devtools
    // @sig dispatch :: Action -> ()
    const dispatch = a => currentStore().dispatch({ type: a.constructor.toString(), action: a })

    // Dispatches and persists table layout (debounced)
    // @sig handleSetTableLayout :: () -> ()
    const handleSetTableLayout = () => {
        dispatch(action)
        E.debouncedPersistTableLayouts()
    }

    // Dispatches and persists tab layout (immediate)
    // @sig handleTabLayoutAction :: () -> ()
    const handleTabLayoutAction = () => {
        dispatch(action)
        E.persistTabLayout()
    }

    // Dispatches and debounces tab layout persistence (for high-frequency drag resize)
    // @sig handleTabGroupWidthAction :: () -> ()
    const handleTabGroupWidthAction = () => {
        dispatch(action)
        E.debouncedPersistTabLayout()
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
        SetTabGroupWidth  : handleTabGroupWidthAction,

        // Account list actions (all persist to IndexedDB)
        SetAccountListSortMode : handleAccountListAction,
        ToggleSectionCollapsed : handleAccountListAction,

        // Global UI actions (no persistence needed)
        SetShowReopenBanner : () => dispatch(action),
        SetShowDrawer       : () => dispatch(action),
        ToggleDrawer        : () => dispatch(action),
        SetLoadingStatus    : () => dispatch(action),

        // Drag state actions (no persistence needed)
        SetDraggingView : () => dispatch(action),
        SetDropTarget   : () => dispatch(action),

        // Multi-step operations (dispatch directly to Redux, bypassing post)
        InitializeSystem : () => handleInitializeSystem(dispatch),
        OpenFile         : () => handleOpenFile(dispatch),
        ReopenFile       : () => handleReopenFile(dispatch),
    })
}

export { post }
