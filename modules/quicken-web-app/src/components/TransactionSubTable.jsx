// ABOUTME: Sub-table for displaying transactions within expanded report rows
// ABOUTME: Hides the column matching groupBy dimension (redundant when grouped)

import { Box, Flex, Text } from '@graffio/design-system'
import React from 'react'
import { ACTION_LABELS } from '../columns/cell-renderers.jsx'
import { formatCurrency, formatDate } from '../utils/formatters.js'

// Render a single transaction row, hiding column for groupBy dimension
// @sig TransactionRow :: { transaction: Transaction, groupBy: String? } -> ReactElement
const TransactionRow = ({ transaction, groupBy }) => {
    const { date, payee, memo, accountName, categoryName, amount, investmentAction } = transaction
    const formattedDate = date ? formatDate(date) : ''
    const formattedAmount = amount != null ? formatCurrency(amount) : '—'
    const amountColor = amount >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    const actionLabel = investmentAction ? ACTION_LABELS[investmentAction] || investmentAction : ''

    return (
        <Flex gap="4" py="1" style={{ borderBottom: '1px solid var(--gray-4)' }}>
            <Text size="1" style={{ width: 90, color: 'var(--gray-11)' }}>
                {formattedDate}
            </Text>
            {groupBy !== 'account' && (
                <Text size="1" style={{ width: 120, color: 'var(--gray-11)' }}>
                    {accountName || ''}
                </Text>
            )}
            {groupBy !== 'category' && (
                <Text size="1" style={{ width: 120, color: 'var(--gray-11)' }}>
                    {categoryName || ''}
                </Text>
            )}
            {groupBy !== 'payee' && (
                <Text size="1" style={{ flex: 1, color: 'var(--gray-12)' }}>
                    {payee || ''}
                </Text>
            )}
            <Text size="1" style={{ width: 80, color: 'var(--gray-11)' }}>
                {actionLabel}
            </Text>
            <Text size="1" style={{ flex: 1, color: 'var(--gray-10)', fontStyle: 'italic' }}>
                {memo || ''}
            </Text>
            <Text size="1" style={{ width: 80, textAlign: 'right', color: amountColor }}>
                {formattedAmount}
            </Text>
        </Flex>
    )
}

const headerStyle = { borderBottom: '1px solid var(--gray-6)', backgroundColor: 'var(--gray-2)' }
const bodyStyle = { height: 200, overflow: 'auto', resize: 'vertical', minHeight: 80 }

// Table showing transactions for an expanded report row
// @sig TransactionSubTable :: { transactions: [Transaction], groupBy: String? } -> ReactElement
const TransactionSubTable = ({ transactions, groupBy }) => {
    if (!transactions || transactions.length === 0)
        return (
            <Text size="1" color="gray">
                No transactions
            </Text>
        )

    return (
        <Box>
            <Flex gap="4" py="1" style={headerStyle}>
                <Text size="1" weight="medium" style={{ width: 90 }}>
                    Date
                </Text>
                {groupBy !== 'account' && (
                    <Text size="1" weight="medium" style={{ width: 120 }}>
                        Account
                    </Text>
                )}
                {groupBy !== 'category' && (
                    <Text size="1" weight="medium" style={{ width: 120 }}>
                        Category
                    </Text>
                )}
                {groupBy !== 'payee' && (
                    <Text size="1" weight="medium" style={{ flex: 1 }}>
                        Payee
                    </Text>
                )}
                <Text size="1" weight="medium" style={{ width: 80 }}>
                    Action
                </Text>
                <Text size="1" weight="medium" style={{ flex: 1 }}>
                    Memo
                </Text>
                <Text size="1" weight="medium" style={{ width: 80, textAlign: 'right' }}>
                    Amount
                </Text>
            </Flex>
            <Box style={bodyStyle}>
                {transactions.map((txn, i) => (
                    <TransactionRow key={txn.id || i} transaction={txn} groupBy={groupBy} />
                ))}
            </Box>
        </Box>
    )
}

export { TransactionSubTable }
