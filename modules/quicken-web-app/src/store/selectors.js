// ABOUTME: All Redux selectors in one place
// ABOUTME: Thin state accessors and memoized derived selectors
// COMPLEXITY-TODO: sig-documentation — Trivial accessors don't need @sig (expires 2026-01-28)
// COMPLEXITY-TODO: cohesion-structure — Domain namespaces (UI, Transactions) vs P/T/F/V/A/E (expires 2026-01-28)
// COMPLEXITY-TODO: export-structure — Multiple namespace exports vs single object (expires 2026-01-28)
// COMPLEXITY-TODO: react-redux-separation — Filter logic moving to financial-computations (expires 2026-01-28)
/* eslint-disable no-restricted-syntax -- selectors must access state directly */

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { memoizeOnceWithIdenticalParams, memoizeReduxState, memoizeReduxStatePerKey } from '@graffio/functional'
import { applySort } from '@graffio/financial-computations/query'
import { HoldingsAsOf } from '@graffio/financial-computations/investments'
import { KeymapModule } from '@graffio/keymap'
import { Category } from '../types/category.js'
import { EnrichedAccount } from '../types/enriched-account.js'
import { TableLayout } from '../types/table-layout.js'
import { Transaction } from '../types/transaction.js'
import { accountOrganization } from '../services/account-organization.js'
import { TransactionFilters } from './reducers/transaction-filters.js'
import { buildTransactionTree } from '../utils/category-tree.js'
import { HoldingsTree } from '../utils/holdings-tree.js'
import { toDataTableProps } from '../utils/table-layout.js'

const { buildAllocationIndex, buildPriceIndex, buildTransactionIndex } = HoldingsAsOf
const { buildHoldingsTree } = HoldingsTree
const { Keymap } = KeymapModule

const defaultTableLayoutProps = { sorting: [], columnSizing: {}, columnOrder: [] }
const ACCOUNT_LIST_VIEW_ID = 'rpt_account_list'

// Applies all filter criteria to a transaction list
const applyFilter = (filter, transactions, categories, securities) => {
    const { dateRange, filterQuery, selectedAccounts, selectedCategories } = filter
    return transactions
        .filter(Transaction.matchesText(filterQuery, categories, securities))
        .filter(Transaction.isInDateRange(dateRange))
        .filter(Transaction.matchesCategories(selectedCategories, categories))
        .filter(t => !selectedAccounts?.length || selectedAccounts.includes(t.accountId))
}

// Applies investment-specific filters on top of base filtering, optionally scoped to one account
const applyInvestmentFilter = (filter, transactions, categories, securities, accountId) => {
    const { selectedInvestmentActions, selectedSecurities } = filter
    return applyFilter(filter, transactions, categories, securities)
        .filter(t => !accountId || t.accountId === accountId)
        .filter(Transaction.matchesSecurities(selectedSecurities))
        .filter(Transaction.matchesInvestmentActions(selectedInvestmentActions))
}

// ---------------------------------------------------------------------------------------------------------------------
// Pure state accessors
// ---------------------------------------------------------------------------------------------------------------------

const initialized = state => state.initialized
const accounts = state => state.accounts
const categories = state => state.categories
const securities = state => state.securities
const transactions = state => state.transactions
const lots = state => state.lots
const prices = state => state.prices
const tableLayouts = state => state.tableLayouts
const tabLayout = state => state.tabLayout
const keymaps = state => state.keymaps
const showReopenBanner = state => state.showReopenBanner
const showDrawer = state => state.showDrawer
const loadingStatus = state => state.loadingStatus
const draggingViewId = state => state.draggingViewId
const dropTargetGroupId = state => state.dropTargetGroupId

// ---------------------------------------------------------------------------------------------------------------------
// Entity lookups (state, id) -> value
// ---------------------------------------------------------------------------------------------------------------------

const accountName = (state, id) => accounts(state).get(id)?.name ?? ''
const accountType = (state, id) => accounts(state).get(id)?.type ?? ''
const securitySymbol = (state, id) => securities(state).get(id)?.symbol ?? id
const securityName = (state, id) => securities(state).get(id)?.name ?? id
const categoryName = (state, id) => categories(state).get(id)?.name ?? 'Uncategorized'

// ---------------------------------------------------------------------------------------------------------------------
// UI state accessors (per-view filter state)
// ---------------------------------------------------------------------------------------------------------------------

const defaultFilterCache = new Map()

const getDefaultFilter = viewId => {
    if (!defaultFilterCache.has(viewId)) defaultFilterCache.set(viewId, TransactionFilters.createDefaultFilter(viewId))
    return defaultFilterCache.get(viewId)
}

const filter = (state, viewId) => state.transactionFilters.get(viewId) || getDefaultFilter(viewId)

