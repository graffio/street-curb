import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { bankTransactionColumns } from '../columns/transaction-columns.js'
import { post } from '../commands/post.js'
import { TransactionFiltersCard } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

/*
 * Calculate running balances for transaction list
 * TODO: Move to selector for proper memoization
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
    // Functions
    const moveToNextRow = () => {
        const maxIndex = filteredTransactions.length - 1
        post(Action.SetTransactionFilter({ currentRowIndex: currentRowIndex >= maxIndex ? 0 : currentRowIndex + 1 }))
    }

    const moveToPreviousRow = () => {
        const maxIndex = filteredTransactions.length - 1
        post(Action.SetTransactionFilter({ currentRowIndex: currentRowIndex <= 0 ? maxIndex : currentRowIndex - 1 }))
    }

    const handlePreviousMatch = () => {
        if (searchMatches.length <= 0) return

        const newIndex = currentSearchIndex === 0 ? searchMatches.length - 1 : currentSearchIndex - 1
        post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
    }

    const handleNextMatch = () => {
        if (searchMatches.length <= 0) return

        const newIndex = currentSearchIndex === searchMatches.length - 1 ? 0 : currentSearchIndex + 1
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
        const inSearchMode = searchMatches.length > 0
        if (event.key === 'ArrowDown') inSearchMode ? handleNextMatch() : moveToNextRow()
        if (event.key === 'ArrowUp') inSearchMode ? handlePreviousMatch() : moveToPreviousRow()
    }

    const setupLayoutEffect = () =>
        setLayout({ title: 'Checking Account', subtitle: 'View and filter your checking account transactions' })

    const setupInitialDateRangeEffect = () => {
        if (dateRangeKey !== 'lastTwelveMonths' || dateRange) return

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        post(Action.SetTransactionFilter({ dateRange: { start: twelveMonthsAgo, end: endOfToday } }))
    }

    const setupKeyboardEffect = () => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }

    // Hooks
    const [, setLayout] = useChannel(layoutChannel)
    const dateRange = useSelector(S.dateRange)
    const dateRangeKey = useSelector(S.dateRangeKey)
    const searchQuery = useSelector(S.searchQuery)
    const currentSearchIndex = useSelector(S.currentSearchIndex)
    const currentRowIndex = useSelector(S.currentRowIndex)

    // Derived state (from selectors)
    const filteredTransactions = useSelector(S.filteredTransactions)
    const searchMatches = useSelector(S.searchMatches)

    // Prepare data with running balances
    const data = useMemo(
        () => calculateRunningBalances(filteredTransactions, startingBalance),
        [filteredTransactions, startingBalance],
    )

    // Effects
    useEffect(setupLayoutEffect, [setLayout])
    useEffect(setupInitialDateRangeEffect, [dateRangeKey, dateRange])
    useEffect(setupKeyboardEffect, [
        searchMatches.length,
        currentSearchIndex,
        currentRowIndex,
        filteredTransactions.length,
    ])

    return (
        <Flex gap="4" style={pageContainerStyle}>
            <TransactionFiltersCard />

            <div style={mainContentStyle}>
                <DataTable
                    columns={bankTransactionColumns}
                    data={data}
                    height={height}
                    rowHeight={60}
                    highlightedRow={Math.max(
                        0,
                        Math.min(
                            searchMatches.length > 0 ? searchMatches[currentSearchIndex] : currentRowIndex,
                            data.length - 1,
                        ),
                    )}
                    context={{ searchQuery }}
                />
            </div>
        </Flex>
    )
}

export default TransactionRegisterPage // fixme: TanStack Router depends on a default export!
export { TransactionRegisterPage }
