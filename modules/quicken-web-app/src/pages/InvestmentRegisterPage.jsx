// ABOUTME: Investment transaction register page with security/action filtering
// ABOUTME: Displays investment account transactions with running cash balance

import { DataTable, Flex, Text } from '@graffio/design-system'
import React, { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { CellRenderers, TransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import {
    ActionFilterChip,
    DateFilterChip,
    FilterColumn,
    SearchFilterChip,
    SecurityFilterChip,
} from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { formatDateRange } from '../utils/formatters.js'
import { applyOrderChange, applySizingChange, applySortingChange } from '../utils/table-layout.js'

const { ACTION_LABELS } = CellRenderers
const { investmentColumns } = TransactionColumns

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }
const filterRowBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }
const filterRowActiveStyle = { ...filterRowBaseStyle, backgroundColor: 'var(--ruby-3)' }
const filterRowInactiveStyle = { ...filterRowBaseStyle, backgroundColor: 'var(--gray-2)' }

const MAX_DETAIL_LINES = 3

const P = {
    // Checks if we need to initialize the date range on first render
    // @sig shouldInitializeDateRange :: (String, DateRange | null) -> Boolean
    shouldInitializeDateRange: (dateRangeKey, dateRange) => dateRangeKey === 'lastTwelveMonths' && !dateRange,
}

const T = {
    // Generates a unique table layout ID for an investment account
    // @sig toTableLayoutId :: String -> String
    toTableLayoutId: id => `cols_investment_${id}`,

    // Truncates detail lines with "+N more" if exceeding maximum
    // @sig toDetailLines :: [String] -> [String]
    toDetailLines: items => {
        const { length } = items
        if (length === 0) return []
        if (length <= MAX_DETAIL_LINES) return items
        const shown = items.slice(0, MAX_DETAIL_LINES - 1)
        return [...shown, `+${length - shown.length} more`]
    },

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

    // Maps security IDs to display names
    // @sig toSecurityNames :: ([String], LookupTable<Security>) -> [String]
    toSecurityNames: (ids, securities) => ids.map(id => securities?.get(id)?.name || id),

    // Maps action codes to display labels
    // @sig toActionNames :: ([String], Object) -> [String]
    toActionNames: (codes, labels) => codes.map(code => labels[code] || code),
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
 * Investment Transaction Register page with filtering, search, and navigation
 *
 * @sig InvestmentRegisterPage :: (InvestmentRegisterPageProps) -> ReactElement
 *     InvestmentRegisterPageProps = { accountId: String, startingBalance?: Number, height?: Number,
 *         isActive?: Boolean }
 */
const InvestmentRegisterPage = ({ accountId, startingBalance = 0, height = '100%', isActive = false }) => {
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
    const accountTransactions = useSelector(state => S.Transactions.filteredForAccount(state, viewId, accountId))
    const investmentFiltered = useSelector(state => S.Transactions.filteredForInvestment(state, viewId, accountId))
    const searchMatches = useSelector(state => S.Transactions.searchMatches(state, viewId))
    const selectedSecurities = useSelector(state => S.UI.selectedSecurities(state, viewId))
    const selectedInvestmentActions = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const securities = useSelector(S.securities)
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

    // Filter chip active states - true when that filter is reducing results
    const isDateActive = dateRangeKey !== 'all'
    const isSecuritiesActive = selectedSecurities.length > 0
    const isActionsActive = selectedInvestmentActions.length > 0
    const isTextActive = filterQuery?.length > 0
    const { length: filteredCount } = investmentFiltered
    const { length: totalCount } = accountTransactions
    const isFiltering = filteredCount < totalCount || isDateActive || isTextActive

    // Build detail lines for each filter chip
    const dateDetails = dateRange ? T.toDetailLines([formatDateRange(dateRange.start, dateRange.end)]) : []
    const securityDetails = T.toDetailLines(T.toSecurityNames(selectedSecurities, securities))
    const actionDetails = T.toDetailLines(T.toActionNames(selectedInvestmentActions, ACTION_LABELS))

    const filterRowStyle = isFiltering ? filterRowActiveStyle : filterRowInactiveStyle

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
        () => post(Action.SetPageTitle(accountName, 'Investment transactions with running cash balance')),
        [accountName],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])

    // Wait for EnsureTableLayout to populate Redux on first render
    if (!tableLayout) return null

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <Flex direction="column" gap="2" style={filterRowStyle}>
                <Flex align="center" gap="2" style={{ paddingLeft: 'var(--space-2)' }}>
                    <Text size="1" color="gray">
                        {filteredCount} transactions
                    </Text>
                    {isFiltering && (
                        <Text size="1" color="ruby" weight="medium">
                            (filtered from {totalCount})
                        </Text>
                    )}
                </Flex>
                <Flex align="start" gap="3" wrap="wrap">
                    <FilterColumn
                        chip={<DateFilterChip viewId={viewId} isActive={isDateActive} />}
                        details={dateDetails}
                    />
                    <FilterColumn
                        chip={<SecurityFilterChip viewId={viewId} isActive={isSecuritiesActive} />}
                        details={securityDetails}
                    />
                    <FilterColumn
                        chip={<ActionFilterChip viewId={viewId} isActive={isActionsActive} />}
                        details={actionDetails}
                    />
                    <FilterColumn chip={<SearchFilterChip viewId={viewId} isActive={isTextActive} />} details={[]} />
                </Flex>
            </Flex>
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

export { InvestmentRegisterPage }