// prettier-ignore
const UI = {
    asOfDate                 : (state, viewId) => filter(state, viewId).asOfDate,
    pageTitle                : state => state.pageTitle,
    pageSubtitle             : state => state.pageSubtitle,
    currentRowIndex          : (state, viewId) => filter(state, viewId).currentRowIndex,
    currentSearchIndex       : (state, viewId) => filter(state, viewId).currentSearchIndex,
    customEndDate            : (state, viewId) => filter(state, viewId).customEndDate,
    customStartDate          : (state, viewId) => filter(state, viewId).customStartDate,
    dateRange                : (state, viewId) => filter(state, viewId).dateRange,
    dateRangeKey             : (state, viewId) => filter(state, viewId).dateRangeKey,
    filterQuery              : (state, viewId) => filter(state, viewId).filterQuery,
    groupBy                  : (state, viewId) => filter(state, viewId).groupBy,
    searchQuery              : (state, viewId) => filter(state, viewId).searchQuery,
    selectedAccounts         : (state, viewId) => filter(state, viewId).selectedAccounts,
    selectedCategories       : (state, viewId) => filter(state, viewId).selectedCategories,
    selectedInvestmentActions: (state, viewId) => filter(state, viewId).selectedInvestmentActions,
    selectedSecurities       : (state, viewId) => filter(state, viewId).selectedSecurities,
    treeExpansion            : (state, viewId) => filter(state, viewId).treeExpansion             ?? {},
    columnSizing             : (state, viewId) => filter(state, viewId).columnSizing              ?? {},
    columnOrder              : (state, viewId) => filter(state, viewId).columnOrder               ?? [],
    transactionFilter        : filter,
}

// ---------------------------------------------------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------------------------------------------------

const Prefs = { sortMode: state => state.accountListSortMode, collapsedSections: state => state.collapsedSections }

// ---------------------------------------------------------------------------------------------------------------------
// Tab layout derived
// ---------------------------------------------------------------------------------------------------------------------

const activeViewId = state => {
    const { tabLayout } = state
    const activeGroup = tabLayout.tabGroups.get(tabLayout.activeTabGroupId)
    return activeGroup?.activeViewId ?? null
}

const tableLayoutProps = memoizeOnceWithIdenticalParams((state, tableLayoutId) => {
    const tableLayout = state.tableLayouts.get(tableLayoutId)
    return tableLayout ? toDataTableProps(tableLayout) : defaultTableLayoutProps
})

// ---------------------------------------------------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------------------------------------------------

const Categories = { allNames: memoizeReduxState(['categories'], state => Category.collectAllNames(state.categories)) }

// ---------------------------------------------------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------------------------------------------------

const ACCOUNT_STATE_KEYS = [
    'accounts',
    'transactions',
    'lots',
    'lotAllocations',
    'prices',
    'securities',
    'accountListSortMode',
]

// Computes organized account sections from state
// @sig collectOrganizedAccounts :: State -> LookupTable<AccountSection>
const collectOrganizedAccounts = state => {
    const { accounts, transactions, accountListSortMode } = state
    const holdings = Holdings.collectAsOf(state, ACCOUNT_LIST_VIEW_ID)
    const enriched = LookupTable(EnrichedAccount.enrichAll(accounts, holdings, transactions), EnrichedAccount, 'id')
    return accountOrganization.A.collectSections(enriched, accountListSortMode)
}

const Accounts = { organized: memoizeReduxState(ACCOUNT_STATE_KEYS, collectOrganizedAccounts) }

// ---------------------------------------------------------------------------------------------------------------------
// Holdings
// ---------------------------------------------------------------------------------------------------------------------

const priceIndex = memoizeReduxState(['prices'], state => buildPriceIndex(state.prices))
const allocationIndex = memoizeReduxState(['lotAllocations'], state => buildAllocationIndex(state.lotAllocations))
const transactionIndex = memoizeReduxState(['transactions'], state => buildTransactionIndex(state.transactions))

const toHoldingsTree = memoizeOnceWithIdenticalParams((groupBy, holdings) => buildHoldingsTree(groupBy, holdings))

const collectHoldingsAsOf = (state, viewId) => {
    const { asOfDate, filterQuery, selectedAccounts } = filter(state, viewId)
    const { accounts, lotAllocations, lots, prices, securities, transactions } = state
    return HoldingsAsOf.computeHoldingsAsOf({
        lots,
        lotAllocations,
        prices,
        accounts,
        securities,
        transactions,
        asOfDate,
        selectedAccountIds: selectedAccounts,
        filterQuery,
        allocationIndex: allocationIndex(state),
        priceIndex: priceIndex(state),
        transactionIndex: transactionIndex(state),
    })
}

const holdingsAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    collectHoldingsAsOf,
)

const Holdings = {
    collectAsOf: holdingsAsOf,
    collectTree: (state, viewId) => toHoldingsTree(UI.groupBy(state, viewId), holdingsAsOf(state, viewId)),
}

// ---------------------------------------------------------------------------------------------------------------------
// Keymaps
// ---------------------------------------------------------------------------------------------------------------------

const toAvailableIntents = memoizeOnceWithIdenticalParams((maps, viewId) => Keymap.collectAvailable(maps, viewId))

