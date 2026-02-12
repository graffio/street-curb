// ABOUTME: Root reducer for application state
// ABOUTME: Manages entities (LookupTables), transaction filters, and view UI state

import { LookupTable } from '@graffio/functional'
import {
    Account,
    Action,
    Category,
    ColumnDescriptor,
    Lot,
    LotAllocation,
    Price,
    Security,
    SortMode,
    SortOrder,
    Split,
    TabGroup,
    TabLayout,
    TableLayout,
    Tag,
    Transaction,
    TransactionFilter,
    View,
    ViewUiState,
} from '../types/index.js'
import { TabLayout as TabLayoutReducers } from './reducers/tab-layout.js'
import { TransactionFilters } from './reducers/transaction-filters.js'
import { ViewUiState as ViewUiStateReducer } from './reducers/view-ui-state.js'

const { closeTabGroup, closeView, createTabGroup, moveView } = TabLayoutReducers
const { openView, setActiveTabGroup, setActiveView, setTabGroupWidth } = TabLayoutReducers
const { createDefaultFilter } = TransactionFilters
const { createDefaultViewUiState } = ViewUiStateReducer

const ACCOUNT_LIST_VIEW_ID = 'rpt_account_list'

// COMPLEXITY: Exporting both reducer and state factory is standard Redux pattern

// Toggles a section's collapsed state (add if not present, remove if present)
// @sig toggleSectionCollapsed :: (State, Action.ToggleSectionCollapsed) -> State
const toggleSectionCollapsed = (state, action) => {
    const { sectionId } = action
    const next = new Set(state.collapsedSections)
    if (next.has(sectionId)) next.delete(sectionId)
    else next.add(sectionId)
    return { ...state, collapsedSections: next }
}

// Creates empty initial state (hydration happens async before store creation)
// @sig createEmptyState :: () -> State
const createEmptyState = () => ({
    initialized: false,
    accounts: LookupTable([], Account, 'id'),
    categories: LookupTable([], Category, 'id'),
    lots: LookupTable([], Lot, 'id'),
    lotAllocations: LookupTable([], LotAllocation, 'id'),
    prices: LookupTable([], Price, 'id'),
    securities: LookupTable([], Security, 'id'),
    tableLayouts: LookupTable([], TableLayout, 'id'),
    tags: LookupTable([], Tag, 'id'),
    splits: LookupTable([], Split, 'id'),
    transactions: LookupTable([], Transaction, 'id'),
    tabLayout: TabLayout(
        'tl_main',
        LookupTable([TabGroup('tg_1', LookupTable([], View, 'id'), null, 100)], TabGroup, 'id'),
        'tg_1',
        2,
    ),
    transactionFilters: LookupTable([createDefaultFilter(ACCOUNT_LIST_VIEW_ID)], TransactionFilter, 'id'),
    viewUiState: LookupTable([createDefaultViewUiState(ACCOUNT_LIST_VIEW_ID)], ViewUiState, 'id'),
    accountListSortMode: SortMode.ByType(),
    collapsedSections: new Set(),
    showReopenBanner: false,
    showDrawer: false,
    loadingStatus: null,
    draggingViewId: null,
    dropTargetGroupId: null,
    pageTitle: '',
    pageSubtitle: '',
})

// Main reducer that dispatches actions to specific handlers
// @sig rootReducer :: (State, ReduxAction) -> State
const rootReducer = (state = createEmptyState(), reduxAction) => {
    // Persists a table layout (column widths, order, sorting) by view ID
    // @sig setTableLayout :: Action.SetTableLayout -> State
    const setTableLayout = action => ({ ...state, tableLayouts: state.tableLayouts.addItemWithId(action.tableLayout) })

    // Creates table layout or reconciles missing columns into existing layout
    // @sig ensureTableLayout :: Action.EnsureTableLayout -> State
    const ensureTableLayout = action => {
        const { tableLayoutId, columns } = action
        const existing = state.tableLayouts[tableLayoutId]
        if (!existing) {
            const descriptors = columns.map(col => ColumnDescriptor(col.id, col.size || 100, 'none'))
            const layout = TableLayout(
                tableLayoutId,
                LookupTable(descriptors, ColumnDescriptor, 'id'),
                LookupTable([], SortOrder, 'id'),
            )
            return { ...state, tableLayouts: state.tableLayouts.addItemWithId(layout) }
        }
        const reconciled = TableLayout.reconcile(existing, columns)
        if (reconciled === existing) return state
        return { ...state, tableLayouts: state.tableLayouts.addItemWithId(reconciled) }
    }

    // Replaces state with loaded file data (accounts, transactions, etc.)
    // @sig loadFile :: Action.LoadFile -> State
    const loadFile = action => ({ ...state, ...action })

    // Handle raw Redux action from post handler
    const { action } = reduxAction
    if (!Action.is(action)) return state

    // prettier-ignore
    return action.match({
        LoadFile               : () => loadFile(action),
        ResetTransactionFilters: () => ViewUiStateReducer.resetViewUiState(TransactionFilters.resetTransactionFilters(state, action), action),
        SetTableLayout         : () => setTableLayout(action),
        EnsureTableLayout      : () => ensureTableLayout(action),
        SetTransactionFilter   : () => TransactionFilters.setTransactionFilter(state, action),
        SetViewUiState         : () => ViewUiStateReducer.setViewUiState(state, action),
        ToggleAccountFilter    : () => TransactionFilters.toggleAccountFilter(state, action),
        ToggleSecurityFilter   : () => TransactionFilters.toggleSecurityFilter(state, action),
        ToggleActionFilter     : () => TransactionFilters.toggleActionFilter(state, action),
        AddCategoryFilter      : () => TransactionFilters.addCategoryFilter(state, action),
        RemoveCategoryFilter   : () => TransactionFilters.removeCategoryFilter(state, action),
        SetFilterPopoverOpen   : () => ViewUiStateReducer.setFilterPopoverOpen(state, action),
        SetFilterPopoverSearch : () => ViewUiStateReducer.setFilterPopoverSearch(state, action),

        // Tab layout actions
        OpenView          : () => openView(state, action),
        CloseView         : () => closeView(state, action),
        MoveView          : () => moveView(state, action),
        CreateTabGroup    : () => createTabGroup(state),
        CloseTabGroup     : () => closeTabGroup(state, action),
        SetActiveView     : () => setActiveView(state, action),
        SetActiveTabGroup : () => setActiveTabGroup(state, action),
        SetTabGroupWidth  : () => setTabGroupWidth(state, action),

        // Account list actions
        SetAccountListSortMode : () => ({ ...state, accountListSortMode: action.sortMode }),
        ToggleSectionCollapsed : () => toggleSectionCollapsed(state, action),

        // Global UI actions
        SetShowReopenBanner : () => ({ ...state, showReopenBanner: action.show }),
        SetShowDrawer       : () => ({ ...state, showDrawer: action.show }),
        SetLoadingStatus    : () => ({ ...state, loadingStatus: action.status }),

        // Drag state actions
        SetDraggingView : () => ({ ...state, draggingViewId: action.viewId }),
        SetDropTarget   : () => ({ ...state, dropTargetGroupId: action.groupId }),

        // Page title actions
        SetPageTitle    : () => ({ ...state, pageTitle: action.title, pageSubtitle: action.subtitle ?? '' }),
    })
}

const Reducer = { createEmptyState, rootReducer }
export { Reducer }
