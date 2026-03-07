// ABOUTME: All Redux selectors in one place
// ABOUTME: Thin state accessors and memoized derived selectors
import {
    applySort,
    containsIgnoreCase,
    LookupTable,
    memoizeOnce,
    memoizeReduxState,
    memoizeReduxStatePerKey,
    truncateWithCount,
    wrapIndex,
} from '@graffio/functional'
import { computeBenchmarkReturn } from '../financial-computations/compute-benchmark-return.js'
import { computeDividendIncome } from '../financial-computations/compute-dividend-income.js'
import { computeIrr } from '../financial-computations/compute-irr.js'
import { computePositions } from '../financial-computations/compute-positions.js'
import { computeRealizedGains } from '../financial-computations/compute-realized-gains.js'
import { Category, EnrichedAccount, TableLayout, Transaction, TransactionFilter, View } from '../types/index.js'
import { CategoryTree } from '../utils/category-tree.js'

// COMPLEXITY: sig-documentation — Trivial state accessors don't need @sig
// COMPLEXITY: cohesion-structure — Selectors use domain namespaces (UI, Transactions, Positions) not P/T/F/V/A/E
// COMPLEXITY: export-structure — Selectors export multiple domain namespaces by design
// COMPLEXITY: function-naming — Selectors are noun-named by Redux convention (accounts, tableLayouts, not toAccounts)
// COMPLEXITY: section-separators — Domain-specific 3-line separators group selectors by concern
// COMPLEXITY: react-redux-separation — Selectors join multiple state slices by design
import { DateRangeUtils } from '../utils/date-range-utils.js'
import { Formatters } from '../utils/formatters.js'
import { buildPositionsTree } from '../financial-computations/build-positions-tree.js'
import { TabLayout as TabLayoutReducers } from './reducers/tab-layout.js'
import { TransactionFilters } from './reducers/transaction-filters.js'
import { ViewUiState as ViewUiStateReducer } from './reducers/view-ui-state.js'
import { toAccountSections } from './to-account-sections.js'
import { toFinancialQueryDescription } from '../query-language/to-financial-query-description.js'
import { runFinancialQuery } from '../query-language/run-financial-query.js'
import { MergeChipFilters } from '../query-language/merge-chip-filters.js'

const defaultTableLayoutProps = { sorting: [], columnSizing: {}, columnOrder: [] }
const ACCOUNT_LIST_VIEW_ID = 'rpt_account_list'
const INVESTMENT_ACTIONS = TransactionFilter.INVESTMENT_ACTIONS
const ACTION_LABELS_MAP = Object.fromEntries(INVESTMENT_ACTIONS.map(({ id, label }) => [id, label]))

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
const transferNavPending = state => state.transferNavPending
const pickerType = state => state.pickerType
const pickerHighlight = state => state.pickerHighlight
const pickerSearch = state => state.pickerSearch
const pickerPosition = state => state.pickerPosition
const actionRegistryVersion = state => state.actionRegistryVersion

// ---------------------------------------------------------------------------------------------------------------------
// Entity lookups (state, id) -> value
// ---------------------------------------------------------------------------------------------------------------------

const accountName = (state, id) => accounts(state).get(id).name
const securitySymbol = (state, id) => (id ? securities(state).get(id).symbol : undefined)
const securityName = (state, id) => (id ? securities(state).get(id).name : undefined)
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
const _toCollapsedSet = memoizeOnce(
    arr => arr,
    arr => new Set(arr),
)

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
    highlightedRowId         : (state, viewId) => viewUi(state, viewId).highlightedRowId,
    searchQuery              : (state, viewId) => filter(state, viewId).searchQuery,
    selectedAccounts         : (state, viewId) => filter(state, viewId).selectedAccounts,
    selectedCategories       : (state, viewId) => filter(state, viewId).selectedCategories,
    selectedInvestmentActions: (state, viewId) => filter(state, viewId).selectedInvestmentActions,
    selectedSecurities       : (state, viewId) => filter(state, viewId).selectedSecurities,
    treeExpansion            : (state, viewId) => viewUi(state, viewId).treeExpansion,
    collapsedSections        : state => _toCollapsedSet(state.collapsedSections),
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
    const badges = selected.map(id => ({ id, label: ACTION_LABELS_MAP[id] || id }))
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
    popoverId: undefined,
    searchText: '',
    highlightedIndex: 0,
    nextHighlightIndex: 0,
    prevHighlightIndex: 0,
    highlightedItemId: undefined,
    filteredItems: [],
    allItems: [],
}

