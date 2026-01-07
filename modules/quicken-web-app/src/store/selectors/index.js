// ABOUTME: Redux selectors for accessing application state
// ABOUTME: Re-exports from submodules plus base state accessors
// COMPLEXITY: functions — barrel file re-exporting selectors; functions are simple state accessors
// COMPLEXITY: cohesion-structure — barrel file for centralized selector access

// Returns initialization status
// @sig initialized :: State -> Boolean
const initialized = state => state.initialized

// Returns all accounts
// @sig accounts :: State -> LookupTable<Account>
const accounts = state => state.accounts

// Returns all categories
// @sig categories :: State -> LookupTable<Category>
const categories = state => state.categories

// Returns all securities
// @sig securities :: State -> LookupTable<Security>
const securities = state => state.securities

// Returns all table layouts
// @sig tableLayouts :: State -> LookupTable<TableLayout>
const tableLayouts = state => state.tableLayouts

// Returns the tab layout
// @sig tabLayout :: State -> TabLayout
const tabLayout = state => state.tabLayout

// Returns all tags
// @sig tags :: State -> LookupTable<Tag>
const tags = state => state.tags

// Returns all registered keymaps
// @sig keymaps :: State -> [Keymap]
const keymaps = state => state.keymaps

// Returns all splits
// @sig splits :: State -> LookupTable<Split>
const splits = state => state.splits

// Returns all transactions
// @sig transactions :: State -> LookupTable<Transaction>
const transactions = state => state.transactions

// Returns all lots
// @sig lots :: State -> LookupTable<Lot>
const lots = state => state.lots

// Returns all prices
// @sig prices :: State -> LookupTable<Price>
const prices = state => state.prices

// ---------------------------------------------------------------------------------------------------------------------
// Entity lookup selectors (parameterized by ID)
// ---------------------------------------------------------------------------------------------------------------------

// Returns the name of an account by ID
// @sig accountName :: (State, String) -> String
const accountName = (state, id) => accounts(state)?.get(id)?.name ?? ''

// Returns the type of an account by ID
// @sig accountType :: (State, String) -> String
const accountType = (state, id) => accounts(state)?.get(id)?.type ?? ''

// Returns the symbol of a security by ID
// @sig securitySymbol :: (State, String) -> String
const securitySymbol = (state, id) => securities(state)?.get(id)?.symbol ?? id

// Returns the name of a security by ID
// @sig securityName :: (State, String) -> String
const securityName = (state, id) => securities(state)?.get(id)?.name ?? id

// Returns the name of a category by ID
// @sig categoryName :: (State, String) -> String
const categoryName = (state, id) => categories(state)?.get(id)?.name ?? 'Uncategorized'

// UI state (all selectors now take viewId as second parameter)
export {
    asOfDate,
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

export {
    defaultStartDate,
    defaultEndDate,
    enrichedTransactions,
    filteredTransactions,
    searchMatches,
} from './transactions/index.js'
export { allCategoryNames } from './categories/index.js'
export { enrichedHoldingsAsOf } from './holdings-selectors.js'
export { accountListSortMode, collapsedSections } from './account-list-prefs.js'
export {
    // Base state
    accounts,
    categories,
    initialized,
    keymaps,
    lots,
    prices,
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
