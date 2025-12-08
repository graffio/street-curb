// ABOUTME: Redux state selectors
// ABOUTME: Provides access to state slices

const initialized = state => state.initialized

const transactionFilters = state => state.transactionFilters

const dateRange = state => state.transactionFilters.dateRange
const dateRangeKey = state => state.transactionFilters.dateRangeKey
const filterQuery = state => state.transactionFilters.filterQuery
const searchQuery = state => state.transactionFilters.searchQuery
const selectedCategories = state => state.transactionFilters.selectedCategories
const currentSearchIndex = state => state.transactionFilters.currentSearchIndex
const currentRowIndex = state => state.transactionFilters.currentRowIndex
const customStartDate = state => state.transactionFilters.customStartDate
const customEndDate = state => state.transactionFilters.customEndDate

export {
    initialized,
    transactionFilters,
    dateRange,
    dateRangeKey,
    filterQuery,
    searchQuery,
    selectedCategories,
    currentSearchIndex,
    currentRowIndex,
    customStartDate,
    customEndDate,
}
