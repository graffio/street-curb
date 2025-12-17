// ABOUTME: UI state selectors for ephemeral display state
// ABOUTME: Not persisted - resets on refresh

// Default values for filter fields when no filter exists for a viewId
const defaults = {
    dateRange: null,
    dateRangeKey: 'lastTwelveMonths',
    filterQuery: '',
    searchQuery: '',
    selectedCategories: [],
    currentSearchIndex: 0,
    currentRowIndex: 0,
    customStartDate: null,
    customEndDate: null,
}

// Get the TransactionFilter for a viewId, or undefined if none exists
// @sig transactionFilter :: (ReduxState, String) -> TransactionFilter?
const transactionFilter = (state, viewId) => state.transactionFilters.get(viewId)

// @sig dateRange :: (ReduxState, String) -> { start: Date, end: Date }?
const dateRange = (state, viewId) => transactionFilter(state, viewId)?.dateRange ?? defaults.dateRange

// @sig dateRangeKey :: (ReduxState, String) -> String
const dateRangeKey = (state, viewId) => transactionFilter(state, viewId)?.dateRangeKey ?? defaults.dateRangeKey

// @sig filterQuery :: (ReduxState, String) -> String
const filterQuery = (state, viewId) => transactionFilter(state, viewId)?.filterQuery ?? defaults.filterQuery

// @sig searchQuery :: (ReduxState, String) -> String
const searchQuery = (state, viewId) => transactionFilter(state, viewId)?.searchQuery ?? defaults.searchQuery

// @sig selectedCategories :: (ReduxState, String) -> [String]
const selectedCategories = (state, viewId) =>
    transactionFilter(state, viewId)?.selectedCategories ?? defaults.selectedCategories

// @sig currentSearchIndex :: (ReduxState, String) -> Number
const currentSearchIndex = (state, viewId) =>
    transactionFilter(state, viewId)?.currentSearchIndex ?? defaults.currentSearchIndex

// @sig currentRowIndex :: (ReduxState, String) -> Number
const currentRowIndex = (state, viewId) => transactionFilter(state, viewId)?.currentRowIndex ?? defaults.currentRowIndex

// @sig customStartDate :: (ReduxState, String) -> Date?
const customStartDate = (state, viewId) => transactionFilter(state, viewId)?.customStartDate ?? defaults.customStartDate

// @sig customEndDate :: (ReduxState, String) -> Date?
const customEndDate = (state, viewId) => transactionFilter(state, viewId)?.customEndDate ?? defaults.customEndDate

export {
    currentRowIndex,
    currentSearchIndex,
    customEndDate,
    customStartDate,
    dateRange,
    dateRangeKey,
    filterQuery,
    searchQuery,
    selectedCategories,
    transactionFilter,
}
