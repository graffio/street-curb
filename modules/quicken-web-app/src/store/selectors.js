// ABOUTME: All Redux selectors in one place
// ABOUTME: Thin state accessors and memoized derived selectors
// COMPLEXITY: sig-documentation — Trivial state accessors don't need @sig
// COMPLEXITY: cohesion-structure — Selectors use domain namespaces (UI, Transactions, Holdings) not P/T/F/V/A/E
// COMPLEXITY: export-structure — Selectors export multiple domain namespaces by design
// COMPLEXITY: react-redux-separation — Selectors wire to business modules; line counts are wiring, not logic
// COMPLEXITY: function-naming — Selectors are noun-named by Redux convention (accounts, tableLayouts, not toAccounts)

import { DateRangeUtils } from '../utils/date-range-utils.js'
import {
    applySort,
    containsIgnoreCase,
    memoizeReduxState,
    memoizeReduxStatePerKey,
    truncateWithCount,
    wrapIndex,
} from '@graffio/functional'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Holdings as HoldingsModule } from '../financial-computations/holdings.js'
import { toAccountSections } from './to-account-sections.js'
import {
    Category,
    ColumnDescriptor,
    EnrichedAccount,
    SortOrder,
    TableLayout,
    Transaction,
    TransactionFilter,
} from '../types/index.js'
import { Formatters } from '../utils/formatters.js'
import { HoldingsTree } from '../utils/holdings-tree.js'
import { TransactionFilters } from './reducers/transaction-filters.js'
import { ViewUiState as ViewUiStateReducer } from './reducers/view-ui-state.js'

const { buildAllocationIndex, buildPriceIndex, buildTransactionIndex } = HoldingsModule

const defaultTableLayoutProps = { sorting: [], columnSizing: {}, columnOrder: [] }
const ACCOUNT_LIST_VIEW_ID = 'rpt_account_list'
const INVESTMENT_ACTIONS = TransactionFilter.INVESTMENT_ACTIONS

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

const DATE_RANGE_ITEMS = Object.entries(DateRangeUtils.DATE_RANGES)
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

    // prettier-ignore
    const { index: highlightedIndex, next: nextHighlightIndex, prev: prevHighlightIndex } = wrapIndex(filterPopoverHighlight, count)
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

const _dateChipData = (state, viewId) => {
    const { dateRange, dateRangeKey } = filter(state, viewId)
    const label = dateRange ? Formatters.formatDateRange(dateRange.start, dateRange.end) : null
    return { isActive: dateRangeKey !== 'all', details: label ? [label] : [] }
}

const _categoryChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedCategories
    return { isActive: selected.length > 0, details: truncateWithCount(selected, MAX_DETAIL_LINES) }
}

const _accountChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedAccounts
    const names = selected.map(id => accounts(state).get(id)?.name || id)
    return { isActive: selected.length > 0, details: truncateWithCount(names, MAX_DETAIL_LINES) }
}

const _securityChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedSecurities
    const symbols = selected.map(id => securities(state).get(id)?.symbol || id)
    return { isActive: selected.length > 0, details: truncateWithCount(symbols, MAX_DETAIL_LINES) }
}

const _actionChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedInvestmentActions
    const labels = selected.map(code => ACTION_LABELS_MAP[code] || code)
    return { isActive: selected.length > 0, details: truncateWithCount(labels, MAX_DETAIL_LINES) }
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
    const isFiltering = TransactionFilter.isActive(f)
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

// prettier-ignore
const categoryDimensionLayouts = {
    category: { title: 'Spending by Category',  subtitle: 'View spending breakdown by category hierarchy' },
    account : { title: 'Spending by Account',   subtitle: 'View spending breakdown by account' },
    payee   : { title: 'Spending by Payee',     subtitle: 'View spending breakdown by payee' },
    month   : { title: 'Spending by Month',     subtitle: 'View spending breakdown by month' },
}

