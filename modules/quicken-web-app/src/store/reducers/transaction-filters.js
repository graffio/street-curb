// ABOUTME: Transaction filter action handlers for the Redux reducer
// ABOUTME: Manages per-view filter state (date range, text, categories, search)

import { TransactionFilter } from '../../types/index.js'

const T = {
    // Gets today's date as ISO string (YYYY-MM-DD)
    // @sig toTodayIso :: () -> String
    toTodayIso: () => new Date().toISOString().slice(0, 10),

    // Toggles an item in a list (add if absent, remove if present)
    // @sig toggleItem :: ([a], a) -> [a]
    toggleItem: (list, item) => (list.includes(item) ? list.filter(x => x !== item) : [...list, item]),
}

// Creates a TransactionFilter with default values for a given viewId
// @sig createDefaultFilter :: String -> TransactionFilter
const createDefaultFilter = viewId =>
    TransactionFilter(
        viewId,
        T.toTodayIso(), // asOfDate
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

// Toggles an account in the selected accounts list for a specific view
// @sig toggleAccountFilter :: (State, Action.ToggleAccountFilter) -> State
const toggleAccountFilter = (state, action) => {
    const { viewId, accountId } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({
        ...existing,
        selectedAccounts: T.toggleItem(existing.selectedAccounts, accountId),
    })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Toggles a security in the selected securities list for a specific view
// @sig toggleSecurityFilter :: (State, Action.ToggleSecurityFilter) -> State
const toggleSecurityFilter = (state, action) => {
    const { viewId, securityId } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({
        ...existing,
        selectedSecurities: T.toggleItem(existing.selectedSecurities, securityId),
    })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Toggles an investment action in the selected actions list for a specific view
// @sig toggleActionFilter :: (State, Action.ToggleActionFilter) -> State
const toggleActionFilter = (state, action) => {
    const { viewId, actionId } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const selectedInvestmentActions = T.toggleItem(existing.selectedInvestmentActions, actionId)
    const updated = TransactionFilter.from({ ...existing, selectedInvestmentActions })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Adds a category to the selected categories list for a specific view
// @sig addCategoryFilter :: (State, Action.AddCategoryFilter) -> State
const addCategoryFilter = (state, action) => {
    const { viewId, category } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const updated = TransactionFilter.from({
        ...existing,
        selectedCategories: [...existing.selectedCategories, category],
    })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

// Removes a category from the selected categories list for a specific view
// @sig removeCategoryFilter :: (State, Action.RemoveCategoryFilter) -> State
const removeCategoryFilter = (state, action) => {
    const { viewId, category } = action
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    const existing = state.transactionFilters.get(viewId) || createDefaultFilter(viewId)
    const selectedCategories = existing.selectedCategories.filter(c => c !== category)
    const updated = TransactionFilter.from({ ...existing, selectedCategories })
    // eslint-disable-next-line no-restricted-syntax -- reducer must access state directly
    return { ...state, transactionFilters: state.transactionFilters.addItemWithId(updated) }
}

const TransactionFilters = {
    addCategoryFilter,
    createDefaultFilter,
    removeCategoryFilter,
    resetTransactionFilters,
    setTransactionFilter,
    toggleAccountFilter,
    toggleActionFilter,
    toggleSecurityFilter,
}

export { TransactionFilters }
