// ABOUTME: Investment transaction register page with security/action filtering
// ABOUTME: Displays investment account transactions with running cash balance

import { DataTable, Flex } from '@graffio/design-system'
import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { TransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { FilterChipRow } from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { applyOrderChange, applySizingChange, applySortingChange } from '../utils/table-layout.js'
const { investmentColumns } = TransactionColumns

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

const P = {
    // Checks if we need to initialize the date range on first render
    // @sig shouldInitializeDateRange :: (String, DateRange | null) -> Boolean
    shouldInitializeDateRange: (dateRangeKey, dateRange) => dateRangeKey === 'lastTwelveMonths' && !dateRange,
}

const T = {
    // Generates a unique table layout ID for an investment account
    // @sig toTableLayoutId :: String -> String
    toTableLayoutId: id => `cols_investment_${id}`,

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
        post(Action.SetViewUiState(viewId, { [inSearchMode ? 'currentSearchIndex' : 'currentRowIndex']: idx }))
    },

    // Initializes the date range to last 12 months if not already set
    // @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
    initDateRangeIfNeeded: (dateRangeKey, dateRange, viewId) => {
        if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
    },

    // Clears search query and resets search index when escaping search mode
    // @sig clearSearch :: (String, String) -> void
    clearSearch: (searchQuery, viewId) => {
        if (!searchQuery) return
        post(Action.SetTransactionFilter(viewId, { searchQuery: '' }))
        post(Action.SetViewUiState(viewId, { currentSearchIndex: 0 }))
    },

    // Ensures table layout exists in Redux (idempotent, only creates if missing)
    // @sig ensureTableLayoutEffect :: (String, [Column]) -> () -> void
    ensureTableLayoutEffect: (tableLayoutId, columns) => () => post(Action.EnsureTableLayout(tableLayoutId, columns)),
}

/*
 * Investment Transaction Register page with filtering, search, and navigation
 *
 * @sig InvestmentRegisterPage :: (InvestmentRegisterPageProps) -> ReactElement
 *     InvestmentRegisterPageProps = { accountId: String, height?: Number }
 */
const InvestmentRegisterPage = ({ accountId, height = '100%' }) => {
    // -----------------------------------------------------------------------------------------------------------------
    // Derived values (computed from props)
    // -----------------------------------------------------------------------------------------------------------------
    // Use reg_ prefix to match View.Register's id pattern (FieldTypes.viewId)
    const viewId = `reg_${accountId}`
    const tableLayoutId = T.toTableLayoutId(accountId)

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const searchQuery = useSelector(state => S.UI.searchQuery(state, viewId))
    const allTableLayouts = useSelector(S.tableLayouts)
    const allAccountTransactions = useSelector(state => S.Transactions.forAccount(state, viewId, accountId))
    const investmentFiltered = useSelector(state => S.Transactions.filteredForInvestment(state, viewId, accountId))
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId))
    const accountName = useSelector(state => S.accountName(state, accountId)) || 'Investment Account'

    useEffect(E.ensureTableLayoutEffect(tableLayoutId, investmentColumns), [tableLayoutId])

    // -----------------------------------------------------------------------------------------------------------------
    // Memos (data transformations)
    // -----------------------------------------------------------------------------------------------------------------
    const tableLayout = allTableLayouts?.[tableLayoutId]
    const { sorting, columnSizing, columnOrder } = useSelector(state => S.tableLayoutProps(state, tableLayoutId))

    // Sorted register rows for display (wraps with balances, applies sort)
    const data = useSelector(state =>
        S.Transactions.sortedForDisplay(state, viewId, accountId, tableLayoutId, investmentColumns),
    )

    // Ref to access current data in callbacks without adding to deps (prevents keymap recreation)
    const dataRef = useRef(data)
    dataRef.current = data

    // Highlighted transaction ID based on search mode or row index
    const highlightedId = useSelector(state =>
        S.Transactions.highlightedId(state, viewId, accountId, tableLayoutId, investmentColumns),
    )
    const matchCount = searchMatches.length
    const { length: filteredCount } = investmentFiltered
    const { length: totalCount } = allAccountTransactions

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

    const handleEscape = useCallback(() => E.clearSearch(searchQuery, viewId), [searchQuery, viewId])
    const handleRowClick = useCallback(row => handleHighlightChange(row.transaction?.id), [handleHighlightChange])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => post(Action.SetPageTitle(accountName, 'Investment transactions with running cash balance')),
        [accountName],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])

    // Wait for EnsureTableLayout to populate Redux on first render
    if (!tableLayout) return null

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                showSecurities
                showActions
                showCategories={false}
                filteredCount={filteredCount}
                totalCount={totalCount}
            />
            <div style={mainContentStyle}>
                <DataTable
                    columns={investmentColumns}
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
                    actionContext={viewId}
                    context={{ searchQuery }}
                />
            </div>
        </Flex>
    )
}

export { InvestmentRegisterPage }
