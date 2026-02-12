// ABOUTME: Transaction register page with filtering, search, and table layout persistence
// ABOUTME: Displays account transactions with sorting, column reordering, and running balances

import { DataTable, Flex } from '@graffio/design-system'
import { KeymapModule } from '@graffio/keymap'
import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { TransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { FilterChipRow } from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action, TableLayout } from '../types/index.js'

const { ActionRegistry } = KeymapModule

const { bankColumns } = TransactionColumns

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

const P = {
    // Checks if we need to initialize the date range on first render
    // @sig shouldInitializeDateRange :: (String, DateRange | null) -> Boolean
    shouldInitializeDateRange: (dateRangeKey, dateRange) => dateRangeKey === 'lastTwelveMonths' && !dateRange,
}

const T = {
    // Generates a unique table layout ID for an account
    // @sig toTableLayoutId :: String -> String
    toTableLayoutId: id => `cols_account_${id}`,

    // Finds the index of a transaction by ID in the data array
    // @sig toRowIndex :: ([Row], String) -> Number
    toRowIndex: (data, id) => data.findIndex(r => r.transaction?.id === id),

    // Finds the row index of the adjacent match in match-list order
    // @sig toAdjacentMatchRowIdx :: ([Row], [String], Number, Number) -> Number
    toAdjacentMatchRowIdx: (data, matchIds, currentIdx, dir) => {
        const targetIdx = (currentIdx + dir + matchIds.length) % matchIds.length
        return T.toRowIndex(data, matchIds[targetIdx])
    },

    // Reducer: picks the match closest to fromRowIdx in the given direction (wrapping)
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
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        return { start: twelveMonthsAgo, end: endOfToday }
    },
}

const E = {
    /* Dispatch highlight change — always updates currentRowIndex
     * Uses getData() to fetch current data at call time (avoids stale closures)
     * @sig dispatchHighlightChange :: (() -> [Row], String) -> String -> void
     */
    dispatchHighlightChange: (getData, viewId) => newId => {
        const idx = T.toRowIndex(getData(), newId)
        if (idx < 0) return
        post(Action.SetViewUiState(viewId, { currentRowIndex: idx }))
    },

    // Initializes the date range to last 12 months if not already set
    // @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
    initDateRangeIfNeeded: (dateRangeKey, dateRange, viewId) => {
        if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
    },

    // Navigates to next/prev search match, finding nearest in display order if between matches
    // @sig navigateToMatch :: ([Row], [String], String, String, Number) -> void
    navigateToMatch: (data, searchMatches, highlightedId, viewId, dir) => {
        if (searchMatches.length === 0) return
        const currentIdx = searchMatches.indexOf(highlightedId)
        const rowIdx =
            currentIdx >= 0
                ? T.toAdjacentMatchRowIdx(data, searchMatches, currentIdx, dir)
                : T.toNearestMatchRowIdx(data, searchMatches, T.toRowIndex(data, highlightedId), dir)
        if (rowIdx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: rowIdx }))
    },

    // Clears search query when escaping search mode
    // @sig clearSearch :: (String, String) -> void
    clearSearch: (searchQuery, viewId) => {
        if (!searchQuery) return
        post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))
    },

    // Ensures table layout exists in Redux (idempotent, only creates if missing)
    // @sig ensureTableLayoutEffect :: (String, [Column]) -> () -> void
    ensureTableLayoutEffect: (tableLayoutId, columns) => () => post(Action.EnsureTableLayout(tableLayoutId, columns)),

    // Registers search + select actions with ActionRegistry
    // @sig searchActionsEffect :: (String, Ref, Ref) -> () -> (() -> void)
    searchActionsEffect: (viewId, handlersRef, searchInputRef) => () =>
        ActionRegistry.register(viewId, [
            { id: 'select', description: 'Next match', execute: () => handlersRef.current.onSearchNext() },
            { id: 'search:prev', description: 'Previous match', execute: () => handlersRef.current.onSearchPrev() },
            { id: 'search:open', description: 'Open search', execute: () => searchInputRef.current?.focus() },
        ]),
}

/*
 * Transaction Register page with filtering, search, and navigation
 *
 * @sig TransactionRegisterPage :: (TransactionRegisterPageProps) -> ReactElement
 *     TransactionRegisterPageProps = { accountId: String, height?: Number }
 */
