// ABOUTME: Transaction filter action handlers for the Redux reducer
// ABOUTME: Manages per-view filter state (date range, text, categories, search)

import { toggleItem } from '@graffio/functional'
import { TransactionFilter } from '../../types/index.js'

// Creates a TransactionFilter with default values for a given viewId
// @sig createDefaultFilter :: String -> TransactionFilter
const createDefaultFilter = viewId =>
    TransactionFilter(
        viewId,
        new Date().toISOString().slice(0, 10), // asOfDate
        { start: null, end: null }, // dateRange
        'all', // dateRangeKey
        '', // filterQuery
        '', // searchQuery
        [], // selectedCategories
        [], // selectedAccounts
        [], // selectedSecurities
        [], // selectedInvestmentActions
        null, // groupBy
        null, // customStartDate
        null, // customEndDate
    )

// Merges partial filter changes into transaction filter state for a specific view
// @sig setTransactionFilter :: (State, Action.SetTransactionFilter) -> State
const setTransactionFilter = (state, action) => {
    const { viewId, changes } = action

    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({ ...existing, ...changes })

    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Resets transaction filters to default values for a specific view
// @sig resetTransactionFilters :: (State, Action.ResetTransactionFilters) -> State
const resetTransactionFilters = (state, action) => {
    const defaultFilter = createDefaultFilter(action.viewId)

    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(defaultFilter) }
}

// Toggles an account in the selected accounts list for a specific view
// @sig toggleAccountFilter :: (State, Action.ToggleAccountFilter) -> State
const toggleAccountFilter = (state, action) => {
    const { viewId, accountId } = action

    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({
        ...existing,
        selectedAccounts: toggleItem(accountId, existing.selectedAccounts),
    })

    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Toggles a security in the selected securities list for a specific view
// @sig toggleSecurityFilter :: (State, Action.ToggleSecurityFilter) -> State
const toggleSecurityFilter = (state, action) => {
    const { viewId, securityId } = action

    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({
        ...existing,
        selectedSecurities: toggleItem(securityId, existing.selectedSecurities),
    })

    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Toggles an investment action in the selected actions list for a specific view
// @sig toggleActionFilter :: (State, Action.ToggleActionFilter) -> State
const toggleActionFilter = (state, action) => {
    const { viewId, actionId } = action

    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const selectedInvestmentActions = toggleItem(actionId, existing.selectedInvestmentActions)
    const updated = TransactionFilter.from({ ...existing, selectedInvestmentActions })

    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Toggles a category in the selected categories list for a specific view
// @sig toggleCategoryFilter :: (State, Action.ToggleCategoryFilter) -> State
const toggleCategoryFilter = (state, action) => {
    const { viewId, category } = action

    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({
        ...existing,
        selectedCategories: toggleItem(category, existing.selectedCategories),
    })

    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const TransactionFilters = {
    createDefaultFilter,
    resetTransactionFilters,
    setTransactionFilter,
    toggleAccountFilter,
    toggleActionFilter,
    toggleCategoryFilter,
    toggleSecurityFilter,
}

export { TransactionFilters }
