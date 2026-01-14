// ABOUTME: Unit tests for holdings database operations
// ABOUTME: Tests getLotsAsOf and getAccurateHoldingsAsOf with lot allocations

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import { getLotsAsOf, getAccurateHoldingsAsOf } from '../src/services/database/holdings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/*
 * Create test database with schema
 * @sig createTestDatabase :: () -> Database
 */
const createTestDatabase = () => {
    const db = new Database(':memory:')
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

/*
 * Insert test data for lot allocation scenarios
 * @sig setupTestData :: Database -> void
 */
const setupTestData = db => {
    // Insert account
    db.prepare('INSERT INTO accounts (id, name, type) VALUES (?, ?, ?)').run('acc_1', 'Brokerage', 'Investment')

    // Insert security
    db.prepare('INSERT INTO securities (id, name, symbol, type) VALUES (?, ?, ?, ?)').run(
        'sec_1',
        'Apple Inc',
        'AAPL',
        'Stock',
    )

    // Insert transactions for FK constraints
    const txnCols = 'id, accountId, securityId, date, amount, transactionType, investmentAction, quantity, price'
    const txnSql = `INSERT INTO transactions (${txnCols}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

    db.prepare(txnSql).run('txn_1', 'acc_1', 'sec_1', '2024-01-01', -10000, 'investment', 'Buy', 100, 100)
    db.prepare(txnSql).run('txn_sell1', 'acc_1', 'sec_1', '2024-01-15', 4500, 'investment', 'Sell', 30, 150)
    db.prepare(txnSql).run('txn_sell2', 'acc_1', 'sec_1', '2024-02-01', 3200, 'investment', 'Sell', 20, 160)

    // Insert lot: bought 100 shares on 2024-01-01 at $100/share
    db.prepare(
        `
        INSERT INTO lots (id, accountId, securityId, purchaseDate, quantity, costBasis,
            remainingQuantity, closedDate, createdByTransactionId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run('lot_1', 'acc_1', 'sec_1', '2024-01-01', 100, 10000, 50, null, 'txn_1', '2024-01-01T10:00:00Z')

    // Insert lot allocation: sold 30 shares on 2024-01-15
    db.prepare(
        `
        INSERT INTO lotAllocations (id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
        VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run('la_1', 'lot_1', 'txn_sell1', 30, 3000, '2024-01-15')

    // Insert lot allocation: sold 20 more shares on 2024-02-01
    db.prepare(
        `
        INSERT INTO lotAllocations (id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
        VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run('la_2', 'lot_1', 'txn_sell2', 20, 2000, '2024-02-01')
}

test('Holdings As-Of Queries', t => {
    t.test('Given a lot with allocations over time', t => {
        const db = createTestDatabase()
        setupTestData(db)

        t.test('When querying lots as of before any sells (2024-01-10)', t => {
            const lots = getLotsAsOf(db, '2024-01-10')

            t.equal(lots.length, 1, 'Should return one lot')
            t.equal(lots[0].remainingQuantityAsOf, 100, 'Should have full 100 shares before any sells')
            t.end()
        })

        t.test('When querying lots as of after first sell (2024-01-20)', t => {
            const lots = getLotsAsOf(db, '2024-01-20')

            t.equal(lots.length, 1, 'Should return one lot')
            t.equal(lots[0].remainingQuantityAsOf, 70, 'Should have 70 shares (100 - 30 sold)')
            t.end()
        })

        t.test('When querying lots as of after second sell (2024-02-15)', t => {
            const lots = getLotsAsOf(db, '2024-02-15')

            t.equal(lots.length, 1, 'Should return one lot')
            t.equal(lots[0].remainingQuantityAsOf, 50, 'Should have 50 shares (100 - 30 - 20 sold)')
            t.end()
        })

        t.test('When querying lots as of before lot was purchased (2023-12-01)', t => {
            const lots = getLotsAsOf(db, '2023-12-01')

            t.equal(lots.length, 0, 'Should return no lots (not purchased yet)')
            t.end()
        })

        db.close()
        t.end()
    })

    t.test('Given accurate holdings as-of query', t => {
        const db = createTestDatabase()
        setupTestData(db)

        t.test('When querying holdings as of 2024-01-10 (before any sells)', t => {
            const holdings = getAccurateHoldingsAsOf(db, '2024-01-10')

            t.equal(holdings.length, 1, 'Should return one holding')
            t.equal(holdings[0].quantity, 100, 'Should have 100 shares')
            t.equal(holdings[0].costBasis, 10000, 'Cost basis should be $10,000')
            t.end()
        })

        t.test('When querying holdings as of 2024-01-20 (after first sell)', t => {
            const holdings = getAccurateHoldingsAsOf(db, '2024-01-20')

            t.equal(holdings.length, 1, 'Should return one holding')
            t.equal(holdings[0].quantity, 70, 'Should have 70 shares')
            t.end()
        })

        db.close()
        t.end()
    })

    t.end()
})
