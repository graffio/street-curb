// ABOUTME: All Redux selectors in one place
// ABOUTME: Thin state accessors and memoized derived selectors
// COMPLEXITY: sig-documentation — Trivial state accessors don't need @sig
// COMPLEXITY: cohesion-structure — Selectors use domain namespaces (UI, Transactions, Holdings) not P/T/F/V/A/E
// COMPLEXITY: export-structure — Selectors export multiple domain namespaces by design
// COMPLEXITY: react-redux-separation — Selectors wire to business modules; line counts are wiring, not logic
/* eslint-disable no-restricted-syntax -- selectors must access state directly */

import {
    applySort,
    containsIgnoreCase,
    memoizeOnceWithIdenticalParams,
    memoizeReduxState,
    memoizeReduxStatePerKey,
} from '@graffio/functional'
import { DATE_RANGES } from '@graffio/design-system'
import { formatDateRange } from '../utils/formatters.js'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { KeymapModule } from '@graffio/keymap'
import { Holdings as HoldingsModule } from '../financial-computations/holdings.js'
import { accountOrganization } from '../services/account-organization.js'
import { Category, EnrichedAccount, TableLayout, Transaction, TransactionFilter } from '../types/index.js'
import { HoldingsTree } from '../utils/holdings-tree.js'
import { toDataTableProps } from '../utils/table-layout.js'
import { TransactionFilters } from './reducers/transaction-filters.js'
import { ViewUiState as ViewUiStateReducer } from './reducers/view-ui-state.js'

const { buildAllocationIndex, buildPriceIndex, buildTransactionIndex } = HoldingsModule
const { Keymap } = KeymapModule

const defaultTableLayoutProps = { sorting: [], columnSizing: {}, columnOrder: [] }
const ACCOUNT_LIST_VIEW_ID = 'rpt_account_list'

// prettier-ignore
const INVESTMENT_ACTIONS = [
    { id: 'Buy',      label: 'Buy' },
    { id: 'Sell',     label: 'Sell' },
    { id: 'Div',      label: 'Dividend' },
    { id: 'ReinvDiv', label: 'Reinvest Dividend' },
    { id: 'XIn',      label: 'Transfer In' },
    { id: 'XOut',     label: 'Transfer Out' },
    { id: 'ContribX', label: 'Contribution' },
    { id: 'WithdrwX', label: 'Withdrawal' },
    { id: 'ShtSell',  label: 'Short Sell' },
    { id: 'CvrShrt',  label: 'Cover Short' },
    { id: 'CGLong',   label: 'Long-Term Gain' },
    { id: 'CGShort',  label: 'Short-Term Gain' },
    { id: 'MargInt',  label: 'Margin Interest' },
    { id: 'ShrsIn',   label: 'Shares In' },
    { id: 'ShrsOut',  label: 'Shares Out' },
    { id: 'StkSplit', label: 'Stock Split' },
    { id: 'Exercise', label: 'Exercise Option' },
    { id: 'Expire',   label: 'Expire Option' },
]

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

const accountName = (state, id) => accounts(state).get(id).name
const securitySymbol = (state, id) => (id ? securities(state).get(id).symbol : null)
const securityName = (state, id) => (id ? securities(state).get(id).name : null)
const categoryName = (state, id) => (id ? categories(state).get(id).name : 'Uncategorized')

// ---------------------------------------------------------------------------------------------------------------------
// UI state accessors (per-view filter state)
// ---------------------------------------------------------------------------------------------------------------------

const defaultFilterCache = new Map()

const getDefaultFilter = viewId => {
    if (!defaultFilterCache.has(viewId)) defaultFilterCache.set(viewId, TransactionFilters.createDefaultFilter(viewId))
    return defaultFilterCache.get(viewId)
}

const filter = (state, viewId) => state.transactionFilters.get(viewId) || getDefaultFilter(viewId)

const defaultViewUiCache = new Map()

const getDefaultViewUi = viewId => {
    if (!defaultViewUiCache.has(viewId))
        defaultViewUiCache.set(viewId, ViewUiStateReducer.createDefaultViewUiState(viewId))
    return defaultViewUiCache.get(viewId)
}

const viewUi = (state, viewId) => state.viewUiState.get(viewId) || getDefaultViewUi(viewId)

