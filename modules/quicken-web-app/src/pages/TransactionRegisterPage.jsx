import { Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { TransactionFiltersCard, TransactionRegister } from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { generateParentCategories } from '../utils/category-hierarchy.js'
import { generateRealisticTransactions } from '../utils/mock-transaction-generator.js'
import {
    extractCategories,
    filterByCategories,
    filterByDateRange,
    filterByText,
    getEarliestTransactionDate,
    transactionMatchesSearch,
} from '../utils/transaction-filters.js'

// ---------------------------------------------------------------------------------------------------------------------
// Inline styles using Radix Themes tokens
// ---------------------------------------------------------------------------------------------------------------------

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }

const mainContentStyle = { flex: 1, minWidth: 0 }

// ---------------------------------------------------------------------------------------------------------------------

const fakeTransactions = generateRealisticTransactions(10000)

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
 *         transactions?: [Transaction],
 *         startingBalance?: Number,
 *         height?: Number
 *     }
 */
const TransactionRegisterPage = ({ transactions = fakeTransactions, startingBalance = 5000, height = '100%' }) => {
    const [, setLayout] = useChannel(layoutChannel)

    const dateRange = useSelector(S.dateRange)
    const dateRangeKey = useSelector(S.dateRangeKey)
    const filterQuery = useSelector(S.filterQuery)
    const searchQuery = useSelector(S.searchQuery)
    const selectedCategories = useSelector(S.selectedCategories)
    const currentSearchIndex = useSelector(S.currentSearchIndex)
    const currentRowIndex = useSelector(S.currentRowIndex)
    const customStartDate = useSelector(S.customStartDate)
    const customEndDate = useSelector(S.customEndDate)

    const transactionRegisterRef = useRef(null)

    // Calculate default dates from transaction data
    const defaultStartDate = getEarliestTransactionDate(transactions)
    const defaultEndDate = new Date()

    // Extract all categories for the selector
    const allCategories = extractCategories(transactions, generateParentCategories)

    // Apply filters in sequence: text filter → date filter → category filter
    const textFiltered = filterByText(transactions, filterQuery)
    const dateFiltered = filterByDateRange(textFiltered, dateRange || {})
    const filteredTransactions = filterByCategories(dateFiltered, selectedCategories)

    // Calculate search matches for navigation
    const searchMatches = filteredTransactions
        .map((transaction, index) => ({ transaction, index }))
        .filter(({ transaction }) => transactionMatchesSearch(transaction, searchQuery))
        .map(({ index }) => index)

    // Function definitions
    const handleClearFilters = () => post(Action.ResetTransactionFilters())

    const moveToNextRow = () => {
        const maxIndex = filteredTransactions.length - 1
        post(Action.SetTransactionFilter({ currentRowIndex: currentRowIndex >= maxIndex ? 0 : currentRowIndex + 1 }))
    }

    const moveToPreviousRow = () => {
        const maxIndex = filteredTransactions.length - 1
        post(Action.SetTransactionFilter({ currentRowIndex: currentRowIndex <= 0 ? maxIndex : currentRowIndex - 1 }))
    }

    const handlePreviousMatch = () => {
        if (searchMatches.length > 0) {
            // Wrap to last match if at first match, otherwise go to previous
            const newIndex = currentSearchIndex === 0 ? searchMatches.length - 1 : currentSearchIndex - 1
            post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
        }
    }

    const handleNextMatch = () => {
        if (searchMatches.length > 0) {
            // Wrap to first match if at last match, otherwise go to next
            const newIndex = currentSearchIndex === searchMatches.length - 1 ? 0 : currentSearchIndex + 1
            post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
        }
    }

    const handleCategoryAdd = category =>
        post(Action.SetTransactionFilter({ selectedCategories: [...selectedCategories, category] }))

    const handleCategoryRemove = category =>
        post(Action.SetTransactionFilter({ selectedCategories: selectedCategories.filter(c => c !== category) }))

    // Keyboard navigation handler
    const handleKeyDown = event => {
        const activeElement = document.activeElement
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA'

        // Handle Escape key to clear search (works even when input is focused)
        // Keep currentRowIndex for browse mode
        if (event.key === 'Escape') {
            event.preventDefault()
            if (searchQuery) post(Action.SetTransactionFilter({ searchQuery: '', currentSearchIndex: 0 }))
            return
        }

        // Only handle arrow keys when no input is focused
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
        if (dateRangeKey === 'lastTwelveMonths' && !dateRange) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
            const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            post(Action.SetTransactionFilter({ dateRange: { start: twelveMonthsAgo, end: endOfToday } }))
        }
    }

    // Set layout state for this page
    useEffect(setupLayoutEffect, [setLayout])

    // Apply initial date range for "lastTwelveMonths"
    useEffect(setupInitialDateRangeEffect, [dateRangeKey, dateRange])

    // Add keyboard event listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown, searchMatches.length, currentSearchIndex, currentRowIndex, filteredTransactions.length])

    // Handle scrolling for both search and browse modes
    useEffect(() => {
        if (!transactionRegisterRef.current || filteredTransactions.length === 0) return

        const targetRowIndex = searchMatches.length > 0 ? searchMatches[currentSearchIndex] : currentRowIndex

        // Use the new scrollToRow API with smooth scrolling and centering
        transactionRegisterRef.current.scrollToRow(targetRowIndex, { behavior: 'smooth', block: 'center' })
    }, [currentSearchIndex, currentRowIndex, searchMatches, filteredTransactions.length])

    return (
        <Flex gap="4" style={pageContainerStyle}>
            <TransactionFiltersCard
                dateRange={dateRange}
                dateRangeKey={dateRangeKey}
                filterQuery={filterQuery}
                searchQuery={searchQuery}
                selectedCategories={selectedCategories}
                currentSearchIndex={currentSearchIndex}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                defaultStartDate={defaultStartDate}
                defaultEndDate={defaultEndDate}
                allCategories={allCategories}
                searchMatches={searchMatches}
                filteredTransactionsCount={filteredTransactions.length}
                onDateRangeChange={dateRange => post(Action.SetTransactionFilter({ dateRange }))}
                onDateRangeKeyChange={dateRangeKey => post(Action.SetTransactionFilter({ dateRangeKey }))}
                onCustomStartDateChange={customStartDate => post(Action.SetTransactionFilter({ customStartDate }))}
                onCustomEndDateChange={customEndDate => post(Action.SetTransactionFilter({ customEndDate }))}
                onFilterQueryChange={e => post(Action.SetTransactionFilter({ filterQuery: e.target.value }))}
                onSearchQueryChange={e =>
                    post(Action.SetTransactionFilter({ searchQuery: e.target.value, currentSearchIndex: 0 }))
                }
                onCategoryAdd={handleCategoryAdd}
                onCategoryRemove={handleCategoryRemove}
                onPreviousMatch={handlePreviousMatch}
                onNextMatch={handleNextMatch}
                onClearFilters={handleClearFilters}
            />

            <div style={mainContentStyle}>
                <TransactionRegister
                    ref={transactionRegisterRef}
                    transactions={filteredTransactions}
                    searchQuery={searchQuery}
                    startingBalance={startingBalance}
                    height={height}
                    highlightedRow={searchMatches.length > 0 ? searchMatches[currentSearchIndex] : currentRowIndex}
                    tabIndex={0}
                />
            </div>
        </Flex>
    )
}

export default TransactionRegisterPage // fixme: TanStack Router depends on a default export!
export { TransactionRegisterPage }
