import {
    Button,
    Card,
    CategorySelector,
    DateRangePicker,
    Flex,
    layoutChannel,
    MainLayout,
    Text,
    TextField,
    useChannel,
} from '@graffio/design-system'
import React, { useEffect, useRef, useState } from 'react'
import { TransactionRegister } from '../components/index.js'
import { createSidebarItems } from '../utils/sidebar-config.js'
import { transactionMatchesSearch } from '../utils/transaction-utils.js'
import { filtersCard, mainContent, pageContainer } from './TransactionRegisterPage.css.js'

/*
 * Filter transactions by text content
 *
 * @sig filterByText :: ([Transaction], String) -> [Transaction]
 */
const filterByText = (transactions, query) => {
    if (!query.trim()) return transactions

    return transactions.filter(transaction => {
        const searchableText = [transaction.description, transaction.memo, transaction.payee, transaction.category]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        return searchableText.includes(query.toLowerCase())
    })
}

/*
 * Filter transactions by date range
 *
 * @sig filterByDateRange :: ([Transaction], DateRange) -> [Transaction]
 *     DateRange = { start: Date?, end: Date? }
 */
const filterByDateRange = (transactions, dateRange) => {
    if (!dateRange.start && !dateRange.end) return transactions

    return transactions.filter(transaction => {
        // Parse ISO date string correctly (transaction.date is like "2024-06-15")
        // Add explicit time to avoid timezone issues
        const transactionDate = new Date(transaction.date + 'T00:00:00')

        if (dateRange.start && transactionDate < dateRange.start) return false
        if (dateRange.end && transactionDate > dateRange.end) return false

        return true
    })
}

/*
 * Generate all parent categories for a hierarchical category
 * e.g., "food:restaurant:lunch" -> ["food", "food:restaurant", "food:restaurant:lunch"]
 *
 * @sig generateParentCategories :: String -> [String]
 */
const generateParentCategories = category => {
    const parts = category.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}

/*
 * Extract all unique categories from transactions, including parent categories
 *
 * @sig extractCategories :: [Transaction] -> [String]
 */
const extractCategories = transactions => {
    const allCategories = transactions
        .filter(transaction => transaction.category && transaction.category.trim())
        .map(transaction => generateParentCategories(transaction.category.trim()))
        .flat()

    return Array.from(new Set(allCategories)).sort()
}

/*
 * Check if a transaction category matches any of the selected category filters
 *
 * @sig categoryMatches :: (String?, [String]) -> Boolean
 */
const categoryMatches = (transactionCategory, selectedCategories) => {
    if (!selectedCategories.length) return true
    if (!transactionCategory) return false

    return selectedCategories.some(
        selectedCategory =>
            // Exact match or hierarchical match (selected category is a parent)
            transactionCategory === selectedCategory || transactionCategory.startsWith(selectedCategory + ':'),
    )
}

/*
 * Filter transactions by selected categories
 *
 * @sig filterByCategories :: ([Transaction], [String]) -> [Transaction]
 */
const filterByCategories = (transactions, selectedCategories) => {
    if (!selectedCategories.length) return transactions

    return transactions.filter(transaction => categoryMatches(transaction.category, selectedCategories))
}

/*
 * Get the earliest transaction date for default start date
 *
 * @sig getEarliestTransactionDate :: [Transaction] -> Date?
 */
const getEarliestTransactionDate = transactions => {
    if (!transactions || transactions.length === 0) return null

    return transactions.reduce((earliest, transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate < earliest ? transactionDate : earliest
    }, new Date(transactions[0].date))
}

/*
 * Get today's date
 *
 * @sig getTodaysDate :: () -> Date
 */
