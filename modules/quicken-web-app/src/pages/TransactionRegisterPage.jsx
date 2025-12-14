// ABOUTME: Transaction register page with filtering, search, and table layout persistence
// ABOUTME: Displays account transactions with sorting, column reordering, and running balances

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { bankTransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { TransactionFiltersCard } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'
import { ColumnDescriptor, TableLayout } from '../types/index.js'

// Build view identity for table layout from account ID
// @sig makeViewId :: String -> String
const makeViewId = accountId => `cols_account_${accountId}`

/**
 * Initialize TableLayout from column definitions (first-time setup)
 * @sig initializeFromColumns :: (String, [ColumnDefinition]) -> { tableLayout: TableLayout, idMap: Object }
 */
const initializeFromColumns = (viewId, columns) => {
    const descriptors = columns.map(col => ColumnDescriptor(`col_${col.id}`, col.size || 100, 'none'))

    // Store mapping from TanStack column id to our descriptor id
    const idMap = {}
    columns.forEach((col, i) => (idMap[col.id] = descriptors[i].id))
    return { tableLayout: TableLayout(viewId, LookupTable(descriptors, ColumnDescriptor, 'id'), []), idMap }
}

/**
 * Convert TableLayout to TanStack Table format
 * @sig toTanStackFormat :: (TableLayout?, Object) -> { sorting, columnSizing, columnOrder }
 */
const toTanStackFormat = (tableLayout, idMap) => {
    const toSizingEntry = (reverseMap, col) => [reverseMap[col.id], col.width]
    const hasValidId = ([tanstackId]) => tanstackId

    /**
     * Convert column descriptor to TanStack sort entry
     * @sig toSortEntry :: (Object, Object, String) -> { id: String, desc: Boolean } | null
     */
    const toSortEntry = (reverseMap, descriptors, id) => {
        const col = descriptors[id]
        if (!col) return null
        const { id: colId, sortDirection } = col
        if (sortDirection === 'none') return null
        return { id: reverseMap[colId], desc: sortDirection === 'desc' }
    }

    if (!tableLayout) return { sorting: [], columnSizing: {}, columnOrder: [] }

    const { columnDescriptors, sortOrder } = tableLayout
    const reverseMap = Object.fromEntries(Object.entries(idMap).map(([k, v]) => [v, k]))
    const columnOrder = columnDescriptors.map(c => reverseMap[c.id])
    const columnSizing = Object.fromEntries(
        columnDescriptors.map(col => toSizingEntry(reverseMap, col)).filter(hasValidId),
    )
    const sorting = sortOrder.map(id => toSortEntry(reverseMap, columnDescriptors, id)).filter(Boolean)

    return { sorting, columnSizing, columnOrder }
}

/*
 * Calculate running balances for transaction list
 * TODO: Move to selector for proper memoization
 * @sig calculateRunningBalances :: ([Object], Number) -> [Object]
 */
const calculateRunningBalances = (transactions, startingBalance) => {
    let runningBalance = startingBalance
    return transactions.map(transaction => ({ ...transaction, runningBalance: (runningBalance += transaction.amount) }))
}

// ---------------------------------------------------------------------------------------------------------------------
// Inline styles using Radix Themes tokens
// ---------------------------------------------------------------------------------------------------------------------

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }

const mainContentStyle = { flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }

/*
 * Transaction Register page with filtering, search, and navigation
 *
 * Provides a complete financial transaction management interface with:
 * - Date range filtering with preset ranges and custom date selection
 * - Text filtering to restrict transaction universe by content
 * - Search with highlighting and Previous/Next navigation
 * - Keyboard navigation (Arrow keys, Escape to clear search)
 * - Smooth scrolling with centering and row highlighting
 * - Wrap-around navigation for seamless browsing
 *
 * @sig TransactionRegisterPage :: (TransactionRegisterPageProps) -> ReactElement
 *     TransactionRegisterPageProps = {
 *         accountId: String,
 *         startingBalance?: Number,
 *         height?: Number
 *     }
 */
