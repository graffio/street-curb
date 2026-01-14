// ABOUTME: Tests for stable identity infrastructure
// ABOUTME: Verifies ID generation, CRUD operations, and orphan tracking

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { StableIdentity } from '../src/stable-identity.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.exec(schema)
    return db
}

test('createStableId', async t => {
    t.test('Given entity type Transaction', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When creating stable ID', async t => {
            const id = StableIdentity.createStableId(db, 'Transaction')

            t.test('Then it starts with txn_ prefix', async t => t.ok(id.startsWith('txn_')))
            t.test('Then it has 12-digit counter format (e.g., txn_000000000001)', async t =>
                t.match(id, /^txn_\d{12}$/),
            )
        })
    })

    t.test('Given entity type Security', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When creating stable ID', async t => {
            const id = StableIdentity.createStableId(db, 'Security')

            t.test('Then it starts with sec_ prefix', async t => t.ok(id.startsWith('sec_')))
        })
    })

    t.test('Given entity type Account', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When creating stable ID', async t => {
            const id = StableIdentity.createStableId(db, 'Account')

            t.test('Then it starts with acc_ prefix', async t => t.ok(id.startsWith('acc_')))
        })
    })

    t.test('Given unknown entity type', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When creating stable ID', async t =>
            t.test('Then it throws error', async t =>
                t.throws(() => StableIdentity.createStableId(db, 'Unknown'), /Unknown entity type/),
            ),
        )
    })

    t.test('Given sequential ID generation', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When creating multiple IDs', async t => {
            const id1 = StableIdentity.createStableId(db, 'Transaction')
            const id2 = StableIdentity.createStableId(db, 'Transaction')
            const id3 = StableIdentity.createStableId(db, 'Transaction')

            t.test('Then IDs are sequential', async t => {
                t.equal(id1, 'txn_000000000001')
                t.equal(id2, 'txn_000000000002')
                t.equal(id3, 'txn_000000000003')
            })
        })
    })
})

test('insertStableIdentity and findBySignature', async t =>
    t.test('Given an empty database', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When inserting a stable identity', async t => {
            StableIdentity.insertStableIdentity(db, {
                id: 'txn_000000000123',
                entityType: 'Transaction',
                signature: 'acc-1|2024-01-15|-50|grocery',
            })

            t.test('Then findBySignature returns the id', async t => {
                const found = StableIdentity.findBySignature(db, 'Transaction', 'acc-1|2024-01-15|-50|grocery')
                t.equal(found, 'txn_000000000123')
            })

            t.test('Then findBySignature with wrong signature returns null', async t => {
                const found = StableIdentity.findBySignature(db, 'Transaction', 'wrong-signature')
                t.equal(found, null)
            })

            t.test('Then findBySignature with wrong entityType returns null', async t => {
                const found = StableIdentity.findBySignature(db, 'Security', 'acc-1|2024-01-15|-50|grocery')
                t.equal(found, null)
            })
        })
    }))

test('markOrphaned and findOrphans', async t =>
    t.test('Given a database with stable identities', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        StableIdentity.insertStableIdentity(db, {
            id: 'txn_000000000111',
            entityType: 'Transaction',
            signature: 'sig-1',
        })
        StableIdentity.insertStableIdentity(db, {
            id: 'txn_000000000222',
            entityType: 'Transaction',
            signature: 'sig-2',
        })
        StableIdentity.insertStableIdentity(db, { id: 'sec_000000000333', entityType: 'Security', signature: 'AAPL' })

        t.test('When marking one as orphaned', async t => {
            StableIdentity.markOrphaned(db, 'txn_000000000111')

            t.test('Then findOrphans returns only the orphaned one', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Transaction')
                t.equal(orphans.length, 1)
                t.equal(orphans[0].id, 'txn_000000000111')
                t.ok(orphans[0].orphanedAt)
            })

            t.test('Then findOrphans for different entityType returns empty', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Security')
                t.equal(orphans.length, 0)
            })
        })
    }))
