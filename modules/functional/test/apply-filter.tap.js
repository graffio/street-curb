/*
 * apply-filter.tap.js - Tests for FilterSpec pattern matching and application
 *
 * Tests the applyFilter interpreter that takes data and FilterSpec tagged types
 * and returns filtered results. Uses Given/When/Then style.
 */

import { test } from 'tap'
import { FilterSpec } from '../src/types/filter-spec.js'
import { applyFilter } from '../src/apply-filter.js'

const sampleTransactions = [
    { id: 1, payee: 'Coffee Shop', memo: 'Morning latte', amount: -5.5, date: '2024-01-15', category: 'Food' },
    { id: 2, payee: 'Grocery Store', memo: 'Weekly groceries', amount: -120.0, date: '2024-01-16', category: 'Food' },
    { id: 3, payee: 'Paycheck', memo: 'January salary', amount: 3000.0, date: '2024-01-17', category: 'Income' },
    { id: 4, payee: 'Coffee House', memo: 'Afternoon coffee', amount: -4.25, date: '2024-01-18', category: 'Food' },
    { id: 5, payee: 'Gas Station', memo: 'Fill up', amount: -45.0, date: '2024-01-20', category: 'Auto' },
]

test('applyFilter with TextMatch', t => {
    t.test('Given a TextMatch filter searching payee and memo fields', t => {
        t.test('When filtering for "coffee" (case-insensitive)', t => {
            const filter = FilterSpec.TextMatch(['payee', 'memo'], 'coffee')
            const result = applyFilter(sampleTransactions, filter)

            t.same(result.length, 2, 'Then it should return 2 matching transactions')
            t.same(result[0].id, 1, 'And first match should be Coffee Shop')
            t.same(result[1].id, 4, 'And second match should be Coffee House')
            t.end()
        })
        t.end()
    })

    t.test('Given a TextMatch filter with no matches', t => {
        t.test('When filtering for "nonexistent"', t => {
            const filter = FilterSpec.TextMatch(['payee', 'memo'], 'nonexistent')
            const result = applyFilter(sampleTransactions, filter)

            t.same(result.length, 0, 'Then it should return empty array')
            t.end()
        })
        t.end()
    })

    t.test('Given a TextMatch filter with empty query', t => {
        t.test('When filtering with empty string', t => {
            const filter = FilterSpec.TextMatch(['payee'], '')
            const result = applyFilter(sampleTransactions, filter)

            t.same(result.length, 5, 'Then it should return all transactions')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('applyFilter with DateRange', t => {
    t.test('Given a DateRange filter', t => {
        t.test('When filtering for dates between Jan 16 and Jan 18', t => {
            const filter = FilterSpec.DateRange('date', new Date('2024-01-16'), new Date('2024-01-18'))
            const result = applyFilter(sampleTransactions, filter)

            t.same(result.length, 3, 'Then it should return 3 transactions')
            t.same(
                result.map(t => t.id),
                [2, 3, 4],
                'And they should be ids 2, 3, 4',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

test('applyFilter with CategoryMatch', t => {
    t.test('Given a CategoryMatch filter', t => {
        t.test('When filtering for Food category', t => {
            const filter = FilterSpec.CategoryMatch('category', ['Food'])
            const result = applyFilter(sampleTransactions, filter)

            t.same(result.length, 3, 'Then it should return 3 Food transactions')
            t.end()
        })

        t.test('When filtering for Food or Auto categories', t => {
            const filter = FilterSpec.CategoryMatch('category', ['Food', 'Auto'])
            const result = applyFilter(sampleTransactions, filter)

            t.same(result.length, 4, 'Then it should return 4 transactions')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('applyFilter with Compound (all mode)', t => {
    t.test('Given a Compound filter with mode "all"', t => {
        t.test('When combining TextMatch and CategoryMatch', t => {
            const textFilter = FilterSpec.TextMatch(['payee', 'memo'], 'coffee')
            const categoryFilter = FilterSpec.CategoryMatch('category', ['Food'])
            const compound = FilterSpec.Compound([textFilter, categoryFilter], 'all')
            const result = applyFilter(sampleTransactions, compound)

            t.same(result.length, 2, 'Then it should return transactions matching both filters')
            t.same(result[0].id, 1, 'And first should be Coffee Shop (Food)')
            t.same(result[1].id, 4, 'And second should be Coffee House (Food)')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('applyFilter with Compound (any mode)', t => {
    t.test('Given a Compound filter with mode "any"', t => {
        t.test('When combining CategoryMatch for Income or Auto', t => {
            const incomeFilter = FilterSpec.CategoryMatch('category', ['Income'])
            const autoFilter = FilterSpec.CategoryMatch('category', ['Auto'])
            const compound = FilterSpec.Compound([incomeFilter, autoFilter], 'any')
            const result = applyFilter(sampleTransactions, compound)

            t.same(result.length, 2, 'Then it should return transactions matching either filter')
            t.same(
                result.map(t => t.id),
                [3, 5],
                'And they should be Paycheck and Gas Station',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})