// prettier-ignore
const UI = {
    asOfDate                 : (state, viewId) => filter(state, viewId).asOfDate,
    pageTitle                : state => state.pageTitle,
    pageSubtitle             : state => state.pageSubtitle,
    currentRowIndex          : (state, viewId) => viewUi(state, viewId).currentRowIndex,
    currentSearchIndex       : (state, viewId) => viewUi(state, viewId).currentSearchIndex,
    customEndDate            : (state, viewId) => filter(state, viewId).customEndDate,
    customStartDate          : (state, viewId) => filter(state, viewId).customStartDate,
    dateRange                : (state, viewId) => filter(state, viewId).dateRange,
    dateRangeKey             : (state, viewId) => filter(state, viewId).dateRangeKey,
    filterPopoverId          : (state, viewId) => viewUi(state, viewId).filterPopoverId,
    filterPopoverHighlight   : (state, viewId) => viewUi(state, viewId).filterPopoverHighlight,
    filterQuery              : (state, viewId) => filter(state, viewId).filterQuery,
    groupBy                  : (state, viewId) => filter(state, viewId).groupBy,
    searchQuery              : (state, viewId) => filter(state, viewId).searchQuery,
    selectedAccounts         : (state, viewId) => filter(state, viewId).selectedAccounts,
    selectedCategories       : (state, viewId) => filter(state, viewId).selectedCategories,
    selectedInvestmentActions: (state, viewId) => filter(state, viewId).selectedInvestmentActions,
    selectedSecurities       : (state, viewId) => filter(state, viewId).selectedSecurities,
    treeExpansion            : (state, viewId) => viewUi(state, viewId).treeExpansion,
    collapsedSections        : state => state.collapsedSections,
    columnSizing             : (state, viewId) => viewUi(state, viewId).columnSizing,
    columnOrder              : (state, viewId) => viewUi(state, viewId).columnOrder,
    sortMode                 : state => state.accountListSortMode,
}

// ---------------------------------------------------------------------------------------------------------------------
// UI derived selectors (pre-joined filter data for FilterChips)
// ---------------------------------------------------------------------------------------------------------------------

const _accountFilterData = (state, viewId) => {
    const selected = filter(state, viewId).selectedAccounts
    const rows = Array.from(accounts(state)).map(({ id, name }) => ({ id, name, isSelected: selected.includes(id) }))
    const badges = selected.map(id => ({ id, label: accounts(state).get(id)?.name || id }))
    return { rows, badges, selectedIds: selected, count: selected.length }
}

const _securityFilterData = (state, viewId) => {
    const selected = filter(state, viewId).selectedSecurities

    // prettier-ignore
    const rows = Array.from(securities(state)).map(({ id, symbol, name }) => ({ id, symbol, name, isSelected: selected.includes(id) }))
    const badges = selected.map(id => ({ id, label: securities(state).get(id)?.symbol || id }))
    return { rows, badges, count: selected.length }
}

const _actionFilterData = (state, viewId) => {
    const selected = filter(state, viewId).selectedInvestmentActions
    const rows = INVESTMENT_ACTIONS.map(({ id, label }) => ({ id, label, isSelected: selected.includes(id) }))
    const badges = selected.map(id => ({ id, label: INVESTMENT_ACTIONS.find(a => a.id === id)?.label || id }))
    return { rows, badges, count: selected.length }
}

const _categoryFilterData = (state, viewId) => {
    const selected = filter(state, viewId).selectedCategories
    const badges = selected.map(name => ({ id: name, label: name }))
    return { badges, selectedIds: selected, count: selected.length }
}

UI.accountFilterData = memoizeReduxStatePerKey(['accounts'], 'transactionFilters', _accountFilterData)
UI.securityFilterData = memoizeReduxStatePerKey(['securities'], 'transactionFilters', _securityFilterData)
UI.actionFilterData = memoizeReduxStatePerKey([], 'transactionFilters', _actionFilterData)
UI.categoryFilterData = memoizeReduxStatePerKey(['categories'], 'transactionFilters', _categoryFilterData)

const CLOSED_POPOVER = {
    popoverId: null,
    searchText: '',
    highlightedIndex: 0,
    nextHighlightIndex: 0,
    prevHighlightIndex: 0,
    highlightedItemId: null,
    filteredItems: [],
}

