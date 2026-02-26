// ABOUTME: Root reducer for application state
// ABOUTME: Manages entities (LookupTables), transaction filters, and view UI state

import { LookupTable, toggleItem } from '@graffio/functional'
import {
    Account,
    Action,
    Category,
    Lot,
    LotAllocation,
    Price,
    Security,
    SortMode,
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

const { closeTabGroup, closeView, createTabGroup, cycleTab, moveTab, moveToNewGroup, moveView } = TabLayoutReducers
const { openView, setActiveTabGroup, setActiveView, setTabGroupWidth } = TabLayoutReducers
const { createDefaultFilter } = TransactionFilters
const { createDefaultViewUiState } = ViewUiStateReducer

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const ACCOUNT_LIST_VIEW_ID = 'rpt_account_list'

// COMPLEXITY: function-naming — rootReducer is standard Redux naming

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
        LookupTable([TabGroup('tg_1', LookupTable([], View, 'id'), undefined, 100)], TabGroup, 'id'),
        'tg_1',
        2,
    ),
    transactionFilters: LookupTable([createDefaultFilter(ACCOUNT_LIST_VIEW_ID)], TransactionFilter, 'id'),
    viewUiState: LookupTable([createDefaultViewUiState(ACCOUNT_LIST_VIEW_ID)], ViewUiState, 'id'),
    accountListSortMode: SortMode.ByType(),
    collapsedSections: [],
    showReopenBanner: false,
    showDrawer: false,
    loadingStatus: undefined,
    draggingViewId: undefined,
    dropTargetGroupId: undefined,
    transferNavPending: undefined,
    pickerType: undefined,
    pickerHighlight: 0,
    pickerSearch: '',
    pickerPosition: undefined,
    actionRegistryVersion: 0,
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
            const layout = TableLayout.fromColumns(tableLayoutId, columns)
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
        ToggleCategoryFilter   : () => TransactionFilters.toggleCategoryFilter(state, action),
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
        CycleTab          : () => cycleTab(state, action),
        MoveTab           : () => moveTab(state, action),
        MoveToNewGroup    : () => moveToNewGroup(state, action),

        // Account list actions
        SetAccountListSortMode : () => ({ ...state, accountListSortMode: action.sortMode }),
        ToggleSectionCollapsed : () => ({ ...state, collapsedSections: toggleItem(action.sectionId, state.collapsedSections) }),

        // Global UI actions
        SetShowReopenBanner    : () => ({ ...state, showReopenBanner: action.show }),
        SetShowDrawer          : () => ({ ...state, showDrawer: action.show }),
        ToggleDrawer           : () => ({ ...state, showDrawer: !state.showDrawer }),
        SetLoadingStatus       : () => ({ ...state, loadingStatus: action.status }),
        SetTransferNavPending  : () => ({ ...state, transferNavPending: action.pending }),
        SetPickerOpen          : () => ({ ...state, pickerType: action.pickerType, pickerHighlight: 0, pickerSearch: '' }),
        SetPickerHighlight     : () => ({ ...state, pickerHighlight: action.index }),
        SetPickerSearch        : () => ({ ...state, pickerSearch: action.searchText, pickerHighlight: 0 }),
        SetPickerPosition      : () => { const { x, y } = action; return { ...state, pickerPosition: Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined } },
        BumpActionRegistry     : () => ({ ...state, actionRegistryVersion: state.actionRegistryVersion + 1 }),

        // Drag state actions
        SetDraggingView : () => ({ ...state, draggingViewId: action.viewId }),
        SetDropTarget   : () => ({ ...state, dropTargetGroupId: action.groupId }),

        // Effect-only actions (handled in post.js, no state change)
        InitializeSystem : () => state,
        OpenFile         : () => state,
        ReopenFile       : () => state,
    })
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const Reducer = { createEmptyState, rootReducer }
export { Reducer }
