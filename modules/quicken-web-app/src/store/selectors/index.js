/*
 * Redux selectors
 *
 * Re-exports all selectors from submodules plus base state accessors.
 */

// Base state accessors (persisted domain data)
export const initialized = state => state.initialized
export const accounts = state => state.accounts
export const categories = state => state.categories
export const securities = state => state.securities
export const tags = state => state.tags
export const splits = state => state.splits
export const transactions = state => state.transactions

// UI state
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
} from './ui.js'

// Transaction selectors and filters
export { defaultStartDate, defaultEndDate, filteredTransactions, searchMatches } from './transactions/index.js'

// Category selectors
export { allCategoryNames } from './categories/index.js'