const DATE_RANGE_ITEMS = Object.entries(DATE_RANGES)
    .filter(([key]) => !key.startsWith('separator'))
    .map(([key, label]) => ({ id: key, label }))

const POPOVER_ITEM_SOURCES = {
    accounts: state => Array.from(accounts(state)).map(({ id, name }) => ({ id, label: name })),
    actions: () => INVESTMENT_ACTIONS.map(({ id, label }) => ({ id, label })),
    categories: state => Category.collectAllNames(categories(state)).map(name => ({ id: name, label: name })),
    date: () => DATE_RANGE_ITEMS,
    securities: state => Array.from(securities(state)).map(({ id, symbol }) => ({ id, label: symbol })),
}

const _filterPopoverData = (state, viewId) => {
    const ui = viewUi(state, viewId)
    const { filterPopoverId, filterPopoverSearch, filterPopoverHighlight } = ui
    if (!filterPopoverId) return CLOSED_POPOVER

    const source = POPOVER_ITEM_SOURCES[filterPopoverId]
    if (!source) return CLOSED_POPOVER

    const allItems = source(state)
    const searchText = filterPopoverSearch
    const filteredItems = searchText.trim()
        ? allItems.filter(item => containsIgnoreCase(searchText)(item.label))
        : allItems
    const count = filteredItems.length

    // -1 means no highlight (initial state), otherwise clamp to valid range
    const highlightedIndex = count === 0 ? -1 : Math.max(-1, Math.min(filterPopoverHighlight, count - 1))

    // Arrow down from -1 goes to 0, otherwise wrap around
    const nextHighlightIndex =
        count === 0 ? -1 : highlightedIndex < 0 ? 0 : highlightedIndex < count - 1 ? highlightedIndex + 1 : 0

    // Arrow up from -1 goes to last item, otherwise wrap around
    const prevHighlightIndex =
        count === 0 ? -1 : highlightedIndex < 0 ? count - 1 : highlightedIndex > 0 ? highlightedIndex - 1 : count - 1
    const highlightedItemId = highlightedIndex >= 0 && count > 0 ? filteredItems[highlightedIndex].id : null

    return {
        popoverId: filterPopoverId,
        searchText,
        highlightedIndex,
        nextHighlightIndex,
        prevHighlightIndex,
        highlightedItemId,
        filteredItems,
    }
}

UI.filterPopoverData = memoizeReduxStatePerKey(['accounts', 'securities'], 'viewUiState', _filterPopoverData)

// ---------------------------------------------------------------------------------------------------------------------
// Per-chip selectors (each returns { isActive, details } for FilterChipRow)
// ---------------------------------------------------------------------------------------------------------------------

const MAX_DETAIL_LINES = 3
const ACTION_LABELS_MAP = Object.fromEntries(INVESTMENT_ACTIONS.map(({ id, label }) => [id, label]))

// Truncates a list of strings to MAX_DETAIL_LINES with "+N more" suffix
// @sig toTruncatedDetails :: [String] -> [String]
const toTruncatedDetails = items => {
    const { length } = items
    if (length === 0) return []
    if (length <= MAX_DETAIL_LINES) return items
    const shown = items.slice(0, MAX_DETAIL_LINES - 1)
    return [...shown, `+${length - shown.length} more`]
}

const _dateChipData = (state, viewId) => {
    const { dateRange, dateRangeKey } = filter(state, viewId)
    const label = dateRange ? formatDateRange(dateRange.start, dateRange.end) : null
    return { isActive: dateRangeKey !== 'all', details: label ? [label] : [] }
}

const _categoryChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedCategories
    return { isActive: selected.length > 0, details: toTruncatedDetails(selected) }
}

const _accountChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedAccounts
    const names = selected.map(id => accounts(state).get(id)?.name || id)
    return { isActive: selected.length > 0, details: toTruncatedDetails(names) }
}

const _securityChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedSecurities
    const symbols = selected.map(id => securities(state).get(id)?.symbol || id)
    return { isActive: selected.length > 0, details: toTruncatedDetails(symbols) }
}

const _actionChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedInvestmentActions
    const labels = selected.map(code => ACTION_LABELS_MAP[code] || code)
    return { isActive: selected.length > 0, details: toTruncatedDetails(labels) }
}

