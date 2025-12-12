/*
 * Redux selectors
 *
 * Re-exports all selectors from submodules plus base state accessors.
 */

// Base state accessors (persisted domain data)
const initialized = state => state.initialized
const accounts = state => state.accounts
const categories = state => state.categories
const securities = state => state.securities
const tableLayouts = state => state.tableLayouts
const tags = state => state.tags
const splits = state => state.splits
const transactions = state => state.transactions

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

export { defaultStartDate, defaultEndDate, filteredTransactions, searchMatches } from './transactions/index.js'
export { allCategoryNames } from './categories/index.js'
export { initialized, accounts, categories, securities, tableLayouts, tags, splits, transactions }
