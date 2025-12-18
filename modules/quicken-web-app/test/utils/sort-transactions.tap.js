// ABOUTME: Tests for multi-column transaction sorting
// ABOUTME: Verifies sorting behavior with various data types and multi-column cases

import tap from 'tap'
import { compareValues, sortTransactions } from '../../src/utils/sort-transactions.js'

const mockColumns = [
    { id: 'date', accessorKey: 'date' },
    { id: 'payee', accessorKey: 'payee' },
    { id: 'amount', accessorKey: 'amount' },
]

const mockTransactions = [
    { id: '1', date: '2024-01-15', payee: 'Grocery Store', amount: -50 },
    { id: '2', date: '2024-01-10', payee: 'Gas Station', amount: -30 },
    { id: '3', date: '2024-01-15', payee: 'Coffee Shop', amount: -5 },
    { id: '4', date: '2024-01-10', payee: 'Grocery Store', amount: -75 },
]

tap.test('compareValues', t => {
    t.test('Given two strings', t => {
        t.equal(compareValues('apple', 'banana'), -1, 'Then apple < banana')
        t.equal(compareValues('banana', 'apple'), 1, 'Then banana > apple')
        t.equal(compareValues('Apple', 'apple'), 0, 'Then comparison is case-insensitive')
        t.end()
    })

    t.test('Given two numbers', t => {
        t.equal(compareValues(10, 20), -1, 'Then 10 < 20')
        t.equal(compareValues(20, 10), 1, 'Then 20 > 10')
        t.equal(compareValues(10, 10), 0, 'Then 10 = 10')
        t.end()
    })

    t.test('Given null values', t => {
        t.equal(compareValues(null, 'value'), 1, 'Then null sorts after value')
        t.equal(compareValues('value', null), -1, 'Then value sorts before null')
        t.equal(compareValues(null, null), 0, 'Then null equals null')
        t.end()
    })
    t.end()
})

tap.test('sortTransactions', t => {
    t.test('Given an empty sorting array', t => {
        const result = sortTransactions(mockTransactions, [], mockColumns)
        t.same(result, mockTransactions, 'Then transactions are unchanged')
        t.end()
    })

    t.test('Given single column ascending sort', t => {
        const result = sortTransactions(mockTransactions, [{ id: 'date', desc: false }], mockColumns)
        t.same(
            result.map(tx => tx.id),
            ['2', '4', '1', '3'],
            'Then transactions are sorted by date ascending',
        )
        t.end()
    })

    t.test('Given single column descending sort', t => {
        const result = sortTransactions(mockTransactions, [{ id: 'amount', desc: true }], mockColumns)
        t.same(
            result.map(tx => tx.id),
            ['3', '2', '1', '4'],
            'Then transactions are sorted by amount descending (highest first)',
        )
        t.end()
    })

    t.test('Given multi-column sort (date asc, payee asc)', t => {
        const sorting = [
            { id: 'date', desc: false },
            { id: 'payee', desc: false },
        ]
        const result = sortTransactions(mockTransactions, sorting, mockColumns)
        t.same(
            result.map(tx => tx.id),
            ['2', '4', '3', '1'],
            'Then transactions are sorted by date, then payee within same date',
        )
        t.end()
    })

    t.test('Given original array', t => {
        const original = [...mockTransactions]
        sortTransactions(mockTransactions, [{ id: 'date', desc: false }], mockColumns)
        t.same(mockTransactions, original, 'Then original array is not mutated')
        t.end()
    })
    t.end()
})