const _searchChipData = (state, viewId) => {
    const query = filter(state, viewId).filterQuery
    return { isActive: query?.length > 0 }
}

const _filterCounts = (state, viewId, accountId = null) => {
    const { categories, securities, transactions } = state
    const f = filter(state, viewId)
    const filteredTxns = TransactionFilter.apply(f, transactions, categories, securities)
    const baseTxns = accountId ? transactions.filter(t => t.accountId === accountId) : Array.from(transactions)
    const accountFilteredTxns = accountId ? filteredTxns.filter(t => t.accountId === accountId) : filteredTxns
    const total = baseTxns.length
    const filtered = accountFilteredTxns.length
    const isFiltering = filtered < total || f.dateRangeKey !== 'all' || f.filterQuery?.length > 0
    return { filtered, total, isFiltering }
}

UI.dateChipData = memoizeReduxStatePerKey([], 'transactionFilters', _dateChipData)
UI.categoryChipData = memoizeReduxStatePerKey([], 'transactionFilters', _categoryChipData)
UI.accountChipData = memoizeReduxStatePerKey(['accounts'], 'transactionFilters', _accountChipData)
UI.securityChipData = memoizeReduxStatePerKey(['securities'], 'transactionFilters', _securityChipData)
UI.actionChipData = memoizeReduxStatePerKey([], 'transactionFilters', _actionChipData)
UI.searchChipData = memoizeReduxStatePerKey([], 'transactionFilters', _searchChipData)
UI.filterCounts = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],
    'transactionFilters',
    _filterCounts,
)

// ---------------------------------------------------------------------------------------------------------------------
// Tab layout derived
// ---------------------------------------------------------------------------------------------------------------------

const activeViewId = state => {
    const { tabLayout } = state
    const activeGroup = tabLayout.tabGroups.get(tabLayout.activeTabGroupId)
    return activeGroup?.activeViewId ?? null
}

