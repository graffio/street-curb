// ABOUTME: UI state selectors for ephemeral display state
// ABOUTME: Not persisted - resets on refresh

// @sig transactionFilters :: ReduxState -> TransactionFilters
const transactionFilters = state => state.transactionFilters

// @sig dateRange :: ReduxState -> { start: Date, end: Date }?
const dateRange = state => state.transactionFilters.dateRange

// @sig dateRangeKey :: ReduxState -> String
const dateRangeKey = state => state.transactionFilters.dateRangeKey

// @sig filterQuery :: ReduxState -> String
const filterQuery = state => state.transactionFilters.filterQuery

// @sig searchQuery :: ReduxState -> String
const searchQuery = state => state.transactionFilters.searchQuery

// @sig selectedCategories :: ReduxState -> [String]
const selectedCategories = state => state.transactionFilters.selectedCategories

// @sig currentSearchIndex :: ReduxState -> Number
const currentSearchIndex = state => state.transactionFilters.currentSearchIndex

// @sig currentRowIndex :: ReduxState -> Number
const currentRowIndex = state => state.transactionFilters.currentRowIndex

// @sig customStartDate :: ReduxState -> Date?
const customStartDate = state => state.transactionFilters.customStartDate

// @sig customEndDate :: ReduxState -> Date?
const customEndDate = state => state.transactionFilters.customEndDate

export {
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
