// ABOUTME: End-to-end tests for reimport with stable identity matching
// ABOUTME: Verifies entity preservation across edit/add/delete/rename scenarios

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

test('processImport initial import', async t =>
    t.test('Given an empty database', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [],
            tags: [],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                {
                    accountName: 'Checking',
                    securitySignature: null,
                    date: '2024-01-15',
                    amount: -50,
                    transactionType: 'bank',
                    payee: 'Grocery Store',
                    memo: 'Weekly groceries',
                    number: null,
                    cleared: 'R',
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                },
            ],
        }

        t.test('When importing data', async t => {
            Import.processImport(db, data)

            t.test('Then accounts are created with stableIds', async t => {
                const accounts = db.prepare('SELECT * FROM accounts').all()
                t.equal(accounts.length, 1)
                t.equal(accounts[0].name, 'Checking')

                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Account'").all()
                t.equal(stableIds.length, 1)
                t.ok(stableIds[0].id.startsWith('acc_'))
            })

            t.test('Then securities are created with stableIds', async t => {
                const securities = db.prepare('SELECT * FROM securities').all()
                t.equal(securities.length, 1)
                t.equal(securities[0].symbol, 'AAPL')

                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Security'").all()
                t.equal(stableIds.length, 1)
                t.ok(stableIds[0].id.startsWith('sec_'))
            })

            t.test('Then transactions are created with stableIds', async t => {
                const transactions = db.prepare('SELECT * FROM transactions').all()
                t.equal(transactions.length, 1)
                t.equal(transactions[0].payee, 'Grocery Store')

                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Transaction'").all()
                t.equal(stableIds.length, 1)
                t.ok(stableIds[0].id.startsWith('txn_'))
            })
        })
    }))

test('processImport preserves identity on reimport', async t =>
    t.test('Given a database with existing entities', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const initialData = {
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [],
            tags: [],
            securities: [],
            transactions: [
                {
                    accountName: 'Checking',
                    securitySignature: null,
                    date: '2024-01-15',
                    amount: -50,
                    transactionType: 'bank',
                    payee: 'Grocery Store',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                },
            ],
        }
        Import.processImport(db, initialData)

        const originalTxnStableId = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Transaction'")
            .get().id

        t.test('When reimporting the same data', async t => {
            Import.processImport(db, initialData)

            t.test('Then transaction stableId is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Transaction'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalTxnStableId)
            })

            t.test('Then no orphans are created', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Transaction')
                t.equal(orphans.length, 0)
            })
        })
    }))

test('processImport marks deleted entities as orphaned', async t =>
    t.test('Given a database with existing transactions', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const initialData = {
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [],
            tags: [],
            securities: [],
            transactions: [
                {
                    accountName: 'Checking',
                    securitySignature: null,
                    date: '2024-01-15',
                    amount: -50,
                    transactionType: 'bank',
                    payee: 'Grocery Store',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                },
                {
                    accountName: 'Checking',
                    securitySignature: null,
                    date: '2024-01-16',
                    amount: -30,
                    transactionType: 'bank',
                    payee: 'Coffee Shop',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                },
            ],
        }
        Import.processImport(db, initialData)

        t.test('When reimporting with one transaction removed', async t => {
            const updatedData = {
                accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
                categories: [],
                tags: [],
                securities: [],
                transactions: [initialData.transactions[0]],
            }
            Import.processImport(db, updatedData)

            t.test('Then removed transaction is marked orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Transaction')
                t.equal(orphans.length, 1)
                t.ok(orphans[0].orphanedAt)
            })
        })
    }))
