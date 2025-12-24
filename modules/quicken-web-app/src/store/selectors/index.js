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

// ---------------------------------------------------------------------------------------------------------------------
// Entity lookup selectors (parameterized by ID)
// ---------------------------------------------------------------------------------------------------------------------

// @sig accountName :: (State, String) -> String
const accountName = (state, id) => accounts(state)?.get(id)?.name ?? ''

// @sig accountType :: (State, String) -> String
const accountType = (state, id) => accounts(state)?.get(id)?.type ?? ''

// @sig securitySymbol :: (State, String) -> String
const securitySymbol = (state, id) => securities(state)?.get(id)?.symbol ?? id

// @sig securityName :: (State, String) -> String
const securityName = (state, id) => securities(state)?.get(id)?.name ?? id

// @sig categoryName :: (State, String) -> String
const categoryName = (state, id) => categories(state)?.get(id)?.name ?? 'Uncategorized'

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
export {
    // Base state
    accounts,
    categories,
    initialized,
    securities,
    splits,
    tabLayout,
    tableLayouts,
    tags,
    transactions,

    // Entity lookups
    accountName,
    accountType,
    categoryName,
    securityName,
    securitySymbol,
}