const DATE_RANGE_ITEMS = Object.entries(DateRangeUtils.DATE_RANGES)
    .filter(([key]) => !key.startsWith('separator'))
    .map(([key, label]) => ({ id: key, label }))

const _pickerAccountItems = state => Array.from(accounts(state)).map(({ id, name }) => ({ id, label: name }))

const POPOVER_ITEM_SOURCES = {
    accounts: _pickerAccountItems,
    actions: () => INVESTMENT_ACTIONS.map(({ id, label }) => ({ id, label })),
    categories: state => Category.collectAllNames(categories(state)).map(name => ({ id: name, label: name })),
    date: () => DATE_RANGE_ITEMS,
    securities: state => Array.from(securities(state)).map(({ id, symbol }) => ({ id, label: symbol })),
}

// items must be a stable reference (module-level constant) for cache stability
const _filterPopoverData = (state, viewId, items) => {
    const ui = viewUi(state, viewId)
    const { filterPopoverId, filterPopoverSearch, filterPopoverHighlight } = ui
    if (!filterPopoverId) return CLOSED_POPOVER

    const allItems = items ?? POPOVER_ITEM_SOURCES[filterPopoverId]?.(state)
    if (!allItems) return CLOSED_POPOVER
    const searchText = filterPopoverSearch
    const matchesSearch = containsIgnoreCase(searchText)
    const filteredItems = searchText.trim() ? allItems.filter(item => matchesSearch(item.label)) : allItems
    const count = filteredItems.length

    // prettier-ignore
    const { index: highlightedIndex, next: nextHighlightIndex, prev: prevHighlightIndex } = wrapIndex(filterPopoverHighlight, count)
    const highlightedItemId = highlightedIndex >= 0 && count > 0 ? filteredItems[highlightedIndex].id : undefined

    return {
        popoverId: filterPopoverId,
        searchText,
        highlightedIndex,
        nextHighlightIndex,
        prevHighlightIndex,
        highlightedItemId,
        filteredItems,
        allItems,
    }
}

UI.filterPopoverData = memoizeReduxStatePerKey(['accounts', 'securities'], 'viewUiState', _filterPopoverData)

const CLOSED_PICKER = {
    searchText: '',
    highlightedIndex: -1,
    nextHighlightIndex: -1,
    prevHighlightIndex: -1,
    filteredItems: [],
    position: undefined,
}

const _pickerData = (state, items) => {
    const { pickerType, pickerSearch, pickerHighlight, pickerPosition } = state
    if (!pickerType) return CLOSED_PICKER
    const matchesSearch = containsIgnoreCase(pickerSearch)
    const filteredItems = pickerSearch.trim() ? items.filter(item => matchesSearch(item.label)) : items
    const count = filteredItems.length

    // prettier-ignore
    const { index: highlightedIndex, next: nextHighlightIndex, prev: prevHighlightIndex } = wrapIndex(pickerHighlight, count)

    return {
        searchText: pickerSearch,
        highlightedIndex,
        nextHighlightIndex,
        prevHighlightIndex,
        filteredItems,
        position: pickerPosition,
    }
}

const pickerData = memoizeReduxState(['pickerType', 'pickerSearch', 'pickerHighlight', 'pickerPosition'], _pickerData)

const pickerAccountItems = memoizeReduxState(['accounts'], _pickerAccountItems)

// ---------------------------------------------------------------------------------------------------------------------
// Per-chip selectors (each returns { isActive, details } for FilterChipRow)
// ---------------------------------------------------------------------------------------------------------------------

const MAX_DETAIL_LINES = 3

