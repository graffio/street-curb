/*
 * TransactionRegister.stories.jsx - Storybook stories for TransactionRegister component
 *
 * This file provides interactive examples and documentation for the TransactionRegister component.
 * It demonstrates various usage patterns and configurations for the financial transaction display.
 *
 * STORY STRUCTURE:
 * - Uses Storybook 6+ CSF (Component Story Format)
 * - Provides realistic transaction data generation for testing
 * - Demonstrates basic usage and interactive features
 * - Shows integration with channel-based state management
 *
 * INTEGRATION WITH OTHER FILES:
 * - TransactionRegister.jsx: The main component being demonstrated
 * - transaction-register-channel.js: State management for transaction data
 * - mock-transaction-generator.js: Utility for generating realistic test data
 * - Uses design-system for useChannel hook and VirtualTable components
 *
 * MOCK DATA:
 * - Generates large datasets (10,000 transactions) to showcase virtualization benefits
 * - Includes realistic transaction data (dates, payees, amounts, categories)
 * - Uses channel initialization pattern for shared state management
 *
 * STORY EXAMPLES:
 * - Default: Standard transaction register with large dataset
 * - WithClickHandler: Demonstrates click interaction with transactions
 * - SmallDataset: Performance comparison with smaller dataset
 *
 * CHANNEL MANAGEMENT:
 * - StoryWrapper handles channel initialization for each story
 * - Sets up realistic starting balance and transaction data
 * - Manages loading states for proper component behavior
 */

import { Button, Card, DateRangePicker, Flex, Text } from '@graffio/design-system'
/* global alert */
import React, { useState } from 'react'
import TransactionRegisterPage from '../../pages/TransactionRegisterPage'
import { generateRealisticTransactions } from '../../utils/mock-transaction-generator.js'
import { TransactionRegister } from './TransactionRegister'

/*
 * Filter transactions by date range
 *
 * @sig filterByDateRange :: ([Transaction], DateRange) -> [Transaction]
 *     DateRange = { start: Date?, end: Date? }
 */
const filterByDateRange = (transactions, dateRange) => {
    if (!dateRange.start && !dateRange.end) return transactions

    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)

        if (dateRange.start && transactionDate < dateRange.start) return false
        if (dateRange.end && transactionDate > dateRange.end) return false

        return true
    })
}

/*
 * Filter transactions by category
 *
 * @sig filterByCategory :: ([Transaction], String) -> [Transaction]
 */
const filterByCategory = (transactions, categoryFilter) => {
    if (!categoryFilter.trim()) return transactions

    const categoryLower = categoryFilter.toLowerCase()

    return transactions.filter(transaction => {
        const category = (transaction.category || '').toLowerCase()
        return category.includes(categoryLower)
    })
}

/*
 * Filter transactions by amount range
 *
 * @sig filterByAmountRange :: ([Transaction], AmountRange) -> [Transaction]
 *     AmountRange = { min: Number?, max: Number? }
 */
const filterByAmountRange = (transactions, amountRange) => {
    if (amountRange.min === null && amountRange.max === null) return transactions

    return transactions.filter(transaction => {
        const amount = Math.abs(transaction.amount)

        if (amountRange.min !== null && amount < amountRange.min) return false
        if (amountRange.max !== null && amount > amountRange.max) return false

        return true
    })
}

/*
 * Filter transactions by cleared status
 *
 * @sig filterByClearedStatus :: ([Transaction], String) -> [Transaction]
 */
const filterByClearedStatus = (transactions, clearedStatus) => {
    if (clearedStatus === 'all') return transactions

    return transactions.filter(transaction => {
        const isCleared = transaction.cleared === 'R'
        return clearedStatus === 'cleared' ? isCleared : !isCleared
    })
}

/*
 * Sort transactions by column and direction
 *
 * @sig sortTransactions :: ([Transaction], SortConfig) -> [Transaction]
 *     SortConfig = { column: String, direction: 'asc'|'desc' }
 */
