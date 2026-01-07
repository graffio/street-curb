// ABOUTME: Transaction register page with filtering, search, and table layout persistence
// ABOUTME: Displays account transactions with sorting, column reordering, and running balances

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import { calculateRunningBalances } from '@graffio/financial-computations/banking'
import { applySort } from '@graffio/financial-computations/query'
import { LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { bankTransactionColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { FilterChipRow } from '../components/index.js'
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

const { Intent, Keymap } = KeymapModule

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

const F = {
    // Creates a keymap for the transaction register with j/k navigation
    // @sig createRegisterKeymap :: String -> Keymap
    createRegisterKeymap: viewId => {
        const intents = LookupTable(
            [Intent('Move down', ['j'], 'ArrowDown'), Intent('Move up', ['k'], 'ArrowUp')],
            Intent,
            'description',
        )
        return Keymap(viewId, 10, false, activeId => activeId === viewId, intents)
    },
}

const E = {
    // Dispatches highlight change, resolving ID to index based on search mode
    // @sig dispatchHighlightChange :: (Number, [String], [Row], String) -> String -> void
    dispatchHighlightChange: (matchCount, searchMatches, data, viewId) => newId => {
        const inSearchMode = matchCount > 0
        const idx = inSearchMode ? searchMatches.indexOf(newId) : T.toRowIndex(data, newId)
        if (idx < 0) return
        post(Action.SetTransactionFilter(viewId, { [inSearchMode ? 'currentSearchIndex' : 'currentRowIndex']: idx }))
    },

    // Initializes the date range to last 12 months if not already set
    // @sig initDateRangeIfNeeded :: (String, DateRange | null, String) -> void
    initDateRangeIfNeeded: (dateRangeKey, dateRange, viewId) => {
        if (P.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: T.toDefaultDateRange() }))
    },

    // Registers keymap on mount and unregisters on unmount
    // @sig keymapEffect :: (Keymap, String) -> () -> void
    keymapEffect: (keymap, viewId) => () => {
        post(Action.RegisterKeymap(keymap))
        return () => post(Action.UnregisterKeymap(viewId))
    },
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
    // Hooks (selectors and keymap registration)
    // -----------------------------------------------------------------------------------------------------------------
    const registerKeymap = useMemo(() => F.createRegisterKeymap(viewId), [viewId])

    useEffect(E.keymapEffect(registerKeymap, viewId), [registerKeymap, viewId])

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
        () => applySort(sorting, accountTransactions, bankTransactionColumns),
        [accountTransactions, sorting],
    )

    const data = useMemo(
        () => calculateRunningBalances(sortedTransactions, startingBalance),
        [sortedTransactions, startingBalance],
    )

    // With manual sorting, search matches are already in display order (indices into sortedTransactions)
    const matchCount = searchMatches.length

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
        () => setLayout({ title: 'Checking Account', subtitle: 'View and filter your checking account transactions' }),
        [setLayout],
    )

    useEffect(() => E.initDateRangeIfNeeded(dateRangeKey, dateRange, viewId), [dateRangeKey, dateRange, viewId])

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} accountId={accountId} />
            <div style={mainContentStyle}>
                <DataTable
                    columns={bankTransactionColumns}
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

export default TransactionRegisterPage // fixme: TanStack Router depends on a default export!
export { TransactionRegisterPage }
