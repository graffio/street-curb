// ABOUTME: Tests for the database schema including stable identity and infrastructure tables
// ABOUTME: Verifies table structure, constraints, and indexes for all import-related tables

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const T = {
    getTableInfo: (db, tableName) => db.prepare(`PRAGMA table_info(${tableName})`).all(),
    getIndexList: (db, tableName) => db.prepare(`PRAGMA index_list(${tableName})`).all(),
    getIndexInfo: (db, indexName) => db.prepare(`PRAGMA index_info(${indexName})`).all(),
}

test('stableIdentities table', async t => {
    const db = new Database(':memory:')
    db.exec(schema)
    t.teardown(() => db.close())

    t.test('Given schema is applied', async t => {
        t.test('When querying table structure', async t => {
            const columns = T.getTableInfo(db, 'stableIdentities')
            const columnNames = columns.map(c => c.name)

            t.test('Then it has all required columns', async t =>
                t.same(columnNames, [
                    'id',
                    'entityType',
                    'signature',
                    'orphanedAt',
                    'acknowledgedAt',
                    'createdAt',
                    'lastModifiedAt',
                ]),
            )

            t.test('Then id is the primary key', async t => {
                const idColumn = columns.find(c => c.name === 'id')
                t.equal(idColumn.pk, 1)
                t.equal(idColumn.type, 'TEXT')
            })

            t.test('Then entityType is NOT NULL', async t => {
                const column = columns.find(c => c.name === 'entityType')
                t.equal(column.notnull, 1)
                t.equal(column.type, 'TEXT')
            })

            t.test('Then signature is NOT NULL', async t => {
                const column = columns.find(c => c.name === 'signature')
                t.equal(column.notnull, 1)
                t.equal(column.type, 'TEXT')
            })

            t.test('Then orphanedAt allows NULL', async t => {
                const column = columns.find(c => c.name === 'orphanedAt')
                t.equal(column.notnull, 0)
                t.equal(column.type, 'TEXT')
            })
        })

        t.test('When querying indexes', async t => {
            const indexes = T.getIndexList(db, 'stableIdentities')
            const indexNames = indexes.map(i => i.name)

            t.test('Then it has index on entityType and signature', async t =>
                t.ok(indexNames.includes('idx_stableIdentities_entityType_signature')),
            )

            t.test('Then entityType+signature is NOT unique (allows duplicates for count-based pairing)', async t => {
                // No autoindex for UNIQUE constraints - duplicates are allowed
                const uniqueConstraint = indexes.find(i => i.origin === 'u' && i.unique === 1)
                t.notOk(uniqueConstraint, 'Should not have unique constraint')
            })
        })

        t.test('When inserting data', async t => {
            t.test('Then allows valid insert', async t => {
                const stmt = db.prepare(`
                    INSERT INTO stableIdentities (id, entityType, signature)
                    VALUES (?, ?, ?)
                `)
                t.doesNotThrow(() => stmt.run('txn_000000000001', 'Transaction', 'sig123'))
            })

            t.test('Then allows duplicate entityType+signature (for count-based pairing)', async t => {
                const stmt = db.prepare(`
                    INSERT INTO stableIdentities (id, entityType, signature)
                    VALUES (?, ?, ?)
                `)
                stmt.run('txn_000000000002', 'Transaction', 'sig-duplicate')
                t.doesNotThrow(() => stmt.run('txn_000000000003', 'Transaction', 'sig-duplicate'))
            })

            t.test('Then allows same signature for different entityTypes', async t => {
                const stmt = db.prepare(`
                    INSERT INTO stableIdentities (id, entityType, signature)
                    VALUES (?, ?, ?)
                `)
                stmt.run('acc_000000000001', 'Account', 'shared-sig')
                t.doesNotThrow(() => stmt.run('sec_000000000001', 'Security', 'shared-sig'))
            })
        })
    })
})