const sortTransactions = (transactions, sortConfig) => {
    const getValue = (transaction, column) => {
        if (column === 'date') return new Date(transaction.date)
        if (column === 'amount') return transaction.amount
        if (column === 'payee') return transaction.payee || ''
        if (column === 'category') return transaction.category || ''
        return ''
    }

    if (!sortConfig.column) return transactions

    const multiplier = sortConfig.direction === 'desc' ? -1 : 1

    return [...transactions].sort((a, b) => {
        const aValue = getValue(a, sortConfig.column)
        const bValue = getValue(b, sortConfig.column)

        if (aValue < bValue) return -1 * multiplier
        if (aValue > bValue) return 1 * multiplier

        return (a.transactionNumber || 0) - (b.transactionNumber || 0)
    })
}

const realisticTransactions = generateRealisticTransactions(10000)

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
 * Default story - no filtering or custom sorting
 * Configuration:
 *   - transactions: all transactions (no filtering)
 *   - searchQuery: '' (no search highlighting)
 */
const Default = args => <TransactionRegister transactions={realisticTransactions} startingBalance={5000} {...args} />

/*
 * WithClickHandler story - demonstrates click interaction
 * Configuration:
 *   - transactions: all transactions (no filtering)
 *   - onTransactionClick: custom handler that logs and shows alert
 */
const WithClickHandler = args => {
    const handleTransactionClick = transaction => {
        console.log('Transaction clicked:', transaction)
        alert(`Clicked transaction: ${transaction.payee} - ${transaction.amount}`)
    }

    return (
        <TransactionRegister
            transactions={realisticTransactions}
            startingBalance={5000}
            onTransactionClick={handleTransactionClick}
            {...args}
        />
    )
}

/*
 * SmallDataset story - performance comparison with smaller dataset
 * Configuration:
 *   - transactions: 100 (vs 10,000 in other stories)
 */
const SmallDataset = args => {
    const smallTransactions = generateRealisticTransactions(100)

    return <TransactionRegister transactions={smallTransactions} startingBalance={5000} {...args} />
}

/*
 * FilteredByDateRange story - shows date range filtering
 */
const FilteredByDateRange = args => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const filteredTransactions = filterByDateRange(realisticTransactions, { start: thirtyDaysAgo, end: new Date() })

    return (
        <div>
            <h3>Date Range Filtering - Last 30 Days</h3>
            <p>
                <strong>Configuration:</strong> filters.dateRange = &#123; start: 30 days ago, end: today &#125;,
                showing {filteredTransactions.length} of {realisticTransactions.length} transactions
            </p>
            <TransactionRegister transactions={filteredTransactions} startingBalance={5000} {...args} />
        </div>
    )
}

/*
 * SearchHighlighting story - demonstrates search highlighting (not filtering)
 */
const SearchHighlighting = args => (
    <div>
        <h3>Search Highlighting - "Starbucks"</h3>
        <p>
            <strong>Configuration:</strong> searchQuery = 'Starbucks' (highlights matching text in yellow, does NOT
            filter out transactions)
        </p>
        <p>
            <em>
                Note: Search highlights text but keeps all transactions visible. Use filtering to remove transactions
                from the list.
            </em>
        </p>
        <TransactionRegister
            transactions={realisticTransactions}
            searchQuery="Starbucks"
            startingBalance={5000}
            {...args}
        />
    </div>
)

/*
 * FilteredByCategory story - shows category filtering with custom sorting
 */
const FilteredByCategory = args => {
    let filteredTransactions = filterByCategory(realisticTransactions, 'Food')
    filteredTransactions = sortTransactions(filteredTransactions, { column: 'amount', direction: 'desc' })

    return (
        <div>
            <h3>Category Filtering with Custom Sorting - Food Transactions</h3>
            <p>
                <strong>Configuration:</strong> filters.categoryFilter = 'Food', sortConfig = &#123; column: 'amount',
                direction: 'desc' &#125; (highest amounts first)
            </p>
            <p>
                Showing {filteredTransactions.length} of {realisticTransactions.length} transactions
            </p>
            <TransactionRegister transactions={filteredTransactions} startingBalance={5000} {...args} />
        </div>
    )
}

