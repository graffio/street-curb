// ABOUTME: Category database operations for QIF import
// ABOUTME: Handles category CRUD with budget and tax tracking fields

import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Category, Entry } from '../../types/index.js'

/*
 * Insert category into database (dedupes on collision)
 * @sig insertCategory :: (Database, Entry.Category) -> String
 */
const insertCategory = (db, categoryEntry) => {
    const generateId = n => `cat_${hashFields({ name: n })}`

    if (!Entry.Category.is(categoryEntry))
        throw new Error(`Expected Entry.Category; found: ${JSON.stringify(categoryEntry)}`)

    const id = generateId(categoryEntry.name)

    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id)
    if (existing) return existing.id

    const cols = 'id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule'
    const stmt = db.prepare(`INSERT INTO categories (${cols}) VALUES (?, ?, ?, ?, ?, ?, ?)`)

    let { name, description, budgetAmount, isIncomeCategory = false, isTaxRelated = false, taxSchedule } = categoryEntry

    isIncomeCategory = isIncomeCategory ? 1 : 0
    isTaxRelated = isTaxRelated ? 1 : 0

    stmt.run(id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule)
    return id
}

/*
 * Import categories into database
 * @sig importCategories :: (Database, [Entry.Category]) -> [String]
 */
const importCategories = (db, categories) => map(category => insertCategory(db, category), categories)

/*
 * Convert raw database record to Category type, coercing 0/1 to boolean
 * @sig convertCategory :: Object? -> Category?
 */
const convertCategory = record => {
    if (!record) return null

    record.isTaxRelated = !!record.isTaxRelated
    record.isIncomeCategory = !!record.isIncomeCategory
    return Category.from(record)
}

/*
 * Find category by name
 * @sig findCategoryByName :: (Database, String) -> Category?
 */
const findCategoryByName = (db, categoryName) => {
    const cols = 'id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule'
    const record = db.prepare(`SELECT ${cols} FROM categories WHERE name = ?`).get(categoryName)
    return convertCategory(record)
}

/*
 * Get all categories from database
 * @sig getAllCategories :: (Database) -> [Category]
 */
const getAllCategories = db => {
    const cols = 'id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule'
    const records = db.prepare(`SELECT ${cols} FROM categories ORDER BY name`).all()
    return map(convertCategory, records)
}

/*
 * Get category count
 * @sig getCategoryCount :: (Database) -> Number
 */
const getCategoryCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM categories').get()
    return result.count
}

/*
 * Clear all categories from database
 * @sig clearCategories :: (Database) -> void
 */
const clearCategories = db => db.prepare('DELETE FROM categories').run()

export { insertCategory, findCategoryByName, getAllCategories, getCategoryCount, importCategories, clearCategories }
