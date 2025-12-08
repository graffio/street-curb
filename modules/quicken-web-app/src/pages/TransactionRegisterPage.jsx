import {
    Button,
    Card,
    CategorySelector,
    DateRangePicker,
    Flex,
    layoutChannel,
    Text,
    TextField,
    useChannel,
} from '@graffio/design-system'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TransactionRegister } from '../components/index.js'
import { resetTransactionFilters, setTransactionFilter } from '../store/actions.js'
import * as S from '../store/selectors.js'
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

const filtersCardStyle = { width: '280px', flexShrink: 0 }

const mainContentStyle = { flex: 1, minWidth: 0 }

// ---------------------------------------------------------------------------------------------------------------------

const fakeTransactions = generateRealisticTransactions(10000)

/*
 * Filters sidebar card for transaction filtering, searching, and category selection
 *
 * @sig TransactionFiltersCard :: (TransactionFiltersCardProps) -> ReactElement
 */
const TransactionFiltersCard = ({
    dateRange,
    dateRangeKey,
    filterQuery,
    searchQuery,
    selectedCategories,
    currentSearchIndex,
    customStartDate,
    customEndDate,
    defaultStartDate,
    defaultEndDate,
    allCategories,
    searchMatches,
    filteredTransactionsCount,
    onDateRangeChange,
    onDateRangeKeyChange,
    onCustomStartDateChange,
    onCustomEndDateChange,
    onFilterQueryChange,
    onSearchQueryChange,
    onCategoryAdd,
    onCategoryRemove,
    onPreviousMatch,
    onNextMatch,
    onClearFilters,
}) => (
    <Card style={filtersCardStyle}>
        <Flex direction="column" gap="4">
            <Text size="3" weight="medium">
                Filters
            </Text>

            <DateRangePicker
                value={dateRangeKey}
                onChange={onDateRangeChange}
                onValueChange={onDateRangeKeyChange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomStartDateChange={onCustomStartDateChange}
                onCustomEndDateChange={onCustomEndDateChange}
                defaultStartDate={defaultStartDate}
                defaultEndDate={defaultEndDate}
            />

            <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">
                    Filter
                </Text>
                <TextField.Root
                    placeholder="Filter transactions (e.g., Chipotle)..."
                    value={filterQuery}
                    onChange={onFilterQueryChange}
                />
            </Flex>

            <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">
                    Search
                </Text>
                <TextField.Root
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={onSearchQueryChange}
                />
                {searchQuery && searchMatches.length > 0 && (
                    <Flex gap="2" align="center">
                        <Button size="1" variant="soft" disabled={searchMatches.length === 0} onClick={onPreviousMatch}>
                            ← Previous
                        </Button>
                        <Button size="1" variant="soft" disabled={searchMatches.length === 0} onClick={onNextMatch}>
                            Next →
                        </Button>
                        <Text size="1" color="gray">
                            {currentSearchIndex + 1} of {searchMatches.length}
                        </Text>
                    </Flex>
                )}
            </Flex>

            <CategorySelector
                categories={allCategories}
                selectedCategories={selectedCategories}
                onCategoryAdded={onCategoryAdd}
                onCategoryRemoved={onCategoryRemove}
            />

            <Button variant="soft" onClick={onClearFilters}>
                Clear Filters
            </Button>

            <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                    Showing {filteredTransactionsCount} transactions
                </Text>
                {dateRange && (
                    <Text size="1" color="gray">
                        {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                    </Text>
                )}
                {filterQuery && (
                    <Text size="1" color="gray">
                        Filtered by: "{filterQuery}"
                    </Text>
                )}
                {searchQuery && (
                    <Text size="1" color="gray">
                        Highlighting: "{searchQuery}"
                    </Text>
                )}
                {selectedCategories.length > 0 && (
                    <Text size="1" color="gray">
                        Categories: {selectedCategories.join(', ')}
                    </Text>
                )}
            </Flex>
        </Flex>
    </Card>
)

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
    const dispatch = useDispatch()
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
    const handleClearFilters = () => dispatch(resetTransactionFilters())

    const moveToNextRow = () => {
        const maxIndex = filteredTransactions.length - 1
        dispatch(setTransactionFilter({ currentRowIndex: currentRowIndex >= maxIndex ? 0 : currentRowIndex + 1 }))
    }

    const moveToPreviousRow = () => {
        const maxIndex = filteredTransactions.length - 1
        dispatch(setTransactionFilter({ currentRowIndex: currentRowIndex <= 0 ? maxIndex : currentRowIndex - 1 }))
    }

    const handlePreviousMatch = () => {
        if (searchMatches.length > 0) {
            // Wrap to last match if at first match, otherwise go to previous
            const newIndex = currentSearchIndex === 0 ? searchMatches.length - 1 : currentSearchIndex - 1
            dispatch(setTransactionFilter({ currentSearchIndex: newIndex }))
        }
    }

    const handleNextMatch = () => {
        if (searchMatches.length > 0) {
            // Wrap to first match if at last match, otherwise go to next
            const newIndex = currentSearchIndex === searchMatches.length - 1 ? 0 : currentSearchIndex + 1
            dispatch(setTransactionFilter({ currentSearchIndex: newIndex }))
        }
    }

    const handleCategoryAdd = category => {
        dispatch(setTransactionFilter({ selectedCategories: [...selectedCategories, category] }))
    }

    const handleCategoryRemove = category => {
        dispatch(setTransactionFilter({ selectedCategories: selectedCategories.filter(c => c !== category) }))
    }

    // Keyboard navigation handler
    const handleKeyDown = event => {
        const activeElement = document.activeElement
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA'

        // Handle Escape key to clear search (works even when input is focused)
        // Keep currentRowIndex for browse mode
        if (event.key === 'Escape') {
            event.preventDefault()
            if (searchQuery) dispatch(setTransactionFilter({ searchQuery: '', currentSearchIndex: 0 }))
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

    const setupLayoutEffect = () => {
        setLayout({ title: 'Checking Account', subtitle: 'View and filter your checking account transactions' })
    }

    const setupInitialDateRangeEffect = () => {
        if (dateRangeKey === 'lastTwelveMonths' && !dateRange) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
            const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            dispatch(setTransactionFilter({ dateRange: { start: twelveMonthsAgo, end: endOfToday } }))
        }
    }

    // Set layout state for this page
    useEffect(setupLayoutEffect, [setLayout])

    // Apply initial date range for "lastTwelveMonths"
    useEffect(setupInitialDateRangeEffect, [dateRangeKey, dateRange, dispatch])

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
                onDateRangeChange={dateRange => dispatch(setTransactionFilter({ dateRange }))}
                onDateRangeKeyChange={dateRangeKey => dispatch(setTransactionFilter({ dateRangeKey }))}
                onCustomStartDateChange={customStartDate => dispatch(setTransactionFilter({ customStartDate }))}
                onCustomEndDateChange={customEndDate => dispatch(setTransactionFilter({ customEndDate }))}
                onFilterQueryChange={e => dispatch(setTransactionFilter({ filterQuery: e.target.value }))}
                onSearchQueryChange={e =>
                    dispatch(setTransactionFilter({ searchQuery: e.target.value, currentSearchIndex: 0 }))
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
