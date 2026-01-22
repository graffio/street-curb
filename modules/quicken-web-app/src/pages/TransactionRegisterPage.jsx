// ABOUTME: Transaction register page with filtering, search, and table layout persistence
// ABOUTME: Displays account transactions with sorting, column reordering, and running balances

import { DataTable, Flex } from '@graffio/design-system'
import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { TransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { FilterChipRow } from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { applyOrderChange, applySizingChange, applySortingChange } from '../utils/table-layout.js'

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
    /* Dispatch highlight change, resolving ID to index based on search mode
     * Uses getData() to fetch current data at call time (avoids stale closures)
     * @sig dispatchHighlightChange :: (Number, [String], () -> [Row], String) -> String -> void
     */
    dispatchHighlightChange: (matchCount, searchMatches, getData, viewId) => newId => {
        const inSearchMode = matchCount > 0
        const idx = inSearchMode ? searchMatches.indexOf(newId) : T.toRowIndex(getData(), newId)
        if (idx < 0) return
        post(Action.SetTransactionFilter(viewId, { [inSearchMode ? 'currentSearchIndex' : 'currentRowIndex']: idx }))
    },

    // Initializes the date range to last 12 months if not already set
    // @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
    initDateRangeIfNeeded: (dateRangeKey, dateRange, viewId) => {
        if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
    },

    // Ensures table layout exists in Redux (idempotent, only creates if missing)
    // @sig ensureTableLayoutEffect :: (String, [Column]) -> () -> void
    ensureTableLayoutEffect: (tableLayoutId, columns) => () => post(Action.EnsureTableLayout(tableLayoutId, columns)),
}

/*
 * Transaction Register page with filtering, search, and navigation
 *
 * @sig TransactionRegisterPage :: (TransactionRegisterPageProps) -> ReactElement
 *     TransactionRegisterPageProps = { accountId: String, startingBalance?: Number, height?: Number,
 *         isActive?: Boolean }
 */
const TransactionRegisterPage = ({ accountId, startingBalance = 0, height = '100%', isActive = false }) => {
    // -----------------------------------------------------------------------------------------------------------------
    // Derived values (computed from props)
    // -----------------------------------------------------------------------------------------------------------------
    // Use reg_ prefix to match View.Register's id pattern (FieldTypes.viewId)
    const viewId = `reg_${accountId}`
    const tableLayoutId = T.toTableLayoutId(accountId)

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    const accountName = useSelector(state => S.accountName(state, accountId))

    useEffect(E.ensureTableLayoutEffect(tableLayoutId, bankColumns), [tableLayoutId])

    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const allTableLayouts = useSelector(S.tableLayouts)
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId))

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
    const matchCount = searchMatches.length

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleSortingChange = useCallback(
        updater => post(Action.SetTableLayout(applySortingChange(tableLayout, updater(sorting)))),
        [tableLayout, sorting],
    )

    const handleColumnSizingChange = useCallback(
        updater => post(Action.SetTableLayout(applySizingChange(tableLayout, updater(columnSizing)))),
        [tableLayout, columnSizing],
    )

    const handleColumnOrderChange = useCallback(
        newOrder => post(Action.SetTableLayout(applyOrderChange(tableLayout, newOrder))),
        [tableLayout],
    )

    // Uses getData() to access current data without adding to deps (prevents keymap registration loop)
    const getData = useCallback(() => dataRef.current, [])
    const handleHighlightChange = useCallback(E.dispatchHighlightChange(matchCount, searchMatches, getData, viewId), [
        matchCount,
        searchMatches,
        getData,
        viewId,
    ])

    const handleEscape = useCallback(
        () => searchQuery && post(Action.SetTransactionFilter(viewId, { searchQuery: '', currentSearchIndex: 0 })),
        [searchQuery, viewId],
    )

    const handleRowClick = useCallback(row => handleHighlightChange(row.transaction?.id), [handleHighlightChange])

    const handleRegisterKeymap = useCallback(keymap => post(Action.RegisterKeymap(keymap)), [])
    const handleUnregisterKeymap = useCallback(id => post(Action.UnregisterKeymap(id)), [])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => post(Action.SetPageTitle('Checking Account', 'View and filter your checking account transactions')),
        [],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])

    // Wait for EnsureTableLayout to populate Redux on first render
    if (!tableLayout) return null

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} accountId={accountId} />
            <div style={mainContentStyle}>
                <DataTable
                    columns={bankColumns}
                    data={data}
                    height={height}
                    rowHeight={60}
                    highlightedId={highlightedId}
                    focusableIds={matchCount > 0 ? searchMatches : undefined}
                    sorting={sorting}
                    columnSizing={columnSizing}
                    columnOrder={columnOrder}
                    onSortingChange={handleSortingChange}
                    onColumnSizingChange={handleColumnSizingChange}
                    onColumnOrderChange={handleColumnOrderChange}
                    onRowClick={handleRowClick}
                    onHighlightChange={handleHighlightChange}
                    onEscape={handleEscape}
                    enableKeyboardNav={isActive}
                    keymapId={`${viewId}_table`}
                    keymapActiveViewId={viewId}
                    keymapName={accountName}
                    onRegisterKeymap={handleRegisterKeymap}
                    onUnregisterKeymap={handleUnregisterKeymap}
                    context={{ searchQuery }}
                />
            </div>
        </Flex>
    )
}

export { TransactionRegisterPage }
