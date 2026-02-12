// ABOUTME: Tests for Transaction.matchesSearch and Transaction.matchesText field coverage
// ABOUTME: Verifies both matchers check all user-visible fields (payee, memo, number, investmentAction, amount, date)

import t from 'tap'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Category } from '../../quicken-type-definitions/category.type.js'
import { Security } from '../../quicken-type-definitions/security.type.js'
import { Transaction } from '../src/types/transaction.js'

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

const categories = LookupTable([{ id: 'cat_1', name: 'Groceries' }], Category, 'id')

const securities = LookupTable([{ id: 'sec_1', name: 'Apple Inc', symbol: 'AAPL' }], Security, 'id')

const emptyCategories = LookupTable([], Category, 'id')
const emptySecurities = LookupTable([], Security, 'id')

const bankTxn = {
    id: 'txn_1',
    transactionType: 'bank',
    accountId: 'acct_1',
    amount: 42.99,
    date: '2025-03-15',
    payee: 'Acme Corp',
    memo: 'Office supplies',
    address: '123 Main St',
    number: '1047',
}

const investmentTxn = {
    id: 'txn_2',
    transactionType: 'investment',
    accountId: 'acct_2',
    date: '2025-06-20',
    amount: 500,
    investmentAction: 'Buy',
    payee: 'Broker',
    memo: 'Monthly purchase',
    securityId: 'sec_1',
}

// -----------------------------------------------------------------------------
// matchesSearch
// -----------------------------------------------------------------------------

t.test('matchesSearch', async t => {
    t.test('Given a bank transaction with all fields populated', async t => {
        t.test('When searching by payee', async t => {
            const matches = Transaction.matchesSearch('Acme', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on payee')
        })

        t.test('When searching by memo', async t => {
            const matches = Transaction.matchesSearch('supplies', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on memo')
        })

        t.test('When searching by address (not a visible field)', async t => {
            const matches = Transaction.matchesSearch('Main St', emptyCategories, emptySecurities)
            t.notOk(matches(bankTxn), 'Then it does not match on address')
        })

        t.test('When searching by check number', async t => {
            const matches = Transaction.matchesSearch('1047', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on number')
        })

        t.test('When searching by amount', async t => {
            const matches = Transaction.matchesSearch('42.99', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on amount')
        })

        t.test('When searching by date', async t => {
            const matches = Transaction.matchesSearch('2025-03', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on date')
        })

        t.test('When searching by category name', async t => {
            const txnWithCat = { ...bankTxn, categoryId: 'cat_1' }
            const matches = Transaction.matchesSearch('Grocer', categories, emptySecurities)
            t.ok(matches(txnWithCat), 'Then it matches on category')
        })
    })

    t.test('Given an investment transaction', async t => {
        t.test('When searching by investmentAction', async t => {
            const matches = Transaction.matchesSearch('Buy', emptyCategories, emptySecurities)
            t.ok(matches(investmentTxn), 'Then it matches on investmentAction')
        })

        t.test('When searching by security symbol', async t => {
            const matches = Transaction.matchesSearch('AAPL', emptyCategories, securities)
            t.ok(matches(investmentTxn), 'Then it matches on security symbol')
        })

        t.test('When searching by security name', async t => {
            const matches = Transaction.matchesSearch('Apple', emptyCategories, securities)
            t.ok(matches(investmentTxn), 'Then it matches on security name')
        })
    })

    t.test('Given an empty query', async t =>
        t.test('When searching', async t => {
            const matches = Transaction.matchesSearch('', emptyCategories, emptySecurities)
            t.notOk(matches(bankTxn), 'Then it returns false')
        }),
    )
})

// -----------------------------------------------------------------------------
// matchesText
// -----------------------------------------------------------------------------

t.test('matchesText', async t => {
    t.test('Given a bank transaction with all fields populated', async t => {
        t.test('When filtering by payee', async t => {
            const matches = Transaction.matchesText('Acme', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on payee')
        })

        t.test('When filtering by memo', async t => {
            const matches = Transaction.matchesText('supplies', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on memo')
        })

        t.test('When filtering by address (not a visible field)', async t => {
            const matches = Transaction.matchesText('Main St', emptyCategories, emptySecurities)
            t.notOk(matches(bankTxn), 'Then it does not match on address')
        })

        t.test('When filtering by check number', async t => {
            const matches = Transaction.matchesText('1047', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on number')
        })

        t.test('When filtering by amount', async t => {
            const matches = Transaction.matchesText('42.99', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on amount')
        })

        t.test('When filtering by date', async t => {
            const matches = Transaction.matchesText('2025-03', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it matches on date')
        })

        t.test('When filtering by category name', async t => {
            const txnWithCat = { ...bankTxn, categoryId: 'cat_1' }
            const matches = Transaction.matchesText('Grocer', categories, emptySecurities)
            t.ok(matches(txnWithCat), 'Then it matches on category')
        })
    })

    t.test('Given an investment transaction', async t => {
        t.test('When filtering by investmentAction', async t => {
            const matches = Transaction.matchesText('Buy', emptyCategories, emptySecurities)
            t.ok(matches(investmentTxn), 'Then it matches on investmentAction')
        })

        t.test('When filtering by security symbol', async t => {
            const matches = Transaction.matchesText('AAPL', emptyCategories, securities)
            t.ok(matches(investmentTxn), 'Then it matches on security symbol')
        })

        t.test('When filtering by security name', async t => {
            const matches = Transaction.matchesText('Apple', emptyCategories, securities)
            t.ok(matches(investmentTxn), 'Then it matches on security name')
        })
    })

    t.test('Given an empty query', async t =>
        t.test('When filtering', async t => {
            const matches = Transaction.matchesText('', emptyCategories, emptySecurities)
            t.ok(matches(bankTxn), 'Then it returns true (filter shows all)')
        }),
    )
})
