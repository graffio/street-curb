// ABOUTME: Tests for categories and tags import with stable identity matching
// ABOUTME: Verifies cat_/tag_ prefixes, identity preservation, orphan detection, and restore

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

test('Categories initial import creates stable IDs', async t =>
    t.test('Given an empty database', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            categories: [
                {
                    name: 'Groceries',
                    description: 'Food expenses',
                    budgetAmount: 500,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
                {
                    name: 'Salary',
                    description: 'Monthly income',
                    budgetAmount: null,
                    isIncomeCategory: 1,
                    isTaxRelated: 1,
                    taxSchedule: 'W-2',
                },
            ],
        }

        t.test('When importing categories', async t => {
            Import.processImport(db, data)

            t.test('Then categories are created in the database', async t => {
                const categories = db.prepare('SELECT * FROM categories').all()
                t.equal(categories.length, 2)
                t.equal(categories.find(c => c.name === 'Groceries').budgetAmount, 500)
                t.equal(categories.find(c => c.name === 'Salary').isIncomeCategory, 1)
            })

            t.test('Then stable identities are created with cat_ prefix', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Category'").all()
                t.equal(stableIds.length, 2)
                t.ok(stableIds[0].id.startsWith('cat_'))
                t.ok(stableIds[1].id.startsWith('cat_'))
            })

            t.test('Then stable IDs have sequential 12-digit format', async t => {
                const stableIds = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Category' ORDER BY id")
                    .all()
                t.equal(stableIds[0].id, 'cat_000000000001')
                t.equal(stableIds[1].id, 'cat_000000000002')
            })
        })
    }))

test('Tags initial import creates stable IDs', async t =>
    t.test('Given an empty database', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            tags: [
                { name: 'Urgent', color: '#FF0000', description: 'High priority' },
                { name: 'Vacation', color: '#00FF00', description: 'Travel related' },
            ],
        }

        t.test('When importing tags', async t => {
            Import.processImport(db, data)

            t.test('Then tags are created in the database', async t => {
                const tags = db.prepare('SELECT * FROM tags').all()
                t.equal(tags.length, 2)
                t.equal(tags.find(t => t.name === 'Urgent').color, '#FF0000')
                t.equal(tags.find(t => t.name === 'Vacation').description, 'Travel related')
            })

            t.test('Then stable identities are created with tag_ prefix', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Tag'").all()
                t.equal(stableIds.length, 2)
                t.ok(stableIds[0].id.startsWith('tag_'))
                t.ok(stableIds[1].id.startsWith('tag_'))
            })

            t.test('Then stable IDs have sequential 12-digit format', async t => {
                const stableIds = db
                    .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Tag' ORDER BY id")
                    .all()
                t.equal(stableIds[0].id, 'tag_000000000001')
                t.equal(stableIds[1].id, 'tag_000000000002')
            })
        })
    }))

test('Categories reimport preserves stable identity', async t =>
    t.test('Given a database with existing categories', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            categories: [
                {
                    name: 'Groceries',
                    description: 'Food',
                    budgetAmount: 500,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
        }
        Import.processImport(db, data)

        const originalStableId = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Category'").get().id

        t.test('When reimporting the same category', async t => {
            Import.processImport(db, data)

            t.test('Then stable ID is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Category'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalStableId)
            })

            t.test('Then no orphans are created', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Category')
                t.equal(orphans.length, 0)
            })
        })
    }))

test('Tags reimport preserves stable identity', async t =>
    t.test('Given a database with existing tags', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = { ...emptyImportData, tags: [{ name: 'Urgent', color: '#FF0000', description: 'High priority' }] }
        Import.processImport(db, data)

        const originalStableId = db.prepare("SELECT id FROM stableIdentities WHERE entityType = 'Tag'").get().id

        t.test('When reimporting the same tag', async t => {
            Import.processImport(db, data)

            t.test('Then stable ID is preserved', async t => {
                const stableIds = db.prepare("SELECT * FROM stableIdentities WHERE entityType = 'Tag'").all()
                t.equal(stableIds.length, 1)
                t.equal(stableIds[0].id, originalStableId)
            })

            t.test('Then no orphans are created', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Tag')
                t.equal(orphans.length, 0)
            })
        })
    }))

