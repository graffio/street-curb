// ABOUTME: Tests for Transactions.matchingTransfer selector
// ABOUTME: Verifies heuristic matching of transfer counterparts across accounts

import t from 'tap'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Transaction } from '../src/types/transaction.js'
import { Transactions } from '../src/store/selectors.js'

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

const CHECKING = 'acc_000000000001'
const SAVINGS = 'acc_000000000002'

const makeTxn = (overrides = {}) => {
    const o = { id: 'txn_1', accountId: CHECKING, amount: -500, date: '2025-03-15', payee: 'Transfer', ...overrides }

    // Transaction.Bank(accountId, amount, date, id, transactionType, address, categoryId, cleared, memo, number, payee, runningBalance, transferAccountId)
    return Transaction.Bank(
        o.accountId,
        o.amount,
        o.date,
        o.id,
        'bank',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        o.payee,
        undefined,
        o.transferAccountId,
    )
}

const makeState = txns => ({ transactions: LookupTable(txns, Transaction, 'id') })

// Two sides of a transfer: checking -> savings
const sourceTransaction = makeTxn({
    id: 'txn_checking',
    accountId: CHECKING,
    transferAccountId: SAVINGS,
    amount: -500,
    date: '2025-03-15',
})

const counterpartTransaction = makeTxn({
    id: 'txn_savings',
    accountId: SAVINGS,
    transferAccountId: CHECKING,
    amount: 500,
    date: '2025-03-15',
})

// -----------------------------------------------------------------------------
// matchingTransfer
// -----------------------------------------------------------------------------

t.test('matchingTransfer', async t => {
    t.test('Given a transfer with a counterpart in the target account', async t => {
        const state = makeState([sourceTransaction, counterpartTransaction])

        t.test('When finding the match from the source side', async t => {
            const match = Transactions.matchingTransfer(state, sourceTransaction)
            t.equal(match.id, 'txn_savings', 'Then it returns the counterpart transaction')
        })

        t.test('When finding the match from the target side', async t => {
            const match = Transactions.matchingTransfer(state, counterpartTransaction)
            t.equal(match.id, 'txn_checking', 'Then it returns the source transaction (bidirectional)')
        })
    })

    t.test('Given a transfer with no counterpart in the target account', async t => {
        const orphanedTransfer = makeTxn({
            id: 'txn_orphan',
            accountId: CHECKING,
            transferAccountId: SAVINGS,
            amount: -500,
            date: '2025-03-15',
        })
        const state = makeState([orphanedTransfer])

        t.test('When attempting to find the match', async t =>
            t.throws(
                () => Transactions.matchingTransfer(state, orphanedTransfer),
                'Then it throws a data integrity error',
            ),
        )
    })

    t.test('Given ambiguous transfers (same accounts, date, and amount)', async t => {
        const firstMatch = makeTxn({
            id: 'txn_savings_1',
            accountId: SAVINGS,
            transferAccountId: CHECKING,
            amount: 500,
            date: '2025-03-15',
        })
        const secondMatch = makeTxn({
            id: 'txn_savings_2',
            accountId: SAVINGS,
            transferAccountId: CHECKING,
            amount: 500,
            date: '2025-03-15',
        })
        const state = makeState([sourceTransaction, firstMatch, secondMatch])

        t.test('When finding the match', async t => {
            const match = Transactions.matchingTransfer(state, sourceTransaction)
            t.equal(match.id, 'txn_savings_1', 'Then it returns the first match')
        })
    })
})
