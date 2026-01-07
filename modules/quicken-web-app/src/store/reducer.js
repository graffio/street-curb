// ABOUTME: Root reducer for application state
// ABOUTME: Manages all entities (LookupTables) and transaction filter state

import { LookupTable } from '@graffio/functional'
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
    TableLayout,
    Tag,
    Transaction,
    TransactionFilter,
} from '../types/index.js'
import {
    closeTabGroup,
    closeView,
    createTabGroup,
    moveView,
    openView,
    setActiveTabGroup,
    setActiveView,
    setTabGroupWidth,
} from './reducers/tab-layout.js'
import { resetTransactionFilters, setTransactionFilter } from './reducers/transaction-filters.js'

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
    tabLayout: null,
    transactionFilters: LookupTable([], TransactionFilter, 'id'),
    accountListSortMode: SortMode.ByType(),
    collapsedSections: new Set(),
    keymaps: [],
})

// Main reducer that dispatches actions to specific handlers
// @sig rootReducer :: (State, ReduxAction) -> State
const rootReducer = (state = createEmptyState(), reduxAction) => {
    // Persists a table layout (column widths, order, sorting) by view ID
    // @sig setTableLayout :: Action.SetTableLayout -> State
    const setTableLayout = action => ({ ...state, tableLayouts: state.tableLayouts.addItemWithId(action.tableLayout) })

    // Replaces state with loaded file data (accounts, transactions, etc.)
    // @sig loadFile :: Action.LoadFile -> State
    const loadFile = action => ({ ...state, ...action })

    // Handle raw Redux action from post handler
    const { action } = reduxAction
    if (!Action.is(action)) return state

    // prettier-ignore
    return action.match({
        LoadFile               : () => loadFile(action),
        ResetTransactionFilters: () => resetTransactionFilters(state, action),
        SetTableLayout         : () => setTableLayout(action),
        SetTransactionFilter   : () => setTransactionFilter(state, action),

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
        RegisterKeymap   : () => ({ ...state, keymaps: [...state.keymaps, action.keymap] }),
        UnregisterKeymap : () => ({ ...state, keymaps: state.keymaps.filter(km => km.id !== action.keymapId) }),
    })
}

export { createEmptyState, rootReducer }
