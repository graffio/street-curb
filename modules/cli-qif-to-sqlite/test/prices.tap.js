// ABOUTME: Tests for price import with stable identity matching
// ABOUTME: Verifies prc_ prefix, security linking, signature format, and orphan detection per D14

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Import } from '../src/import.js'
import { StableIdentity } from '../src/stable-identity.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.exec(schema)
    return db
}

const emptyImportData = { accounts: [], categories: [], tags: [], securities: [], transactions: [], prices: [] }

test('Price import creates stable IDs with prc_ prefix', async t =>
    t.test('Given a database with a security', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [
                { symbol: 'AAPL', date: '2024-01-15', price: 185.5 },
                { symbol: 'AAPL', date: '2024-01-16', price: 186.25 },
            ],
        }

        t.test('When importing prices for a security', async t => {
            Import.processImport(db, data)

            t.test('Then prices are created in the database', async t => {
                const prices = db.prepare('SELECT * FROM prices').all()
                t.equal(prices.length, 2)
            })

            t.test('Then stable identities are created with prc_ prefix', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Price'").all()
                t.equal(stableIds.length, 2)
                t.ok(stableIds[0].id.startsWith('prc_'))
                t.ok(stableIds[1].id.startsWith('prc_'))
            })

            t.test('Then stable IDs have sequential 12-digit format', async t => {
                const stableIds = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Price' ORDER BY id")
                    .all()
                t.equal(stableIds[0].id, 'prc_000000000001')
                t.equal(stableIds[1].id, 'prc_000000000002')
            })
        })
    }))

test('Price linked to correct security', async t =>
    t.test('Given a database with multiple securities', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            securities: [
                { name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null },
                { name: 'Microsoft Corp', symbol: 'MSFT', type: 'Stock', goal: null },
            ],
            prices: [
                { symbol: 'AAPL', date: '2024-01-15', price: 185.5 },
                { symbol: 'MSFT', date: '2024-01-15', price: 390.0 },
            ],
        }

        t.test('When importing prices for different securities', async t => {
            Import.processImport(db, data)

            t.test('Then each price references the correct security', async t => {
                const aaplSecurity = db.prepare("SELECT * FROM securities WHERE symbol = 'AAPL'").get()
                const msftSecurity = db.prepare("SELECT * FROM securities WHERE symbol = 'MSFT'").get()
                const aaplPrice = db.prepare('SELECT * FROM prices WHERE price = 185.50').get()
                const msftPrice = db.prepare('SELECT * FROM prices WHERE price = 390.00').get()

                t.equal(aaplPrice.securityId, aaplSecurity.id)
                t.equal(msftPrice.securityId, msftSecurity.id)
            })
        })
    }))

test('Price signature is security+date per D14', async t =>
    t.test('Given a database with a security and prices on different dates', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [
                { symbol: 'AAPL', date: '2024-01-15', price: 185.5 },
                { symbol: 'AAPL', date: '2024-01-16', price: 186.25 },
            ],
        }
        Import.processImport(db, data)

        const securityStableId = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Security'").get().id
        const priceStableIds = db
            .prepare("SELECT id, signature FROM stableIdentities WHERE entityType = 'Price' ORDER BY signature")
            .all()

        t.test('Then price signatures contain security stable ID and date', async t => {
            t.equal(priceStableIds[0].signature, `${securityStableId}|2024-01-15`)
            t.equal(priceStableIds[1].signature, `${securityStableId}|2024-01-16`)
        })

        t.test('When reimporting the same prices', async t => {
            const originalIds = priceStableIds.map(p => p.id)
            Import.processImport(db, data)

            t.test('Then same security+date resolves to same stable ID', async t => {
                const newPriceStableIds = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Price' ORDER BY id")
                    .all()
                    .map(r => r.id)
                t.same(newPriceStableIds.sort(), originalIds.sort())
            })
        })
    }))

test('Price reimport preserves identity', async t =>
    t.test('Given a database with imported prices', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [{ symbol: 'AAPL', date: '2024-01-15', price: 185.5 }],
        }
        Import.processImport(db, data)

        const originalPriceStableId = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Price'").get().id
        const originalSecurityStableId = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Security'")
            .get().id

        t.test('When reimporting the same price', async t => {
            Import.processImport(db, data)

            t.test('Then the price stable ID is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Price'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalPriceStableId)
            })

            t.test('Then the security stable ID is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Security'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalSecurityStableId)
            })

            t.test('Then no orphans are created', async t => {
                const priceOrphans = StableIdentity.findOrphans(db, 'Price')
                const securityOrphans = StableIdentity.findOrphans(db, 'Security')
                t.equal(priceOrphans.length, 0)
                t.equal(securityOrphans.length, 0)
            })
        })
    }))

test('Price orphan detection', async t =>
    t.test('Given a database with imported prices', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [
                { symbol: 'AAPL', date: '2024-01-15', price: 185.5 },
                { symbol: 'AAPL', date: '2024-01-16', price: 186.25 },
            ],
        }
        Import.processImport(db, data)

        const originalPriceIds = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Price' ORDER BY id")
            .all()
            .map(r => r.id)

        t.test('When reimporting with one price removed', async t => {
            const dataWithOnePriceRemoved = {
                ...emptyImportData,
                securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
                prices: [{ symbol: 'AAPL', date: '2024-01-15', price: 185.5 }],
            }
            Import.processImport(db, dataWithOnePriceRemoved)

            t.test('Then one price is orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Price')
                t.equal(orphans.length, 1)
            })

            t.test('Then the orphaned price is the one that was removed', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Price')
                const remainingPrice = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Price' AND orphanedAt IS NULL")
                    .get()
                t.ok(originalPriceIds.includes(orphans[0].id))
                t.not(orphans[0].id, remainingPrice.id)
            })
        })
    }))
