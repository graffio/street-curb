import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearCategories,
    findCategoryByName,
    getAllCategories,
    getCategoryCount,
    importCategories,
    insertCategory,
} from '../src/services/database/index.js'

import { Category, Entry } from '../src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createTestDatabase = () => {
    const db = Database(':memory:')
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

test('Categories Repository', t => {
    t.test('Given a fresh database', t => {
        const db = createTestDatabase()

        t.test('When I insert a basic category', t => {
            const categoryEntry = Entry.Category.from({
                name: 'Groceries',
                description: 'Food and household items',
                budgetAmount: 500.0,
                isIncomeCategory: false,
                isTaxRelated: false,
                taxSchedule: null,
            })

            const categoryId = insertCategory(db, categoryEntry)

            t.test('Then the category is inserted with a valid ID', t => {
                t.match(categoryId, /^cat_[a-f0-9]{12}$/, 'Category ID should match pattern')
                t.end()
            })

            t.test('And I can find the category by name', t => {
                const foundCategory = findCategoryByName(db, 'Groceries')

                t.ok(foundCategory, 'Category should be found')
                t.same(foundCategory.name, 'Groceries', 'Category name should match')
                t.same(foundCategory.description, 'Food and household items', 'Description should match')
                t.same(foundCategory.budgetAmount, 500.0, 'Budget amount should match')
                t.same(foundCategory.isIncomeCategory, false, 'Income category flag should match')
                t.same(foundCategory.isTaxRelated, false, 'Tax related flag should match')
                t.same(foundCategory.taxSchedule, null, 'Tax schedule should be null')
                t.end()
            })

            t.end()
        })

        t.test('When I insert a category with minimal data', t => {
            const categoryEntry = Entry.Category.from({ name: 'Utilities' })

            const categoryId = insertCategory(db, categoryEntry)

            t.test('Then the category is inserted successfully', t => {
                t.match(categoryId, /^cat_[a-f0-9]{12}$/, 'Category ID should match pattern')
                t.end()
            })

            t.test('And I can find the category with default values', t => {
                const foundCategory = findCategoryByName(db, 'Utilities')

                t.ok(foundCategory, 'Category should be found')
                t.same(foundCategory.name, 'Utilities', 'Category name should match')
                t.same(foundCategory.description, null, 'Description should default to null')
                t.same(foundCategory.budgetAmount, null, 'Budget amount should default to null')
                t.same(foundCategory.isIncomeCategory, false, 'Income category should default to false')
                t.same(foundCategory.isTaxRelated, false, 'Tax related should default to false')
                t.same(foundCategory.taxSchedule, null, 'Tax schedule should default to null')
                t.end()
            })

            t.end()
        })

        t.test('When I insert an income category', t => {
            const categoryEntry = Entry.Category.from({
                name: 'Salary',
                description: 'Employment income',
                budgetAmount: 5000.0,
                isIncomeCategory: true,
                isTaxRelated: true,
                taxSchedule: 'W-2',
            })

            const categoryId = insertCategory(db, categoryEntry)

            t.test('Then the category is inserted with income flags', t => {
                t.match(categoryId, /^cat_[a-f0-9]{12}$/, 'Category ID should match pattern')
                t.end()
            })

            t.test('And I can find the income category', t => {
                const foundCategory = findCategoryByName(db, 'Salary')

                t.ok(foundCategory, 'Category should be found')
                t.same(foundCategory.name, 'Salary', 'Category name should match')
                t.same(foundCategory.isIncomeCategory, true, 'Income category flag should be true')
                t.same(foundCategory.isTaxRelated, true, 'Tax related flag should be true')
                t.same(foundCategory.taxSchedule, 'W-2', 'Tax schedule should match')
                t.end()
            })

            t.end()
        })

        t.test('When I try to find a non-existent category', t => {
            const foundCategory = findCategoryByName(db, 'NonExistent')

            t.test('Then no category is found', t => {
                t.same(foundCategory, null, 'Should return null for non-existent category')
                t.end()
            })

            t.end()
        })

        t.test('When I get all categories on a fresh database', t => {
            const db = createTestDatabase()
            const allCategories = getAllCategories(db)
            t.same(allCategories, [], 'Should return empty array for fresh database')
            t.end()
        })

        t.test('When I get the category count on a fresh database', t => {
            const db = createTestDatabase()
            const count = getCategoryCount(db)
            t.same(count, 0, 'Category count should be zero for fresh database')
            t.end()
        })

        t.test('When I clear categories', t => {
            clearCategories(db)

            t.test('Then the operation completes without error', t => {
                t.pass('Clear categories should not throw an error')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with existing categories', t => {
        const db = createTestDatabase()

        // Insert some test categories
        const categories = [
            Entry.Category.from({ name: 'Groceries', description: 'Food items' }),
            Entry.Category.from({ name: 'Transportation', description: 'Gas and transit' }),
            Entry.Category.from({ name: 'Entertainment', description: 'Movies and dining' }),
        ]

        categories.forEach(category => insertCategory(db, category))

        t.test('When I get all categories', t => {
            const allCategories = getAllCategories(db)

            t.test('Then I get all categories in alphabetical order', t => {
                t.same(allCategories.length, 3, 'Should return all 3 categories')
                t.same(allCategories[0].name, 'Entertainment', 'First category should be Entertainment')
                t.same(allCategories[1].name, 'Groceries', 'Second category should be Groceries')
                t.same(allCategories[2].name, 'Transportation', 'Third category should be Transportation')
                t.end()
            })

            t.test('And each category has the correct structure', t => {
                allCategories.forEach(category => {
                    t.ok(Category.is(category), 'Each item should be a Category type')
                    t.match(category.id, /^cat_[a-f0-9]{12}$/, 'Each category should have a valid ID')
                    t.ok(typeof category.name === 'string', 'Each category should have a string name')
                })
                t.end()
            })

            t.end()
        })

        t.test('When I get the category count', t => {
            const count = getCategoryCount(db)

            t.test('Then the count matches the number of categories', t => {
                t.same(count, 3, 'Category count should be 3')
                t.end()
            })

            t.end()
        })

        t.test('When I import additional categories', t => {
            const newCategories = [
                Entry.Category.from({ name: 'Healthcare', description: 'Medical expenses' }),
                Entry.Category.from({ name: 'Education', description: 'School and training' }),
            ]

            const categoryIds = importCategories(db, newCategories)

            t.test('Then all categories are imported successfully', t => {
                t.same(categoryIds.length, 2, 'Should return 2 category IDs')
                categoryIds.forEach(id => t.match(id, /^cat_[a-f0-9]{12}$/, 'Each ID should match pattern'))
                t.end()
            })

            t.test('And I can find the new categories', t => {
                const healthcare = findCategoryByName(db, 'Healthcare')
                const education = findCategoryByName(db, 'Education')

                t.ok(healthcare, 'Healthcare category should be found')
                t.ok(education, 'Education category should be found')
                t.same(healthcare.description, 'Medical expenses', 'Healthcare description should match')
                t.same(education.description, 'School and training', 'Education description should match')
                t.end()
            })

            t.test('And the total count is updated', t => {
                const count = getCategoryCount(db)
                t.same(count, 5, 'Total category count should be 5')
                t.end()
            })

            t.end()
        })

        t.test('When I clear all categories', t => {
            clearCategories(db)

            t.test('Then all categories are removed', t => {
                const count = getCategoryCount(db)
                t.same(count, 0, 'Category count should be zero after clearing')
                t.end()
            })

            t.test('And I cannot find any categories', t => {
                const allCategories = getAllCategories(db)
                t.same(allCategories, [], 'All categories should return empty array')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        const db = createTestDatabase()

        t.test('When I try to insert a non-Category entry', t => {
            const invalidEntry = { name: 'Invalid', description: 'This is not a Category' }

            t.test('Then an error is thrown', t => {
                t.throws(() => insertCategory(db, invalidEntry), 'Should throw error for invalid entry type')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
