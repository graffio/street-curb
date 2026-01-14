// ABOUTME: Tests for rollback functionality during import failures
// ABOUTME: Verifies original database preserved on error, working copy discarded

import { test } from 'tap'
import { existsSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import Database from 'better-sqlite3'
import { Rollback } from '../src/rollback.js'

const createTestDbPath = () => join(tmpdir(), `test-rollback-${Date.now()}.db`)

const initTestDb = dbPath => {
    const db = new Database(dbPath)
    db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)')
    db.exec("INSERT INTO test VALUES (1, 'original')")
    db.close()
}

const cleanup = dbPath => {
    const paths = [dbPath, `${dbPath}.working`, `${dbPath}.backup`]
    paths.filter(existsSync).forEach(unlinkSync)
}

test('Rollback on success replaces original with working copy', async t =>
    t.test('Given a database with initial data', async t => {
        const dbPath = createTestDbPath()
        initTestDb(dbPath)
        t.teardown(() => cleanup(dbPath))

        t.test('When import succeeds', async t => {
            const openDatabase = path => new Database(path)
            const importFn = db => {
                db.exec("UPDATE test SET value = 'modified'")
                return { success: true }
            }

            const result = Rollback.withRollback(dbPath, openDatabase, importFn)

            t.test('Then result indicates success', async t => t.equal(result.success, true))

            t.test('Then original database has new data', async t => {
                const db = new Database(dbPath)
                const row = db.prepare('SELECT value FROM test WHERE id = 1').get()
                db.close()
                t.equal(row.value, 'modified')
            })

            t.test('Then working copy is removed', async t => t.equal(existsSync(`${dbPath}.working`), false))
        })
    }))

test('Rollback on failure preserves original database', async t =>
    t.test('Given a database with initial data', async t => {
        const dbPath = createTestDbPath()
        initTestDb(dbPath)
        t.teardown(() => cleanup(dbPath))

        t.test('When import fails with an error', async t => {
            const openDatabase = path => new Database(path)
            const importFn = db => {
                db.exec("UPDATE test SET value = 'modified'")
                throw new Error('Import failed!')
            }

            const result = Rollback.withRollback(dbPath, openDatabase, importFn)

            t.test('Then result indicates failure', async t => {
                t.equal(result.success, false)
                t.equal(result.error.message, 'Import failed!')
            })

            t.test('Then original database is unchanged', async t => {
                const db = new Database(dbPath)
                const row = db.prepare('SELECT value FROM test WHERE id = 1').get()
                db.close()
                t.equal(row.value, 'original')
            })

            t.test('Then working copy is removed', async t => t.equal(existsSync(`${dbPath}.working`), false))
        })
    }))

test('Error context includes progress information', async t =>
    t.test('Given an import that fails mid-progress', async t => {
        const dbPath = createTestDbPath()
        initTestDb(dbPath)
        t.teardown(() => cleanup(dbPath))

        t.test('When import fails with progress tracking', async t => {
            const openDatabase = path => new Database(path)
            const importFn = (db, progress) => {
                progress.stage = 'importing'
                progress.currentEntityType = 'Transaction'
                progress.currentEntity = { id: 'tx-123' }
                progress.processed = 50
                progress.total = 100
                throw new Error('Failed on transaction')
            }

            const result = Rollback.withRollback(dbPath, openDatabase, importFn)

            t.test('Then error context includes stage and progress', async t => {
                t.equal(result.error.stage, 'importing')
                t.equal(result.error.entityType, 'Transaction')
                t.same(result.error.entity, { id: 'tx-123' })
                t.equal(result.error.processed, 50)
                t.equal(result.error.total, 100)
            })
        })
    }))
