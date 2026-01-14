// ABOUTME: Tests for investment running cash balance calculation
// ABOUTME: Verifies RegisterRow output with sequential cash balance accumulation

import t from 'tap'
import { calculateRunningCashBalances } from '../../src/investments/running-cash-balance.js'
import { RegisterRow, Transaction } from '../../src/types/index.js'

// Helper to create minimal investment transactions for testing
// Transaction.Investment(accountId, date, id, transactionType, address, amount, categoryId, cleared, commission,
//                        investmentAction, memo, payee, price, quantity, runningBalance, securityId)
const createTransaction = (id, amount, action = 'Buy') =>
    Transaction.Investment(
        'acc_000000000001',
        '2024-01-15',
        `txn_${id.padStart(12, '0')}`,
        'investment',
        null,
        amount,
        null,
        null,
        null,
        action,
        null,
        null,
        null,
        null,
        null,
        'sec_000000000001',
    )

t.test('Given an empty array', t => {
    t.test('When calculateRunningCashBalances is called', t => {
        const result = calculateRunningCashBalances([])
        t.same(result, [], 'Then it returns an empty array')
        t.end()
    })
    t.end()
})

t.test('Given investment transactions with amounts [-1000, 500, -200] and startingBalance 0', t => {
    const transactions = [
        createTransaction('001', -1000, 'Buy'),
        createTransaction('002', 500, 'Sell'),
        createTransaction('003', -200, 'Buy'),
    ]

    t.test('When calculateRunningCashBalances is called', t => {
        const result = calculateRunningCashBalances(transactions, 0)

        t.test('Then each result is a RegisterRow', t => {
            t.ok(RegisterRow.is(result[0]))
            t.ok(RegisterRow.is(result[1]))
            t.ok(RegisterRow.is(result[2]))
            t.end()
        })

        t.test('Then cash balances accumulate correctly', t => {
            const balances = result.map(r => r.runningBalance)
            t.same(balances, [-1000, -500, -700])
            t.end()
        })
        t.end()
    })
    t.end()
})

t.test('Given investment transactions and startingBalance 5000', t => {
    const transactions = [createTransaction('001', -1000, 'Buy'), createTransaction('002', 100, 'Div')]

    t.test('When calculateRunningCashBalances is called', t => {
        const result = calculateRunningCashBalances(transactions, 5000)
        t.equal(result[0].runningBalance, 4000, 'Then first runningBalance includes starting cash')
        t.equal(result[1].runningBalance, 4100, 'Then second runningBalance accumulates dividend')
        t.end()
    })
    t.end()
})

t.test('Given transactions without explicit startingBalance', t => {
    const transactions = [createTransaction('001', -500, 'Buy')]

    t.test('When calculateRunningCashBalances is called with no second argument', t => {
        const result = calculateRunningCashBalances(transactions)
        t.equal(result[0].runningBalance, -500, 'Then startingBalance defaults to 0')
        t.end()
    })
    t.end()
})

t.test('Given transaction with null amount', t => {
    // ShrsIn has no cash impact
    const txn = Transaction.Investment(
        'acc_000000000001',
        '2024-01-15',
        'txn_000000000001',
        'investment',
        null,
        null,
        null,
        null,
        null,
        'ShrsIn',
        null,
        null,
        100,
        10,
        null,
        'sec_000000000001',
    )

    t.test('When calculateRunningCashBalances is called', t => {
        const result = calculateRunningCashBalances([txn], 1000)
        t.equal(result[0].runningBalance, 1000, 'Then null amount is treated as 0')
        t.end()
    })
    t.end()
})

t.test('Given the original transaction object', t => {
    const original = createTransaction('001', -100, 'Buy')
    const transactions = [original]

    t.test('When calculateRunningCashBalances is called', t => {
        const result = calculateRunningCashBalances(transactions)
        t.equal(result[0].transaction, original, 'Then the transaction reference is preserved')
        t.end()
    })
    t.end()
})