const getTodaysDate = () => new Date()

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
const TransactionRegisterPage = ({ transactions = [], startingBalance = 5000, height = 600 }) => {
    // Function definitions (without dependencies)
    const handleClearFilters = () => {
        setDateRange(null)
        setDateRangeKey('all')
        setSearchQuery('')
        setFilterQuery('')
        setCurrentSearchIndex(0)
        setCurrentRowIndex(0)
        setCustomStartDate(null)
        setCustomEndDate(null)
        setSelectedCategories([])
    }

    const moveToNextRow = () => {
        const maxIndex = filteredTransactions.length - 1
        setCurrentRowIndex(prev => (prev >= maxIndex ? 0 : prev + 1)) // Wrap around
    }

    const moveToPreviousRow = () => {
        const maxIndex = filteredTransactions.length - 1
        setCurrentRowIndex(prev => (prev <= 0 ? maxIndex : prev - 1)) // Wrap around
    }

    const handlePreviousMatch = () => {
        if (searchMatches.length > 0) {
            // Wrap to last match if at first match, otherwise go to previous
            const newIndex = currentSearchIndex === 0 ? searchMatches.length - 1 : currentSearchIndex - 1
            setCurrentSearchIndex(newIndex)
        }
    }

    const handleNextMatch = () => {
        if (searchMatches.length > 0) {
            // Wrap to first match if at last match, otherwise go to next
            const newIndex = currentSearchIndex === searchMatches.length - 1 ? 0 : currentSearchIndex + 1
            setCurrentSearchIndex(newIndex)
        }
    }

    const handleCategoryAdd = category => {
        setSelectedCategories(prev => [...prev, category])
    }

    const handleCategoryRemove = category => {
        setSelectedCategories(prev => prev.filter(c => c !== category))
    }

    // Keyboard navigation handler
    const handleKeyDown = event => {
        const activeElement = document.activeElement
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA'

        // Handle Escape key to clear search (works even when input is focused)
        if (event.key === 'Escape') {
            event.preventDefault()
            if (searchQuery) {
                setSearchQuery('')
                setCurrentSearchIndex(0)
                // Keep currentRowIndex for browse mode
            }
            return
        }

        // Only handle arrow keys when no input is focused
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
        if (isInputFocused) return

        event.preventDefault()

        if (searchMatches.length > 0) {
            // Search mode: navigate through search matches
            if (event.key === 'ArrowDown') handleNextMatch()
            else if (event.key === 'ArrowUp') handlePreviousMatch()
        } else {
            // Browse mode: navigate through all rows
            if (event.key === 'ArrowDown') moveToNextRow()
            else if (event.key === 'ArrowUp') moveToPreviousRow()
        }
    }

    const setupLayoutEffect = () => {
        setLayout({
            title: 'Checking Account',
            subtitle: 'View and filter your checking account transactions',
            topBarActions: (
                <Flex gap="2">
                    <Button variant="soft">Export</Button>
                    <Button>Import</Button>
                </Flex>
            ),
            sidebarItems: createSidebarItems('/transactions/checking'),
        })
    }

    const setupInitialDateRangeEffect = () => {
        if (dateRangeKey === 'lastTwelveMonths' && !dateRange) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
            const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            setDateRange({ start: twelveMonthsAgo, end: endOfToday })
        }
    }

    const [, setLayout] = useChannel(layoutChannel)
    const [dateRange, setDateRange] = useState(null)
    const [dateRangeKey, setDateRangeKey] = useState('lastTwelveMonths')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterQuery, setFilterQuery] = useState('')
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
    const [currentRowIndex, setCurrentRowIndex] = useState(0) // For browse mode navigation
    const [customStartDate, setCustomStartDate] = useState(null)
    const [customEndDate, setCustomEndDate] = useState(null)
    const [selectedCategories, setSelectedCategories] = useState([])

    const transactionRegisterRef = useRef(null)

    // Calculate default dates from transaction data
    const defaultStartDate = getEarliestTransactionDate(transactions)
    const defaultEndDate = getTodaysDate()

    // Extract all categories for the selector
    const allCategories = extractCategories(transactions)

    // Apply filters in sequence: text filter → date filter → category filter
    const textFilteredTransactions = filterByText(transactions, filterQuery)
    const dateFilteredTransactions = filterByDateRange(textFilteredTransactions, dateRange || {})
    const filteredTransactions = filterByCategories(dateFilteredTransactions, selectedCategories)

    // Calculate search matches for navigation
    const searchMatches = filteredTransactions
        .map((transaction, index) => ({ transaction, index }))
        .filter(({ transaction }) => transactionMatchesSearch(transaction, searchQuery))
        .map(({ index }) => index)

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
        <MainLayout>
            <Flex gap="4" className={pageContainer}>
                <Card className={filtersCard}>
                    <Flex direction="column" gap="4">
                        <Text size="3" weight="medium">
                            Filters
                        </Text>

                        <DateRangePicker
                            value={dateRangeKey}
                            onChange={setDateRange}
                            onValueChange={setDateRangeKey}
                            customStartDate={customStartDate}
                            customEndDate={customEndDate}
                            onCustomStartDateChange={setCustomStartDate}
                            onCustomEndDateChange={setCustomEndDate}
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
                                onChange={e => setFilterQuery(e.target.value)}
                            />
                        </Flex>

                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium" color="gray">
                                Search
                            </Text>
                            <TextField.Root
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value)
                                    setCurrentSearchIndex(0)
                                }}
                            />
                            {searchQuery && searchMatches.length > 0 && (
                                <Flex gap="2" align="center">
                                    <Button
                                        size="1"
                                        variant="soft"
                                        disabled={searchMatches.length === 0}
                                        onClick={handlePreviousMatch}
                                    >
                                        ← Previous
                                    </Button>
                                    <Button
                                        size="1"
                                        variant="soft"
                                        disabled={searchMatches.length === 0}
                                        onClick={handleNextMatch}
                                    >
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
                            onCategoryAdd={handleCategoryAdd}
                            onCategoryRemove={handleCategoryRemove}
                        />

                        <Button variant="soft" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>

                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray">
                                Showing {filteredTransactions.length} transactions
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

                <div className={mainContent}>
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
        </MainLayout>
    )
}

export { TransactionRegisterPage }
