// ABOUTME: Tests for running balance calculation
// ABOUTME: Verifies ViewRow.Detail output with sequential balance accumulation

import t from 'tap'
import { calculateRunningBalances } from '../../src/banking/running-balance.js'
import { ViewRow, Transaction } from '../../src/types/index.js'

const { Detail } = ViewRow

// Helper to create minimal bank transactions for testing
// Transaction.Bank(accountId, amount, date, id, transactionType, address, categoryId, cleared, memo, number, payee)
const createTransaction = (id, amount, extras = {}) =>
    Transaction.Bank(
        'acc_000000000001',
        amount,
        '2024-01-15',
        `txn_${id.padStart(12, '0')}`,
        'bank',
        null,
        null,
        null,
        extras.memo ?? null,
        null,
        extras.payee ?? null,
    )

t.test('Given an empty array', t => {
    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances([])
        t.same(result, [], 'Then it returns an empty array')
        t.end()
    })
    t.end()
})

t.test('Given transactions with amounts [100, -50, 200] and startingBalance 0', t => {
    const transactions = [createTransaction('001', 100), createTransaction('002', -50), createTransaction('003', 200)]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions, 0)

        t.test('Then each result is a ViewRow.Detail', t => {
            t.ok(Detail.is(result[0]))
            t.ok(Detail.is(result[1]))
            t.ok(Detail.is(result[2]))
            t.end()
        })

        t.test('Then running balances accumulate correctly', t => {
            const balances = result.map(r => r.computed.runningBalance)
            t.same(balances, [100, 50, 250])
            t.end()
        })
        t.end()
    })
    t.end()
})

t.test('Given transactions with amounts [100, -50] and startingBalance 1000', t => {
    const transactions = [createTransaction('001', 100), createTransaction('002', -50)]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions, 1000)
        t.equal(result[0].computed.runningBalance, 1100, 'Then first runningBalance includes starting')
        t.equal(result[1].computed.runningBalance, 1050, 'Then second runningBalance accumulates')
        t.end()
    })
    t.end()
})

t.test('Given transactions without explicit startingBalance', t => {
    const transactions = [createTransaction('001', 100)]

    t.test('When calculateRunningBalances is called with no second argument', t => {
        const result = calculateRunningBalances(transactions)
        t.equal(result[0].computed.runningBalance, 100, 'Then startingBalance defaults to 0')
        t.end()
    })
    t.end()
})

t.test('Given already-sorted transactions', t => {
    const transactions = [createTransaction('00a', 10), createTransaction('00b', 20), createTransaction('00c', 30)]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions)
        const ids = result.map(r => r.transaction.id)
        t.same(ids, ['txn_00000000000a', 'txn_00000000000b', 'txn_00000000000c'], 'Then order is preserved')
        t.end()
    })
    t.end()
})

t.test('Given transactions with extra properties', t => {
    const transactions = [createTransaction('001', 100, { payee: 'Store', memo: 'Groceries' })]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions)
        t.equal(result[0].transaction.payee, 'Store', 'Then transaction properties are accessible')
        t.equal(result[0].transaction.memo, 'Groceries', 'Then all transaction properties are preserved')
        t.equal(result[0].computed.runningBalance, 100, 'Then runningBalance is in computed')
        t.end()
    })
    t.end()
})

t.test('Given the original transaction object', t => {
    const original = createTransaction('001', 100)
    const transactions = [original]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions)
        t.equal(result[0].transaction, original, 'Then the transaction reference is preserved')
        t.end()
    })
    t.end()
})
