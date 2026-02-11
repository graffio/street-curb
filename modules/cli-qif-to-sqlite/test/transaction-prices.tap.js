// ABOUTME: Tests for price extraction from investment transactions
// ABOUTME: Verifies Buy/Sell/Reinv transactions create price entries, overwrite QIF prices, and skip non-qualifying

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

test('Buy transaction with price field creates price entry', async t =>
    t.test('Given an investment account with a security and a Buy transaction', async t => {
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
                },
            ],
        }

        t.test('When importing the data', async t => {
            Import.processImport(db, data)

            t.test('Then a price entry is created from the transaction', async t => {
                const prices = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').all()
                t.equal(prices.length, 1)
                t.equal(prices[0].price, 100)
                t.equal(prices[0].date, '2024-01-15')
            })
        })
    }))

test('Transaction-derived price overwrites QIF !Type:Prices entry for same security+date', async t =>
    t.test('Given a security with both a QIF price and a Buy transaction on the same date', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            prices: [{ symbol: 'AAPL', date: '2024-01-15', price: 95.0 }],
            transactions: [
                {
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
                },
            ],
        }

        t.test('When importing the data', async t => {
            Import.processImport(db, data)

            t.test('Then only one price entry exists for that security+date', async t => {
                const prices = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').all()
                t.equal(prices.length, 1)
            })

            t.test('Then the price reflects the transaction price, not the QIF price', async t => {
                const price = db.prepare('SELECT * FROM prices WHERE orphanedAt IS NULL').get()
                t.equal(price.price, 100, 'transaction price (100) should overwrite QIF price (95)')
            })
        })
    }))

test('Transactions without price or security are skipped', async t =>
    t.test('Given an investment account with a Div transaction (no price)', async t => {
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