/*
 * LargeTransactionsOnly story - shows amount range filtering
 */
const LargeTransactionsOnly = args => {
    const filteredTransactions = filterByAmountRange(realisticTransactions, { min: 100, max: null })

    return (
        <div>
            <h3>Amount Range Filtering - Large Transactions Only</h3>
            <p>
                <strong>Configuration:</strong> filters.amountRange = &#123; min: 100, max: null &#125; (shows
                transactions with absolute value &gt; $100)
            </p>
            <p>
                Showing {filteredTransactions.length} of {realisticTransactions.length} transactions
            </p>
            <TransactionRegister transactions={filteredTransactions} startingBalance={5000} {...args} />
        </div>
    )
}

/*
 * UnclearedTransactions story - shows cleared status filtering with custom sorting
 */
const UnclearedTransactions = args => {
    let filteredTransactions = filterByClearedStatus(realisticTransactions, 'uncleared')
    filteredTransactions = sortTransactions(filteredTransactions, { column: 'amount', direction: 'asc' })

    return (
        <div>
            <h3>Uncleared Transactions - Reconciliation Workflow</h3>
            <p>
                <strong>Configuration:</strong> filters.clearedStatus = 'uncleared' (shows only transactions without 'R'
                in cleared field), sortConfig = &#123; column: 'amount', direction: 'asc' &#125; (lowest amounts first)
            </p>
            <p>
                Showing {filteredTransactions.length} of {realisticTransactions.length} transactions
            </p>
            <TransactionRegister transactions={filteredTransactions} startingBalance={5000} {...args} />
        </div>
    )
}

/*
 * SortedByPayee story - demonstrates custom column sorting
 */
const SortedByPayee = args => {
    const sortedTransactions = sortTransactions(realisticTransactions, { column: 'payee', direction: 'asc' })

    return (
        <div>
            <h3>Custom Column Sorting - Alphabetical by Payee</h3>
            <p>
                <strong>Configuration:</strong> sortConfig = &#123; column: 'payee', direction: 'asc' &#125;
                (alphabetical by payee name), no filters applied
            </p>
            <TransactionRegister transactions={sortedTransactions} startingBalance={5000} {...args} />
        </div>
    )
}

/*
 * ComplexFilter story - demonstrates combining multiple KeyboardDateInput and custom sorting
 */
const ComplexFilter = args => {
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    let filteredTransactions = filterByDateRange(realisticTransactions, { start: sixtyDaysAgo, end: new Date() })
    filteredTransactions = filterByCategory(filteredTransactions, 'Food')
    filteredTransactions = filterByAmountRange(filteredTransactions, { min: 20, max: null })
    filteredTransactions = sortTransactions(filteredTransactions, { column: 'amount', direction: 'desc' })

    return (
        <div>
            <h3>Complex Multi-Filter Example - Food Transactions</h3>
            <p>
                <strong>Configuration:</strong> Multiple filters combined: dateRange (last 60 days) + categoryFilter
                ('Food') + amountRange (&gt; $20), sorted by amount descending
            </p>
            <p>
                Showing {filteredTransactions.length} of {realisticTransactions.length} transactions
            </p>
            <TransactionRegister transactions={filteredTransactions} startingBalance={5000} {...args} />
        </div>
    )
}

/*
 * FilteringPlusSearch story - demonstrates filtering vs search highlighting
 */
const FilteringPlusSearch = args => {
    const filteredTransactions = filterByCategory(realisticTransactions, 'Food')

    return (
        <div>
            <h3>Filtering + Search Highlighting - Food Category with "Coffee" Search</h3>
            <p>
                <strong>Configuration:</strong> filters.categoryFilter = 'Food' (removes non-food transactions) +
                searchQuery = 'Coffee' (highlights "Coffee" text in remaining transactions)
            </p>
            <p>
                <em>
                    Notice: Only Food transactions are shown (filtering), and "Coffee" text is highlighted in yellow
                    (searching).
                </em>
            </p>
            <p>
                Showing {filteredTransactions.length} of {realisticTransactions.length} transactions
            </p>
            <TransactionRegister
                transactions={filteredTransactions}
                searchQuery="Coffee"
                startingBalance={5000}
                {...args}
            />
        </div>
    )
}

