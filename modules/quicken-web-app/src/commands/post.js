// ABOUTME: Command execution layer for domain Actions
// ABOUTME: Dispatches Tagged actions to Redux as plain objects
// ABOUTME: Handles IndexedDB persistence for table layouts (debounced) and tab layout (immediate + debounced)
// COMPLEXITY: export-structure — post is a function, not a namespace; lowercase matches usage pattern

import { debounce } from '@graffio/functional'
import { TransactionColumns } from '../columns/index.js'
import { currentStore, Selectors as S } from '../store/index.js'
import { RegisterNavigation } from '../store/register-navigation.js'
import { Account } from '../types/account.js'
import { Action } from '../types/action.js'
import { IndexedDbStorage } from './data-sources/indexed-db-storage.js'
import { handleInitializeSystem } from './operations/handle-initialize-system.js'
import { handleOpenFile } from './operations/handle-open-file.js'
import { handleReopenFile } from './operations/handle-reopen-file.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Derives account type context from viewId for register navigation
    // @sig toRegisterContext :: (State, String) -> RegisterContext
    toRegisterContext: (state, viewId) => {
        const accountId = viewId.replace('reg_', '')
        const account = S.accounts(state).get(accountId)
        const isInvestment = Account.isInvestment(account)
        const { sortedForDisplay, sortedForBankDisplay, highlightedId, highlightedIdForBank } = S.Transactions
        const sortSelector = isInvestment ? sortedForDisplay : sortedForBankDisplay
        const highlightSelector = isInvestment ? highlightedId : highlightedIdForBank
        const columns = isInvestment ? TransactionColumns.investmentColumns : TransactionColumns.bankColumns
        const tableLayoutId = RegisterNavigation.toTableLayoutId(isInvestment ? 'investment' : 'account', accountId)
        return { sortSelector, highlightSelector, columns, tableLayoutId, accountId }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Sends action to Redux store with type string for devtools
    // @sig dispatch :: Action -> void
    dispatch: a => currentStore().dispatch({ type: a.constructor.toString(), action: a }),

    // Writes table layouts to IndexedDB (fire-and-forget)
    // @sig persistTableLayouts :: () -> ()
    persistTableLayouts: () => IndexedDbStorage.persistTableLayouts(S.tableLayouts(currentStore().getState())),

    // Module-level debounced functions — initialized after E is defined
    debouncedPersistTableLayouts: null,
    debouncedPersistTabLayout: null,

    // Writes tab layout to IndexedDB (guard: tabLayout is null before LoadFile completes)
    // @sig persistTabLayout :: () -> ()
    persistTabLayout: () => {
        const tabLayout = S.tabLayout(currentStore().getState())
        if (tabLayout) IndexedDbStorage.persistTabLayout(tabLayout)
    },

    // Writes account list preferences to IndexedDB (fire-and-forget)
    // @sig persistAccountListPrefs :: () -> void
    persistAccountListPrefs: () => {
        const state = currentStore().getState()
        const sortMode = S.UI.sortMode(state)['@@tagName']
        const collapsedSections = [...S.UI.collapsedSections(state)]
        IndexedDbStorage.persistAccountListPrefs({ sortMode, collapsedSections })
    },

    // Navigates to next/prev search match by computing row index from current state
    // @sig handleNavigateSearch :: (Function, String, Number) -> void
    handleNavigateSearch: (dispatch, viewId, dir) => {
        const state = currentStore().getState()
        const ctx = T.toRegisterContext(state, viewId)
        const { sortSelector, highlightSelector, accountId, tableLayoutId, columns } = ctx
        const data = sortSelector(state, viewId, accountId, tableLayoutId, columns)
        const searchMatches = S.Transactions.searchMatches(state, viewId, accountId)
        if (searchMatches.length === 0) return
        const highlighted = highlightSelector(state, viewId, accountId, tableLayoutId, columns)
        const currentIdx = searchMatches.indexOf(highlighted)
        const rowIdx =
            currentIdx >= 0
                ? RegisterNavigation.toAdjacentMatchRowIdx(data, searchMatches, currentIdx, dir)
                : RegisterNavigation.toNearestMatchRowIdx(
                      data,
                      searchMatches,
                      RegisterNavigation.toRowIndex(data, highlighted),
                      dir,
                  )
        if (rowIdx >= 0) dispatch(Action.SetViewUiState(viewId, { currentRowIndex: rowIdx }))
    },

    // Highlights a transaction row by computing its index from current state
    // @sig handleHighlightRow :: (Function, String, String) -> void
    handleHighlightRow: (dispatch, viewId, transactionId) => {
        const state = currentStore().getState()
        const { sortSelector, accountId, tableLayoutId, columns } = T.toRegisterContext(state, viewId)
        const data = sortSelector(state, viewId, accountId, tableLayoutId, columns)
        const idx = RegisterNavigation.toRowIndex(data, transactionId)
        if (idx >= 0) dispatch(Action.SetViewUiState(viewId, { currentRowIndex: idx }))
    },

    // Initializes date range to last 12 months if not already set
    // @sig handleInitDateRange :: (Function, String) -> void
    handleInitDateRange: (dispatch, viewId) => {
        const state = currentStore().getState()
        const dateRangeKey = S.UI.dateRangeKey(state, viewId)
        const dateRange = S.UI.dateRange(state, viewId)
        if (RegisterNavigation.shouldInitializeDateRange(dateRangeKey, dateRange))
            dispatch(Action.SetTransactionFilter(viewId, { dateRange: RegisterNavigation.toDefaultDateRange() }))
    },

    // Dispatches and persists table layout (debounced)
    // @sig handleSetTableLayout :: (Function, Action) -> void
    handleSetTableLayout: (dispatch, action) => {
        dispatch(action)
        E.debouncedPersistTableLayouts()
    },

    // Dispatches and persists tab layout (immediate)
    // @sig handleTabLayoutAction :: (Function, Action) -> void
    handleTabLayoutAction: (dispatch, action) => {
        dispatch(action)
        E.persistTabLayout()
    },

    // Dispatches and debounces tab layout persistence (for high-frequency drag resize)
    // @sig handleTabGroupWidthAction :: (Function, Action) -> void
    handleTabGroupWidthAction: (dispatch, action) => {
        dispatch(action)
        E.debouncedPersistTabLayout()
    },

    // Dispatches and persists account list preferences (immediate)
    // @sig handleAccountListAction :: (Function, Action) -> void
    handleAccountListAction: (dispatch, action) => {
        dispatch(action)
        E.persistAccountListPrefs()
    },

    // Routes register page intent keys to handlers, else dispatches as-is
    // @sig handleSetViewUiState :: (Function, Action) -> void
    handleSetViewUiState: (dispatch, action) => {
        const { changes, viewId } = action
        const { navigateSearch, highlightRow: highlightRowId } = changes
        if (navigateSearch) return E.handleNavigateSearch(dispatch, viewId, navigateSearch)
        if (highlightRowId) return E.handleHighlightRow(dispatch, viewId, highlightRowId)
        dispatch(action)
    },
}

