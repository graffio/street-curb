// ABOUTME: Transaction filter action handlers for the Redux reducer
// ABOUTME: Manages per-view filter state (date range, text, categories, search)

import { TransactionFilter } from '../../types/index.js'

const T = {
    // Gets today's date as ISO string (YYYY-MM-DD)
    // @sig toTodayIso :: () -> String
    toTodayIso: () => new Date().toISOString().slice(0, 10),
}

// Creates a TransactionFilter with default values for a given viewId
// @sig createDefaultFilter :: String -> TransactionFilter
const createDefaultFilter = viewId =>
    TransactionFilter(
        viewId,
        T.toTodayIso(), // asOfDate
        { start: null, end: null }, // dateRange
        'lastTwelveMonths', // dateRangeKey
        '', // filterQuery
        '', // searchQuery
        [], // selectedCategories
        [], // selectedAccounts
        [], // selectedSecurities
        [], // selectedInvestmentActions
        null, // groupBy
        0, // currentSearchIndex
        0, // currentRowIndex
        null, // customStartDate
        null, // customEndDate
        {}, // treeExpansion
        {}, // columnSizing
        [], // columnOrder
    )

// Merges partial filter changes into transaction filter state for a specific view
// @sig setTransactionFilter :: (State, Action.SetTransactionFilter) -> State
const setTransactionFilter = (state, action) => {
    const { viewId, changes } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({ ...existing, ...changes })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Resets transaction filters to default values for a specific view
// @sig resetTransactionFilters :: (State, Action.ResetTransactionFilters) -> State
const resetTransactionFilters = (state, action) => {
    const defaultFilter = createDefaultFilter(action.viewId)
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(defaultFilter) }
}

// Sets tree expansion state for a specific view
// @sig setTreeExpanded :: (State, Action.SetTreeExpanded) -> State
const setTreeExpanded = (state, action) => {
    const { viewId, expanded } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({ ...existing, treeExpansion: expanded })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Sets column sizing state for a specific view
// @sig setColumnSizing :: (State, Action.SetColumnSizing) -> State
const setColumnSizing = (state, action) => {
    const { viewId, sizing } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({ ...existing, columnSizing: sizing })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Sets column order state for a specific view
// @sig setColumnOrder :: (State, Action.SetColumnOrder) -> State
const setColumnOrder = (state, action) => {
    const { viewId, order } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({ ...existing, columnOrder: order })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

const TransactionFilters = {
    createDefaultFilter,
    resetTransactionFilters,
    setColumnOrder,
    setColumnSizing,
    setTransactionFilter,
    setTreeExpanded,
}

export { TransactionFilters }
