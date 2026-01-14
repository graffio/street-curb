// ABOUTME: Tests for import history retention and automatic pruning
// ABOUTME: Verifies 20-import retention limit and automatic cleanup

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { ImportHistory } from '../src/import-history.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.exec(schema)
    return db
}

test('Import history records import with metadata', async t =>
    t.test('Given an empty database', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        t.test('When finalizing an import', async t => {
            const qifContent = '!Account\nNTest Account\n^'
            const changeCounts = { created: 5, modified: 2, orphaned: 1, restored: 0 }
            const changes = [{ stableId: 'acc_000000000001', changeType: 'created', entityType: 'Account' }]

            const importId = ImportHistory.finalizeImportHistory(db, qifContent, changeCounts, changes)

            t.test('Then import history record is created', async t => {
                const history = db.prepare('SELECT * FROM importHistory').all()
                t.equal(history.length, 1)
                t.equal(history[0].importId, importId)
                t.ok(history[0].qifFileHash)
                t.ok(history[0].summary.includes('created'))
            })

            t.test('Then entity change is recorded', async t => {
                const changes = db.prepare('SELECT * FROM entityChanges').all()
                t.equal(changes.length, 1)
                t.equal(changes[0].stableId, 'acc_000000000001')
                t.equal(changes[0].changeType, 'created')
            })
        })
    }))

test('History pruning keeps only last 20 imports', async t =>
    t.test('Given a database with more than 20 imports', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        // Insert 25 imports manually
        const insertImport = db.prepare(`
            INSERT INTO importHistory (importId, importedAt, qifFileHash, summary)
            VALUES (?, datetime('now', '-' || ? || ' minutes'), ?, '{}')
        `)
        const insertChange = db.prepare(`
            INSERT INTO entityChanges (stableId, importId, changeType, entityType)
            VALUES (?, ?, 'created', 'Account')
        `)

        const importIds = []
        for (let i = 0; i < 25; i++) {
            const id = `import-${i.toString().padStart(3, '0')}`
            insertImport.run(id, 25 - i, `hash-${i}`)
            insertChange.run(`stable-${i}`, id)
            importIds.push(id)
        }

        t.test('When pruning old history', async t => {
            const pruned = ImportHistory.E.pruneOldHistory(db)

            t.test('Then 5 old imports are removed', async t => t.equal(pruned, 5))

            t.test('Then exactly 20 imports remain', async t => {
                const remaining = db.prepare('SELECT COUNT(*) as count FROM importHistory').get()
                t.equal(remaining.count, 20)
            })

            t.test('Then entity changes for oldest 5 imports are removed', async t => {
                // Oldest imports are import-000 through import-004 (25 mins to 21 mins old)
                const deleted = ['import-000', 'import-001', 'import-002', 'import-003', 'import-004']
                const placeholders = deleted.map(() => '?').join(', ')
                const oldChanges = db
                    .prepare(`SELECT COUNT(*) as count FROM entityChanges WHERE importId IN (${placeholders})`)
                    .get(...deleted)
                t.equal(oldChanges.count, 0, 'Oldest 5 changes removed')
            })
        })
    }))

test('Modified entities get lastModifiedAt updated', async t =>
    t.test('Given a stable identity in the database', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        db.prepare(
            `
            INSERT INTO stableIdentities (id, entityType, signature)
            VALUES ('acc_000000000001', 'Account', 'test|sig')
        `,
        ).run()

        t.test('When recording a modified change', async t => {
            const qifContent = 'test'
            const changeCounts = { created: 0, modified: 1, orphaned: 0, restored: 0 }
            const changes = [{ stableId: 'acc_000000000001', changeType: 'modified', entityType: 'Account' }]

            ImportHistory.finalizeImportHistory(db, qifContent, changeCounts, changes)

            t.test('Then lastModifiedAt is set', async t => {
                const identity = db
                    .prepare('SELECT lastModifiedAt FROM stableIdentities WHERE id = ?')
                    .get('acc_000000000001')
                t.ok(identity.lastModifiedAt, 'lastModifiedAt should be set')
            })
        })
    }))