const _dateChipData = (state, viewId) => {
    const { dateRange, dateRangeKey } = filter(state, viewId)
    const label = dateRange ? Formatters.formatDateRange(dateRange.start, dateRange.end) : undefined
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

const _filterCounts = (state, viewId, accountId) => {
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
    return activeGroup?.activeViewId
}

const tabGroupById = (state, groupId) => state.tabLayout.tabGroups.get(groupId)

const tabGroupIsActive = (state, groupId) => state.tabLayout.activeTabGroupId === groupId

const atMaxGroups = state => state.tabLayout.tabGroups.length >= TabLayoutReducers.MAX_GROUPS

// Stable reference table for tabMoveDisabled — indexed by (left | right<<1) to avoid new object allocation
const TAB_MOVE_DISABLED_REFS = [
    { left: false, right: false },
    { left: true, right: false },
    { left: false, right: true },
    { left: true, right: true },
]

// Whether Move Left/Right is disabled for a tab at its current position (at edge with MAX_GROUPS)
// Returns a stable reference per boolean combination to avoid unnecessary rerenders
const tabMoveDisabled = (state, viewId, groupId) => {
    const { tabGroups } = state.tabLayout
    const group = tabGroups.get(groupId)
    const atMax = tabGroups.length >= TabLayoutReducers.MAX_GROUPS
    const left = atMax && tabGroups[0].id === groupId && group.views[0].id === viewId
    const right =
        atMax && tabGroups[tabGroups.length - 1].id === groupId && group.views[group.views.length - 1].id === viewId
    return TAB_MOVE_DISABLED_REFS[left | (right << 1)]
}

// Flat list of all views across all tab groups for the tab picker
// Carries groupId because SetActiveView(groupId, viewId) requires both
const _pickerTabItems = state =>
    state.tabLayout.tabGroups.flatMap(group =>
        group.views.map(view => ({ id: view.id, label: view.title, groupId: group.id })),
    )

const pickerTabItems = memoizeReduxState(['tabLayout'], _pickerTabItems)

// Derives page title from active view type + related state
// @sig _activeViewPageTitle :: State -> { title: String, subtitle: String }
const _activeViewPageTitle = state => {
    const tl = state.tabLayout
    const group = tl.tabGroups.get(tl.activeTabGroupId)
    const { activeViewId: viewId, views } = group ?? {}
    if (!viewId) return View.DEFAULT_PAGE_TITLE
    const view = views.get(viewId)
    if (!view) return View.DEFAULT_PAGE_TITLE
    return view.match({
        Register: () => {
            const account = accounts(state).get(view.accountId)
            if (!account) return View.DEFAULT_PAGE_TITLE
            return { title: account.name, subtitle: account.type }
        },
        Report: () => View.toReportTitle(view.reportType, filter(state, view.id).groupBy),
        Reconciliation: () => ({ title: 'Reconciliation', subtitle: '' }),
    })
}

// prettier-ignore
const _activeViewPageTitleCacheKey = state => {
    const { tabLayout: { activeTabGroupId, tabGroups }, accounts: stateAccounts, transactionFilters } = state
    const group = tabGroups.get(activeTabGroupId)
    return [activeTabGroupId, group?.activeViewId, group?.views, stateAccounts, transactionFilters]
}

const activeViewPageTitle = memoizeOnce(_activeViewPageTitleCacheKey, _activeViewPageTitle)

const tableLayoutProps = memoizeReduxStatePerKey(['tableLayouts'], 'tableLayouts', (state, tableLayoutId) => {
    const tableLayout = state.tableLayouts.get(tableLayoutId)
    return tableLayout ? TableLayout.toDataTableProps(tableLayout) : defaultTableLayoutProps
})

// Resolves a tableLayout: reconcile existing or construct default from columns
const resolveTableLayout = (state, tableLayoutId, columns) => {
    const existing = state.tableLayouts.get(tableLayoutId)
    return existing ? TableLayout.reconcile(existing, columns) : TableLayout.fromColumns(tableLayoutId, columns)
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
    const positions = Positions.asOf(state, ACCOUNT_LIST_VIEW_ID)
    const enriched = LookupTable(EnrichedAccount.enrichAll(accounts, positions, transactions), EnrichedAccount, 'id')
    return toAccountSections(enriched, accountListSortMode)
}

const Accounts = { organized: memoizeReduxState(ACCOUNT_STATE_KEYS, _organizedAccounts) }

// ---------------------------------------------------------------------------------------------------------------------
// QueryResult — engine-driven query execution per viewId
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const ENGINE_STATE_KEYS = ['accounts', 'categories', 'transactions', 'securities', 'lots', 'lotAllocations', 'prices', 'transactionFilters']

// fallbackIR must be referentially stable (e.g. a module-level constant) — rest-arg stringify is the only
// cache discriminator when state.queryIR[viewId] is undefined
const _queryResult = (state, viewId, fallbackIR) => {
    const ir = state.queryIR[viewId] ?? fallbackIR
    if (!ir) return undefined
    const mergedIR = MergeChipFilters.applyChipFilters(ir, state.transactionFilters.get(viewId), accounts(state))

    const result = runFinancialQuery(mergedIR, state)
    return result.match({
        Identity: ({ tree }) => tree.nodes,
        Scalar: r => r,
        FilteredEntities: r => r,
        Pivot: r => r,
        TimeSeries: r => r,
        RunningBalance: r => r,
    })
}

// Describe the merged IR as human-readable text — cheap, no heavy memoization needed
// @sig _queryDescription :: (State, String, FinancialQuery?) -> String
const _queryDescription = (state, viewId, fallbackIR) => {
    const ir = state.queryIR[viewId] ?? fallbackIR
    if (!ir) return ''
    const mergedIR = MergeChipFilters.applyChipFilters(ir, state.transactionFilters.get(viewId), accounts(state))
    return toFinancialQueryDescription(mergedIR)
}

// prettier-ignore
const QueryResult = {
    fromIR:      memoizeReduxStatePerKey(ENGINE_STATE_KEYS, 'queryIR', _queryResult),
    description: _queryDescription,
}

// ---------------------------------------------------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------------------------------------------------

const _positionsAsOf = (state, viewId) => {
    const { asOfDate, filterQuery, selectedAccounts } = filter(state, viewId)
    const { accounts, lotAllocations, lots, prices, securities, transactions } = state
    return computePositions({
        lots,
        lotAllocations,
        prices,
        accounts,
        securities,
        transactions,
        asOfDate,
        selectedAccountIds: selectedAccounts,
        filterQuery,
    })
}

const positionsAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    _positionsAsOf,
)

