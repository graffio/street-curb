import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearTransactions,
    getAllTransactions,
    getTransactionCount,
    insertBankTransaction,
    insertInvestmentTransaction,
} from '../src/services/database/index.js'
import { Account, Entry, Security, Transaction } from '../src/types/index.js'

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
    const accountEntry = Entry.Account.from(accountData)
    const stmt = db.prepare('INSERT INTO accounts (name, type, description, credit_limit) VALUES (?, ?, ?, ?)')
    const result = stmt.run(accountEntry.name, accountEntry.type, accountEntry.description, accountEntry.creditLimit)

    return Account.from({
        id: result.lastInsertRowid,
        name: accountEntry.name,
        type: accountEntry.type,
        description: accountEntry.description,
        creditLimit: accountEntry.creditLimit,
    })
}

/*
 * Create security in database for testing
 * @sig createSecurityInDb :: (Database, Object) -> Security
 */
const createSecurityInDb = (db, securityData) => {
    const securityEntry = Entry.Security.from(securityData)
    const stmt = db.prepare('INSERT INTO securities (name, symbol, type, goal) VALUES (?, ?, ?, ?)')
    const result = stmt.run(securityEntry.name, securityEntry.symbol, securityEntry.type, securityEntry.goal)

    return Security.from({
        id: result.lastInsertRowid,
        name: securityEntry.name,
        symbol: securityEntry.symbol,
        type: securityEntry.type,
        goal: securityEntry.goal,
    })
}

test('Transactions Repository', t => {
    t.test('Given a fresh database', t => {
        t.test('When I insert a basic bank transaction', t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Checking Account', type: 'Bank' })
            const transactionEntry = Entry.TransactionBank.from({
                account: 'Checking Account',
                amount: -50.0,
                date: new Date('2024-01-15'),
                transactionType: 'Bank',
                payee: 'Grocery Store',
                memo: 'Weekly groceries',
            })

            const transactionId = insertBankTransaction(db, transactionEntry, account)

            t.test('Then the transaction is inserted with a valid ID', t => {
                t.ok(transactionId > 0, 'Transaction ID should be positive')
                t.end()
            })

            t.test('And I can find the transaction in the database', t => {
                const allTransactions = getAllTransactions(db)

                t.same(allTransactions.length, 1, 'Should have one transaction')
                t.ok(Transaction.Bank.is(allTransactions[0]), 'Should be a Bank transaction')
                t.same(allTransactions[0].accountId, account.id, 'Account ID should match')
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
            const transactionEntry = Entry.TransactionInvestment.from({
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
                t.ok(transactionId > 0, 'Transaction ID should be positive')
                t.end()
            })

            t.test('And I can find the transaction in the database', t => {
                const allTransactions = getAllTransactions(db)

                t.same(allTransactions.length, 1, 'Should have one transaction')
                t.ok(Transaction.Investment.is(allTransactions[0]), 'Should be an Investment transaction')
                t.same(allTransactions[0].accountId, account.id, 'Account ID should match')
                t.same(allTransactions[0].securityId, security.id, 'Security ID should match')
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
        const bankTransaction = Entry.TransactionBank.from({
            account: 'Checking Account',
            amount: -50.0,
            date: new Date('2024-01-15'),
            transactionType: 'Bank',
            payee: 'Grocery Store',
        })

        const investmentTransaction = Entry.TransactionInvestment.from({
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
                allTransactions.forEach(transaction => {
                    t.ok(Transaction.is(transaction), 'Each item should be a Transaction type')
                    t.ok(typeof transaction.id === 'number', 'Each transaction should have a numeric ID')
                    t.ok(typeof transaction.accountId === 'number', 'Each transaction should have a numeric account ID')
                    t.ok(typeof transaction.date === 'string', 'Each transaction should have a string date')
                    t.ok(
                        typeof transaction.transactionType === 'string',
                        'Each transaction should have a string transaction type',
                    )
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
                const outflowTransaction = Entry.TransactionBank.from({
                    account: 'Test Account',
                    amount: -510.0,
                    date: new Date('2024-01-15'),
                    transactionType: 'Bank',
                    payee: 'Store',
                    memo: 'Purchase',
                })

                const inflowTransaction = Entry.TransactionBank.from({
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

                t.test('Then transactions should be processed in correct order', t => {
                    // Get transactions in the order they were inserted
                    const transactions = db
                        .prepare(
                            `
                        SELECT id, account_id, date, amount, transaction_type, payee, memo
                        FROM transactions
                        ORDER BY date ASC, id ASC
                    `,
                        )
                        .all()

                    t.same(transactions.length, 2, 'Should have 2 transactions')

                    // The first transaction should be the outflow (id: 1)
                    t.same(transactions[0].id, 1, 'First transaction should be outflow')
                    t.same(transactions[0].amount, -510.0, 'First transaction should be outflow amount')

                    // The second transaction should be the inflow (id: 2)
                    t.same(transactions[1].id, 2, 'Second transaction should be inflow')
                    t.same(transactions[1].amount, 10.0, 'Second transaction should be inflow amount')
                    t.end()
                })

                t.end()
            })

            t.test('When I have investment transactions with same-day cash flows', t => {
                const db = createTestDatabase()
                const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
                const security = createSecurityInDb(db, { name: 'Test Stock', symbol: 'TEST' })

                // Insert investment transactions in problematic order: buy first, interest second
                const buyTransaction = Entry.TransactionInvestment.from({
                    account: 'Investment Account',
                    date: new Date('2024-01-15'),
                    transactionType: 'Buy',
                    amount: -510.0,
                    security: 'TEST',
                    quantity: 10,
                    price: 51.0,
                })

                const interestTransaction = Entry.TransactionInvestment.from({
                    account: 'Investment Account',
                    date: new Date('2024-01-15'),
                    transactionType: 'IntInc',
                    amount: 10.0,
                    security: null,
                })

                // Insert in problematic order
                insertInvestmentTransaction(db, buyTransaction, account, security)
                insertInvestmentTransaction(db, interestTransaction, account)

                t.test('Then investment transactions should be processed in correct order', t => {
                    // Get transactions in the order they were inserted
                    const transactions = db
                        .prepare(
                            `
                        SELECT id, account_id, date, amount, transaction_type, investment_action, security_id
                        FROM transactions
                        ORDER BY date ASC, id ASC
                    `,
                        )
                        .all()

                    t.same(transactions.length, 2, 'Should have 2 investment transactions')

                    // The first transaction should be the buy (id: 1)
                    t.same(transactions[0].id, 1, 'First transaction should be buy')
                    t.same(transactions[0].amount, -510.0, 'First transaction should be buy amount')
                    t.same(transactions[0].investment_action, 'Buy', 'First transaction should be buy action')

                    // The second transaction should be the interest (id: 2)
                    t.same(transactions[1].id, 2, 'Second transaction should be interest')
                    t.same(transactions[1].amount, 10.0, 'Second transaction should be interest amount')
                    t.same(transactions[1].investment_action, 'IntInc', 'Second transaction should be interest action')
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
