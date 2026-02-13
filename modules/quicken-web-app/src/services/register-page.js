// ABOUTME: Shared register page logic for bank and investment transaction registers
// ABOUTME: Contains navigation, search, layout, and date range functions used by both register pages

import { endOfDay, startOfMonth } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { post } from '../commands/post.js'
import { currentStore } from '../store/index.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'

const { ActionRegistry } = KeymapModule

const P = {
    // Checks if we need to initialize the date range on first render
    // @sig shouldInitializeDateRange :: (String, DateRange | null) -> Boolean
    shouldInitializeDateRange: (dateRangeKey, dateRange) => dateRangeKey === 'lastTwelveMonths' && !dateRange,
}

const T = {
    // Finds the index of a transaction by ID in the data array
    // Rows without a transaction (e.g., subtotal rows) are skipped via optional chaining
    // @sig toRowIndex :: ([Row], String) -> Number
    toRowIndex: (data, id) => data.findIndex(r => r.transaction?.id === id),

    // Finds the row index of the adjacent match in match-list order
    // @sig toAdjacentMatchRowIdx :: ([Row], [String], Number, Number) -> Number
    toAdjacentMatchRowIdx: (data, matchIds, currentIdx, dir) => {
        const targetIdx = (currentIdx + dir + matchIds.length) % matchIds.length
        return T.toRowIndex(data, matchIds[targetIdx])
    },

    // Reducer: picks the match closest to fromRowIdx in the given direction (wrapping)
    // Rows without a transaction (e.g., subtotal rows) are skipped via optional chaining
    // @sig toClosestMatch :: ([Row], Number, Number, Number) -> ({ dist, rowIdx }, String) -> { dist, rowIdx }
    toClosestMatch: (data, fromRowIdx, len, dir) => (best, id) => {
        const idx = T.toRowIndex(data, id)
        if (idx < 0) return best
        const dist = ((idx - fromRowIdx) * dir + len) % len
        return dist > 0 && dist < best.dist ? { dist, rowIdx: idx } : best
    },

    // Finds the display row index of the nearest match forward (dir=1) or backward (dir=-1)
    // @sig toNearestMatchRowIdx :: ([Row], [String], Number, Number) -> Number
    toNearestMatchRowIdx: (data, matchIds, fromRowIdx, dir) =>
        matchIds.reduce(T.toClosestMatch(data, fromRowIdx, data.length, dir), { dist: Infinity, rowIdx: -1 }).rowIdx,

    // Creates a date range spanning the last 12 months
    // @sig toDefaultDateRange :: () -> DateRange
    toDefaultDateRange: () => {
        const now = new Date()
        const twelveMonthsAgo = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1))
        return { start: twelveMonthsAgo, end: endOfDay(now) }
    },
}

// Generates a unique table layout ID for an account with a type prefix
// @sig toTableLayoutId :: (String, String) -> String
const toTableLayoutId = (prefix, id) => `cols_${prefix}_${id}`

// Highlights a transaction by ID — reads current data from store at call time
// @sig highlightTransaction :: (RegisterCtx, String) -> void
const highlightTransaction = (ctx, newId) => {
    const { sortSelector, viewId, accountId, tableLayoutId, columns } = ctx
    const data = sortSelector(currentStore().getState(), viewId, accountId, tableLayoutId, columns)
    const idx = T.toRowIndex(data, newId)
    if (idx < 0) return
    post(Action.SetViewUiState(viewId, { currentRowIndex: idx }))
}

// Initializes the date range to last 12 months if not already set
// @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
const initDateRangeIfNeeded = (dateRangeKey, dateRange, viewId) => {
    if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
        post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
}

// Clears search query when escaping search mode — reads current query from store
// @sig clearSearch :: (String) -> void
const clearSearch = viewId => {
    const searchQuery = S.UI.searchQuery(currentStore().getState(), viewId)
    if (!searchQuery) return
    post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))
}

// Ensures table layout exists in Redux (idempotent, only creates if missing)
// @sig ensureTableLayoutEffect :: (String, [Column]) -> () -> void
const ensureTableLayoutEffect = (tableLayoutId, columns) => () => post(Action.EnsureTableLayout(tableLayoutId, columns))

// Navigates to next/prev search match — reads all state from store at call time
// @sig navigateSearchMatch :: (RegisterCtx, Number) -> void
const navigateSearchMatch = (ctx, dir) => {
    const { sortSelector, highlightSelector, viewId, accountId, tableLayoutId, columns } = ctx
    const state = currentStore().getState()
    const data = sortSelector(state, viewId, accountId, tableLayoutId, columns)
    const searchMatches = S.Transactions.searchMatches(state, viewId, accountId)
    if (searchMatches.length === 0) return
    const highlightedId = highlightSelector(state, viewId, accountId, tableLayoutId, columns)
    const currentIdx = searchMatches.indexOf(highlightedId)
    const rowIdx =
        currentIdx >= 0
            ? T.toAdjacentMatchRowIdx(data, searchMatches, currentIdx, dir)
            : T.toNearestMatchRowIdx(data, searchMatches, T.toRowIndex(data, highlightedId), dir)
    if (rowIdx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: rowIdx }))
}

// Registers search + select actions with ActionRegistry — reads state from store, no React hooks
// @sig searchActionsEffect :: (RegisterCtx, Ref) -> () -> (() -> void)
const searchActionsEffect = (ctx, searchInputRef) => () =>
    ActionRegistry.register(ctx.viewId, [
        { id: 'select', description: 'Next match', execute: () => navigateSearchMatch(ctx, 1) },
        { id: 'search:prev', description: 'Previous match', execute: () => navigateSearchMatch(ctx, -1) },
        { id: 'search:open', description: 'Open search', execute: () => searchInputRef.current?.focus() },
    ])

// Reads current tableLayout from store, resolves TanStack sorting updater, dispatches result
// @sig updateSorting :: (String, (SortingState -> SortingState)) -> void
const updateSorting = (tableLayoutId, updater) => {
    const tableLayout = currentStore().getState().tableLayouts.get(tableLayoutId)
    if (!tableLayout) return
    const { sorting } = TableLayout.toDataTableProps(tableLayout)
    post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting))))
}

// Reads current tableLayout from store, resolves TanStack sizing updater, dispatches result
// @sig updateColumnSizing :: (String, (SizingState -> SizingState)) -> void
const updateColumnSizing = (tableLayoutId, updater) => {
    const tableLayout = currentStore().getState().tableLayouts.get(tableLayoutId)
    if (!tableLayout) return
    const { columnSizing } = TableLayout.toDataTableProps(tableLayout)
    post(Action.SetTableLayout(TableLayout.applySizingChange(tableLayout, updater(columnSizing))))
}

// Reads current tableLayout from store, dispatches with new column order
// @sig updateColumnOrder :: (String, [String]) -> void
const updateColumnOrder = (tableLayoutId, newOrder) => {
    const tableLayout = currentStore().getState().tableLayouts.get(tableLayoutId)
    if (!tableLayout) return
    post(Action.SetTableLayout(TableLayout.applyOrderChange(tableLayout, newOrder)))
}

const RegisterPage = {
    toTableLayoutId,
    highlightTransaction,
    initDateRangeIfNeeded,
    navigateSearchMatch,
    clearSearch,
    ensureTableLayoutEffect,
    searchActionsEffect,
    updateSorting,
    updateColumnSizing,
    updateColumnOrder,
}

export { RegisterPage }
