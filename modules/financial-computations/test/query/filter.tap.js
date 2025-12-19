// ABOUTME: Tests for filter predicates and composition
// ABOUTME: Verifies predicate composition and domain-specific filters

import { test } from 'tap'
import {
    and,
    or,
    not,
    byDateRange,
    byAccount,
    byCategory,
    byCategoryPrefix,
    byText,
    byCleared,
    byAmountRange,
    applyFilter,
} from '../../src/query/filter.js'

// Test data
const transactions = [
    {
        date: '2024-01-15',
        accountId: 'acc_1',
        categoryName: 'food:restaurant',
        payee: 'Whole Foods',
        amount: -50,
        cleared: 'R',
    },
    {
        date: '2024-01-20',
        accountId: 'acc_1',
        categoryName: 'food:grocery',
        payee: 'Trader Joes',
        amount: -100,
        cleared: 'R',
    },
    {
        date: '2024-02-01',
        accountId: 'acc_2',
        categoryName: 'transport',
        payee: 'Shell Gas',
        memo: 'Road trip',
        amount: -75,
        cleared: null,
    },
    {
        date: '2024-02-15',
        accountId: 'acc_1',
        categoryName: 'income:salary',
        payee: 'Employer',
        amount: 5000,
        cleared: 'R',
    },
]

test('Predicate composition', async t =>
    t.test('given multiple predicates', async t => {
        const isFood = txn => txn.categoryName?.startsWith('food')
        const isExpense = txn => txn.amount < 0

        t.test('when composing with and()', async t => {
            const predicate = and(isFood, isExpense)
            const result = transactions.filter(predicate)

            t.test('then only items matching all predicates are included', async t => {
                t.equal(result.length, 2)
                t.ok(result.every(txn => txn.categoryName.startsWith('food') && txn.amount < 0))
            })
        })

        t.test('when composing with or()', async t => {
            const isIncome = txn => txn.amount > 0
            const predicate = or(isFood, isIncome)
            const result = transactions.filter(predicate)

            t.test('then items matching any predicate are included', async t => t.equal(result.length, 3))
        })

        t.test('when negating with not()', async t => {
            const predicate = not(isFood)
            const result = transactions.filter(predicate)

            t.test('then items not matching the predicate are included', async t => {
                t.equal(result.length, 2)
                t.ok(result.every(txn => !txn.categoryName?.startsWith('food')))
            })
        })
    }))

test('byDateRange', async t =>
    t.test('given a date range', async t =>
        t.test('when filtering transactions', async t => {
            const result = applyFilter(byDateRange('2024-01-01', '2024-01-31'), transactions)

            t.test('then only transactions within the range are included', async t => {
                t.equal(result.length, 2)
                t.ok(result.every(txn => txn.date >= '2024-01-01' && txn.date <= '2024-01-31'))
            })
        }),
    ))

test('byAccount', async t =>
    t.test('given an account ID', async t =>
        t.test('when filtering transactions', async t => {
            const result = applyFilter(byAccount('acc_1'), transactions)

            t.test('then only transactions for that account are included', async t => {
                t.equal(result.length, 3)
                t.ok(result.every(txn => txn.accountId === 'acc_1'))
            })
        }),
    ))

test('byCategory', async t =>
    t.test('given an exact category name', async t =>
        t.test('when filtering transactions', async t => {
            const result = applyFilter(byCategory('food:restaurant'), transactions)

            t.test('then only exact matches are included', async t => {
                t.equal(result.length, 1)
                t.equal(result[0].payee, 'Whole Foods')
            })
        }),
    ))

test('byCategoryPrefix', async t =>
    t.test('given a category prefix', async t => {
        t.test('when filtering transactions', async t => {
            const result = applyFilter(byCategoryPrefix('food'), transactions)

            t.test('then transactions matching the prefix or hierarchy are included', async t => {
                t.equal(result.length, 2)
                t.ok(result.every(txn => txn.categoryName.startsWith('food')))
            })
        })

        t.test('when the prefix matches exactly', async t => {
            const txns = [{ categoryName: 'food' }, { categoryName: 'food:restaurant' }]
            const result = applyFilter(byCategoryPrefix('food'), txns)

            t.test('then both exact match and children are included', async t => t.equal(result.length, 2))
        })
    }))

test('byText', async t =>
    t.test('given a search query', async t => {
        t.test('when filtering by payee', async t => {
            const result = applyFilter(byText('whole'), transactions)

            t.test('then matching payees are found (case-insensitive)', async t => {
                t.equal(result.length, 1)
                t.equal(result[0].payee, 'Whole Foods')
            })
        })

        t.test('when filtering by memo', async t => {
            const result = applyFilter(byText('road'), transactions)

            t.test('then matching memos are found', async t => {
                t.equal(result.length, 1)
                t.equal(result[0].payee, 'Shell Gas')
            })
        })

        t.test('when filtering by category', async t => {
            const result = applyFilter(byText('restaurant'), transactions)

            t.test('then matching categories are found', async t => {
                t.equal(result.length, 1)
                t.equal(result[0].payee, 'Whole Foods')
            })
        })
    }))

test('byCleared', async t =>
    t.test('given a cleared status', async t => {
        t.test('when filtering for reconciled transactions', async t => {
            const result = applyFilter(byCleared('R'), transactions)

            t.test('then only reconciled transactions are included', async t => t.equal(result.length, 3))
        })

        t.test('when filtering for uncleared transactions', async t => {
            const result = applyFilter(byCleared(null), transactions)

            t.test('then only uncleared transactions are included', async t => {
                t.equal(result.length, 1)
                t.equal(result[0].payee, 'Shell Gas')
            })
        })
    }))

test('byAmountRange', async t =>
    t.test('given an amount range', async t => {
        t.test('when filtering for small expenses', async t => {
            const result = applyFilter(byAmountRange(-100, -50), transactions)

            t.test('then only transactions in the range are included', async t => t.equal(result.length, 3))
        })

        t.test('when filtering for income', async t => {
            const result = applyFilter(byAmountRange(0, 10000), transactions)

            t.test('then only positive amounts are included', async t => {
                t.equal(result.length, 1)
                t.equal(result[0].amount, 5000)
            })
        })
    }))

test('applyFilter', async t =>
    t.test('given a predicate and array', async t =>
        t.test('when applying the filter', async t => {
            const result = applyFilter(txn => txn.amount < 0, transactions)

            t.test('then a new array is returned', async t => {
                t.not(result, transactions)
                t.equal(result.length, 3)
            })
        }),
    ))
