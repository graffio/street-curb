import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Category, Entry } from '../../types/index.js'

/*
 * Generate deterministic category ID from name
 * @sig generateCategoryId :: String -> String
 */
const generateCategoryId = name => `cat_${hashFields({ name })}`

/*
 * Insert category into database (dedupes on collision)
 * @sig insertCategory :: (Database, Entry.Category) -> String
 */
const insertCategory = (db, categoryEntry) => {
    if (!Entry.Category.is(categoryEntry))
        throw new Error(`Expected Entry.Category; found: ${JSON.stringify(categoryEntry)}`)

    const id = generateCategoryId(categoryEntry.name)

    // Check if category already exists (dedupe)
    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id)
    if (existing) return existing.id

    const stmt = db.prepare(`
        INSERT INTO categories (id, name, description, budget_amount, is_income_category, is_tax_related, tax_schedule)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    let { name, description, budgetAmount, isIncomeCategory = false, isTaxRelated = false, taxSchedule } = categoryEntry

    // Coerce booleans to numbers
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
    const record = db
        .prepare(
            'SELECT id, name, description, budget_amount AS budgetAmount, is_income_category AS isIncomeCategory, is_tax_related AS isTaxRelated, tax_schedule AS taxSchedule FROM categories WHERE name = ?',
        )
        .get(categoryName)

    // convert from 0|1 to false|true
    return convertCategory(record)
}

/*
 * Get all categories from database
 * @sig getAllCategories :: (Database) -> [Category]
 */
const getAllCategories = db => {
    const records = db
        .prepare(
            'SELECT id, name, description, budget_amount AS budgetAmount, is_income_category AS isIncomeCategory, is_tax_related AS isTaxRelated, tax_schedule AS taxSchedule FROM categories ORDER BY name',
        )
        .all()

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
