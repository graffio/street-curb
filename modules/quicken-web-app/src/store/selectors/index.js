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

// Returns all registered keymaps
// @sig keymaps :: State -> [Keymap]
const keymaps = state => state.keymaps

// Returns whether the reopen banner is shown
// @sig showReopenBanner :: State -> Boolean
const showReopenBanner = state => state.showReopenBanner

// Returns whether the keymap drawer is shown
// @sig showDrawer :: State -> Boolean
const showDrawer = state => state.showDrawer

// Returns the current loading status message
// @sig loadingStatus :: State -> String?
const loadingStatus = state => state.loadingStatus

// Returns the ID of the view currently being dragged
// @sig draggingViewId :: State -> String?
const draggingViewId = state => state.draggingViewId

// Returns the ID of the group that is a drop target
// @sig dropTargetGroupId :: State -> String?
const dropTargetGroupId = state => state.dropTargetGroupId

// Returns the active view ID from the tab layout
// @sig activeViewId :: State -> String | null
const activeViewId = state => {
    const layout = state.tabLayout
    const activeGroup = layout?.tabGroups?.find(g => g.id === layout.activeTabGroupId)
    return activeGroup?.activeViewId ?? null
}

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

// Namespace exports
export { Accounts } from './accounts.js'
export { Categories } from './categories.js'
export { Holdings } from './holdings.js'
export { Keymaps } from './keymaps.js'
export { Prefs } from './prefs.js'
export { Transactions } from './transactions.js'
export { UI } from './ui.js'
export {
    // Base state
    accounts,
    activeViewId,
    categories,
    draggingViewId,
    dropTargetGroupId,
    initialized,
    keymaps,
    loadingStatus,
    lots,
    prices,
    securities,
    showDrawer,
    showReopenBanner,
    tabLayout,
    tableLayouts,
    transactions,

    // Entity lookups
    accountName,
    accountType,
    categoryName,
    securityName,
    securitySymbol,
}
