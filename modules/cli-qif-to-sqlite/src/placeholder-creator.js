// ABOUTME: Creates placeholder securities and categories for orphaned references
// ABOUTME: Ensures all referenced IDs exist after import for referential integrity

const E = {
    // Finds categoryIds referenced by transactions/splits that don't exist in categories table
    // @sig queryMissingCategoryIds :: Database -> [String]
    queryMissingCategoryIds: db => {
        const sql = `
            SELECT DISTINCT categoryId FROM (
                SELECT categoryId FROM transactions
                WHERE categoryId IS NOT NULL AND orphanedAt IS NULL
                UNION
                SELECT categoryId FROM transactionSplits
                WHERE categoryId IS NOT NULL AND orphanedAt IS NULL
            )
            WHERE categoryId NOT IN (SELECT id FROM categories)
        `
        return db
            .prepare(sql)
            .all()
            .map(row => row.categoryId)
    },

    // Finds securityIds referenced by transactions/prices/lots that don't exist in securities table
    // @sig queryMissingSecurityIds :: Database -> [String]
    queryMissingSecurityIds: db => {
        const sql = `
            SELECT DISTINCT securityId FROM (
                SELECT securityId FROM transactions
                WHERE securityId IS NOT NULL AND orphanedAt IS NULL
                UNION
                SELECT securityId FROM prices
                WHERE securityId IS NOT NULL AND orphanedAt IS NULL
                UNION
                SELECT securityId FROM lots
                WHERE securityId IS NOT NULL
            )
            WHERE securityId NOT IN (SELECT id FROM securities)
        `
        return db
            .prepare(sql)
            .all()
            .map(row => row.securityId)
    },

    // Creates a placeholder category with the given ID
    // @sig createPlaceholderCategory :: (Database, String, ChangeTracker?) -> void
    createPlaceholderCategory: (db, categoryId, changeTracker) => {
        const sql = `INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`
        const name = `[Unknown: ${categoryId}]`
        db.prepare(sql).run(categoryId, name, 'Placeholder for missing category reference')
        if (changeTracker) changeTracker.recordChange(categoryId, 'Category', 'created')
    },

    // Creates a placeholder security with the given ID
    // @sig createPlaceholderSecurity :: (Database, String, ChangeTracker?) -> void
    createPlaceholderSecurity: (db, securityId, changeTracker) => {
        const sql = `INSERT INTO securities (id, name, symbol, type) VALUES (?, ?, ?, ?)`
        const name = `[Unknown: ${securityId}]`
        db.prepare(sql).run(securityId, name, '???', 'Unknown')
        if (changeTracker) changeTracker.recordChange(securityId, 'Security', 'created')
    },
}

// Creates placeholder entries for all missing category and security references
// Should be called after all data is imported but before orphan marking
// @sig createPlaceholders :: (Database, ChangeTracker?) -> { categories: Number, securities: Number }
const createPlaceholders = (db, changeTracker) => {
    const missingCategoryIds = E.queryMissingCategoryIds(db)
    const missingSecurityIds = E.queryMissingSecurityIds(db)

    missingCategoryIds.forEach(id => E.createPlaceholderCategory(db, id, changeTracker))
    missingSecurityIds.forEach(id => E.createPlaceholderSecurity(db, id, changeTracker))

    return { categories: missingCategoryIds.length, securities: missingSecurityIds.length }
}

const PlaceholderCreator = { createPlaceholders }
export { PlaceholderCreator }