// prettier-ignore
const holdingsDimensionLayouts = {
    account     : { title: 'Holdings by Account',  subtitle: 'View portfolio positions by account' },
    security    : { title: 'Holdings by Security',  subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Holdings by Type',      subtitle: 'View portfolio positions by security type' },
    goal        : { title: 'Holdings by Goal',      subtitle: 'View portfolio positions by investment goal' },
}

const defaultPageTitle = { title: 'Dashboard', subtitle: '' }

// Derives page title from active view type + related state
// @sig _activeViewPageTitle :: State -> { title: String, subtitle: String }
const _activeViewPageTitle = state => {
    const tl = state.tabLayout
    const group = tl.tabGroups.get(tl.activeTabGroupId)
    const { activeViewId: viewId, views } = group ?? {}
    if (!viewId) return defaultPageTitle
    const view = views.get(viewId)
    if (!view) return defaultPageTitle
    return view.match({
        Register: () => {
            const account = accounts(state).get(view.accountId)
            if (!account) return defaultPageTitle
            return { title: account.name, subtitle: account.type }
        },
        Report: () => {
            const groupBy = filter(state, view.id).groupBy
            if (view.reportType === 'holdings')
                return holdingsDimensionLayouts[groupBy || 'account'] || holdingsDimensionLayouts.account
            return categoryDimensionLayouts[groupBy || 'category'] || categoryDimensionLayouts.category
        },
        Reconciliation: () => ({ title: 'Reconciliation', subtitle: '' }),
    })
}

const activeViewPageTitle = memoizeReduxState(['tabLayout', 'accounts', 'transactionFilters'], _activeViewPageTitle)

const tableLayoutProps = memoizeReduxStatePerKey(['tableLayouts'], 'tableLayouts', (state, tableLayoutId) => {
    const tableLayout = state.tableLayouts.get(tableLayoutId)
    return tableLayout ? TableLayout.toDataTableProps(tableLayout) : defaultTableLayoutProps
})

// Resolves a tableLayout: reconcile existing or construct default from columns
const resolveTableLayout = (state, tableLayoutId, columns) => {
    const existing = state.tableLayouts.get(tableLayoutId)
    if (existing) return TableLayout.reconcile(existing, columns)
    const descriptors = columns.map(col => ColumnDescriptor(col.id, col.size || 100, 'none'))
    return TableLayout(
        tableLayoutId,
        LookupTable(descriptors, ColumnDescriptor, 'id'),
        LookupTable([], SortOrder, 'id'),
    )
}

// Returns existing tableLayout (reconciled with columns) or constructs a default
// Replaces ensureTableLayoutEffect — selectors handle "not yet initialized"
const tableLayoutOrDefault = memoizeReduxStatePerKey(['tableLayouts'], 'tableLayouts', resolveTableLayout)

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
    return toAccountSections(enriched, accountListSortMode)
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
// Transactions - memoized selectors
// ---------------------------------------------------------------------------------------------------------------------

const _filtered = (state, viewId) => {
    const { categories, securities, transactions } = state
    return TransactionFilter.apply(filter(state, viewId), transactions, categories, securities)
}

const _searchMatches = (state, viewId, accountId) =>
    Transaction.collectSearchMatchIds(
        T.filteredForAccount(state, viewId, accountId),
        filter(state, viewId).searchQuery,
        state.categories,
        state.securities,
    )

const _enriched = (state, viewId) => Transaction.enrichAll(T.filtered(state, viewId), state.categories, state.accounts)

const _forAccount = (state, _viewId, accountId) => state.transactions.filter(Transaction.isInAccount(accountId))

const _filteredForAccount = (state, viewId, accountId) =>
    T.filtered(state, viewId).filter(Transaction.isInAccount(accountId))

const _filteredForInvestment = (state, viewId, accountId) => {
    const { categories, securities, transactions } = state
    return TransactionFilter.applyInvestment(filter(state, viewId), transactions, categories, securities, accountId)
}

const _makeSortedSelector = filterFn => (state, viewId, accountId, tableLayoutId, columns) => {
    const tableLayout = state.tableLayouts.get(tableLayoutId)
    const rows = Transaction.toRegisterRows(filterFn(state, viewId, accountId))
    return tableLayout ? applySort(TableLayout.toSorting(tableLayout), rows, columns) : rows
}

const _makeHighlightSelector = sortFn => (state, viewId, accountId, tableLayoutId, columns) => {
    const data = sortFn(state, viewId, accountId, tableLayoutId, columns)
    return data[UI.currentRowIndex(state, viewId)]?.transaction.id ?? null
}

const SORT_STATE_KEYS = ['transactions', 'categories', 'securities', 'tableLayouts']
const HIGHLIGHT_STATE_KEYS = [...SORT_STATE_KEYS, 'viewUiState']

// prettier-ignore
const T= {
    enriched             : memoizeReduxStatePerKey(['transactions', 'categories', 'accounts'  ], 'transactionFilters', _enriched),
    filtered             : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _filtered),
    forAccount           : memoizeReduxStatePerKey(['transactions'                            ], 'transactionFilters', _forAccount),
    filteredForAccount   : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _filteredForAccount),
    filteredForInvestment: memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _filteredForInvestment),
    searchMatches        : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _searchMatches),
}

// Parameterized sort/highlight pairs — wired after T is defined so factory receives memoized filter functions
T.sortedForDisplay = memoizeReduxStatePerKey(
    SORT_STATE_KEYS,
    'transactionFilters',
    _makeSortedSelector(T.filteredForInvestment),
)
T.sortedForBankDisplay = memoizeReduxStatePerKey(
    SORT_STATE_KEYS,
    'transactionFilters',
    _makeSortedSelector(T.filteredForAccount),
)
T.highlightedId = memoizeReduxStatePerKey(
    HIGHLIGHT_STATE_KEYS,
    'transactionFilters',
    _makeHighlightSelector(T.sortedForDisplay),
)
T.highlightedIdForBank = memoizeReduxStatePerKey(
    HIGHLIGHT_STATE_KEYS,
    'transactionFilters',
    _makeHighlightSelector(T.sortedForBankDisplay),
)

const Transactions = T

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

export {
    Accounts,
    Categories,
    Holdings,
    Transactions,
    UI,

    // Base state
    accounts,
    activeViewId,
    activeViewPageTitle,
    categories,
    draggingViewId,
    dropTargetGroupId,
    initialized,
    loadingStatus,
    lots,
    prices,
    securities,
    showDrawer,
    showReopenBanner,
    tabLayout,
    tableLayoutOrDefault,
    tableLayoutProps,
    tableLayouts,
    transactions,

    // Entity lookups
    accountName,
    categoryName,
    securityName,
    securitySymbol,
}
