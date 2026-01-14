// ABOUTME: Tests for transaction matching functions
// ABOUTME: Verifies duplicate handling via count-based pairing and orphan collection

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Matching } from '../src/Matching.js'
import { StableIdentity } from '../src/stable-identity.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.exec(schema)
    return db
}

test('buildTransactionLookup', async t =>
    t.test('Given a database with transactions including duplicates', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const sig = 'acc-1|2024-01-15|-50|grocery'
        StableIdentity.insertStableIdentity(db, { id: 'txn_000000000111', entityType: 'Transaction', signature: sig })
        StableIdentity.insertStableIdentity(db, { id: 'txn_000000000222', entityType: 'Transaction', signature: sig })

        t.test('When building lookup', async t => {
            const lookup = Matching.buildTransactionLookup(db, 'Transaction')

            t.test('Then duplicate signatures map to array of entries', async t => {
                const entries = lookup.get(sig)
                t.equal(entries.length, 2)
                t.equal(entries[0].id, 'txn_000000000111')
                t.equal(entries[1].id, 'txn_000000000222')
            })
        })
    }))

test('findTransactionMatch', async t => {
    t.test('Given a lookup with duplicate signatures', async t => {
        const sig = 'acc-1|2024-01-15|-50|grocery'
        const lookup = new Map([
            [
                sig,
                [
                    { id: 'txn_000000000111', orphanedAt: null },
                    { id: 'txn_000000000222', orphanedAt: null },
                ],
            ],
        ])

        t.test('When matching first occurrence', async t => {
            const result = Matching.findTransactionMatch(lookup, sig)

            t.test('Then it returns first entry', async t => t.equal(result.id, 'txn_000000000111'))
        })

        t.test('When matching second occurrence', async t => {
            const result = Matching.findTransactionMatch(lookup, sig)

            t.test('Then it returns second entry (shifted)', async t => t.equal(result.id, 'txn_000000000222'))
        })

        t.test('When matching third occurrence (exhausted)', async t => {
            const result = Matching.findTransactionMatch(lookup, sig)

            t.test('Then it returns null', async t => t.equal(result, null))
        })
    })

    t.test('Given a lookup with no match', async t => {
        const lookup = new Map()

        t.test('When matching unknown signature', async t => {
            const result = Matching.findTransactionMatch(lookup, 'unknown-sig')

            t.test('Then it returns null', async t => t.equal(result, null))
        })
    })
})

test('collectUnmatchedIds', async t => {
    t.test('Given a lookup with unconsumed entries', async t => {
        const lookup = new Map([
            ['sig-1', [{ id: 'txn_000000000111', orphanedAt: null }]],
            [
                'sig-2',
                [
                    { id: 'txn_000000000222', orphanedAt: null },
                    { id: 'txn_000000000333', orphanedAt: null },
                ],
            ],
            ['sig-3', []],
        ])

        t.test('When collecting unmatched', async t => {
            const result = Matching.collectUnmatchedIds(lookup)

            t.test('Then it returns all remaining IDs', async t =>
                t.same(result, ['txn_000000000111', 'txn_000000000222', 'txn_000000000333']),
            )
        })
    })

    t.test('Given an empty lookup', async t => {
        const lookup = new Map()

        t.test('When collecting unmatched', async t => {
            const result = Matching.collectUnmatchedIds(lookup)

            t.test('Then it returns empty array', async t => t.same(result, []))
        })
    })
})