const TransactionRegisterPage = ({ accountId, startingBalance = 5000, height = '100%' }) => {
    // -----------------------------------------------------------------------------------------------------------------
    // `post` Functions
    // -----------------------------------------------------------------------------------------------------------------
    const moveToNextRow = () => {
        const maxIndex = filteredTransactions.length - 1
        post(Action.SetTransactionFilter({ currentRowIndex: currentRowIndex >= maxIndex ? 0 : currentRowIndex + 1 }))
    }

    const moveToPreviousRow = () => {
        const maxIndex = filteredTransactions.length - 1
        post(Action.SetTransactionFilter({ currentRowIndex: currentRowIndex <= 0 ? maxIndex : currentRowIndex - 1 }))
    }

    const handlePreviousMatch = () => {
        if (sortedSearchMatches.length <= 0) return
        const newIndex = currentSearchIndex === 0 ? sortedSearchMatches.length - 1 : currentSearchIndex - 1
        post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
    }

    const handleNextMatch = () => {
        if (sortedSearchMatches.length <= 0) return
        const newIndex = currentSearchIndex === sortedSearchMatches.length - 1 ? 0 : currentSearchIndex + 1
        post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
    }

    // Handles Escape (clear search) and Arrow keys (navigate rows/matches)
    // @sig handleKeyDown :: KeyboardEvent -> void
    const handleKeyDown = event => {
        // @sig handleEscape :: () -> void
        const handleEscape = () => {
            event.preventDefault()
            if (searchQuery) post(Action.SetTransactionFilter({ searchQuery: '', currentSearchIndex: 0 }))
        }

        // @sig handleArrow :: () -> void
        const handleArrow = () => {
            event.preventDefault()
            const inSearchMode = sortedSearchMatches.length > 0
            if (event.key === 'ArrowDown') inSearchMode ? handleNextMatch() : moveToNextRow()
            if (event.key === 'ArrowUp') inSearchMode ? handlePreviousMatch() : moveToPreviousRow()
        }

        if (event.key === 'Escape') return handleEscape()

        const activeElement = document.activeElement
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA'
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
        if (isInputFocused) return

        handleArrow()
    }

    // Sets default date range to last 12 months on first load
    // @sig setupInitialDateRangeEffect :: () -> void
    const setupInitialDateRangeEffect = () => {
        if (dateRangeKey !== 'lastTwelveMonths' || dateRange) return

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        post(Action.SetTransactionFilter({ dateRange: { start: twelveMonthsAgo, end: endOfToday } }))
    }

    // Converts TanStack sorting state to TableLayout and persists
    // @sig updateSorting :: (Updater | SortingState) -> void
    const updateSorting = updater => {
        // @sig applySort :: ColumnDescriptor -> ColumnDescriptor
        const applySort = col => {
            const tanstackId = Object.entries(idMap).find(([, v]) => v === col.id)?.[0]
            const sortEntry = newSorting.find(s => s.id === tanstackId)
            const direction = sortEntry ? (sortEntry.desc ? 'desc' : 'asc') : 'none'
            return ColumnDescriptor(col.id, col.width, direction)
        }

        const newSorting = typeof updater === 'function' ? updater(sorting) : updater
        const updatedColumns = tableLayout.columnDescriptors.map(applySort)
        const newSortOrder = newSorting.map(s => idMap[s.id])
        const newLayout = TableLayout(tableLayout.id, LookupTable(updatedColumns, ColumnDescriptor, 'id'), newSortOrder)
        post(Action.SetTableLayout(newLayout))
    }

    // Converts TanStack column sizing to TableLayout and persists
    // @sig updateColumnSizing :: (Updater | SizingState) -> void
    const updateColumnSizing = updater => {
        /**
         * Apply new width from sizing state to column descriptor
         * @sig applyWidth :: ColumnDescriptor -> ColumnDescriptor
         */
        const applyWidth = col => {
            const { id, width, sortDirection } = col
            const tanstackId = Object.entries(idMap).find(([, v]) => v === id)?.[0]
            const newWidth = newSizing[tanstackId] ?? width
            return ColumnDescriptor(id, newWidth, sortDirection)
        }

        const { columnDescriptors, id: layoutId, sortOrder } = tableLayout
        const newSizing = typeof updater === 'function' ? updater(columnSizing) : updater
        const updatedColumns = columnDescriptors.map(applyWidth)
        const newLayout = TableLayout(layoutId, LookupTable(updatedColumns, ColumnDescriptor, 'id'), sortOrder)
        post(Action.SetTableLayout(newLayout))
    }

    // Reorders columns in TableLayout based on TanStack column order
    // @sig updateColumnOrder :: [String] -> void
    const updateColumnOrder = newOrder => {
        const toDescriptor = tanstackId => tableLayout.columnDescriptors[idMap[tanstackId]]

        const reorderedColumns = newOrder.map(toDescriptor)
        const newLayout = TableLayout(
            tableLayout.id,
            LookupTable(reorderedColumns, ColumnDescriptor, 'id'),
            tableLayout.sortOrder,
        )
        post(Action.SetTableLayout(newLayout))
    }

    // -----------------------------------------------------------------------------------------------------------------
    // useEffect functions
    // -----------------------------------------------------------------------------------------------------------------
    const setupLayoutEffect = () =>
        setLayout({ title: 'Checking Account', subtitle: 'View and filter your checking account transactions' })

    const setupKeyboardEffect = () => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }

    // -----------------------------------------------------------------------------------------------------------------
    // computation functions
    // -----------------------------------------------------------------------------------------------------------------

    // Returns -1, 0, or 1 for sorting; handles both strings and numbers
    // @sig compareStringsOrNumbers :: (a, b) -> Number
    const compareStringsOrNumbers = (aVal, bVal) => {
        if (typeof aVal === 'string' && typeof bVal === 'string')
            return aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
        if (aVal < bVal) return -1
        if (aVal > bVal) return 1
        return 0
    }

    const computeTanStackFormat = () => toTanStackFormat(tableLayout, idMap)

    const computeData = () => calculateRunningBalances(filteredTransactions, startingBalance)

    // Returns search match IDs sorted by current table sort order
    // @sig computeSortedSearchMatches :: () -> [String]
    const computeSortedSearchMatches = () => {
        const compareBySort = (a, b) => sorting.reduce((result, spec) => compareBySortKey(a, b, result, spec), 0)
        const byPosition = (idA, idB) => (positionMap.get(idA) ?? 0) - (positionMap.get(idB) ?? 0)

        // @sig compareBySortKey :: (Object, Object, Number, {id: String, desc: Boolean}) -> Number
        const compareBySortKey = (a, b, result, { id, desc }) => {
            if (result !== 0) return result
            const key = accessorMap[id] || id
            const cmp = compareStringsOrNumbers(a[key] ?? '', b[key] ?? '')
            return desc ? -cmp : cmp
        }

        if (searchMatches.length === 0 || sorting.length === 0) return searchMatches

        const accessorMap = Object.fromEntries(bankTransactionColumns.map(col => [col.id, col.accessorKey]))
        const sortedData = [...data].sort(compareBySort)
        const positionMap = new Map(sortedData.map((row, i) => [row.id, i]))
        return [...searchMatches].sort(byPosition)
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks
    // -----------------------------------------------------------------------------------------------------------------
    const [, setLayout] = useChannel(layoutChannel)
    const dateRange = useSelector(S.dateRange)
    const dateRangeKey = useSelector(S.dateRangeKey)
    const searchQuery = useSelector(S.searchQuery)
    const currentSearchIndex = useSelector(S.currentSearchIndex)
    const currentRowIndex = useSelector(S.currentRowIndex)
    const allTableLayouts = useSelector(S.tableLayouts)
    const filteredTransactions = useSelector(S.filteredTransactions)
    const searchMatches = useSelector(S.searchMatches)

    // -----------------------------------------------------------------------------------------------------------------
    // Memos
    // -----------------------------------------------------------------------------------------------------------------
    const viewId = makeViewId(accountId)
    const { tableLayout: initialLayout, idMap } = useMemo(
        () => initializeFromColumns(viewId, bankTransactionColumns),
        [viewId],
    )
    const tableLayout = allTableLayouts?.[viewId] || initialLayout
    const { sorting, columnSizing, columnOrder } = useMemo(computeTanStackFormat, [tableLayout, idMap])
    const data = useMemo(computeData, [filteredTransactions, startingBalance])
    const sortedSearchMatches = useMemo(computeSortedSearchMatches, [searchMatches, data, sorting])

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleSortingChange = useCallback(updateSorting, [tableLayout, idMap, sorting])
    const handleColumnSizingChange = useCallback(updateColumnSizing, [tableLayout, idMap, columnSizing])
    const handleColumnOrderChange = useCallback(updateColumnOrder, [tableLayout, idMap])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(setupLayoutEffect, [setLayout])
    useEffect(setupInitialDateRangeEffect, [dateRangeKey, dateRange])
    useEffect(setupKeyboardEffect, [
        sortedSearchMatches.length,
        currentSearchIndex,
        currentRowIndex,
        filteredTransactions.length,
    ])

    const highlightedId =
        sortedSearchMatches.length > 0
            ? sortedSearchMatches[currentSearchIndex]
            : filteredTransactions[currentRowIndex]?.id

    return (
        <Flex gap="4" style={pageContainerStyle}>
            <TransactionFiltersCard />

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