test('Category orphan detection', async t =>
    t.test('Given a database with multiple categories', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const initialData = {
            ...emptyImportData,
            categories: [
                {
                    name: 'Groceries',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
                {
                    name: 'Utilities',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
        }
        Import.processImport(db, initialData)

        t.test('When reimporting with one category removed', async t => {
            const updatedData = {
                ...emptyImportData,
                categories: [
                    {
                        name: 'Groceries',
                        description: null,
                        budgetAmount: null,
                        isIncomeCategory: 0,
                        isTaxRelated: 0,
                        taxSchedule: null,
                    },
                ],
            }
            Import.processImport(db, updatedData)

            t.test('Then removed category is marked as orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Category')
                t.equal(orphans.length, 1)
                t.equal(orphans[0].signature, 'Utilities')
                t.ok(orphans[0].orphanedAt)
            })

            t.test('Then remaining category is not orphaned', async t => {
                const groceries = db
                    .prepare("SELECT * FROM stableIdentities WHERE entityType = 'Category' AND signature = 'Groceries'")
                    .get()
                t.equal(groceries.orphanedAt, null)
            })
        })
    }))

test('Tag orphan detection', async t =>
    t.test('Given a database with multiple tags', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const initialData = {
            ...emptyImportData,
            tags: [
                { name: 'Urgent', color: null, description: null },
                { name: 'Vacation', color: null, description: null },
            ],
        }
        Import.processImport(db, initialData)

        t.test('When reimporting with one tag removed', async t => {
            const updatedData = { ...emptyImportData, tags: [{ name: 'Urgent', color: null, description: null }] }
            Import.processImport(db, updatedData)

            t.test('Then removed tag is marked as orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Tag')
                t.equal(orphans.length, 1)
                t.equal(orphans[0].signature, 'Vacation')
                t.ok(orphans[0].orphanedAt)
            })

            t.test('Then remaining tag is not orphaned', async t => {
                const urgent = db
                    .prepare("SELECT * FROM stableIdentities WHERE entityType = 'Tag' AND signature = 'Urgent'")
                    .get()
                t.equal(urgent.orphanedAt, null)
            })
        })
    }))

test('Category restore from orphan', async t =>
    t.test('Given a database with an orphaned category', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const initialData = {
            ...emptyImportData,
            categories: [
                {
                    name: 'Groceries',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
                {
                    name: 'Utilities',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
        }
        Import.processImport(db, initialData)

        const originalUtilitiesStableId = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Category' AND signature = 'Utilities'")
            .get().id

        // Remove Utilities to orphan it
        const withoutUtilities = {
            ...emptyImportData,
            categories: [
                {
                    name: 'Groceries',
                    description: null,
                    budgetAmount: null,
                    isIncomeCategory: 0,
                    isTaxRelated: 0,
                    taxSchedule: null,
                },
            ],
        }
        Import.processImport(db, withoutUtilities)

        // Verify it's orphaned
        const orphanedBefore = StableIdentity.findOrphans(db, 'Category')
        t.equal(orphanedBefore.length, 1, 'Utilities should be orphaned')

        t.test('When reimporting with the orphaned category restored', async t => {
            Import.processImport(db, initialData)

            t.test('Then the category is no longer orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Category')
                t.equal(orphans.length, 0)
            })

            t.test('Then the original stable ID is preserved', async t => {
                const utilities = db
                    .prepare("SELECT * FROM stableIdentities WHERE entityType = 'Category' AND signature = 'Utilities'")
                    .get()
                t.equal(utilities.id, originalUtilitiesStableId)
                t.equal(utilities.orphanedAt, null)
            })
        })
    }))

test('Tag restore from orphan', async t =>
    t.test('Given a database with an orphaned tag', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const initialData = {
            ...emptyImportData,
            tags: [
                { name: 'Urgent', color: '#FF0000', description: null },
                { name: 'Vacation', color: '#00FF00', description: null },
            ],
        }
        Import.processImport(db, initialData)

        const originalVacationStableId = db
            .prepare("SELECT id FROM stableIdentities WHERE entityType = 'Tag' AND signature = 'Vacation'")
            .get().id

        // Remove Vacation to orphan it
        const withoutVacation = { ...emptyImportData, tags: [{ name: 'Urgent', color: '#FF0000', description: null }] }
        Import.processImport(db, withoutVacation)

        // Verify it's orphaned
        const orphanedBefore = StableIdentity.findOrphans(db, 'Tag')
        t.equal(orphanedBefore.length, 1, 'Vacation should be orphaned')

        t.test('When reimporting with the orphaned tag restored', async t => {
            Import.processImport(db, initialData)

            t.test('Then the tag is no longer orphaned', async t => {
                const orphans = StableIdentity.findOrphans(db, 'Tag')
                t.equal(orphans.length, 0)
            })

            t.test('Then the original stable ID is preserved', async t => {
                const vacation = db
                    .prepare("SELECT * FROM stableIdentities WHERE entityType = 'Tag' AND signature = 'Vacation'")
                    .get()
                t.equal(vacation.id, originalVacationStableId)
                t.equal(vacation.orphanedAt, null)
            })
        })
    }))
