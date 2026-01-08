// ABOUTME: Investment transaction register page with security/action filtering
// ABOUTME: Displays investment account transactions with running cash balance

import { DataTable, Flex, layoutChannel, Text, useChannel } from '@graffio/design-system'
import { applySort } from '@graffio/financial-computations/query'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ACTION_LABELS, investmentTransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import {
    ActionFilterChip,
    DateFilterChip,
    FilterColumn,
    SearchFilterChip,
    SecurityFilterChip,
} from '../components/index.js'
import * as S from '../store/selectors/index.js'
import {
    filterByAccount,
    filterByInvestmentActions,
    filterBySecurities,
} from '../store/selectors/transactions/filters.js'
import { Action } from '../types/action.js'
import { formatDateRange } from '../utils/formatters.js'
import {
    applyOrderChange,
    applySizingChange,
    applySortingChange,
    initializeTableLayout,
    toDataTableProps,
} from '../utils/table-layout.js'

const pageContainerStyle = { height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }
const filterRowBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }

const MAX_DETAIL_LINES = 3

const P = {
    /* Check if date range should be initialized with default last 12 months
     * @sig shouldInitializeDateRange :: (String, DateRange | null) -> Boolean
     */
    shouldInitializeDateRange: (dateRangeKey, dateRange) => dateRangeKey === 'lastTwelveMonths' && !dateRange,
}