/*
 * Interactive DateRangePicker story - shows the DateRangePicker controlling TransactionRegister
 */
const WithDateRangeFilter = args => {
    const [dateRange, setDateRange] = useState(null)
    const [dateRangeKey, setDateRangeKey] = useState('thisMonth')
    const [searchQuery, setSearchQuery] = useState('')

    // Calculate default dates from transaction data
    const defaultStartDate = getEarliestTransactionDate(realisticTransactions)
    const defaultEndDate = getTodaysDate()

    const [customStartDate, setCustomStartDate] = useState(null)
    const [customEndDate, setCustomEndDate] = useState(null)

    // Apply initial date range for "thisMonth"
    React.useEffect(() => {
        if (dateRangeKey === 'thisMonth' && !dateRange) {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            endOfMonth.setHours(23, 59, 59, 999)
            setDateRange({ start: startOfMonth, end: endOfMonth })
        }
    }, [dateRangeKey, dateRange])

    const filteredTransactions = filterByDateRange(realisticTransactions, dateRange || {})

    const handleDateRangeChange = newDateRange => {
        setDateRange(newDateRange)
    }

    const handleDateRangeKeyChange = key => {
        setDateRangeKey(key)
    }

    const handleCustomStartDateChange = newStartDate => {
        setCustomStartDate(newStartDate)
    }

    const handleCustomEndDateChange = newEndDate => {
        setCustomEndDate(newEndDate)
    }

    const handleClearFilters = () => {
        setDateRange(null)
        setDateRangeKey('all')
        setSearchQuery('')
        setCustomStartDate(null)
        setCustomEndDate(null)
    }

    return (
        <div>
            <h3>Interactive Date Range Filter</h3>
            <p>
                Use the date range filter to see how transactions are filtered in real-time. Currently showing{' '}
                {filteredTransactions.length} of {realisticTransactions.length} transactions.
            </p>

            <Flex gap="4" style={{ marginBottom: '16px' }}>
                <Card style={{ width: '280px', padding: '16px' }}>
                    <Flex direction="column" gap="4">
                        <Text size="3" weight="medium">
                            Date Range Filter
                        </Text>

                        <DateRangePicker
                            value={dateRangeKey}
                            onChange={handleDateRangeChange}
                            onValueChange={handleDateRangeKeyChange}
                            customStartDate={customStartDate}
                            customEndDate={customEndDate}
                            onCustomStartDateChange={handleCustomStartDateChange}
                            onCustomEndDateChange={handleCustomEndDateChange}
                            defaultStartDate={defaultStartDate}
                            defaultEndDate={defaultEndDate}
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
                        </Flex>
                    </Flex>
                </Card>

                <div style={{ flex: 1 }}>
                    <TransactionRegister
                        transactions={filteredTransactions}
                        searchQuery={searchQuery}
                        startingBalance={5000}
                        height={1600}
                        {...args}
                    />
                </div>
            </Flex>
        </div>
    )
}

/*
 * DateRangePicker with Search story - shows both date filtering and search highlighting
 */
