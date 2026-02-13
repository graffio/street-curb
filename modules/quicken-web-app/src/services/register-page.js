// ABOUTME: Shared register page logic for bank and investment transaction registers
// ABOUTME: Contains navigation, search, layout, and date range functions used by both register pages

import { endOfDay, startOfMonth } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { post } from '../commands/post.js'
import { currentStore } from '../store/index.js'
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
        const idx = data.findIndex(r => r.transaction?.id === id)
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

/* Dispatch highlight change — always updates currentRowIndex
 * Uses getData() to fetch current data at call time (avoids stale closures)
 * @sig dispatchHighlightChange :: (() -> [Row], String) -> String -> void
 */
const dispatchHighlightChange = (getData, viewId) => newId => {
    const idx = T.toRowIndex(getData(), newId)
    if (idx < 0) return
    post(Action.SetViewUiState(viewId, { currentRowIndex: idx }))
}

// Initializes the date range to last 12 months if not already set
// @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
const initDateRangeIfNeeded = (dateRangeKey, dateRange, viewId) => {
    if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
        post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
}

// Navigates to next/prev search match, finding nearest in display order if between matches
// @sig navigateToMatch :: ([Row], [String], String, String, Number) -> void
const navigateToMatch = (data, searchMatches, highlightedId, viewId, dir) => {
    if (searchMatches.length === 0) return
    const currentIdx = searchMatches.indexOf(highlightedId)
    const rowIdx =
        currentIdx >= 0
            ? T.toAdjacentMatchRowIdx(data, searchMatches, currentIdx, dir)
            : T.toNearestMatchRowIdx(data, searchMatches, T.toRowIndex(data, highlightedId), dir)
    if (rowIdx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: rowIdx }))
}

// Clears search query when escaping search mode
// @sig clearSearch :: (String, String) -> void
const clearSearch = (searchQuery, viewId) => {
    if (!searchQuery) return
    post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))
}

// Ensures table layout exists in Redux (idempotent, only creates if missing)
// @sig ensureTableLayoutEffect :: (String, [Column]) -> () -> void
const ensureTableLayoutEffect = (tableLayoutId, columns) => () => post(Action.EnsureTableLayout(tableLayoutId, columns))

// Registers search + select actions with ActionRegistry
// @sig searchActionsEffect :: (String, Ref, Ref) -> () -> (() -> void)
const searchActionsEffect = (viewId, handlersRef, searchInputRef) => () =>
    ActionRegistry.register(viewId, [
        { id: 'select', description: 'Next match', execute: () => handlersRef.current.onSearchNext() },
        { id: 'search:prev', description: 'Previous match', execute: () => handlersRef.current.onSearchPrev() },
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
    dispatchHighlightChange,
    initDateRangeIfNeeded,
    navigateToMatch,
    clearSearch,
    ensureTableLayoutEffect,
    searchActionsEffect,
    updateSorting,
    updateColumnSizing,
    updateColumnOrder,
}

export { RegisterPage }
