// ABOUTME: Tests for placeholder creation for orphaned references
// ABOUTME: Verifies that missing category/security references get placeholder entries

import t from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { PlaceholderCreator } from '../src/placeholder-creator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.pragma('foreign_keys = OFF')
    db.exec(schema)
    return db
}

const insertAccount = (db, id, name) =>
    db.prepare('INSERT INTO accounts (id, name, type) VALUES (?, ?, ?)').run(id, name, 'Bank')

const insertCategory = (db, id, name) => db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').run(id, name)

const insertSecurity = (db, id, name, symbol) =>
    db.prepare('INSERT INTO securities (id, name, symbol, type) VALUES (?, ?, ?, ?)').run(id, name, symbol, 'Stock')

const insertTransaction = (db, id, accountId, categoryId = null, securityId = null) =>
    db
        .prepare(
            `
        INSERT INTO transactions (id, accountId, date, amount, transactionType, categoryId, securityId)
        VALUES (?, ?, '2024-01-01', 100, 'bank', ?, ?)
    `,
        )
        .run(id, accountId, categoryId, securityId)

const insertSplit = (db, id, transactionId, categoryId) =>
    db
        .prepare(
            `
        INSERT INTO transactionSplits (id, transactionId, categoryId, amount)
        VALUES (?, ?, ?, 50)
    `,
        )
        .run(id, transactionId, categoryId)

const insertPrice = (db, id, securityId) =>
    db
        .prepare(
            `
        INSERT INTO prices (id, securityId, date, price)
        VALUES (?, ?, '2024-01-01', 100)
    `,
        )
        .run(id, securityId)

const insertLot = (db, id, securityId) =>
    db
        .prepare(
            `
        INSERT INTO lots (id, accountId, securityId, purchaseDate, quantity, costBasis, remainingQuantity)
        VALUES (?, 'acc_1', ?, '2024-01-01', 10, 1000, 10)
    `,
        )
        .run(id, securityId)

t.test('Given a database with missing category references', t => {
    t.test('When transaction references non-existent category', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Checking')
        insertTransaction(db, 'txn_1', 'acc_1', 'cat_missing', null)

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.categories, 1, 'Then one placeholder category should be created')
        const placeholder = db.prepare('SELECT * FROM categories WHERE id = ?').get('cat_missing')
        t.ok(placeholder, 'Then placeholder category exists in database')
        t.match(placeholder.name, /Unknown/, 'Then placeholder has Unknown in name')
        t.end()
    })

    t.test('When split references non-existent category', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Checking')
        insertTransaction(db, 'txn_1', 'acc_1', null, null)
        insertSplit(db, 'split_1', 'txn_1', 'cat_split_missing')

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.categories, 1, 'Then one placeholder category should be created')
        const placeholder = db.prepare('SELECT * FROM categories WHERE id = ?').get('cat_split_missing')
        t.ok(placeholder, 'Then placeholder category exists in database')
        t.end()
    })

    t.test('When orphaned transaction references missing category', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Checking')
        insertTransaction(db, 'txn_1', 'acc_1', 'cat_orphan', null)
        db.prepare("UPDATE transactions SET orphanedAt = datetime('now') WHERE id = ?").run('txn_1')

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.categories, 0, 'Then no placeholder should be created for orphaned transaction')
        t.end()
    })

    t.end()
})

t.test('Given a database with missing security references', t => {
    t.test('When transaction references non-existent security', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Investment')
        insertTransaction(db, 'txn_1', 'acc_1', null, 'sec_missing')

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.securities, 1, 'Then one placeholder security should be created')
        const placeholder = db.prepare('SELECT * FROM securities WHERE id = ?').get('sec_missing')
        t.ok(placeholder, 'Then placeholder security exists in database')
        t.match(placeholder.name, /Unknown/, 'Then placeholder has Unknown in name')
        t.equal(placeholder.symbol, '???', 'Then placeholder has ??? symbol')
        t.end()
    })

    t.test('When price references non-existent security', t => {
        const db = createTestDb()
        insertPrice(db, 'price_1', 'sec_price_missing')

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.securities, 1, 'Then one placeholder security should be created')
        t.end()
    })

    t.test('When lot references non-existent security', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Investment')
        insertLot(db, 'lot_1', 'sec_lot_missing')

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.securities, 1, 'Then one placeholder security should be created')
        t.end()
    })

    t.end()
})

t.test('Given a database with existing categories and securities', t => {
    t.test('When all references exist', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Checking')
        insertCategory(db, 'cat_1', 'Groceries')
        insertSecurity(db, 'sec_1', 'Apple Inc', 'AAPL')
        insertTransaction(db, 'txn_1', 'acc_1', 'cat_1', 'sec_1')

        const result = PlaceholderCreator.createPlaceholders(db)

        t.equal(result.categories, 0, 'Then no placeholder categories should be created')
        t.equal(result.securities, 0, 'Then no placeholder securities should be created')
        t.end()
    })

    t.end()
})

t.test('Given a change tracker', t => {
    t.test('When placeholders are created', t => {
        const db = createTestDb()
        insertAccount(db, 'acc_1', 'Checking')
        insertTransaction(db, 'txn_1', 'acc_1', 'cat_tracked', 'sec_tracked')

        const changes = []
        const changeTracker = { recordChange: (id, type, action) => changes.push({ id, type, action }) }

        PlaceholderCreator.createPlaceholders(db, changeTracker)

        t.equal(changes.length, 2, 'Then two changes should be recorded')
        t.ok(
            changes.find(c => c.type === 'Category' && c.action === 'created'),
            'Then category creation recorded',
        )
        t.ok(
            changes.find(c => c.type === 'Security' && c.action === 'created'),
            'Then security creation recorded',
        )
        t.end()
    })

    t.end()
})