const T = {
    /* Generate table layout storage ID for investment register
     * @sig toTableLayoutId :: String -> String
     */
    toTableLayoutId: id => `cols_investment_${id}`,

    /* Truncate item list with "+N more" suffix if exceeds max lines
     * @sig toDetailLines :: [String] -> [String]
     */
    toDetailLines: items => {
        const { length } = items
        if (length === 0) return []
        if (length <= MAX_DETAIL_LINES) return items
        const shown = items.slice(0, MAX_DETAIL_LINES - 1)
        return [...shown, `+${length - shown.length} more`]
    },

    /* Find row index by transaction ID in data array
     * @sig toRowIndex :: ([Row], String) -> Number
     */
    toRowIndex: (data, id) => data.findIndex(r => r.transaction?.id === id),

    /* Create default date range for last 12 months
     * @sig toDefaultDateRange :: () -> DateRange
     */
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
     * @sig dispatchHighlightChange :: (Number, [String], [Row], String) -> String -> void
     */
    dispatchHighlightChange: (matchCount, searchMatches, data, viewId) => newId => {
        const inSearchMode = matchCount > 0
        const idx = inSearchMode ? searchMatches.indexOf(newId) : T.toRowIndex(data, newId)
        if (idx < 0) return
        post(Action.SetTransactionFilter(viewId, { [inSearchMode ? 'currentSearchIndex' : 'currentRowIndex']: idx }))
    },

    /* Initialize date range filter if using default and not yet set
     * @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
     */
    initDateRangeIfNeeded: (dateRangeKey, dateRange, viewId) => {
        if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
    },
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
    // Use inv_ prefix to distinguish from bank registers
    const viewId = `inv_${accountId}`
    const tableLayoutId = T.toTableLayoutId(accountId)

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    const [, setLayout] = useChannel(layoutChannel)
    const dateRange = useSelector(state => S.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.dateRangeKey(state, viewId))
    const searchQuery = useSelector(state => S.searchQuery(state, viewId))
    const currentSearchIndex = useSelector(state => S.currentSearchIndex(state, viewId))
    const currentRowIndex = useSelector(state => S.currentRowIndex(state, viewId))
    const allTableLayouts = useSelector(S.tableLayouts)
    const filteredTransactions = useSelector(state => S.filteredTransactions(state, viewId))
    const searchMatches = useSelector(state => S.searchMatches(state, viewId))
    const selectedSecurities = useSelector(state => S.selectedSecurities(state, viewId))
    const selectedInvestmentActions = useSelector(state => S.selectedInvestmentActions(state, viewId))
    const filterQuery = useSelector(state => S.filterQuery(state, viewId))
    const securities = useSelector(S.securities)

    // -----------------------------------------------------------------------------------------------------------------
    // Memos (data transformations)
    // -----------------------------------------------------------------------------------------------------------------
    // Apply investment-specific filter chain: account -> securities -> actions
    const accountTransactions = useMemo(
        () => filterByAccount(filteredTransactions, accountId),
        [filteredTransactions, accountId],
    )

    const securityFiltered = useMemo(
        () => filterBySecurities(accountTransactions, selectedSecurities),
        [accountTransactions, selectedSecurities],
    )

    const actionFiltered = useMemo(
        () => filterByInvestmentActions(securityFiltered, selectedInvestmentActions),
        [securityFiltered, selectedInvestmentActions],
    )

    const tableLayout = useMemo(
        () => allTableLayouts?.[tableLayoutId] || initializeTableLayout(tableLayoutId, investmentTransactionColumns),
        [allTableLayouts, tableLayoutId],
    )

    const { sorting, columnSizing, columnOrder } = useMemo(() => toDataTableProps(tableLayout), [tableLayout])

    // Wrap transactions with stored running balance, then apply user's display sort
    const withBalances = useMemo(
        () => actionFiltered.map(txn => ({ transaction: txn, runningBalance: txn.runningBalance })),
        [actionFiltered],
    )

    // Apply user's display sort to RegisterRows
    const data = useMemo(() => applySort(sorting, withBalances, investmentTransactionColumns), [withBalances, sorting])

    // Get account name for header
    const accountName = useSelector(state => S.accountName(state, accountId)) || 'Investment Account'

    // With manual sorting, search matches are already in display order
    const matchCount = searchMatches.length

    const highlightedId = useMemo(
        () => (matchCount > 0 ? searchMatches[currentSearchIndex] : data[currentRowIndex]?.transaction?.id),
        [matchCount, searchMatches, currentSearchIndex, data, currentRowIndex],
    )

    // Filter chip active states - true when that filter is reducing results
    const isDateActive = dateRangeKey !== 'all'
    const isSecuritiesActive = selectedSecurities.length > 0
    const isActionsActive = selectedInvestmentActions.length > 0
    const isTextActive = filterQuery?.length > 0
    const { length: filteredCount } = actionFiltered
    const { length: totalCount } = accountTransactions
    const isFiltering = filteredCount < totalCount || isDateActive || isTextActive

    // Build detail lines for each filter chip
    const dateDetails = dateRange ? [formatDateRange(dateRange.start, dateRange.end)].filter(Boolean) : []
    const securityNames = selectedSecurities.map(id => securities?.get(id)?.name || id)
    const securityDetails = T.toDetailLines(securityNames)
    const actionNames = selectedInvestmentActions.map(code => ACTION_LABELS[code] || code)
    const actionDetails = T.toDetailLines(actionNames)

    const filterRowStyle = { ...filterRowBaseStyle, backgroundColor: isFiltering ? 'var(--ruby-3)' : 'var(--gray-2)' }

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

    const handleHighlightChange = useCallback(E.dispatchHighlightChange(matchCount, searchMatches, data, viewId), [
        matchCount,
        searchMatches,
        data,
        viewId,
    ])

    const handleEscape = useCallback(
        () => searchQuery && post(Action.SetTransactionFilter(viewId, { searchQuery: '', currentSearchIndex: 0 })),
        [searchQuery, viewId],
    )
    const handleRowClick = useCallback(row => handleHighlightChange(row.transaction?.id), [handleHighlightChange])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => setLayout({ title: accountName, subtitle: 'Investment transactions with running cash balance' }),
        [setLayout, accountName],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])

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
                    columns={investmentTransactionColumns}
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
                    context={{ searchQuery }}
                />
            </div>
        </Flex>
    )
}

export default InvestmentRegisterPage // fixme: TanStack Router depends on a default export!
export { InvestmentRegisterPage }