const Keymaps = {
    availableIntents: state => toAvailableIntents(keymaps(state), activeViewId(state)),
    forView: (state, viewId) => keymaps(state).get(viewId) ?? null,
}

// ---------------------------------------------------------------------------------------------------------------------
// Transactions - helpers
// ---------------------------------------------------------------------------------------------------------------------

const toTransactionTree = memoizeOnceWithIdenticalParams((groupBy, transactions) =>
    buildTransactionTree(groupBy, transactions),
)

// ---------------------------------------------------------------------------------------------------------------------
// Transactions - memoized selectors
// ---------------------------------------------------------------------------------------------------------------------

const collectFiltered = (state, viewId) => {
    const { categories, securities, transactions } = state
    return applyFilter(filter(state, viewId), transactions, categories, securities)
}

const filtered = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],
    'transactionFilters',
    collectFiltered,
)

const collectSearchMatches = (state, viewId) =>
    Transaction.collectSearchMatchIds(filtered(state, viewId), filter(state, viewId).searchQuery, state.categories)

const searchMatches = memoizeReduxStatePerKey(
    ['transactions', 'categories'],
    'transactionFilters',
    collectSearchMatches,
)

const collectEnriched = (state, viewId) =>
    Transaction.enrichAll(filtered(state, viewId), state.categories, state.accounts)

const enriched = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'accounts'],
    'transactionFilters',
    collectEnriched,
)

const collectTree = (state, viewId) => toTransactionTree(UI.groupBy(state, viewId), enriched(state, viewId))

const filteredForAccount = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],
    'transactionFilters',
    (state, viewId, accountId) => filtered(state, viewId).filter(Transaction.isInAccount(accountId)),
)

const collectFilteredForInvestment = (state, viewId, accountId) => {
    const { categories, securities, transactions } = state
    return applyInvestmentFilter(filter(state, viewId), transactions, categories, securities, accountId)
}

const filteredForInvestment = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],
    'transactionFilters',
    collectFilteredForInvestment,
)

const collectSortedForDisplay = (state, viewId, accountId, tableLayoutId, columns) =>
    applySort(
        TableLayout.toSorting(state.tableLayouts.get(tableLayoutId)),
        Transaction.toRegisterRows(filteredForInvestment(state, viewId, accountId)),
        columns,
    )

const sortedForDisplay = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities', 'tableLayouts'],
    'transactionFilters',
    collectSortedForDisplay,
)

const collectHighlightedId = (state, viewId, accountId, tableLayoutId, columns) => {
    const matches = searchMatches(state, viewId)
    if (matches.length > 0) return matches[UI.currentSearchIndex(state, viewId)] ?? null
    const data = sortedForDisplay(state, viewId, accountId, tableLayoutId, columns)
    return data[UI.currentRowIndex(state, viewId)]?.transaction?.id ?? null
}

const highlightedId = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities', 'tableLayouts'],
    'transactionFilters',
    collectHighlightedId,
)

const collectSortedForBankDisplay = (state, viewId, accountId, tableLayoutId, columns) =>
    applySort(
        TableLayout.toSorting(state.tableLayouts.get(tableLayoutId)),
        Transaction.toRegisterRows(filteredForAccount(state, viewId, accountId)),
        columns,
    )

const sortedForBankDisplay = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities', 'tableLayouts'],
    'transactionFilters',
    collectSortedForBankDisplay,
)

const collectHighlightedIdForBank = (state, viewId, accountId, tableLayoutId, columns) => {
    const matches = searchMatches(state, viewId)
    if (matches.length > 0) return matches[UI.currentSearchIndex(state, viewId)] ?? null
    const data = sortedForBankDisplay(state, viewId, accountId, tableLayoutId, columns)
    return data[UI.currentRowIndex(state, viewId)]?.transaction?.id ?? null
}

const highlightedIdForBank = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities', 'tableLayouts'],
    'transactionFilters',
    collectHighlightedIdForBank,
)

const Transactions = {
    collectTree,
    enriched,
    filtered,
    filteredForAccount,
    filteredForInvestment,
    highlightedId,
    highlightedIdForBank,
    searchMatches,
    sortedForBankDisplay,
    sortedForDisplay,
}

// ---------------------------------------------------------------------------------------------------------------------
// Transaction filters (thin wrappers for pages)
// ---------------------------------------------------------------------------------------------------------------------

const Filters = {
    filterByAccount: (txns, accountId) => (!accountId ? txns : txns.filter(Transaction.isInAccount(accountId))),
    filterBySecurities: (txns, securityIds) => txns.filter(Transaction.matchesSecurities(securityIds)),
    filterByInvestmentActions: (txns, actions) => txns.filter(Transaction.matchesInvestmentActions(actions)),
}

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

export {
    // Namespaces
    Accounts,
    Categories,
    Filters,
    Holdings,
    Keymaps,
    Prefs,
    Transactions,
    UI,

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
    tableLayoutProps,
    tableLayouts,
    transactions,

    // Entity lookups
    accountName,
    accountType,
    categoryName,
    securityName,
    securitySymbol,
}
