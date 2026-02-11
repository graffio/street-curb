// ABOUTME: Tests for transaction-derived price extraction and import
// ABOUTME: Verifies CLI extracts prices from transactions, merges with QIF prices, and prices survive reimport

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

const buyTransaction = {
    accountName: 'Brokerage',
    date: '2024-01-15',
    amount: -1000,
    transactionType: 'Buy',
    payee: null,
    memo: null,
    number: null,
    cleared: null,
    categoryId: null,
    address: null,
    runningBalance: null,
    securitySignature: 'AAPL',
    quantity: 10,
    price: 100,
    commission: 0,
    splits: [],
}

test('Transaction-derived price is imported when included in prices array', async t =>
    t.test('Given import data with a price extracted from a Buy transaction', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [{ symbol: 'AAPL', date: '2024-01-15', price: 100 }],
            transactions: [buyTransaction],
        }

        t.test('When importing the data', async t => {
            Import.processImport(db, data)

            t.test('Then the price entry exists', async t => {
                const prices = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').all()
                t.equal(prices.length, 1)
                t.equal(prices[0].price, 100)
                t.equal(prices[0].date, '2024-01-15')
            })
        })
    }))

test('Transaction-derived prices survive reimport', async t =>
    t.test('Given a first import with a transaction-derived price', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [{ symbol: 'AAPL', date: '2024-01-15', price: 100 }],
            transactions: [buyTransaction],
        }

        Import.processImport(db, data)

        t.test('When reimporting the same data', async t => {
            const result = Import.processImport(db, data)

            t.test('Then the price is not orphaned', async t => {
                const prices = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').all()
                t.equal(prices.length, 1, 'price should still be active')
                t.equal(prices[0].price, 100)
                t.equal(result.changeCounts.orphaned, 0, 'nothing should be orphaned')
            })
        })
    }))

test('Prices with different symbols resolving to same security do not cause UNIQUE violation', async t =>
    t.test('Given prices using security name and ticker for the same security and date', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [
                { symbol: 'Apple Inc', date: '2024-01-15', price: 99 },
                { symbol: 'AAPL', date: '2024-01-15', price: 100 },
            ],
            transactions: [buyTransaction],
        }

        t.test('When importing the data', async t => {
            Import.processImport(db, data)

            t.test('Then only one price entry exists (last wins)', async t => {
                const prices = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').all()
                t.equal(prices.length, 1)
                t.equal(prices[0].price, 100)
            })
        })
    }))

test('Div transactions do not produce price entries', async t =>
    t.test('Given an investment account with a Div transaction (no qualifying price)', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                {
                    accountName: 'Brokerage',
                    date: '2024-01-15',
                    amount: 50,
                    transactionType: 'Div',
                    payee: null,
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: 'AAPL',
                    quantity: null,
                    price: null,
                    commission: null,
                    splits: [],
                },
            ],
        }

        t.test('When importing the data', async t => {
            Import.processImport(db, data)

            t.test('Then no price entries are created', async t => {
                const prices = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').all()
                t.equal(prices.length, 0)
            })
        })
    }))
