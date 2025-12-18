// ABOUTME: Tests for balance query functions
// ABOUTME: Verifies currentBalance, balanceAsOf, balanceBreakdown, reconciliationDifference

import t from 'tap'
import {
    balanceAsOf,
    balanceBreakdown,
    currentBalance,
    reconciliationDifference,
} from '../../src/banking/balance-queries.js'

// -----------------------------------------------------------------------------
// currentBalance
// -----------------------------------------------------------------------------

t.test('Given transactions with amounts [100, -50, 200]', t => {
    const transactions = [
        { id: '1', amount: 100 },
        { id: '2', amount: -50 },
        { id: '3', amount: 200 },
    ]

    t.test('When currentBalance is called', t => {
        const result = currentBalance(transactions)
        t.equal(result, 250, 'Then it returns 250')
        t.end()
    })
    t.end()
})

t.test('Given an empty array', t => {
    t.test('When currentBalance is called', t => {
        const result = currentBalance([])
        t.equal(result, 0, 'Then it returns 0')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// balanceAsOf
// -----------------------------------------------------------------------------

t.test('Given transactions with dates 2024-01-15, 2024-02-01, 2024-03-01', t => {
    const transactions = [
        { id: '1', date: '2024-01-15', amount: 100 },
        { id: '2', date: '2024-02-01', amount: 200 },
        { id: '3', date: '2024-03-01', amount: 300 },
    ]

    t.test('When balanceAsOf 2024-02-01 is called', t => {
        const result = balanceAsOf('2024-02-01', transactions)
        t.equal(result, 300, 'Then it includes first two transactions (100 + 200)')
        t.end()
    })

    t.test('When balanceAsOf 2024-01-01 is called (before all transactions)', t => {
        const result = balanceAsOf('2024-01-01', transactions)
        t.equal(result, 0, 'Then it returns 0')
        t.end()
    })

    t.test('When balanceAsOf 2024-12-31 is called (after all transactions)', t => {
        const result = balanceAsOf('2024-12-31', transactions)
        t.equal(result, 600, 'Then it includes all transactions')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// balanceBreakdown
// -----------------------------------------------------------------------------

t.test('Given transactions with cleared status R, empty, c, empty', t => {
    const transactions = [
        { id: '1', cleared: 'R', amount: 100 },
        { id: '2', cleared: '', amount: 200 },
        { id: '3', cleared: 'c', amount: 50 },
        { id: '4', cleared: '', amount: -25 },
    ]

    t.test('When balanceBreakdown is called', t => {
        const { cleared, uncleared, total } = balanceBreakdown(transactions)
        t.equal(cleared, 150, 'Then cleared includes R and c (100 + 50)')
        t.equal(uncleared, 175, 'Then uncleared includes empty cleared (200 + -25)')
        t.equal(total, 325, 'Then total is sum of all')
        t.end()
    })
    t.end()
})

t.test('Given transactions with no cleared transactions', t => {
    const transactions = [
        { id: '1', cleared: '', amount: 100 },
        { id: '2', cleared: '', amount: 200 },
    ]

    t.test('When balanceBreakdown is called', t => {
        const result = balanceBreakdown(transactions)
        t.equal(result.cleared, 0, 'Then cleared is 0')
        t.equal(result.uncleared, 300, 'Then uncleared is total')
        t.end()
    })
    t.end()
})

t.test('Given an empty array', t => {
    t.test('When balanceBreakdown is called', t => {
        const result = balanceBreakdown([])
        t.same(result, { cleared: 0, uncleared: 0, total: 0 }, 'Then all values are 0')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// reconciliationDifference
// -----------------------------------------------------------------------------

t.test('Given statement balance 500 and cleared transactions totaling 450', t => {
    const transactions = [
        { id: '1', cleared: 'R', amount: 300 },
        { id: '2', cleared: 'R', amount: 150 },
        { id: '3', cleared: '', amount: 100 },
    ]

    t.test('When reconciliationDifference is called', t => {
        const result = reconciliationDifference(500, transactions)
        t.equal(result, 50, 'Then it returns 50 (statement - cleared)')
        t.end()
    })
    t.end()
})

t.test('Given statement balance matches cleared transactions', t => {
    const transactions = [{ id: '1', cleared: 'R', amount: 500 }]

    t.test('When reconciliationDifference is called', t => {
        const result = reconciliationDifference(500, transactions)
        t.equal(result, 0, 'Then it returns 0 (reconciled)')
        t.end()
    })
    t.end()
})

t.test('Given statement balance less than cleared transactions', t => {
    const transactions = [{ id: '1', cleared: 'R', amount: 600 }]

    t.test('When reconciliationDifference is called', t => {
        const result = reconciliationDifference(500, transactions)
        t.equal(result, -100, 'Then it returns negative (we have more cleared)')
        t.end()
    })
    t.end()
})
