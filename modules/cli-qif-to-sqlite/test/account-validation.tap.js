// ABOUTME: Tests for import validation — single-account detection and missing-account detection
// ABOUTME: Verifies Import.validateImport returns correct ImportIssue variants

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

test('validateImport returns empty array for valid multi-account import', async t =>
    t.test('Given a database with two existing accounts', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const seedData = {
            ...emptyImportData,
            accounts: [
                { name: 'Checking', type: 'Bank', description: null, creditLimit: null },
                { name: 'Savings', type: 'Bank', description: null, creditLimit: null },
            ],
        }
        Import.processImport(db, seedData)

        t.test('When validating an import with both accounts present', async t => {
            const newData = {
                ...emptyImportData,
                accounts: [
                    { name: 'Checking', type: 'Bank', description: null, creditLimit: null },
                    { name: 'Savings', type: 'Bank', description: null, creditLimit: null },
                ],
            }
            const issues = Import.validateImport(db, newData)

            t.test('Then no issues are returned', async t => t.same(issues, []))
        })
    }))

test('validateImport returns SingleAccount when QIF has 1 account', async t =>
    t.test('Given a database with existing accounts', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const seedData = {
            ...emptyImportData,
            accounts: [
                { name: 'Checking', type: 'Bank', description: null, creditLimit: null },
                { name: 'Savings', type: 'Bank', description: null, creditLimit: null },
            ],
        }
        Import.processImport(db, seedData)

        t.test('When validating an import with only 1 account', async t => {
            const newData = {
                ...emptyImportData,
                accounts: [{ name: 'Checking', type: 'Bank', description: null, creditLimit: null }],
            }
            const issues = Import.validateImport(db, newData)

            t.test('Then a SingleAccount issue is returned', async t => {
                const singleIssue = issues.find(i => i['@@tagName'] === 'SingleAccount')
                t.ok(singleIssue, 'SingleAccount issue should be present')
            })

            t.test('Then the issue contains the single account name', async t => {
                const singleIssue = issues.find(i => i['@@tagName'] === 'SingleAccount')
                t.same(singleIssue.accounts, ['Checking'])
            })
        })
    }))

test('validateImport returns MissingAccounts for non-orphaned accounts absent from QIF', async t =>
    t.test('Given a database with three accounts where one is orphaned', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        // Seed with three accounts
        const seedData = {
            ...emptyImportData,
            accounts: [
                { name: 'Checking', type: 'Bank', description: null, creditLimit: null },
                { name: 'Savings', type: 'Bank', description: null, creditLimit: null },
                { name: 'Old Account', type: 'Bank', description: null, creditLimit: null },
            ],
        }
        Import.processImport(db, seedData)

        // Orphan 'Old Account' by reimporting without it
        const reimportData = {
            ...emptyImportData,
            accounts: [
                { name: 'Checking', type: 'Bank', description: null, creditLimit: null },
                { name: 'Savings', type: 'Bank', description: null, creditLimit: null },
            ],
        }
        Import.processImport(db, reimportData)

        t.test('When validating an import missing a non-orphaned account', async t => {
            // Checking present, Savings missing (non-orphaned), Old Account missing (orphaned — excluded)
            const newData = {
                ...emptyImportData,
                accounts: [
                    { name: 'Checking', type: 'Bank', description: null, creditLimit: null },
                    { name: 'New Account', type: 'Bank', description: null, creditLimit: null },
                ],
            }
            const issues = Import.validateImport(db, newData)

            t.test('Then a MissingAccounts issue is returned', async t => {
                const missingIssue = issues.find(i => i['@@tagName'] === 'MissingAccounts')
                t.ok(missingIssue, 'MissingAccounts issue should be present')
            })

            t.test('Then the missing list includes only the non-orphaned absent account', async t => {
                const missingIssue = issues.find(i => i['@@tagName'] === 'MissingAccounts')
                t.same(missingIssue.missing, ['Savings'])
            })

            t.test('Then the orphaned account is not in the missing list', async t => {
                const missingIssue = issues.find(i => i['@@tagName'] === 'MissingAccounts')
                t.notOk(missingIssue.missing.includes('Old Account'))
            })
        })
    }))
