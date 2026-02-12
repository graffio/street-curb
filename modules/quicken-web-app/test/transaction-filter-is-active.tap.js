// ABOUTME: Tests for TransactionFilter.isActive predicate
// ABOUTME: Verifies detection of non-default filter state across all filter fields

import t from 'tap'
import { TransactionFilter } from '../src/types/transaction-filter.js'

// Default filter — all fields at their initial values
const defaultFilter = TransactionFilter(
    'reg_test_1',
    '2026-02-12', // asOfDate
    { start: null, end: null }, // dateRange
    'all', // dateRangeKey
    '', // filterQuery
    '', // searchQuery
    [], // selectedCategories
    [], // selectedAccounts
    [], // selectedSecurities
    [], // selectedInvestmentActions
    null, // groupBy
    null, // customStartDate
    null, // customEndDate
)

t.test('TransactionFilter.isActive', t => {
    t.test('Given a default filter', t => {
        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(defaultFilter), false, 'Then it is not active')
            t.end()
        })
        t.end()
    })

    t.test('Given a filter with dateRangeKey !== "all"', t => {
        const filter = TransactionFilter.from({ ...defaultFilter, dateRangeKey: 'thisMonth' })

        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(filter), true, 'Then it is active')
            t.end()
        })
        t.end()
    })

    t.test('Given a filter with a non-empty filterQuery', t => {
        const filter = TransactionFilter.from({ ...defaultFilter, filterQuery: 'groceries' })

        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(filter), true, 'Then it is active')
            t.end()
        })
        t.end()
    })

    t.test('Given a filter with selected categories', t => {
        const filter = TransactionFilter.from({ ...defaultFilter, selectedCategories: ['cat_1'] })

        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(filter), true, 'Then it is active')
            t.end()
        })
        t.end()
    })

    t.test('Given a filter with selected accounts', t => {
        const filter = TransactionFilter.from({ ...defaultFilter, selectedAccounts: ['acct_1'] })

        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(filter), true, 'Then it is active')
            t.end()
        })
        t.end()
    })

    t.test('Given a filter with selected securities', t => {
        const filter = TransactionFilter.from({ ...defaultFilter, selectedSecurities: ['sec_1'] })

        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(filter), true, 'Then it is active')
            t.end()
        })
        t.end()
    })

    t.test('Given a filter with selected investment actions', t => {
        const filter = TransactionFilter.from({ ...defaultFilter, selectedInvestmentActions: ['Buy'] })

        t.test('When checked for activity', t => {
            t.equal(TransactionFilter.isActive(filter), true, 'Then it is active')
            t.end()
        })
        t.end()
    })
    t.end()
})
