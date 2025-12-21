// ABOUTME: Sub-table for displaying transactions within expanded category rows
// ABOUTME: Simple list view with Date, Payee, Amount columns

import { Box, Flex, Text } from '@graffio/design-system'
import React from 'react'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

// Render a single transaction row
// @sig TransactionRow :: { transaction: Transaction } -> ReactElement
const TransactionRow = ({ transaction }) => {
    const { date, payee, memo, accountName, amount } = transaction
    const formattedDate = date ? dateFormatter.format(new Date(date)) : ''
    const formattedAmount = currencyFormatter.format(amount)
    const amountColor = amount >= 0 ? 'var(--green-11)' : 'var(--red-11)'

    return (
        <Flex gap="4" py="1" style={{ borderBottom: '1px solid var(--gray-4)' }}>
            <Text size="1" style={{ width: 90, color: 'var(--gray-11)' }}>
                {formattedDate}
            </Text>
            <Text size="1" style={{ width: 120, color: 'var(--gray-11)' }}>
                {accountName || ''}
            </Text>
            <Text size="1" style={{ flex: 1, color: 'var(--gray-12)' }}>
                {payee || 'Unknown'}
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

// Table showing transactions for an expanded category row
// @sig TransactionSubTable :: { transactions: [Transaction] } -> ReactElement
const TransactionSubTable = ({ transactions }) => {
    if (!transactions || transactions.length === 0)
        return (
            <Text size="1" color="gray">
                No transactions
            </Text>
        )

    return (
        <Box style={{ maxHeight: 200, overflow: 'auto' }}>
            <Flex gap="4" py="1" style={{ borderBottom: '1px solid var(--gray-6)' }}>
                <Text size="1" weight="medium" style={{ width: 90 }}>
                    Date
                </Text>
                <Text size="1" weight="medium" style={{ width: 120 }}>
                    Account
                </Text>
                <Text size="1" weight="medium" style={{ flex: 1 }}>
                    Payee
                </Text>
                <Text size="1" weight="medium" style={{ flex: 1 }}>
                    Memo
                </Text>
                <Text size="1" weight="medium" style={{ width: 80, textAlign: 'right' }}>
                    Amount
                </Text>
            </Flex>
            {transactions.map((txn, i) => (
                <TransactionRow key={txn.id || i} transaction={txn} />
            ))}
        </Box>
    )
}

export { TransactionSubTable }
