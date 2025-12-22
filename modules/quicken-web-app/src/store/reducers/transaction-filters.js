// ABOUTME: Transaction filter action handlers for the Redux reducer
// ABOUTME: Manages per-view filter state (date range, text, categories, search)

import { TransactionFilter } from '../../types/index.js'

// Creates a TransactionFilter with default values for a given viewId
// @sig defaultFilterForView :: String -> TransactionFilter
const defaultFilterForView = viewId =>
    TransactionFilter(
        viewId,
        null, // dateRange
        'lastTwelveMonths', // dateRangeKey
        '', // filterQuery
        '', // searchQuery
        [], // selectedCategories
        [], // selectedAccounts
        null, // groupBy
        0, // currentSearchIndex
        0, // currentRowIndex
        null, // customStartDate
        null, // customEndDate
    )

// Merges partial filter changes into transaction filter state for a specific view
// @sig setTransactionFilter :: (State, Action.SetTransactionFilter) -> State
const setTransactionFilter = (state, action) => {
    const { viewId, changes } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || defaultFilterForView(viewId)
    const updated = TransactionFilter.from({ ...existing, ...changes })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Resets transaction filters to default values for a specific view
// @sig resetTransactionFilters :: (State, Action.ResetTransactionFilters) -> State
const resetTransactionFilters = (state, action) => {
    const defaultFilter = defaultFilterForView(action.viewId)
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(defaultFilter) }
}

export { resetTransactionFilters, setTransactionFilter }