const WithDateRangeAndSearch = args => {
    const [dateRange, setDateRange] = useState(null)
    const [dateRangeKey, setDateRangeKey] = useState('lastTwelveMonths')
    const [searchQuery, setSearchQuery] = useState('Coffee')

    // Calculate default dates from transaction data
    const defaultStartDate = getEarliestTransactionDate(realisticTransactions)
    const defaultEndDate = getTodaysDate()

    const [customStartDate, setCustomStartDate] = useState(null)
    const [customEndDate, setCustomEndDate] = useState(null)

    // Apply initial date range for "lastTwelveMonths"
    React.useEffect(() => {
        if (dateRangeKey === 'lastTwelveMonths' && !dateRange) {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
            const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            setDateRange({ start: twelveMonthsAgo, end: endOfToday })
        }
    }, [dateRangeKey, dateRange])

    const filteredTransactions = filterByDateRange(realisticTransactions, dateRange || {})

    const handleDateRangeChange = newDateRange => {
        setDateRange(newDateRange)
    }

    const handleDateRangeKeyChange = key => {
        setDateRangeKey(key)
    }

    const handleCustomStartDateChange = newStartDate => {
        setCustomStartDate(newStartDate)
    }

    const handleCustomEndDateChange = newEndDate => {
        setCustomEndDate(newEndDate)
    }

    const handleSearchChange = event => {
        setSearchQuery(event.target.value)
    }

    const handleClearFilters = () => {
        setDateRange(null)
        setDateRangeKey('all')
        setSearchQuery('')
        setCustomStartDate(null)
        setCustomEndDate(null)
    }

    return (
        <div>
            <h3>Date Range Filter + Search Highlighting</h3>
            <p>
                Demonstrates both date filtering (removes transactions outside date range) and search highlighting
                (highlights matching text). Currently showing {filteredTransactions.length} of{' '}
                {realisticTransactions.length} transactions.
            </p>

            <Flex gap="4" style={{ marginBottom: '16px' }}>
                <Card style={{ width: '280px', padding: '16px' }}>
                    <Flex direction="column" gap="4">
                        <Text size="3" weight="medium">
                            Filters
                        </Text>

                        <DateRangePicker
                            value={dateRangeKey}
                            onChange={handleDateRangeChange}
                            onValueChange={handleDateRangeKeyChange}
                            customStartDate={customStartDate}
                            customEndDate={customEndDate}
                            onCustomStartDateChange={handleCustomStartDateChange}
                            onCustomEndDateChange={handleCustomEndDateChange}
                            defaultStartDate={defaultStartDate}
                            defaultEndDate={defaultEndDate}
                        />

                        <Flex direction="column" gap="2">
                            <Text size="2" weight="medium" color="gray">
                                Search
                            </Text>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={{
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                }}
                            />
                        </Flex>

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
                            {searchQuery && (
                                <Text size="1" color="gray">
                                    Highlighting: "{searchQuery}"
                                </Text>
                            )}
                        </Flex>
                    </Flex>
                </Card>

                <div style={{ flex: 1 }}>
                    <TransactionRegister
                        transactions={filteredTransactions}
                        searchQuery={searchQuery}
                        startingBalance={5000}
                        height={1600}
                        {...args}
                    />
                </div>
            </Flex>
        </div>
    )
}

/*
 * As Complete Page story - shows the page component version
 * This demonstrates how the WithDateRangeAndSearch functionality has been extracted into a reusable page
 */
const AsCompletePage = args => (
    <div>
        <h3>Complete Page Component</h3>
        <p>
            This shows the same functionality as WithDateRangeAndSearch but as a complete page component that can be
            used in both Storybook and the real application. The page includes MainLayout integration with sidebar and
            top bar customization.
        </p>
        <p>
            <em>
                Note: This story shows the page component in the component story context. See
                Pages/TransactionRegisterPage for the full page experience.
            </em>
        </p>
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            <TransactionRegisterPage height={1600} {...args} />
        </div>
    </div>
)

export default {
    title: 'Components/TransactionRegister',
    component: TransactionRegister,
    args: { height: 1600 },
    argTypes: { height: { control: { type: 'range', min: 300, max: 800, step: 50 } } },
}

export {
    Default,
    WithClickHandler,
    SmallDataset,
    FilteredByDateRange,
    SearchHighlighting,
    FilteredByCategory,
    LargeTransactionsOnly,
    UnclearedTransactions,
    SortedByPayee,
    ComplexFilter,
    FilteringPlusSearch,
    WithDateRangeFilter,
    WithDateRangeAndSearch,
    AsCompletePage,
}
