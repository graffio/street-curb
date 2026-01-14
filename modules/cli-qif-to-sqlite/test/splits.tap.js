// ABOUTME: Tests for transaction split import with stable identity matching
// ABOUTME: Verifies spl_ prefix, parent linking, duplicate handling, and orphan cascading per D4, D13, D20

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

const emptyImportData = { accounts: [], categories: [], tags: [], securities: [], transactions: [] }

test('Split import creates stable IDs with spl_ prefix', async t =>
    t.test('Given a database with an account and categories', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [
                {
                    name: 'Food',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
                {
                    name: 'Household',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
            transactions: [
                {
                    accountName: 'Checking',
                    date: '2024-01-15',
                    amount: -100,
                    transactionType: 'Bank',
                    payee: 'Grocery Store',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                    splits: [
                        { categoryName: 'Food', amount: -60, memo: 'groceries' },
                        { categoryName: 'Household', amount: -40, memo: 'supplies' },
                    ],
                },
            ],
        }

        t.test('When importing a transaction with splits', async t => {
            Import.processImport(db, data)

            t.test('Then splits are created in the database', async t => {
                const splits = db.prepare('SELECT * FROM transactionSplits').all()
                t.equal(splits.length, 2)
            })

            t.test('Then stable identities are created with spl_ prefix', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Split'").all()
                t.equal(stableIds.length, 2)
                t.ok(stableIds[0].id.startsWith('spl_'))
                t.ok(stableIds[1].id.startsWith('spl_'))
            })

            t.test('Then stable IDs have sequential 12-digit format', async t => {
                const stableIds = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Split' ORDER BY id")
                    .all()
                t.equal(stableIds[0].id, 'spl_000000000001')
                t.equal(stableIds[1].id, 'spl_000000000002')
            })
        })
    }))

test('Splits are linked to parent transaction', async t =>
    t.test('Given a database with account and categories', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [
                {
                    name: 'Food',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
            transactions: [
                {
                    accountName: 'Checking',
                    date: '2024-01-15',
                    amount: -60,
                    transactionType: 'Bank',
                    payee: 'Market',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                    splits: [{ categoryName: 'Food', amount: -60, memo: 'food purchase' }],
                },
            ],
        }

        t.test('When importing a transaction with a split', async t => {
            Import.processImport(db, data)

            t.test('Then the split references the correct transaction', async t => {
                const transaction = db.prepare('SELECT * FROM transactions').get()
                const split = db.prepare('SELECT * FROM transactionSplits').get()
                t.equal(split.transactionId, transaction.id)
            })

            t.test('Then the split references the correct category', async t => {
                const category = db.prepare("SELECT * FROM categories WHERE name = 'Food'").get()
                const split = db.prepare('SELECT * FROM transactionSplits').get()
                t.equal(split.categoryId, category.id)
            })
        })
    }))

test('Duplicate splits with same signature get different stable IDs (D4 fungible pairing)', async t =>
    t.test('Given a transaction with two identical splits', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [
                {
                    name: 'Food',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
            transactions: [
                {
                    accountName: 'Checking',
                    date: '2024-01-15',
                    amount: -100,
                    transactionType: 'Bank',
                    payee: 'Store',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                    splits: [
                        { categoryName: 'Food', amount: -50, memo: 'first' },
                        { categoryName: 'Food', amount: -50, memo: 'second' },
                    ],
                },
            ],
        }

        t.test('When importing transaction with duplicate splits', async t => {
            Import.processImport(db, data)

            t.test('Then both splits are created', async t => {
                const splits = db.prepare('SELECT * FROM transactionSplits').all()
                t.equal(splits.length, 2)
            })

            t.test('Then both splits have unique stable IDs', async t => {
                const stableIds = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Split'").all()
                t.equal(stableIds.length, 2)
                t.not(stableIds[0].id, stableIds[1].id)
            })
        })
    }))

test('Orphan cascading from parent transaction (D13)', async t =>
    t.test('Given a database with a transaction and its splits', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [
                {
                    name: 'Food',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
                {
                    name: 'Household',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
            transactions: [
                {
                    accountName: 'Checking',
                    date: '2024-01-15',
                    amount: -100,
                    transactionType: 'Bank',
                    payee: 'Store',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                    splits: [
                        { categoryName: 'Food', amount: -60, memo: null },
                        { categoryName: 'Household', amount: -40, memo: null },
                    ],
                },
            ],
        }
        Import.processImport(db, data)

        const splitStableIdsBefore = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Split' ORDER BY id")
            .all()
            .map(r => r.id)

        t.test('When reimporting without the transaction', async t => {
            const dataWithoutTransaction = {
                ...emptyImportData,
                accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
                categories: [
                    {
                        name: 'Food',
                        description: null,
                        budgetAmount: null,
                        isIncomeCategory: 0,
                        isTaxRelated: 0,
                        taxSchedule: null,
                    },
                    {
                        name: 'Household',
                        description: null,
                        budgetAmount: null,
                        isIncomeCategory: 0,
                        isTaxRelated: 0,
                        taxSchedule: null,
                    },
                ],
                transactions: [],
            }
            Import.processImport(db, dataWithoutTransaction)

            t.test('Then the transaction is orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Transaction')
                t.equal(orphans.length, 1)
            })

            t.test('Then the splits are also orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Split')
                t.equal(orphans.length, 2)
                const orphanIds = orphans.map(o => o.id).sort()
                t.same(orphanIds, splitStableIdsBefore.sort())
            })
        })
    }))

test('Split reimport preserves stable identity', async t =>
    t.test('Given a database with a transaction and its splits', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            categories: [
                {
                    name: 'Food',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
            transactions: [
                {
                    accountName: 'Checking',
                    date: '2024-01-15',
                    amount: -60,
                    transactionType: 'Bank',
                    payee: 'Store',
                    memo: null,
                    number: null,
                    cleared: null,
                    categoryId: null,
                    address: null,
                    runningBalance: null,
                    securitySignature: null,
                    quantity: null,
                    price: null,
                    commission: null,
                    investmentAction: null,
                    splits: [{ categoryName: 'Food', amount: -60, memo: 'groceries' }],
                },
            ],
        }
        Import.processImport(db, data)

        const originalSplitStableId = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Split'").get().id
        const originalTransactionStableId = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Transaction'")
            .get().id

        t.test('When reimporting the same transaction with splits', async t => {
            Import.processImport(db, data)

            t.test('Then the split stable ID is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Split'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalSplitStableId)
            })

            t.test('Then the transaction stable ID is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Transaction'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalTransactionStableId)
            })

            t.test('Then no orphans are created', async t => {
                const splitOrphans = StableIdentity.findOrphans(db, 'Split')
                const txnOrphans = StableIdentity.findOrphans(db, 'Transaction')
                t.equal(splitOrphans.length, 0)
                t.equal(txnOrphans.length, 0)
            })
        })
    }))
