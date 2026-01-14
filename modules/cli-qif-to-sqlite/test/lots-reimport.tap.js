// ABOUTME: Tests for lot stable ID preservation across reimports
// ABOUTME: Verifies lots and allocations maintain identity when importing the same data again

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Import } from '../src/import.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.exec(schema)
    return db
}

const emptyImportData = { accounts: [], categories: [], tags: [], securities: [], transactions: [], prices: [] }

const createTransaction = (accountName, date, action, quantity, price, amount = null) => ({
    accountName,
    date,
    amount: amount ?? -(quantity * price),
    transactionType: action,
    payee: null,
    memo: null,
    number: null,
    cleared: null,
    categoryId: null,
    address: null,
    runningBalance: null,
    securitySignature: 'AAPL',
    quantity,
    price,
    commission: 0,
    splits: [],
})

test('Lot stable ID preserved on reimport', async t =>
    t.test('Given an initial import with a buy transaction', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [createTransaction('Brokerage', '2024-01-15', 'Buy', 10, 100)],
        }

        // First import
        Import.processImport(db, data)

        const lotsAfterFirst = db.prepare('SELECT * FROM lots').all()
        const stableIdsAfterFirst = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Lot'").all()

        t.test('When reimporting the same data', async t => {
            // Second import - simulates reimport
            Import.processImport(db, data)

            t.test('Then lot stable ID is preserved', async t => {
                const stableIdsAfterSecond = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Lot'").all()
                t.equal(stableIdsAfterSecond.length, 1, 'Still one lot stable ID')
                t.equal(stableIdsAfterSecond[0].id, stableIdsAfterFirst[0].id, 'Same stable ID')
            })

            t.test('Then lot data is unchanged', async t => {
                const lotsAfterSecond = db.prepare('SELECT * FROM lots').all()
                t.equal(lotsAfterSecond.length, 1, 'Still one lot')
                t.equal(lotsAfterSecond[0].quantity, lotsAfterFirst[0].quantity)
                t.equal(lotsAfterSecond[0].costBasis, lotsAfterFirst[0].costBasis)
            })
        })
    }))

test('Lot allocation stable ID preserved on reimport', async t =>
    t.test('Given an initial import with buy and sell transactions', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-10', 'Buy', 10, 100),
                createTransaction('Brokerage', '2024-01-15', 'Sell', 5, 110, 550),
            ],
        }

        // First import
        Import.processImport(db, data)

        const allocationsAfterFirst = db.prepare('SELECT * FROM lotAllocations').all()
        const stableIdsAfterFirst = db
            .prepare("SELECT * FROM stableIdentities WHERE entityType = 'LotAllocation'")
            .all()

        t.test('When reimporting the same data', async t => {
            // Second import
            Import.processImport(db, data)

            t.test('Then allocation stable ID is preserved', async t => {
                const stableIdsAfterSecond = db
                    .prepare("SELECT * FROM stableIdentities WHERE entityType = 'LotAllocation'")
                    .all()
                t.equal(stableIdsAfterSecond.length, 1, 'Still one allocation stable ID')
                t.equal(stableIdsAfterSecond[0].id, stableIdsAfterFirst[0].id, 'Same stable ID')
            })

            t.test('Then allocation data is unchanged', async t => {
                const allocationsAfterSecond = db.prepare('SELECT * FROM lotAllocations').all()
                t.equal(allocationsAfterSecond.length, 1, 'Still one allocation')
                t.equal(allocationsAfterSecond[0].sharesAllocated, allocationsAfterFirst[0].sharesAllocated)
            })
        })
    }))

test('Multiple lots maintain distinct stable IDs across reimports', async t =>
    t.test('Given an initial import with multiple buy transactions', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-10', 'Buy', 10, 100),
                createTransaction('Brokerage', '2024-01-15', 'Buy', 20, 110),
                createTransaction('Brokerage', '2024-01-20', 'Buy', 30, 120),
            ],
        }

        // First import
        Import.processImport(db, data)

        const stableIdsAfterFirst = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Lot' ORDER BY id")
            .all()
            .map(r => r.id)

        t.test('When reimporting the same data', async t => {
            // Second import
            Import.processImport(db, data)

            t.test('Then all three lot stable IDs are preserved', async t => {
                const stableIdsAfterSecond = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Lot' ORDER BY id")
                    .all()
                    .map(r => r.id)

                t.equal(stableIdsAfterSecond.length, 3, 'Three lots')
                t.same(stableIdsAfterSecond, stableIdsAfterFirst, 'Same stable IDs in same order')
            })

            t.test('Then lots have distinct stable IDs', async t => {
                const stableIdsAfterSecond = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Lot' ORDER BY id")
                    .all()
                    .map(r => r.id)

                const uniqueIds = new Set(stableIdsAfterSecond)
                t.equal(uniqueIds.size, 3, 'All IDs are unique')
            })
        })
    }))

test('Lot and allocation stable IDs survive FIFO consumption across reimports', async t =>
    t.test('Given transactions that trigger FIFO lot consumption', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-05', 'Buy', 10, 100),
                createTransaction('Brokerage', '2024-01-10', 'Buy', 20, 110),
                createTransaction('Brokerage', '2024-01-15', 'Sell', 15, 120, 1800),
            ],
        }

        // First import
        Import.processImport(db, data)

        const lotStableIdsFirst = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Lot'").all()
        const allocStableIdsFirst = db
            .prepare("SELECT * FROM stableIdentities WHERE entityType = 'LotAllocation'")
            .all()

        t.test('When reimporting the same data', async t => {
            // Second import
            Import.processImport(db, data)

            t.test('Then lot consumption state is preserved', async t => {
                const lotsAfterSecond = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lotsAfterSecond.length, 2)
                t.equal(lotsAfterSecond[0].remainingQuantity, 0, 'First lot still fully consumed')
                t.ok(lotsAfterSecond[0].closedDate, 'First lot still closed')
                t.equal(lotsAfterSecond[1].remainingQuantity, 15, 'Second lot still has 15 remaining')
            })

            t.test('Then lot stable IDs are preserved', async t => {
                const lotStableIdsSecond = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Lot'").all()
                t.equal(lotStableIdsSecond.length, lotStableIdsFirst.length)
            })

            t.test('Then allocation stable IDs are preserved', async t => {
                const allocStableIdsSecond = db
                    .prepare("SELECT * FROM stableIdentities WHERE entityType = 'LotAllocation'")
                    .all()
                t.equal(allocStableIdsSecond.length, allocStableIdsFirst.length)
            })
        })
    }))

test('Orphaned lots restored on reimport', async t =>
    t.test('Given a lot that gets orphaned after initial import', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [createTransaction('Brokerage', '2024-01-15', 'Buy', 10, 100)],
        }

        // First import
        Import.processImport(db, data)

        const stableIdBefore = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Lot'").get()

        // Manually orphan the lot (simulate entity removal via orphanedAt)
        db.prepare("UPDATE stableIdentities SET orphanedAt = datetime('now') WHERE entityType = 'Lot'").run()
        db.prepare('DELETE FROM lots').run()

        t.test('When reimporting the same data', async t => {
            Import.processImport(db, data)

            t.test('Then the lot is restored with same stable ID', async t => {
                const stableIdAfter = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Lot'").get()
                t.equal(stableIdAfter.id, stableIdBefore.id, 'Same stable ID restored')
            })

            t.test('Then the lot is back in the database', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)
                t.equal(lots[0].quantity, 10)
            })
        })
    }))
