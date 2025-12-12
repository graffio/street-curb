import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { bankTransactionColumns } from '../columns/transaction-columns.js'
import { post } from '../commands/post.js'
import { TransactionFiltersCard } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'
import { ColumnDescriptor, TableLayout } from '../types/index.js'

// View identity for table layout (will be account-specific when tabs are implemented)
// TODO: Replace with actual account ID like 'cols_account_abc123'
const VIEW_ID = 'cols_bank_default'

/**
 * Initialize TableLayout from column definitions (first-time setup)
 * @sig initializeFromColumns :: [ColumnDefinition] -> { tableLayout: TableLayout, idMap: Object }
 */
const initializeFromColumns = columns => {
    const descriptors = columns.map(col => ColumnDescriptor(`col_${col.id}`, col.size || 100, 'none'))
    // Store mapping from TanStack column id to our descriptor id
    const idMap = {}
    columns.forEach((col, i) => (idMap[col.id] = descriptors[i].id))
    return { tableLayout: TableLayout(VIEW_ID, LookupTable(descriptors, ColumnDescriptor, 'id'), []), idMap }
}

/**
 * Convert TableLayout to TanStack Table format
 * @sig toTanStackFormat :: (TableLayout?, Object) -> { sorting, columnSizing, columnOrder }
 */
const toTanStackFormat = (tableLayout, idMap) => {
    if (!tableLayout) return { sorting: [], columnSizing: {}, columnOrder: [] }

    // Build reverse map: descriptor id -> TanStack column id
    const reverseMap = Object.fromEntries(Object.entries(idMap).map(([k, v]) => [v, k]))

    // LookupTable order = display order
    const columnOrder = tableLayout.columnDescriptors.map(c => reverseMap[c.id])

    // Build columnSizing
    const columnSizing = {}
    for (const col of tableLayout.columnDescriptors) {
        const tanstackId = reverseMap[col.id]
        if (tanstackId) columnSizing[tanstackId] = col.width
    }

    // Build sorting from sortOrder + sortDirection
    const sorting = tableLayout.sortOrder
        .map(id => {
            const col = tableLayout.columnDescriptors[id]
            if (!col || col.sortDirection === 'none') return null
            return { id: reverseMap[col.id], desc: col.sortDirection === 'desc' }
        })
        .filter(Boolean)

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
 *         startingBalance?: Number,
 *         height?: Number
 *     }
 */
const TransactionRegisterPage = ({ startingBalance = 5000, height = '100%' }) => {
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

    const handleKeyDown = event => {
        const activeElement = document.activeElement
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA'

        if (event.key === 'Escape') {
            event.preventDefault()
            if (searchQuery) post(Action.SetTransactionFilter({ searchQuery: '', currentSearchIndex: 0 }))
            return
        }

        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
        if (isInputFocused) return

        event.preventDefault()
        const inSearchMode = sortedSearchMatches.length > 0
        if (event.key === 'ArrowDown') inSearchMode ? handleNextMatch() : moveToNextRow()
        if (event.key === 'ArrowUp') inSearchMode ? handlePreviousMatch() : moveToPreviousRow()
    }

    const setupInitialDateRangeEffect = () => {
        if (dateRangeKey !== 'lastTwelveMonths' || dateRange) return

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        post(Action.SetTransactionFilter({ dateRange: { start: twelveMonthsAgo, end: endOfToday } }))
    }

    const updateSorting = updater => {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater
        const updatedColumns = tableLayout.columnDescriptors.map(col => {
            const tanstackId = Object.entries(idMap).find(([, v]) => v === col.id)?.[0]
            const sortEntry = newSorting.find(s => s.id === tanstackId)
            const direction = sortEntry ? (sortEntry.desc ? 'desc' : 'asc') : 'none'
            return ColumnDescriptor(col.id, col.width, direction)
        })
        const newSortOrder = newSorting.map(s => idMap[s.id])
        const newLayout = TableLayout(tableLayout.id, LookupTable(updatedColumns, ColumnDescriptor, 'id'), newSortOrder)
        post(Action.SetTableLayout(newLayout))
    }

    const updateColumnSizing = updater => {
        const newSizing = typeof updater === 'function' ? updater(columnSizing) : updater
        const updatedColumns = tableLayout.columnDescriptors.map(col => {
            const tanstackId = Object.entries(idMap).find(([, v]) => v === col.id)?.[0]
            const width = newSizing[tanstackId] ?? col.width
            return ColumnDescriptor(col.id, width, col.sortDirection)
        })
        const newLayout = TableLayout(
            tableLayout.id,
            LookupTable(updatedColumns, ColumnDescriptor, 'id'),
            tableLayout.sortOrder,
        )
        post(Action.SetTableLayout(newLayout))
    }

    const updateColumnOrder = newOrder => {
        const reorderedColumns = newOrder.map(tanstackId => {
            const descriptorId = idMap[tanstackId]
            return tableLayout.columnDescriptors[descriptorId]
        })
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

    const hydrateLocalStorageEffect = () => post(Action.HydrateFromLocalStorage())

    // -----------------------------------------------------------------------------------------------------------------
    // computation functions
    // -----------------------------------------------------------------------------------------------------------------

    const compareStringsOrNumbers = (aVal, bVal) => {
        if (typeof aVal === 'string' && typeof bVal === 'string')
            return aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
        if (aVal < bVal) return -1
        if (aVal > bVal) return 1
        return 0
    }

    const computeTanStackFormat = () => toTanStackFormat(tableLayout, idMap)

    const computeData = () => calculateRunningBalances(filteredTransactions, startingBalance)

    const computeSortedSearchMatches = () => {
        const compareFn = (a, b) => {
            for (const { id, desc } of sorting) {
                const key = accessorMap[id] || id
                const aVal = a[key] ?? ''
                const bVal = b[key] ?? ''
                const result = compareStringsOrNumbers(aVal, bVal)
                if (result !== 0) return desc ? -result : result
            }
            return 0
        }

        if (searchMatches.length === 0 || sorting.length === 0) return searchMatches

        const accessorMap = Object.fromEntries(bankTransactionColumns.map(col => [col.id, col.accessorKey]))
        const sortedData = [...data].sort(compareFn)
        const positionMap = new Map(sortedData.map((row, i) => [row.id, i]))
        return [...searchMatches].sort((a, b) => (positionMap.get(a) ?? 0) - (positionMap.get(b) ?? 0))
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
    const { tableLayout: initialLayout, idMap } = useMemo(() => initializeFromColumns(bankTransactionColumns), [])
    const tableLayout = allTableLayouts?.[VIEW_ID] || initialLayout
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
    useEffect(hydrateLocalStorageEffect, [])
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
