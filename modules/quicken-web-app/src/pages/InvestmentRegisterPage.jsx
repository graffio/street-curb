// ABOUTME: Investment transaction register page with security/action filtering
// ABOUTME: Displays investment account transactions with running cash balance

import { DataTable, Flex, layoutChannel, Text, useChannel } from '@graffio/design-system'
import { calculateRunningCashBalances } from '@graffio/financial-computations/investments'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ACTION_LABELS, investmentTransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { ActionFilterChip, DateFilterChip, SearchFilterChip, SecurityFilterChip } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import {
    filterByAccount,
    filterByInvestmentActions,
    filterBySecurities,
} from '../store/selectors/transactions/filters.js'
import { Action } from '../types/action.js'
import {
    applyOrderChange,
    applySizingChange,
    applySortingChange,
    initializeTableLayout,
    toDataTableProps,
} from '../utils/table-layout.js'

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

const filterRowBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }

const columnStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }

const detailTextStyle = {
    fontSize: 'var(--font-size-1)',
    color: 'var(--gray-11)',
    lineHeight: 1.3,
    paddingLeft: 'var(--space-2)',
}

const MAX_DETAIL_LINES = 3

/*
 * A filter column with chip and detail lines below
 *
 * @sig FilterColumn :: { chip: ReactElement, details: [String] } -> ReactElement
 */
const FilterColumn = ({ chip, details }) => (
    <div style={columnStyle}>
        {chip}
        {details.map((line, i) => (
            <span key={i} style={detailTextStyle}>
                {line}
            </span>
        ))}
    </div>
)

/*
 * Investment Transaction Register page with filtering, search, and navigation
 *
 * @sig InvestmentRegisterPage :: (InvestmentRegisterPageProps) -> ReactElement
 *     InvestmentRegisterPageProps = { accountId: String, startingBalance?: Number, height?: Number }
 */
