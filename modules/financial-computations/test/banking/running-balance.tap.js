// ABOUTME: Tests for running balance calculation
// ABOUTME: Verifies sequential balance accumulation on sorted transactions

import t from 'tap'
import { calculateRunningBalances } from '../../src/banking/running-balance.js'

t.test('Given an empty array', t => {
    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances([])
        t.same(result, [], 'Then it returns an empty array')
        t.end()
    })
    t.end()
})

t.test('Given transactions with amounts [100, -50, 200] and startingBalance 0', t => {
    const transactions = [
        { id: '1', amount: 100 },
        { id: '2', amount: -50 },
        { id: '3', amount: 200 },
    ]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions, 0)
        t.equal(result[0].runningBalance, 100, 'Then first runningBalance is 100')
        t.equal(result[1].runningBalance, 50, 'Then second runningBalance is 50')
        t.equal(result[2].runningBalance, 250, 'Then third runningBalance is 250')
        t.end()
    })
    t.end()
})

t.test('Given transactions with amounts [100, -50] and startingBalance 1000', t => {
    const transactions = [
        { id: '1', amount: 100 },
        { id: '2', amount: -50 },
    ]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions, 1000)
        t.equal(result[0].runningBalance, 1100, 'Then first runningBalance is 1100')
        t.equal(result[1].runningBalance, 1050, 'Then second runningBalance is 1050')
        t.end()
    })
    t.end()
})

t.test('Given transactions without explicit startingBalance', t => {
    const transactions = [{ id: '1', amount: 100 }]

    t.test('When calculateRunningBalances is called with no second argument', t => {
        const result = calculateRunningBalances(transactions)
        t.equal(result[0].runningBalance, 100, 'Then startingBalance defaults to 0')
        t.end()
    })
    t.end()
})

t.test('Given already-sorted transactions', t => {
    const transactions = [
        { id: 'a', amount: 10, date: '2024-01-01' },
        { id: 'b', amount: 20, date: '2024-01-02' },
        { id: 'c', amount: 30, date: '2024-01-03' },
    ]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions)
        t.equal(result[0].id, 'a', 'Then order is preserved - first is a')
        t.equal(result[1].id, 'b', 'Then order is preserved - second is b')
        t.equal(result[2].id, 'c', 'Then order is preserved - third is c')
        t.end()
    })
    t.end()
})

t.test('Given transactions with other properties', t => {
    const transactions = [{ id: '1', amount: 100, payee: 'Store', memo: 'Groceries' }]

    t.test('When calculateRunningBalances is called', t => {
        const result = calculateRunningBalances(transactions)
        t.equal(result[0].payee, 'Store', 'Then original properties are preserved')
        t.equal(result[0].memo, 'Groceries', 'Then all properties are preserved')
        t.ok(result[0].runningBalance, 'Then runningBalance is added')
        t.end()
    })
    t.end()
})