test('stableIdCounters table', async t => {
    const db = new Database(':memory:')
    db.exec(schema)
    t.teardown(() => db.close())

    t.test('Given schema is applied', async t => {
        t.test('When querying table structure', async t => {
            const columns = T.getTableInfo(db, 'stableIdCounters')

            t.test('Then entityType is the primary key', async t => {
                const pkColumn = columns.find(c => c.pk === 1)
                t.equal(pkColumn.name, 'entityType')
                t.equal(pkColumn.type, 'TEXT')
            })

            t.test('Then nextId has default value of 1', async t => {
                const column = columns.find(c => c.name === 'nextId')
                t.equal(column.type, 'INTEGER')
                t.equal(column.dflt_value, '1')
            })
        })

        t.test('When inserting and updating counters', async t =>
            t.test('Then counter increments correctly', async t => {
                db.prepare('INSERT INTO stableIdCounters (entityType) VALUES (?)').run('Transaction')
                const row = db
                    .prepare('UPDATE stableIdCounters SET nextId = nextId + 1 WHERE entityType = ? RETURNING nextId')
                    .get('Transaction')
                t.equal(row.nextId, 2)
            }),
        )
    })
})

test('importHistory table', async t => {
    const db = new Database(':memory:')
    db.exec(schema)
    t.teardown(() => db.close())

    t.test('Given schema is applied', async t => {
        t.test('When querying table structure', async t => {
            const columns = T.getTableInfo(db, 'importHistory')
            const columnNames = columns.map(c => c.name)

            t.test('Then it has all required columns', async t =>
                t.same(columnNames, ['importId', 'importedAt', 'qifFileHash', 'summary']),
            )

            t.test('Then importId is the primary key', async t => {
                const pkColumn = columns.find(c => c.pk === 1)
                t.equal(pkColumn.name, 'importId')
            })
        })

        t.test('When inserting data', async t =>
            t.test('Then allows valid insert with JSON summary', async t => {
                const stmt = db.prepare(`
                    INSERT INTO importHistory (importId, qifFileHash, summary)
                    VALUES (?, ?, ?)
                `)
                t.doesNotThrow(() =>
                    stmt.run('imp-001', 'abc123', JSON.stringify({ created: 5, modified: 2, orphaned: 1 })),
                )
            }),
        )
    })
})

test('entityChanges table', async t => {
    const db = new Database(':memory:')
    db.exec(schema)
    t.teardown(() => db.close())

    t.test('Given schema is applied', async t =>
        t.test('When querying table structure', async t => {
            const columns = T.getTableInfo(db, 'entityChanges')

            t.test('Then it has composite primary key', async t => {
                const pkColumns = columns.filter(c => c.pk > 0)
                t.equal(pkColumns.length, 2)
                t.same(
                    pkColumns.map(c => c.name),
                    ['stableId', 'importId'],
                )
            })

            t.test('Then changeType has CHECK constraint', async t => {
                t.doesNotThrow(() =>
                    db.prepare('INSERT INTO entityChanges VALUES (?, ?, ?, ?)').run('s1', 'i1', 'created', 'Account'),
                )
                t.throws(
                    () =>
                        db
                            .prepare('INSERT INTO entityChanges VALUES (?, ?, ?, ?)')
                            .run('s2', 'i2', 'invalid', 'Account'),
                    /CHECK constraint/,
                )
            })
        }),
    )
})

test('lotAssignmentOverrides table', async t => {
    const db = new Database(':memory:')
    db.exec(schema)
    t.teardown(() => db.close())

    t.test('Given schema is applied', async t =>
        t.test('When querying table structure', async t => {
            const columns = T.getTableInfo(db, 'lotAssignmentOverrides')

            t.test('Then it has composite primary key for sell+open transactions', async t => {
                const pkColumns = columns.filter(c => c.pk > 0)
                t.equal(pkColumns.length, 2)
                t.same(
                    pkColumns.map(c => c.name),
                    ['sellTransactionStableId', 'openTransactionStableId'],
                )
            })

            t.test('Then quantity is REAL', async t => {
                const column = columns.find(c => c.name === 'quantity')
                t.equal(column.type, 'REAL')
            })
        }),
    )
})

test('userPreferences table', async t => {
    const db = new Database(':memory:')
    db.exec(schema)
    t.teardown(() => db.close())

    t.test('Given schema is applied', async t => {
        t.test('When querying table structure', async t => {
            const columns = T.getTableInfo(db, 'userPreferences')

            t.test('Then key is the primary key', async t => {
                const pkColumn = columns.find(c => c.pk === 1)
                t.equal(pkColumn.name, 'key')
                t.equal(pkColumn.type, 'TEXT')
            })
        })

        t.test('When inserting preferences', async t =>
            t.test('Then allows key-value storage', async t => {
                const stmt = db.prepare('INSERT INTO userPreferences (key, value) VALUES (?, ?)')
                t.doesNotThrow(() => stmt.run('defaultAccount', 'acc_000000000001'))
            }),
        )
    })
})