const _positionsTree = (state, viewId) => {
    const groupBy = filter(state, viewId).groupBy || 'account'
    return buildPositionsTree(groupBy, positionsAsOf(state, viewId))
}

const positionsTree = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    _positionsTree,
)

const benchmarkSecurity = memoizeReduxState(['securities'], state => state.securities.find(s => s.symbol === 'SPY'))

const _enrichedPosition = (state, accountId, securityId) => {
    const { lots, lotAllocations, prices, securities, transactions } = state
    const positions = positionsAsOf(state, ACCOUNT_LIST_VIEW_ID)
    const position = positions.find(p => p.accountId === accountId && p.securityId === securityId)
    if (!position) return undefined

    const benchmark = benchmarkSecurity(state)
    const { asOfDate } = filter(state, ACCOUNT_LIST_VIEW_ID)
    const context = {
        lots,
        lotAllocations,
        transactions,
        securities,
        prices,
        asOfDate,
        benchmarkSecurityId: benchmark?.id,
    }

    const realizedGains = computeRealizedGains(position, context)
    const dividendIncome = computeDividendIncome(position, context)
    const { unrealizedGainLoss, costBasis } = position
    const totalReturnDollars = unrealizedGainLoss + realizedGains.totalRealizedGain + dividendIncome
    const totalReturnPercent = costBasis !== 0 ? totalReturnDollars / costBasis : 0

    return {
        ...position,
        realizedGains,
        dividendIncome,
        irr: computeIrr(position, context),
        benchmarkReturnPct: computeBenchmarkReturn(position, context),
        totalReturn: { totalReturnDollars, totalReturnPercent },
    }
}

