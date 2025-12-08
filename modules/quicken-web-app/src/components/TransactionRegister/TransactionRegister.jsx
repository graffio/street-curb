/*
 * TransactionRegister - A financial transaction register component
 *
 * This component provides a bank-style transaction register interface built on top of VirtualTable.
 * It displays financial transactions with running balances, formatted amounts, and interactive features.
 *
 * ARCHITECTURE:
 * - Simple prop-based component that accepts filtered transactions and search query
 * - Delegates virtualization to VirtualTable from the design system
 * - Implements transaction-specific business logic (running balances, formatting)
 * - Supports click handlers for transaction selection and editing
 * - Forwards ref to enable programmatic scrolling via scrollToRow method
 * - Supports row highlighting for navigation and search result indication
 *
 * BUSINESS LOGIC:
 * - Calculates running balances from starting balance + transaction amounts
 * - Formats currency amounts with appropriate colors (green/red for positive/negative)
 * - Handles transaction data structure (date, payee, memo, amount, etc.)
 * - Provides column definitions optimized for financial data display
 * - Highlights search matches in displayed text
 *
 * INTEGRATION WITH OTHER FILES:
 * - TransactionRegister.stories.jsx: Storybook examples with mock data generation
 * - mock-transaction-generator.js: Utility for generating realistic test data
 * - index.js: Clean export interface for the component
 *
 * DELEGATION TO VirtualTable:
 * - All virtualization performance (handles 10,000+ transactions smoothly)
 * - Column management and responsive layouts
 * - Scroll handling and keyboard navigation
 * - Row rendering optimization and memory management
 * - Programmatic scrolling with smooth animations and centering
 * - Row highlighting and visual feedback for navigation
 */

import { VirtualTable } from '@graffio/design-system'
import PropTypes from 'prop-types'
import React from 'react'
import { transactionMatchesSearch } from '../../utils/transaction-filters.js'

// ---------------------------------------------------------------------------------------------------------------------
// Inline styles using Radix Themes tokens
// ---------------------------------------------------------------------------------------------------------------------

const rowBaseStyle = {}

const searchMatchRowStyle = { backgroundColor: 'var(--accent-2)' }

const highlightedRowStyle = { backgroundColor: 'var(--accent-3)' }

const payeeInfoStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }

const payeeNameStyle = { color: 'var(--gray-12)' }

const payeeMemoStyle = { color: 'var(--gray-11)', fontSize: 'var(--font-size-1)' }

const dateInfoStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }

const dateStyle = { color: 'var(--gray-12)' }

const relativeTimeStyle = { color: 'var(--gray-11)', fontSize: 'var(--font-size-1)' }

const searchHighlightStyle = { backgroundColor: 'var(--yellow-3)', borderRadius: 'var(--radius-1)', padding: '0 2px' }

// ---------------------------------------------------------------------------------------------------------------------

/*
 * Calculate running balances for transaction list
 *
 * @sig calculateRunningBalances :: ([Transaction], Number) -> [TransactionWithBalance]
 *     Transaction = { amount: Number }
 *     TransactionWithBalance = { runningBalance: Number, amount: Number }
 */
const calculateRunningBalances = (transactions, startingBalance) => {
    let runningBalance = startingBalance
    return transactions.map(transaction => ({ ...transaction, runningBalance: (runningBalance += transaction.amount) }))
}

/*
 * Format transaction amount for display
 *
 * @sig formatAmount :: Number -> String
 */
