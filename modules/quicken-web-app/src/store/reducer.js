// ABOUTME: Root reducer for application state
// ABOUTME: Manages all entities (LookupTables) and transaction filter state

import { LookupTable } from '@graffio/functional'
import { Account, Action, Category, Security, Split, Tag, Transaction, TransactionFilter } from '../types/index.js'
import { hydrateTabLayout, hydrateTableLayouts } from './hydration.js'
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

// Creates the initial Redux state with empty LookupTables and default filters
// @sig getInitialState :: () -> State
const getInitialState = () => ({
    initialized: true,
    accounts: LookupTable([], Account, 'id'),
    categories: LookupTable([], Category, 'id'),
    securities: LookupTable([], Security, 'id'),
    tableLayouts: hydrateTableLayouts(),
    tags: LookupTable([], Tag, 'id'),
    splits: LookupTable([], Split, 'id'),
    transactions: LookupTable([], Transaction, 'id'),
    tabLayout: hydrateTabLayout(),
    transactionFilters: LookupTable([], TransactionFilter, 'id'),
})

// Main reducer that dispatches actions to specific handlers
// @sig rootReducer :: (State, ReduxAction) -> State
const rootReducer = (state = getInitialState(), reduxAction) => {
    // Persists a table layout (column widths, order, sorting) by view ID
    // @sig setTableLayout :: Action.SetTableLayout -> State
    const setTableLayout = action => ({ ...state, tableLayouts: state.tableLayouts.addItemWithId(action.tableLayout) })

    // Replaces state with loaded file data (accounts, transactions, etc.)
    // @sig loadFile :: Action.LoadFile -> State
    const loadFile = action => ({ ...state, ...action })

    // Handle raw Redux action from post handler (localStorage hydration)
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
    })
}

export { rootReducer }