const InvestmentRegisterPage = ({ accountId, startingBalance = 0, height = '100%' }) => {
    const makeViewId = id => `cols_investment_${id}`

    // Format a date range for display
    // @sig formatDateRange :: (Date, Date) -> String?
    const formatDateRange = (start, end) => {
        // @sig formatDate :: Date -> String?
        const formatDate = date => {
            if (!date || !(date instanceof Date)) return null
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const startStr = formatDate(start)
        const endStr = formatDate(end)
        if (!startStr || !endStr) return null
        return `${startStr} – ${endStr}`
    }

    // Build detail lines for a list (up to MAX_DETAIL_LINES, then +N more)
    // @sig buildDetailLines :: [String] -> [String]
    const buildDetailLines = items => {
        const { length } = items
        if (length === 0) return []
        if (length <= MAX_DETAIL_LINES) return items
        const shown = items.slice(0, MAX_DETAIL_LINES - 1)
        const remaining = length - shown.length
        return [...shown, `+${remaining} more`]
    }

    // Compares two values for sorting, handling nulls
    // @sig compareNullable :: (Any, Any, Boolean) -> Number
    const compareNullable = (a, b, desc) => {
        if (a == null && b == null) return 0
        if (a == null) return 1
        if (b == null) return -1
        return desc ? (a > b ? -1 : a < b ? 1 : 0) : a < b ? -1 : a > b ? 1 : 0
    }

    // Sorts RegisterRows by a column's accessor, handling nested paths like "transaction.date"
    // @sig sortRegisterRows :: ([SortSpec], [RegisterRow]) -> [RegisterRow]
    const sortRegisterRows = (sortSpecs, rows) => {
        if (!sortSpecs?.length) return rows
        const { id, desc } = sortSpecs[0]
        const key = investmentTransactionColumns.get(id)?.accessorKey || id
        const [first, second] = key.split('.')
        const getValue = second ? row => row[first]?.[second] : row => row[first]
        return [...rows].sort((a, b) => compareNullable(getValue(a), getValue(b), desc))
    }

    // Initializes the date range to last 12 months when first loading
    // @sig initializeDateRange :: () -> void
    const initializeDateRange = () => {
        if (dateRangeKey !== 'lastTwelveMonths' || dateRange) return
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        post(Action.SetTransactionFilter(viewId, { dateRange: { start: twelveMonthsAgo, end: endOfToday } }))
    }

    // Sets up keyboard navigation for transaction list and search matches
    // @sig setupKeyboardNavigation :: () -> (() -> void)
    const setupKeyboardNavigation = () => {
        // @sig moveToNextRow :: () -> void
        const moveToNextRow = () => {
            const nextIndex = currentRowIndex >= maxRowIndex ? 0 : currentRowIndex + 1
            post(Action.SetTransactionFilter(viewId, { currentRowIndex: nextIndex }))
        }

        // @sig moveToPreviousRow :: () -> void
        const moveToPreviousRow = () => {
            const prevIndex = currentRowIndex <= 0 ? maxRowIndex : currentRowIndex - 1
            post(Action.SetTransactionFilter(viewId, { currentRowIndex: prevIndex }))
        }

        // @sig handleNextMatch :: () -> void
        const handleNextMatch = () => {
            if (matchCount <= 0) return
            const nextIndex = currentSearchIndex === matchCount - 1 ? 0 : currentSearchIndex + 1
            post(Action.SetTransactionFilter(viewId, { currentSearchIndex: nextIndex }))
        }

        // @sig handlePreviousMatch :: () -> void
        const handlePreviousMatch = () => {
            if (matchCount <= 0) return
            const prevIndex = currentSearchIndex === 0 ? matchCount - 1 : currentSearchIndex - 1
            post(Action.SetTransactionFilter(viewId, { currentSearchIndex: prevIndex }))
        }

        // @sig handleArrowKey :: (String, Event) -> void
        const handleArrowKey = (key, event) => {
            const { tagName } = document.activeElement
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') return
            event.preventDefault()
            const inSearchMode = matchCount > 0
            if (key === 'ArrowDown') inSearchMode ? handleNextMatch() : moveToNextRow()
            if (key === 'ArrowUp') inSearchMode ? handlePreviousMatch() : moveToPreviousRow()
        }

        // @sig handleKeyDown :: KeyboardEvent -> void
        const handleKeyDown = event => {
            const { key } = event
            if (key === 'Escape') {
                event.preventDefault()
                searchQuery && post(Action.SetTransactionFilter(viewId, { searchQuery: '', currentSearchIndex: 0 }))
                return
            }
            if (['ArrowUp', 'ArrowDown'].includes(key)) handleArrowKey(key, event)
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Derived values (computed from props)
    // -----------------------------------------------------------------------------------------------------------------
    // Use inv_ prefix to distinguish from bank registers
    const viewId = `inv_${accountId}`
    const tableLayoutId = makeViewId(accountId)

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

    // Always sort by date ascending for correct running balance calculation
    const chronological = useMemo(
        () => [...actionFiltered].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
        [actionFiltered],
    )

    // Calculate running balance in chronological order (wraps in RegisterRow)
    const withBalances = useMemo(
        () => calculateRunningCashBalances(chronological, startingBalance),
        [chronological, startingBalance],
    )

    // Apply user's display sort to RegisterRows
    const data = useMemo(() => sortRegisterRows(sorting, withBalances), [withBalances, sorting])

    // Get account name for header
    const accountName = useSelector(state => S.accountName(state, accountId)) || 'Investment Account'

    // With manual sorting, search matches are already in display order
    const matchCount = searchMatches.length
    const maxRowIndex = data.length - 1

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
    const securityDetails = buildDetailLines(securityNames)
    const actionNames = selectedInvestmentActions.map(code => ACTION_LABELS[code] || code)
    const actionDetails = buildDetailLines(actionNames)

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

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => setLayout({ title: accountName, subtitle: 'Investment transactions with running cash balance' }),
        [setLayout, accountName],
    )

    useEffect(initializeDateRange, [dateRangeKey, dateRange, viewId])

    const dependencies = [viewId, currentRowIndex, maxRowIndex, currentSearchIndex, matchCount, searchQuery]
    useEffect(setupKeyboardNavigation, dependencies)

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
                    sorting={sorting}
                    columnSizing={columnSizing}
                    columnOrder={columnOrder}
                    onSortingChange={handleSortingChange}
                    onColumnSizingChange={handleColumnSizingChange}
                    onColumnOrderChange={handleColumnOrderChange}
                    context={{ searchQuery }}
                />
            </div>
        </Flex>
    )
}

export default InvestmentRegisterPage // fixme: TanStack Router depends on a default export!
export { InvestmentRegisterPage }
