// ABOUTME: Redux selectors for accessing application state
// ABOUTME: Re-exports from submodules plus base state accessors

// @sig initialized :: State -> Boolean
const initialized = state => state.initialized

// @sig accounts :: State -> LookupTable<Account>
const accounts = state => state.accounts

// @sig categories :: State -> LookupTable<Category>
const categories = state => state.categories

// @sig securities :: State -> LookupTable<Security>
const securities = state => state.securities

// @sig tableLayouts :: State -> LookupTable<TableLayout>
const tableLayouts = state => state.tableLayouts

// @sig tabLayout :: State -> TabLayout
const tabLayout = state => state.tabLayout

// @sig tags :: State -> LookupTable<Tag>
const tags = state => state.tags

// @sig splits :: State -> LookupTable<Split>
const splits = state => state.splits

// @sig transactions :: State -> LookupTable<Transaction>
const transactions = state => state.transactions

// UI state (all selectors now take viewId as second parameter)
export {
    currentRowIndex,
    currentSearchIndex,
    customEndDate,
    customStartDate,
    dateRange,
    dateRangeKey,
    filterQuery,
    groupBy,
    searchQuery,
    selectedAccounts,
    selectedCategories,
    selectedInvestmentActions,
    selectedSecurities,
    transactionFilter,
} from './ui.js'

export { defaultStartDate, defaultEndDate, filteredTransactions, searchMatches } from './transactions/index.js'
export { allCategoryNames } from './categories/index.js'
export { initialized, accounts, categories, securities, tableLayouts, tabLayout, tags, splits, transactions }