const tableLayoutProps = memoizeReduxStatePerKey(['tableLayouts'], 'tableLayouts', (state, tableLayoutId) => {
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
// @sig _organizedAccounts :: State -> LookupTable<AccountSection>
const _organizedAccounts = state => {
    const { accounts, transactions, accountListSortMode } = state
    const holdings = Holdings.asOf(state, ACCOUNT_LIST_VIEW_ID)
    const enriched = LookupTable(EnrichedAccount.enrichAll(accounts, holdings, transactions), EnrichedAccount, 'id')
    return accountOrganization.A.collectSections(enriched, accountListSortMode)
}

const Accounts = { organized: memoizeReduxState(ACCOUNT_STATE_KEYS, _organizedAccounts) }

// ---------------------------------------------------------------------------------------------------------------------
// Holdings
// ---------------------------------------------------------------------------------------------------------------------

const priceIndex = memoizeReduxState(['prices'], state => buildPriceIndex(state.prices))
const allocationIndex = memoizeReduxState(['lotAllocations'], state => buildAllocationIndex(state.lotAllocations))
const transactionIndex = memoizeReduxState(['transactions'], state => buildTransactionIndex(state.transactions))

const _holdingsAsOf = (state, viewId) => {
    const { asOfDate, filterQuery, selectedAccounts } = filter(state, viewId)
    const { accounts, lotAllocations, lots, prices, securities, transactions } = state
    return HoldingsModule.computeHoldingsAsOf({
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
    _holdingsAsOf,
)

const _holdingsTree = (state, viewId) => {
    const groupBy = filter(state, viewId).groupBy || 'account'
    return HoldingsTree.buildHoldingsTree(groupBy, holdingsAsOf(state, viewId))
}

const holdingsTree = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    _holdingsTree,
)

const Holdings = { asOf: holdingsAsOf, tree: holdingsTree }

// ---------------------------------------------------------------------------------------------------------------------
// Keymaps
// ---------------------------------------------------------------------------------------------------------------------

const toAvailableIntents = memoizeOnceWithIdenticalParams((maps, viewId) => Keymap.collectAvailable(maps, viewId))

const Keymaps = { availableIntents: state => toAvailableIntents(keymaps(state), activeViewId(state)) }

// ---------------------------------------------------------------------------------------------------------------------
// Transactions - memoized selectors
// ---------------------------------------------------------------------------------------------------------------------

const _filtered = (state, viewId) => {
    const { categories, securities, transactions } = state
    return TransactionFilter.apply(filter(state, viewId), transactions, categories, securities)
}

const _searchMatches = (state, viewId) =>
    Transaction.collectSearchMatchIds(T.filtered(state, viewId), filter(state, viewId).searchQuery, state.categories)

const _enriched = (state, viewId) => Transaction.enrichAll(T.filtered(state, viewId), state.categories, state.accounts)

const _forAccount = (state, _viewId, accountId) => state.transactions.filter(Transaction.isInAccount(accountId))

const _filteredForAccount = (state, viewId, accountId) =>
    T.filtered(state, viewId).filter(Transaction.isInAccount(accountId))

const _filteredForInvestment = (state, viewId, accountId) => {
    const { categories, securities, transactions } = state
    return TransactionFilter.applyInvestment(filter(state, viewId), transactions, categories, securities, accountId)
}

const _sortedForDisplay = (state, viewId, accountId, tableLayoutId, columns) => {
    const tableLayout = state.tableLayouts.get(tableLayoutId)
    const rows = Transaction.toRegisterRows(T.filteredForInvestment(state, viewId, accountId))
    return tableLayout ? applySort(TableLayout.toSorting(tableLayout), rows, columns) : rows
}

const _highlightedId = (state, viewId, accountId, tableLayoutId, columns) => {
    const matches = T.searchMatches(state, viewId)
    if (matches.length > 0) return matches[UI.currentSearchIndex(state, viewId)]

    const data = T.sortedForDisplay(state, viewId, accountId, tableLayoutId, columns)
    return data[UI.currentRowIndex(state, viewId)]?.transaction.id ?? null
}

const _sortedForBankDisplay = (state, viewId, accountId, tableLayoutId, columns) => {
    const tableLayout = state.tableLayouts.get(tableLayoutId)
    const rows = Transaction.toRegisterRows(T.filteredForAccount(state, viewId, accountId))
    return tableLayout ? applySort(TableLayout.toSorting(tableLayout), rows, columns) : rows
}

const _highlightedIdForBank = (state, viewId, accountId, tableLayoutId, columns) => {
    const matches = T.searchMatches(state, viewId)
    if (matches.length > 0) return matches[UI.currentSearchIndex(state, viewId)]
    const data = T.sortedForBankDisplay(state, viewId, accountId, tableLayoutId, columns)
    return data[UI.currentRowIndex(state, viewId)]?.transaction.id ?? null
}

// prettier-ignore
const T= {
    enriched             : memoizeReduxStatePerKey(['transactions', 'categories', 'accounts'                  ], 'transactionFilters', _enriched),
    filtered             : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'                ], 'transactionFilters', _filtered),
    forAccount           : memoizeReduxStatePerKey(['transactions'                                              ], 'transactionFilters', _forAccount),
    filteredForAccount   : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'                ], 'transactionFilters', _filteredForAccount,),
    filteredForInvestment: memoizeReduxStatePerKey(['transactions', 'categories', 'securities'                ], 'transactionFilters', _filteredForInvestment,),
    highlightedId        : memoizeReduxStatePerKey(['transactions', 'categories', 'securities', 'tableLayouts', 'viewUiState'], 'transactionFilters', _highlightedId,),
    highlightedIdForBank : memoizeReduxStatePerKey(['transactions', 'categories', 'securities', 'tableLayouts', 'viewUiState'], 'transactionFilters', _highlightedIdForBank,),
    searchMatches        : memoizeReduxStatePerKey(['transactions', 'categories'                              ], 'transactionFilters', _searchMatches),
    sortedForBankDisplay : memoizeReduxStatePerKey(['transactions', 'categories', 'securities', 'tableLayouts'], 'transactionFilters', _sortedForBankDisplay,),
    sortedForDisplay     : memoizeReduxStatePerKey(['transactions', 'categories', 'securities', 'tableLayouts'], 'transactionFilters', _sortedForDisplay,),
}

const Transactions = T

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

export {
    // Namespaces
    Accounts,
    Categories,
    Holdings,
    Keymaps,
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
    categoryName,
    securityName,
    securitySymbol,
}