const enrichedPosition = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'securities', 'transactions'],
    'transactionFilters',
    _enrichedPosition,
)

const Positions = { asOf: positionsAsOf, tree: positionsTree, enriched: enrichedPosition }

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

const _transactionTree = (state, viewId) => {
    const groupBy = filter(state, viewId).groupBy || 'category'
    return CategoryTree.buildTransactionTree(groupBy, T.enriched(state, viewId))
}

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
    return data[UI.currentRowIndex(state, viewId)]?.transaction.id
}

const SORT_STATE_KEYS = ['transactions', 'categories', 'securities', 'tableLayouts']
const HIGHLIGHT_STATE_KEYS = [...SORT_STATE_KEYS, 'viewUiState']

// prettier-ignore
const T = {
    enriched             : memoizeReduxStatePerKey(['transactions', 'categories', 'accounts'  ], 'transactionFilters', _enriched),
    filtered             : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _filtered),
    forAccount           : memoizeReduxStatePerKey(['transactions'                            ], 'transactionFilters', _forAccount),
    filteredForAccount   : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _filteredForAccount),
    filteredForInvestment: memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _filteredForInvestment),
    searchMatches        : memoizeReduxStatePerKey(['transactions', 'categories', 'securities'], 'transactionFilters', _searchMatches),
}

// prettier-ignore
const T2 = {
    tree                : memoizeReduxStatePerKey(['transactions', 'categories', 'accounts'], 'transactionFilters', _transactionTree),
    sortedForDisplay    : memoizeReduxStatePerKey(SORT_STATE_KEYS, 'transactionFilters'     , _makeSortedSelector(T.filteredForInvestment)),
    sortedForBankDisplay: memoizeReduxStatePerKey(SORT_STATE_KEYS, 'transactionFilters'     , _makeSortedSelector(T.filteredForAccount)),
}

// prettier-ignore
const T3 = {
    highlightedId       : memoizeReduxStatePerKey(HIGHLIGHT_STATE_KEYS, 'transactionFilters', _makeHighlightSelector(T2.sortedForDisplay)),
    highlightedIdForBank: memoizeReduxStatePerKey(HIGHLIGHT_STATE_KEYS, 'transactionFilters', _makeHighlightSelector(T2.sortedForBankDisplay))
}

// @sig _isCounterpart :: Transaction -> Transaction -> Boolean
const _isCounterpart =
    ({ accountId, transferAccountId, amount, date }) =>
    ({
        accountId: candidateAccountId,
        transferAccountId: candidateTransferAccountId,
        amount: candidateAmount,
        date: candidateDate,
    }) =>
        candidateAccountId === transferAccountId &&
        candidateTransferAccountId === accountId &&
        candidateAmount === -amount &&
        candidateDate === date

// @sig matchingTransfer :: (State, Transaction) -> Transaction
const matchingTransfer = (state, source) => {
    const matches = transactions(state).filter(_isCounterpart(source))
    if (matches.length === 0)
        throw new Error(
            `No matching transfer found for transaction ${source.id} in account ${source.transferAccountId}`,
        )
    return matches[0]
}

const Transactions = { ...T, ...T2, ...T3, matchingTransfer }

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

export {
    Accounts,
    Categories,
    Positions,
    QueryResult,
    Transactions,
    UI,

    // Base state
    accounts,
    activeViewId,
    atMaxGroups,
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
    tabGroupById,
    tabGroupIsActive,
    tabLayout,
    tabMoveDisabled,
    tableLayoutOrDefault,
    tableLayoutProps,
    tableLayouts,
    transactions,
    transferNavPending,
    pickerType,
    pickerHighlight,
    pickerSearch,
    pickerPosition,
    pickerAccountItems,
    pickerTabItems,
    pickerData,
    CLOSED_PICKER,
    actionRegistryVersion,

    // Entity lookups
    accountName,
    categoryName,
    securityName,
    securitySymbol,
}
