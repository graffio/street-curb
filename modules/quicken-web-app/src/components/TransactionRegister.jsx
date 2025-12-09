/*
 * TransactionRegister - A financial transaction register component
 *
 * This component provides a bank-style transaction register interface built on top of VirtualTable.
 * It displays financial transactions with running balances, formatted amounts, and interactive features.
 *
 * ARCHITECTURE:
 * - Simple prop-based component that accepts filtered transactions and search query
 * - Accepts a columns prop (ColumnDefinition[]) for flexible column configuration
 * - Delegates virtualization to VirtualTable from the design system
 * - Uses applyFormat interpreter for value formatting based on column Format specs
 * - Supports click handlers for transaction selection and editing
 * - Forwards ref to enable programmatic scrolling via scrollToRow method
 * - Supports row highlighting for navigation and search result indication
 *
 * BUSINESS LOGIC:
 * - Calculates running balances from starting balance + transaction amounts
 * - Formats values according to column Format specs (Currency, Date, Custom, etc.)
 * - Applies conditional styling for amounts (green/red based on value)
 * - Highlights search matches in displayed text
 *
 * INTEGRATION WITH OTHER FILES:
 * - TransactionRegister.stories.jsx: Storybook examples with mock data generation
 * - columns/bank-transaction-columns.js: Default column configuration
 * - formatters/apply-format.js: Format interpreter for value formatting
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
import { Format } from '@graffio/design-system/src/types/format.js'
import PropTypes from 'prop-types'
import React from 'react'
import { bankTransactionColumns } from '../columns/bank-transaction-columns.js'
import { applyFormat } from '../formatters/apply-format.js'
import { transactionMatchesSearch } from '../utils/transaction-filters.js'

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
 * Get conditional style for monetary values (green for positive, red for negative)
 *
 * @sig getMonetaryStyle :: Number -> Object
 */
const getMonetaryStyle = value => ({ color: value >= 0 ? 'var(--green-11)' : 'var(--red-11)', fontWeight: '500' })

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

    const searchHighlightStyle = {
        backgroundColor: 'var(--yellow-3)',
        borderRadius: 'var(--radius-1)',
        padding: '0 2px',
    }
    const matches = getFieldSearchMatches(text, searchQuery)
    return <span>{matches.map(possiblyHighlightRow)}</span>
}

/*
 * Render a single cell based on column definition
 *
 * @sig renderCell :: (Transaction, ColumnDefinition, String) -> ReactElement
 */
const renderCell = (transaction, column, searchQuery) => {
    const { key, width, flex, textAlign, format } = column
    const value = transaction[key]
    const formattedValue = applyFormat(value, format)

    // Special case: date column shows date + relative time
    if (key === 'date')
        return (
            <VirtualTable.Cell key={key} width={width} flex={flex} textAlign={textAlign}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <div style={{ color: 'var(--gray-12)' }}>
                        <HighlightedText text={formattedValue} searchQuery={searchQuery} />
                    </div>
                    <div style={{ color: 'var(--gray-11)', fontSize: 'var(--font-size-1)' }}>
                        {applyFormat(value, Format.RelativeDate())}
                    </div>
                </div>
            </VirtualTable.Cell>
        )

    // Special case: payee column shows payee + memo
    if (key === 'payee')
        return (
            <VirtualTable.Cell key={key} width={width} flex={flex} textAlign={textAlign}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <div style={{ color: 'var(--gray-12)' }}>
                        <HighlightedText text={value || 'Unknown Payee'} searchQuery={searchQuery} />
                    </div>
                    <div style={{ color: 'var(--gray-11)', fontSize: 'var(--font-size-1)' }}>
                        <HighlightedText text={transaction.memo || ''} searchQuery={searchQuery} />
                    </div>
                </div>
            </VirtualTable.Cell>
        )

    // Special case: amount/balance with conditional styling
    if (key === 'amount' || key === 'runningBalance')
        return (
            <VirtualTable.Cell
                key={key}
                width={width}
                flex={flex}
                textAlign={textAlign}
                style={getMonetaryStyle(value)}
            >
                <HighlightedText text={formattedValue} searchQuery={searchQuery} />
            </VirtualTable.Cell>
        )

    // Default case: simple formatted value with search highlighting
    return (
        <VirtualTable.Cell key={key} width={width} flex={flex} textAlign={textAlign}>
            <HighlightedText text={formattedValue} searchQuery={searchQuery} />
        </VirtualTable.Cell>
    )
}

/*
 * Render a single transaction row with search highlighting
 *
 * @sig renderTransactionRow :: ([TransactionWithBalance], [ColumnDefinition], ClickHandler?, String) -> RenderRowFunc
 *     ClickHandler = Transaction -> void
 *     RenderRowFunc = Number -> ReactElement
 */
const renderTransactionRow =
    (transactions, columns, onTransactionClick, searchQuery) =>
    (index, { isHighlighted } = {}) => {
        const transaction = transactions[index]
        if (!transaction) return `Row ${index} - No transaction`

        const handleRowClick = () => onTransactionClick && onTransactionClick(transaction)
        const isSearchMatch = transactionMatchesSearch(transaction, searchQuery)

        const rowStyle = {
            ...(isSearchMatch && { backgroundColor: 'var(--accent-2)' }),
            ...(isHighlighted && { backgroundColor: 'var(--accent-3)' }),
        }

        return (
            <VirtualTable.Row onClick={handleRowClick} style={rowStyle}>
                {columns.map(column => renderCell(transaction, column, searchQuery))}
            </VirtualTable.Row>
        )
    }

/*
 * TransactionRegister main component
 * @sig TransactionRegister :: TransactionRegister.propTypes -> ReactElement
 */
const TransactionRegister = React.forwardRef(
    (
        {
            transactions = [],
            columns = bankTransactionColumns,
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
        const transactionRenderRow = renderTransactionRow(
            transactionsWithBalance,
            columns,
            onTransactionClick,
            searchQuery,
        )

        return (
            <VirtualTable.Root ref={ref} height={height} {...props}>
                <VirtualTable.Header>
                    {columns.map((column, index) => (
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
    columns: PropTypes.array,
    searchQuery: PropTypes.string,
    startingBalance: PropTypes.number,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onTransactionClick: PropTypes.func,
    highlightedRow: PropTypes.number,
}

export { TransactionRegister }
