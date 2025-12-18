// ABOUTME: Transaction register page with filtering, search, and table layout persistence
// ABOUTME: Displays account transactions with sorting, column reordering, and running balances

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { bankTransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { TransactionFiltersCard } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import { filterByAccount } from '../store/selectors/transactions/filters.js'
import { Action } from '../types/action.js'
import {
    applyOrderChange,
    applySizingChange,
    applySortingChange,
    initializeTableLayout,
    toDataTableProps,
} from '../utils/table-layout.js'
import { sortTransactions } from '../utils/sort-transactions.js'

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }
const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

/*
 * Transaction Register page with filtering, search, and navigation
 *
 * @sig TransactionRegisterPage :: (TransactionRegisterPageProps) -> ReactElement
 *     TransactionRegisterPageProps = { accountId: String, startingBalance?: Number, height?: Number }
 */
const TransactionRegisterPage = ({ accountId, startingBalance = 5000, height = '100%' }) => {
    // -----------------------------------------------------------------------------------------------------------------
    // Functions (closures capture bindings - variables initialized before function is called)
    // -----------------------------------------------------------------------------------------------------------------
    // @sig makeViewId :: String -> String
    const makeViewId = id => `cols_account_${id}`

    // @sig calculateRunningBalances :: ([Transaction], Number) -> [Transaction]
    const calculateRunningBalances = (transactions, balance) => {
        let runningBalance = balance
        return transactions.map(tx => ({ ...tx, runningBalance: (runningBalance += tx.amount) }))
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
    // Use reg_ prefix to match View.Register's id pattern (FieldTypes.viewId)
    const viewId = `reg_${accountId}`
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

    // -----------------------------------------------------------------------------------------------------------------
    // Memos (data transformations)
    // -----------------------------------------------------------------------------------------------------------------
    const accountTransactions = useMemo(
        () => filterByAccount(filteredTransactions, accountId),
        [filteredTransactions, accountId],
    )

    const tableLayout = useMemo(
        () => allTableLayouts?.[tableLayoutId] || initializeTableLayout(tableLayoutId, bankTransactionColumns),
        [allTableLayouts, tableLayoutId],
    )

    const { sorting, columnSizing, columnOrder } = useMemo(() => toDataTableProps(tableLayout), [tableLayout])

    // Sort transactions, then calculate running balances
    const sortedTransactions = useMemo(
        () => sortTransactions(accountTransactions, sorting, bankTransactionColumns),
        [accountTransactions, sorting],
    )

    const data = useMemo(
        () => calculateRunningBalances(sortedTransactions, startingBalance),
        [sortedTransactions, startingBalance],
    )

    // With manual sorting, search matches are already in display order (indices into sortedTransactions)
    const matchCount = searchMatches.length
    const maxRowIndex = sortedTransactions.length - 1

    const highlightedId = useMemo(
        () => (matchCount > 0 ? searchMatches[currentSearchIndex] : sortedTransactions[currentRowIndex]?.id),
        [matchCount, searchMatches, currentSearchIndex, sortedTransactions, currentRowIndex],
    )

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
        () => setLayout({ title: 'Checking Account', subtitle: 'View and filter your checking account transactions' }),
        [setLayout],
    )

    useEffect(initializeDateRange, [dateRangeKey, dateRange, viewId])

    useEffect(setupKeyboardNavigation, [
        viewId,
        currentRowIndex,
        maxRowIndex,
        currentSearchIndex,
        matchCount,
        searchQuery,
    ])

    return (
        <Flex gap="4" style={pageContainerStyle}>
            <TransactionFiltersCard viewId={viewId} />
            <div style={mainContentStyle}>
                <DataTable
                    columns={bankTransactionColumns}
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

export default TransactionRegisterPage // fixme: TanStack Router depends on a default export!
export { TransactionRegisterPage }
