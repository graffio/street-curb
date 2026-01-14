// ABOUTME: Tests for transaction database operations
// ABOUTME: Validates bank and investment transaction import and querying

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearTransactions,
    getAllTransactions,
    getTransactionCount,
    insertAccount,
    insertBankTransaction,
    insertInvestmentTransaction,
    insertSecurity,
    findAccountByName,
    findSecurityByName,
} from '../src/services/database/index.js'
import { QifEntry, Transaction } from '../src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/*
 * Create test database
 * @sig createTestDatabase :: () -> Database
 */
const createTestDatabase = () => {
    const db = Database(':memory:')
    const schemaPath = join(__dirname, '../schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

/*
 * Create account in database for testing
 * @sig createAccountInDb :: (Database, Object) -> Account
 */
const createAccountInDb = (db, accountData) => {
    const accountEntry = QifEntry.Account.from(accountData)
    insertAccount(db, accountEntry)
    return findAccountByName(db, accountEntry.name)
}

/*
 * Create security in database for testing
 * @sig createSecurityInDb :: (Database, Object) -> Security
 */
const createSecurityInDb = (db, securityData) => {
    const securityEntry = QifEntry.Security.from(securityData)
    insertSecurity(db, securityEntry)
    return findSecurityByName(db, securityEntry.name)
}

test('Transactions Repository', t => {
    t.test('Given a fresh database', t => {
        t.test('When I insert a basic bank transaction', t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Checking Account', type: 'Bank' })
            const transactionEntry = QifEntry.TransactionBank.from({
                account: 'Checking Account',
                amount: -50.0,
                date: new Date('2024-01-15'),
                transactionType: 'Bank',
                payee: 'Grocery Store',
                memo: 'Weekly groceries',
            })

            const transactionId = insertBankTransaction(db, transactionEntry, account)

            t.test('Then the transaction is inserted with a valid ID', t => {
                t.match(transactionId, /^txn_[a-f0-9]{12}(-\d+)?$/, 'Transaction ID should match pattern')
                t.end()
            })

            t.test('And I can find the transaction in the database', t => {
                const allTransactions = getAllTransactions(db)

                t.same(allTransactions.length, 1, 'Should have one transaction')
                t.ok(Transaction.Bank.is(allTransactions[0]), 'Should be a Bank transaction')
                t.match(allTransactions[0].accountId, /^acc_[a-f0-9]{12}$/, 'Account ID should match pattern')
                t.same(allTransactions[0].amount, -50.0, 'Amount should match')
                t.same(allTransactions[0].payee, 'Grocery Store', 'Payee should match')
                t.same(allTransactions[0].memo, 'Weekly groceries', 'Memo should match')
                t.same(allTransactions[0].transactionType, 'bank', 'Transaction type should match')
                t.end()
            })

            t.end()
        })

        t.test('When I insert a basic investment transaction', t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })
            const transactionEntry = QifEntry.TransactionInvestment.from({
                account: 'Investment Account',
                date: new Date('2024-01-15'),
                transactionType: 'Buy',
                amount: -1500.0,
                security: 'AAPL',
                quantity: 10,
                price: 150.0,
            })

            const transactionId = insertInvestmentTransaction(db, transactionEntry, account, security)

            t.test('Then the transaction is inserted with a valid ID', t => {
                t.match(transactionId, /^txn_[a-f0-9]{12}(-\d+)?$/, 'Transaction ID should match pattern')
                t.end()
            })

            t.test('And I can find the transaction in the database', t => {
                const allTransactions = getAllTransactions(db)

                t.same(allTransactions.length, 1, 'Should have one transaction')
                t.ok(Transaction.Investment.is(allTransactions[0]), 'Should be an Investment transaction')
                t.match(allTransactions[0].accountId, /^acc_[a-f0-9]{12}$/, 'Account ID should match pattern')
                t.match(allTransactions[0].securityId, /^sec_[a-f0-9]{12}$/, 'Security ID should match pattern')
                t.same(allTransactions[0].amount, -1500.0, 'Amount should match')
                t.same(allTransactions[0].quantity, 10, 'Quantity should match')
                t.same(allTransactions[0].price, 150.0, 'Price should match')
                t.same(allTransactions[0].transactionType, 'investment', 'Transaction type should match')
                t.same(allTransactions[0].investmentAction, 'Buy', 'Investment action should match')
                t.end()
            })

            t.end()
        })

        t.test('When I get all transactions on a fresh database', t => {
            const db = createTestDatabase()
            const allTransactions = getAllTransactions(db)

            t.test('Then I get an empty array', t => {
                t.same(allTransactions, [], 'Should return empty array for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I get the transaction count on a fresh database', t => {
            const db = createTestDatabase()
            const count = getTransactionCount(db)

            t.test('Then the count is zero', t => {
                t.same(count, 0, 'Transaction count should be zero for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I clear transactions', t => {
            const db = createTestDatabase()
            clearTransactions(db)

            t.test('Then the operation completes without error', t => {
                t.pass('Clear transactions should not throw an error')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with existing transactions', t => {
        const db = createTestDatabase()

        // Insert test accounts and securities
        const accounts = [
            createAccountInDb(db, { name: 'Checking Account', type: 'Bank' }),
            createAccountInDb(db, { name: 'Investment Account', type: 'Investment' }),
        ]

        const securities = [
            createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' }),
            createSecurityInDb(db, { name: 'Microsoft Corp.', symbol: 'MSFT' }),
        ]

        // Insert some test transactions
        const bankTransaction = QifEntry.TransactionBank.from({
            account: 'Checking Account',
            amount: -50.0,
            date: new Date('2024-01-15'),
            transactionType: 'Bank',
            payee: 'Grocery Store',
        })

        const investmentTransaction = QifEntry.TransactionInvestment.from({
            account: 'Investment Account',
            date: new Date('2024-01-16'),
            transactionType: 'Buy',
            amount: -1500.0,
            security: 'AAPL',
            quantity: 10,
            price: 150.0,
        })

        insertBankTransaction(db, bankTransaction, accounts[0])
        insertInvestmentTransaction(db, investmentTransaction, accounts[1], securities[0])

        t.test('When I get all transactions', t => {
            const allTransactions = getAllTransactions(db)

            t.test('Then I get all transactions in reverse chronological order', t => {
                t.same(allTransactions.length, 2, 'Should return all 2 transactions')
                t.same(allTransactions[0].date, '2024-01-16', 'First transaction should be most recent')
                t.same(allTransactions[1].date, '2024-01-15', 'Second transaction should be oldest')
                t.end()
            })

            t.test('And each transaction has the correct structure', t => {
                allTransactions.forEach(txn => {
                    const { id, accountId, date, transactionType } = txn
                    t.ok(Transaction.is(txn), 'Each item should be a Transaction type')
                    t.match(id, /^txn_[a-f0-9]{12}(-\d+)?$/, 'Each transaction should have a valid ID')
                    t.match(accountId, /^acc_[a-f0-9]{12}$/, 'Each transaction should have a valid account ID')
                    t.ok(typeof date === 'string', 'Each transaction should have a string date')
                    t.ok(typeof transactionType === 'string', 'Each transaction should have a string transaction type')
                })
                t.end()
            })

            t.test('And bank and investment transactions are correctly typed', t => {
                t.ok(Transaction.Bank.is(allTransactions[1]), 'Second transaction should be Bank type')
                t.ok(Transaction.Investment.is(allTransactions[0]), 'First transaction should be Investment type')
                t.end()
            })

            t.end()
        })

        t.test('When I get the transaction count', t => {
            const count = getTransactionCount(db)

            t.test('Then the count matches the number of transactions', t => {
                t.same(count, 2, 'Transaction count should be 2')
                t.end()
            })

            t.end()
        })

        t.test('When I clear all transactions', t => {
            clearTransactions(db)

            t.test('Then all transactions are removed', t => {
                const count = getTransactionCount(db)
                t.same(count, 0, 'Transaction count should be zero after clearing')
                t.end()
            })

            t.test('And I cannot find any transactions', t => {
                const allTransactions = getAllTransactions(db)
                t.same(allTransactions, [], 'All transactions should return empty array')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        t.test('When I try to insert a non-TransactionBank entry', t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Checking Account', type: 'Bank' })
            const invalidEntry = { account: 'Checking Account', amount: 100, date: new Date() }

            t.test('Then an error is thrown', t => {
                t.throws(
                    () => insertBankTransaction(db, invalidEntry, account),
                    'Should throw error for invalid entry type',
                )
                t.end()
            })

            t.end()
        })

        t.test('When I try to insert a non-TransactionInvestment entry', t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const invalidEntry = { account: 'Investment Account', date: new Date() }

            t.test('Then an error is thrown', t => {
                t.throws(
                    () => insertInvestmentTransaction(db, invalidEntry, account),
                    'Should throw error for invalid entry type',
                )
                t.end()
            })

            t.end()
        })

        t.test('Given transactions on the same day', t => {
            t.test('When I have cash outflow before cash inflow', t => {
                const db = createTestDatabase()
                const account = createAccountInDb(db, { name: 'Test Account', type: 'Bank' })

                // Insert transactions in problematic order: outflow first, inflow second
                const outflowTransaction = QifEntry.TransactionBank.from({
                    account: 'Test Account',
                    amount: -510.0,
                    date: new Date('2024-01-15'),
                    transactionType: 'Bank',
                    payee: 'Store',
                    memo: 'Purchase',
                })

                const inflowTransaction = QifEntry.TransactionBank.from({
                    account: 'Test Account',
                    amount: 10.0,
                    date: new Date('2024-01-15'),
                    transactionType: 'Bank',
                    payee: 'Bank',
                    memo: 'Interest',
                })

                // Insert in problematic order
                insertBankTransaction(db, outflowTransaction, account)
                insertBankTransaction(db, inflowTransaction, account)

                t.test('Then both transactions exist with correct amounts', t => {
                    const transactions = db.prepare('SELECT amount FROM transactions ORDER BY date ASC').all()

                    t.same(transactions.length, 2, 'Should have 2 transactions')

                    const amounts = transactions.map(t => t.amount).sort((a, b) => a - b)
                    t.same(amounts, [-510.0, 10.0], 'Both transactions should have correct amounts')
                    t.end()
                })

                t.end()
            })

            t.test('When I have investment transactions with same-day cash flows', t => {
                const db = createTestDatabase()
                const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
                const security = createSecurityInDb(db, { name: 'Test Stock', symbol: 'TEST' })

                // Insert investment transactions in problematic order: buy first, interest second
                const buyTransaction = QifEntry.TransactionInvestment.from({
                    account: 'Investment Account',
                    date: new Date('2024-01-15'),
                    transactionType: 'Buy',
                    amount: -510.0,
                    security: 'TEST',
                    quantity: 10,
                    price: 51.0,
                })

                const interestTransaction = QifEntry.TransactionInvestment.from({
                    account: 'Investment Account',
                    date: new Date('2024-01-15'),
                    transactionType: 'IntInc',
                    amount: 10.0,
                    security: null,
                })

                // Insert in problematic order
                insertInvestmentTransaction(db, buyTransaction, account, security)
                insertInvestmentTransaction(db, interestTransaction, account)

                t.test('Then both investment transactions exist with correct data', t => {
                    const transactions = db
                        .prepare('SELECT amount, investmentAction FROM transactions ORDER BY date ASC')
                        .all()

                    t.same(transactions.length, 2, 'Should have 2 investment transactions')

                    const buyTxn = transactions.find(t => t.investmentAction === 'Buy')
                    const intTxn = transactions.find(t => t.investmentAction === 'IntInc')

                    t.ok(buyTxn, 'Buy transaction should exist')
                    t.ok(intTxn, 'Interest transaction should exist')
                    t.same(buyTxn.amount, -510.0, 'Buy transaction should have correct amount')
                    t.same(intTxn.amount, 10.0, 'Interest transaction should have correct amount')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
