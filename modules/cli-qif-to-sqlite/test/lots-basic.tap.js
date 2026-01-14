// ABOUTME: Tests for basic FIFO lot tracking
// ABOUTME: Verifies buy creates lot, sell consumes FIFO, lot stableIds generated correctly

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

test('Buy transaction creates lot', async t =>
    t.test('Given an investment account with a security', async t => {
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

        t.test('When importing a buy transaction', async t => {
            Import.processImport(db, data)

            t.test('Then a lot is created in the database', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)
                t.equal(lots[0].quantity, 10)
                t.equal(lots[0].remainingQuantity, 10)
                t.equal(lots[0].costBasis, 1000)
            })

            t.test('Then stable identity is created with lot_ prefix', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Lot'").all()
                t.equal(stableIds.length, 1)
                t.ok(stableIds[0].id.startsWith('lot_'))
            })
        })
    }))

test('Sell transaction consumes lot FIFO', async t =>
    t.test('Given an investment account with two buy transactions', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                {
                    accountName: 'Brokerage',
                    date: '2024-01-10',
                    amount: -500,
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
                    price: 50,
                    commission: 0,
                    splits: [],
                },
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
                {
                    accountName: 'Brokerage',
                    date: '2024-01-20',
                    amount: 750,
                    transactionType: 'Sell',
                    payee: null,
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: 'AAPL',
                    quantity: 15,
                    price: 50,
                    commission: 0,
                    splits: [],
                },
            ],
        }

        t.test('When importing buy and sell transactions', async t => {
            Import.processImport(db, data)

            t.test('Then first lot is fully consumed (FIFO)', async t => {
                const lots = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lots.length, 2)
                t.equal(lots[0].remainingQuantity, 0, 'First lot fully consumed')
                t.ok(lots[0].closedDate, 'First lot has closedDate')
            })

            t.test('Then second lot is partially consumed', async t => {
                const lots = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lots[1].remainingQuantity, 5, 'Second lot has 5 remaining (started with 10, sold 5)')
                t.notOk(lots[1].closedDate, 'Second lot still open')
            })

            t.test('Then lot allocations track the consumption', async t => {
                const allocations = db.prepare('SELECT * FROM lotAllocations').all()
                t.equal(allocations.length, 2, 'Two allocations (one per lot reduced)')
            })
        })
    }))

test('Lot stable ID uses lot_ prefix', async t =>
    t.test('Given a buy transaction', async t => {
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

        t.test('When importing and processing lots', async t => {
            Import.processImport(db, data)

            t.test('Then lot ID is a stable ID with lot_ prefix', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)
                t.ok(lots[0].id.startsWith('lot_'), `Lot ID ${lots[0].id} should start with lot_`)
            })

            t.test('Then lot stable identity exists', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Lot'").all()
                t.equal(stableIds.length, 1)
                t.ok(stableIds[0].id.startsWith('lot_'))
            })
        })
    }))
