// ABOUTME: Tests for security matching functions
// ABOUTME: Verifies symbol/name lookup priority and duplicate handling

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

test('buildSecurityLookup', async t =>
    t.test('Given a database with securities', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        StableIdentity.insertStableIdentity(db, { id: 'sec_000000000111', entityType: 'Security', signature: 'AAPL' })
        StableIdentity.insertStableIdentity(db, {
            id: 'sec_000000000222',
            entityType: 'Security',
            signature: 'vanguard total stock',
        })

        t.test('When building lookup', async t => {
            const lookup = Matching.buildSecurityLookup(db)

            t.test('Then bySymbol contains uppercase signatures with orphan info (as array)', async t => {
                const entries = lookup.bySymbol.get('AAPL')
                t.equal(entries[0].id, 'sec_000000000111')
                t.equal(entries[0].orphanedAt, null)
            })

            t.test('Then byName contains lowercase signatures with orphan info (as array)', async t => {
                const entries = lookup.byName.get('vanguard total stock')
                t.equal(entries[0].id, 'sec_000000000222')
                t.equal(entries[0].orphanedAt, null)
            })
        })
    }))

test('findSecurityMatch', async t =>
    t.test('Given a lookup with symbol and name entries', async t => {
        const lookup = {
            bySymbol: new Map([['AAPL', [{ id: 'sec_000000000111', orphanedAt: null }]]]),
            byName: new Map([['vanguard total stock', [{ id: 'sec_000000000222', orphanedAt: null }]]]),
        }

        t.test('When matching by symbol', async t => {
            const security = { name: 'Apple Inc', symbol: 'AAPL' }
            const result = Matching.findSecurityMatch(lookup, security)

            t.test('Then it returns the entry with id', async t => t.equal(result.id, 'sec_000000000111'))
        })

        t.test('When matching by name (no symbol)', async t => {
            const security = { name: 'Vanguard Total Stock', symbol: null }
            const result = Matching.findSecurityMatch(lookup, security)

            t.test('Then it returns the entry with id', async t => t.equal(result.id, 'sec_000000000222'))
        })

        t.test('When no match exists', async t => {
            const security = { name: 'Unknown Fund', symbol: 'UNK' }
            const result = Matching.findSecurityMatch(lookup, security)

            t.test('Then it returns null', async t => t.equal(result, null))
        })
    }))
