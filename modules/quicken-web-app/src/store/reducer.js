// ABOUTME: Root reducer for application state
// ABOUTME: Manages all entities (LookupTables) and transaction filter state

import { LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
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
} from '../types/index.js'
import { TabLayout as TabLayoutReducers } from './reducers/tab-layout.js'
import { TransactionFilters } from './reducers/transaction-filters.js'
import { initializeTableLayout } from '../utils/table-layout.js'

const { closeTabGroup, closeView, createTabGroup, moveView } = TabLayoutReducers
const { openView, setActiveTabGroup, setActiveView, setTabGroupWidth } = TabLayoutReducers
const { Keymap } = KeymapModule
const { createDefaultFilter } = TransactionFilters

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
    accountListSortMode: SortMode.ByType(),
    collapsedSections: new Set(),
    keymaps: LookupTable([], Keymap, 'id'),
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

    // Creates table layout if it doesn't exist (idempotent initialization)
    // @sig ensureTableLayout :: Action.EnsureTableLayout -> State
    const ensureTableLayout = action => {
        const { tableLayoutId, columns } = action
        if (state.tableLayouts[tableLayoutId]) return state
        return {
            ...state,
            tableLayouts: state.tableLayouts.addItemWithId(initializeTableLayout(tableLayoutId, columns)),
        }
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
        ResetTransactionFilters: () => TransactionFilters.resetTransactionFilters(state, action),
        SetTableLayout         : () => setTableLayout(action),
        EnsureTableLayout      : () => ensureTableLayout(action),
        SetTransactionFilter   : () => TransactionFilters.setTransactionFilter(state, action),
        ToggleAccountFilter    : () => TransactionFilters.toggleAccountFilter(state, action),
        ToggleSecurityFilter   : () => TransactionFilters.toggleSecurityFilter(state, action),
        ToggleActionFilter     : () => TransactionFilters.toggleActionFilter(state, action),
        AddCategoryFilter      : () => TransactionFilters.addCategoryFilter(state, action),
        RemoveCategoryFilter   : () => TransactionFilters.removeCategoryFilter(state, action),
        SetTreeExpanded        : () => TransactionFilters.setTreeExpanded(state, action),
        SetColumnSizing        : () => TransactionFilters.setColumnSizing(state, action),
        SetColumnOrder         : () => TransactionFilters.setColumnOrder(state, action),

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

        // Keymap actions
        RegisterKeymap   : () => ({ ...state, keymaps: state.keymaps.addItemWithId(action.keymap) }),
        UnregisterKeymap : () => ({ ...state, keymaps: state.keymaps.removeItemWithId(action.keymapId) }),

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
