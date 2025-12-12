// ABOUTME: Root reducer for application state
// ABOUTME: Manages all entities (LookupTables) and transaction filter state

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Account } from '../types/account.js'
import { Action } from '../types/action.js'
import { Category } from '../types/category.js'
import { TableLayout, Transaction } from '../types/index.js'
import { Security } from '../types/security.js'
import { Split } from '../types/split.js'
import { Tag } from '../types/tag.js'

const initialState = {
    initialized: true,
    accounts: LookupTable([], Account, 'id'),
    categories: LookupTable([], Category, 'id'),
    securities: LookupTable([], Security, 'id'),
    tableLayouts: LookupTable([], TableLayout, 'id'),
    tags: LookupTable([], Tag, 'id'),
    splits: LookupTable([], Split, 'id'),
    transactions: LookupTable([], Transaction, 'id'),
    transactionFilters: {
        dateRange: null,
        dateRangeKey: 'lastTwelveMonths',
        filterQuery: '',
        searchQuery: '',
        selectedCategories: [],
        currentSearchIndex: 0,
        currentRowIndex: 0,
        customStartDate: null,
        customEndDate: null,
    },
}

// @sig loadFile :: (State. Action.SetTransactionFilterAction) -> State
const setTransactionFilter = (state, setTransactionFilterAction) => ({
    ...state,
    transactionFilters: { ...state.transactionFilters, ...setTransactionFilterAction.changes },
})

// @sig resetTransactionFilters :: State -> State
const resetTransactionFilters = state => ({ ...state, transactionFilters: { ...initialState.transactionFilters } })

// @sig setTableLayout :: (State. Action.SetTableLayoutAction) -> State
const setTableLayout = (state, setTableLayoutAction) => ({
    ...state,
    tableLayouts: state.tableLayouts.addItemWithId(setTableLayoutAction.tableLayout),
})

// @sig loadFile :: (State. Action.LoadFile) -> State
const loadFile = (state, loadFileAction) => ({ ...state, ...loadFileAction })

// Special case: Action.HydrateFromLocalStorage has no contents; `post` will send tableLayouts
// @sig hydrateFromLocalStorage :: (State, LookupTable<TableLayout>) -> State
const hydrateFromLocalStorage = (state, tableLayouts) => ({ ...state, tableLayouts })

// ---------------------------------------------------------------------------------------------------------------------
// Main reducer
// ---------------------------------------------------------------------------------------------------------------------

const rootReducer = (state = initialState, action) => {
    // Handle raw Redux action from post handler (localStorage hydration)
    const { type, payload } = action

    if (type === 'HydrateFromLocalStorage') return hydrateFromLocalStorage(state, payload)

    if (!Action.is(payload)) return state

    // prettier-ignore
    return payload.match({
        LoadFile               : () => loadFile(state, payload),
        SetTransactionFilter   : () => setTransactionFilter(state, payload),
        ResetTransactionFilters: () => resetTransactionFilters(state),
        SetTableLayout         : () => setTableLayout(state, payload),
        HydrateFromLocalStorage: () => state, // handled above as raw action
    })
}

export { rootReducer }