const TransactionRegisterPage = ({ accountId, height = '100%' }) => {
    // -----------------------------------------------------------------------------------------------------------------
    // Derived values (computed from props)
    // -----------------------------------------------------------------------------------------------------------------
    // Use reg_ prefix to match View.Register's id pattern (FieldTypes.viewId)
    const viewId = `reg_${accountId}`
    const tableLayoutId = T.toTableLayoutId(accountId)

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(E.ensureTableLayoutEffect(tableLayoutId, bankColumns), [tableLayoutId])

    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const allTableLayouts = useSelector(S.tableLayouts)
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId, accountId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))

    // -----------------------------------------------------------------------------------------------------------------
    // Selectors (derived state)
    // -----------------------------------------------------------------------------------------------------------------
    const tableLayout = allTableLayouts?.[tableLayoutId]
    const { sorting, columnSizing, columnOrder } = useSelector(state => S.tableLayoutProps(state, tableLayoutId))
    const data = useSelector(state =>
        S.Transactions.sortedForBankDisplay(state, viewId, accountId, tableLayoutId, bankColumns),
    )

    // Ref to access current data in callbacks without adding to deps (prevents keymap recreation)
    const dataRef = useRef(data)
    dataRef.current = data

    const highlightedId = useSelector(state =>
        S.Transactions.highlightedIdForBank(state, viewId, accountId, tableLayoutId, bankColumns),
    )
    const searchInputRef = useRef(null)
    const searchHandlersRef = useRef({})
    searchHandlersRef.current = {
        onSearchNext: () => E.navigateToMatch(dataRef.current, searchMatches, highlightedId, viewId, 1),
        onSearchPrev: () => E.navigateToMatch(dataRef.current, searchMatches, highlightedId, viewId, -1),
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleSortingChange = useCallback(
        updater => post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting)))),
        [tableLayout, sorting],
    )

    const handleColumnSizingChange = useCallback(
        updater => post(Action.SetTableLayout(TableLayout.applySizingChange(tableLayout, updater(columnSizing)))),
        [tableLayout, columnSizing],
    )

    const handleColumnOrderChange = useCallback(
        newOrder => post(Action.SetTableLayout(TableLayout.applyOrderChange(tableLayout, newOrder))),
        [tableLayout],
    )

    // Uses getData() to access current data without adding to deps (prevents keymap registration loop)
    const getData = useCallback(() => dataRef.current, [])
    const handleHighlightChange = useCallback(E.dispatchHighlightChange(getData, viewId), [getData, viewId])

    const handleEscape = useCallback(() => E.clearSearch(searchQuery, viewId), [searchQuery, viewId])

    const handleRowClick = useCallback(row => handleHighlightChange(row.transaction?.id), [handleHighlightChange])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => post(Action.SetPageTitle('Checking Account', 'View and filter your checking account transactions')),
        [],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])
    useEffect(E.searchActionsEffect(viewId, searchHandlersRef, searchInputRef), [viewId])

    // Wait for EnsureTableLayout to populate Redux on first render
    if (!tableLayout) return null

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                accountId={accountId}
                searchQuery={searchQuery}
                searchMatches={searchMatches}
                highlightedId={highlightedId}
                searchInputRef={searchInputRef}
                onSearchNext={() => searchHandlersRef.current.onSearchNext()}
                onSearchPrev={() => searchHandlersRef.current.onSearchPrev()}
            />
            <div style={mainContentStyle}>
                <DataTable
                    columns={bankColumns}
                    data={data}
                    height={height}
                    rowHeight={60}
                    highlightedId={highlightedId}
                    sorting={sorting}
                    columnSizing={columnSizing}
                    columnOrder={columnOrder}
                    onSortingChange={handleSortingChange}
                    onColumnSizingChange={handleColumnSizingChange}
                    onColumnOrderChange={handleColumnOrderChange}
                    onRowClick={handleRowClick}
                    onHighlightChange={handleHighlightChange}
                    onEscape={handleEscape}
                    actionContext={viewId}
                    context={{ searchQuery: searchQuery || filterQuery }}
                />
            </div>
        </Flex>
    )
}

export { TransactionRegisterPage }