const formatAmount = amount => (amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`)

/*
 * Format running balance for display
 *
 * @sig formatBalance :: Number -> String
 */
const formatBalance = balance => `$${balance.toFixed(2)}`

/*
 * Format date for display
 *
 * @sig formatDate :: String -> String
 */
const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/*
 * Get relative time from date
 *
 * @sig getRelativeTime :: String -> String
 */
const getRelativeTime = dateString => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return months === 1 ? '1 month ago' : `${months} months ago`
    }
    const years = Math.floor(diffDays / 365)
    return years === 1 ? '1 year ago' : `${years} years ago`
}

/*
 * Get amount style for display
 *
 * @sig getAmountStyle :: Number -> Object
 */
const getAmountStyle = amount => ({ color: amount >= 0 ? 'var(--green-11)' : 'var(--red-11)', fontWeight: '500' })

/*
 * Get balance style for display
 *
 * @sig getBalanceStyle :: Number -> Object
 */
const getBalanceStyle = balance => ({ color: balance >= 0 ? 'var(--green-11)' : 'var(--red-11)', fontWeight: '500' })

/*
 * Get search matches within a specific field for highlighting
 *
 * @sig getFieldSearchMatches :: (String, String) -> [SearchMatch]
 *     SearchMatch = { text: String, isMatch: Boolean }
 */
const getFieldSearchMatches = (fieldValue, searchQuery) => {
    if (!searchQuery.trim() || !fieldValue) return [{ text: fieldValue || '', isMatch: false }]

    const queryLower = searchQuery.toLowerCase()
    const fieldLower = fieldValue.toLowerCase()

    if (!fieldLower.includes(queryLower)) return [{ text: fieldValue, isMatch: false }]

    const matches = []
    let lastIndex = 0
    let index = fieldLower.indexOf(queryLower, lastIndex)

    while (index !== -1) {
        // Add text before match
        if (index > lastIndex) matches.push({ text: fieldValue.slice(lastIndex, index), isMatch: false })

        // Add match
        matches.push({ text: fieldValue.slice(index, index + searchQuery.length), isMatch: true })

        lastIndex = index + searchQuery.length
        index = fieldLower.indexOf(queryLower, lastIndex)
    }

    // Add remaining text
    if (lastIndex < fieldValue.length) matches.push({ text: fieldValue.slice(lastIndex), isMatch: false })

    return matches
}

/*
 * Render text with search highlighting
 *
 * @sig HighlightedText :: Props -> ReactElement
 *     Props = { text: String, searchQuery: String }
 */
const HighlightedText = ({ text, searchQuery }) => {
    const possiblyHighlightRow = (match, index) => (
        <span key={index} style={match.isMatch ? searchHighlightStyle : undefined}>
            {match.text}
        </span>
    )

    const matches = getFieldSearchMatches(text, searchQuery)
    return <span>{matches.map(possiblyHighlightRow)}</span>
}

/*
 * Render a single transaction row with search highlighting
 *
 * @sig renderTransactionRow :: ([TransactionWithBalance], ClickHandler?, String) -> RenderRowFunc
 *     ClickHandler = Transaction -> void
 *     RenderRowFunc = Number -> ReactElement
 *     TransactionWithBalance = {
 *         date: String,
 *         number: String?,
 *         payee: String?,
 *         memo: String?,
 *         cleared: String?,
 *         category: String?,
 *         amount: Number,
 *         runningBalance: Number
 *     }
 */
const renderTransactionRow =
    (transactions, onTransactionClick, searchQuery) =>
    (index, { isHighlighted } = {}) => {
        const transaction = transactions[index]
        if (!transaction) return `Row ${index} - No transaction`

        const handleRowClick = () => onTransactionClick && onTransactionClick(transaction)
        const isSearchMatch = transactionMatchesSearch(transaction, searchQuery)

        // Build style object based on row state
        const rowStyle = {
            ...rowBaseStyle,
            ...(isSearchMatch && searchMatchRowStyle),
            ...(isHighlighted && highlightedRowStyle),
        }

        return (
            <VirtualTable.Row onClick={handleRowClick} style={rowStyle}>
                <VirtualTable.Cell width="110px">
                    <div style={dateInfoStyle}>
                        <div style={dateStyle}>
                            <HighlightedText text={formatDate(transaction.date)} searchQuery={searchQuery} />
                        </div>
                        <div style={relativeTimeStyle}>{getRelativeTime(transaction.date)}</div>
                    </div>
                </VirtualTable.Cell>
                <VirtualTable.Cell width="70px">
                    <HighlightedText text={transaction.number || ''} searchQuery={searchQuery} />
                </VirtualTable.Cell>
                <VirtualTable.Cell flex={1}>
                    <div style={payeeInfoStyle}>
                        <div style={payeeNameStyle}>
                            <HighlightedText text={transaction.payee || 'Unknown Payee'} searchQuery={searchQuery} />
                        </div>
                        <div style={payeeMemoStyle}>
                            <HighlightedText text={transaction.memo || ''} searchQuery={searchQuery} />
                        </div>
                    </div>
                </VirtualTable.Cell>
                <VirtualTable.Cell width="60px" textAlign="center">
                    <HighlightedText text={transaction.cleared || ''} searchQuery={searchQuery} />
                </VirtualTable.Cell>
                <VirtualTable.Cell width="140px">
                    <HighlightedText text={transaction.category || ''} searchQuery={searchQuery} />
                </VirtualTable.Cell>
                <VirtualTable.Cell width="100px" textAlign="right" style={getAmountStyle(transaction.amount)}>
                    <HighlightedText text={formatAmount(transaction.amount)} searchQuery={searchQuery} />
                </VirtualTable.Cell>
                <VirtualTable.Cell width="100px" textAlign="right" style={getBalanceStyle(transaction.runningBalance)}>
                    {formatBalance(transaction.runningBalance)}
                </VirtualTable.Cell>
            </VirtualTable.Row>
        )
    }

/*
 * Column definitions for transaction register
 *
 * @sig transactionColumns :: [Column]
 *     Column = { width: String?, flex: Number?, title: String, textAlign: 'left'|'center'|'right'? }
 */
// prettier-ignore
const transactionColumns = [
    { width: '110px', title: 'Date'        , textAlign: 'left'  },
    { width: '70px' , title: 'Number'      , textAlign: 'left'  },
    { flex: 1       , title: 'Payee / Memo', textAlign: 'left'  },
    { width: '60px' , title: 'Cleared'     , textAlign: 'center'},
    { width: '140px', title: 'Category'    , textAlign: 'left'  },
    { width: '100px', title: 'Amount'      , textAlign: 'right' },
    { width: '100px', title: 'Balance'     , textAlign: 'right' },
]

/*
 * TransactionRegister main component
 * @sig TransactionRegister :: TransactionRegister.propTypes -> ReactElement
 */
const TransactionRegister = React.forwardRef(
    (
        {
            transactions = [],
            searchQuery = '',
            startingBalance = 0,
            height = 600,
            onTransactionClick,
            highlightedRow,
            ...props
        },
        ref,
    ) => {
        const transactionsWithBalance = calculateRunningBalances(transactions, startingBalance)
        const transactionRenderRow = renderTransactionRow(transactionsWithBalance, onTransactionClick, searchQuery)

        return (
            <VirtualTable.Root ref={ref} height={height} columns={transactionColumns} {...props}>
                <VirtualTable.Header>
                    {transactionColumns.map((column, index) => (
                        <VirtualTable.HeaderCell
                            key={index}
                            width={column.width}
                            flex={column.flex}
                            textAlign={column.textAlign}
                        >
                            {column.title}
                        </VirtualTable.HeaderCell>
                    ))}
                </VirtualTable.Header>
                <VirtualTable.Body
                    rowCount={transactionsWithBalance.length}
                    rowHeight={72}
                    renderRow={transactionRenderRow}
                    highlightedRow={highlightedRow}
                />
            </VirtualTable.Root>
        )
    },
)

TransactionRegister.propTypes = {
    transactions: PropTypes.array,
    searchQuery: PropTypes.string,
    startingBalance: PropTypes.number,
    height: PropTypes.number,
    onTransactionClick: PropTypes.func,
    highlightedRow: PropTypes.number,
}

export { TransactionRegister }
