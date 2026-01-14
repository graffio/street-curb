// ABOUTME: Tests for signature functions used in stable entity matching
// ABOUTME: Verifies deterministic string generation for payees, securities, and transactions

import { test } from 'tap'
import { Signatures } from '../src/signatures.js'

test('Signatures.normalizePayee', async t => {
    t.test('Given a payee string with mixed case and whitespace', async t =>
        t.test('When normalizing', async t => {
            const result = Signatures.normalizePayee('  ACME  Corporation   Inc  ')

            t.test('Then it lowercases, trims, and collapses whitespace', async t =>
                t.equal(result, 'acme corporation inc'),
            )
        }),
    )

    t.test('Given a null payee', async t =>
        t.test('When normalizing', async t => {
            const result = Signatures.normalizePayee(null)

            t.test('Then it returns empty string', async t => t.equal(result, ''))
        }),
    )

    t.test('Given an undefined payee', async t =>
        t.test('When normalizing', async t => {
            const result = Signatures.normalizePayee(undefined)

            t.test('Then it returns empty string', async t => t.equal(result, ''))
        }),
    )
})

test('Signatures.securitySignature', async t => {
    t.test('Given a security with a symbol', async t =>
        t.test('When generating signature', async t => {
            const security = { name: 'Apple Inc', symbol: 'AAPL' }
            const result = Signatures.securitySignature(security)

            t.test('Then it uses the symbol', async t => t.equal(result, 'AAPL'))
        }),
    )

    t.test('Given a security without a symbol', async t =>
        t.test('When generating signature', async t => {
            const security = { name: '  Vanguard Total Stock  ', symbol: null }
            const result = Signatures.securitySignature(security)

            t.test('Then it uses normalized name', async t => t.equal(result, 'vanguard total stock'))
        }),
    )

    t.test('Given a security with empty symbol', async t =>
        t.test('When generating signature', async t => {
            const security = { name: 'Bond Fund', symbol: '' }
            const result = Signatures.securitySignature(security)

            t.test('Then it falls back to normalized name', async t => t.equal(result, 'bond fund'))
        }),
    )
})

test('Signatures.bankTransactionSignature', async t => {
    t.test('Given a bank transaction', async t =>
        t.test('When generating signature', async t => {
            const txn = { date: '2024-01-15', amount: -50.0, payee: '  Grocery Store  ' }
            const stableAccountId = 'acc_00123'
            const result = Signatures.bankTransactionSignature(txn, stableAccountId)

            t.test('Then it joins stable account ID, date, amount, and normalized payee', async t =>
                t.equal(result, 'acc_00123|2024-01-15|-50|grocery store'),
            )
        }),
    )

    t.test('Given a transaction with null payee', async t =>
        t.test('When generating signature', async t => {
            const txn = { date: '2024-02-20', amount: 100.0, payee: null }
            const stableAccountId = 'acc_00456'
            const result = Signatures.bankTransactionSignature(txn, stableAccountId)

            t.test('Then it uses empty string for payee', async t => t.equal(result, 'acc_00456|2024-02-20|100|'))
        }),
    )
})

test('Signatures.investmentTransactionSignature', async t => {
    t.test('Given an investment transaction with stable IDs', async t =>
        t.test('When generating signature', async t => {
            const txn = { date: '2024-03-01', transactionType: 'Buy', quantity: 10.5, amount: -1050.0 }
            const stableAccountId = 'acc_00789'
            const stableSecurityId = 'sec_00123'
            const result = Signatures.investmentTransactionSignature(txn, stableAccountId, stableSecurityId)

            t.test('Then it joins stable account ID, date, action, security ID, quantity, and amount', async t =>
                t.equal(result, 'acc_00789|2024-03-01|Buy|sec_00123|10.5|-1050'),
            )
        }),
    )

    t.test('Given a dividend transaction', async t =>
        t.test('When generating signature', async t => {
            const txn = { date: '2024-06-15', transactionType: 'Div', quantity: null, amount: 25.5 }
            const stableAccountId = 'acc_00789'
            const stableSecurityId = 'sec_00789'
            const result = Signatures.investmentTransactionSignature(txn, stableAccountId, stableSecurityId)

            t.test('Then null quantity becomes empty string in signature', async t =>
                t.equal(result, 'acc_00789|2024-06-15|Div|sec_00789||25.5'),
            )
        }),
    )
})

test('Signatures.categorySignature', async t => {
    t.test('Given a category with a name', async t =>
        t.test('When generating signature', async t => {
            const category = { name: 'Groceries' }
            const result = Signatures.categorySignature(category)

            t.test('Then it returns the category name', async t => t.equal(result, 'Groceries'))
        }),
    )

    t.test('Given a category with a subcategory path', async t =>
        t.test('When generating signature', async t => {
            const category = { name: 'Auto:Fuel' }
            const result = Signatures.categorySignature(category)

            t.test('Then it returns the full path', async t => t.equal(result, 'Auto:Fuel'))
        }),
    )
})

test('Signatures.tagSignature', async t => {
    t.test('Given a tag with a name', async t =>
        t.test('When generating signature', async t => {
            const tag = { name: 'Vacation' }
            const result = Signatures.tagSignature(tag)

            t.test('Then it returns the tag name', async t => t.equal(result, 'Vacation'))
        }),
    )

    t.test('Given a tag with special characters', async t =>
        t.test('When generating signature', async t => {
            const tag = { name: '2024-Trip' }
            const result = Signatures.tagSignature(tag)

            t.test('Then it preserves the exact name', async t => t.equal(result, '2024-Trip'))
        }),
    )
})

test('Signatures.splitSignature', async t => {
    t.test('Given a split with transaction and category stable IDs', async t =>
        t.test('When generating signature', async t => {
            const split = { amount: -25.5 }
            const transactionStableId = 'txn_00123'
            const categoryStableId = 'cat_00456'
            const result = Signatures.splitSignature(split, transactionStableId, categoryStableId)

            t.test('Then it joins transaction stable ID, category stable ID, and amount', async t =>
                t.equal(result, 'txn_00123|cat_00456|-25.5'),
            )
        }),
    )

    t.test('Given a split with positive amount', async t =>
        t.test('When generating signature', async t => {
            const split = { amount: 100 }
            const transactionStableId = 'txn_00789'
            const categoryStableId = 'cat_00111'
            const result = Signatures.splitSignature(split, transactionStableId, categoryStableId)

            t.test('Then it includes the positive amount', async t => t.equal(result, 'txn_00789|cat_00111|100'))
        }),
    )
})

test('Signatures.priceSignature', async t => {
    t.test('Given a security stable ID and date', async t =>
        t.test('When generating signature', async t => {
            const securityStableId = 'sec_00123'
            const date = '2024-03-15'
            const result = Signatures.priceSignature(securityStableId, date)

            t.test('Then it joins security stable ID and date', async t => t.equal(result, 'sec_00123|2024-03-15'))
        }),
    )

    t.test('Given a different security and date', async t =>
        t.test('When generating signature', async t => {
            const securityStableId = 'sec_00456'
            const date = '2024-12-31'
            const result = Signatures.priceSignature(securityStableId, date)

            t.test('Then it produces a unique signature', async t => t.equal(result, 'sec_00456|2024-12-31'))
        }),
    )
})