E.debouncedPersistTableLayouts = debounce(500, E.persistTableLayouts)
E.debouncedPersistTabLayout = debounce(500, E.persistTabLayout)

// Dispatches an Action to Redux and handles persistence side effects
// @sig post :: Action -> void
const post = action => {
    if (!Action.is(action)) throw new Error('post requires an Action; found: ' + action)

    // prettier-ignore
    action.match({
        LoadFile               : () => E.dispatch(action),
        SetTransactionFilter   : () => action.changes.initDateRange ? E.handleInitDateRange(E.dispatch, action.viewId) : E.dispatch(action),
        ResetTransactionFilters: () => E.dispatch(action),
        ToggleAccountFilter    : () => E.dispatch(action),
        ToggleSecurityFilter   : () => E.dispatch(action),
        ToggleActionFilter     : () => E.dispatch(action),
        AddCategoryFilter      : () => E.dispatch(action),
        RemoveCategoryFilter   : () => E.dispatch(action),
        SetViewUiState         : () => E.handleSetViewUiState(E.dispatch, action),
        SetFilterPopoverOpen   : () => E.dispatch(action),
        SetFilterPopoverSearch : () => E.dispatch(action),
        SetTableLayout         : () => E.handleSetTableLayout(E.dispatch, action),
        EnsureTableLayout      : () => E.handleSetTableLayout(E.dispatch, action),

        // Tab layout actions (all persist to IndexedDB)
        OpenView          : () => E.handleTabLayoutAction(E.dispatch, action),
        CloseView         : () => E.handleTabLayoutAction(E.dispatch, action),
        MoveView          : () => E.handleTabLayoutAction(E.dispatch, action),
        CreateTabGroup    : () => E.handleTabLayoutAction(E.dispatch, action),
        CloseTabGroup     : () => E.handleTabLayoutAction(E.dispatch, action),
        SetActiveView     : () => E.handleTabLayoutAction(E.dispatch, action),
        SetActiveTabGroup : () => E.handleTabLayoutAction(E.dispatch, action),
        SetTabGroupWidth  : () => E.handleTabGroupWidthAction(E.dispatch, action),

        // Account list actions (all persist to IndexedDB)
        SetAccountListSortMode : () => E.handleAccountListAction(E.dispatch, action),
        ToggleSectionCollapsed : () => E.handleAccountListAction(E.dispatch, action),

        // Global UI actions (no persistence needed)
        SetShowReopenBanner : () => E.dispatch(action),
        SetShowDrawer       : () => E.dispatch(action),
        ToggleDrawer        : () => E.dispatch(action),
        SetLoadingStatus    : () => E.dispatch(action),

        // Drag state actions (no persistence needed)
        SetDraggingView : () => E.dispatch(action),
        SetDropTarget   : () => E.dispatch(action),

        // Multi-step operations (dispatch directly to Redux, bypassing post)
        InitializeSystem : () => handleInitializeSystem(E.dispatch),
        OpenFile         : () => handleOpenFile(E.dispatch),
        ReopenFile       : () => handleReopenFile(E.dispatch),
    })
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { post }
