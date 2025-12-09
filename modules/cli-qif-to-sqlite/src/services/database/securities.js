import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Entry, Security } from '../../types/index.js'

/*
 * Generate deterministic security ID from name and symbol
 * Use null for missing symbol (not empty string) to distinguish null from ''
 * @sig generateSecurityId :: (String, String?) -> String
 */
const generateSecurityId = (name, symbol) => `sec_${hashFields({ name, symbol: symbol || null })}`

/*
 * Insert security into database (dedupes on collision)
 * @sig insertSecurity :: (Database, Entry.Security) -> String
 */
const insertSecurity = (db, securityEntry) => {
    if (!Entry.Security.is(securityEntry))
        throw new Error(`Expected Entry.Security; found: ${JSON.stringify(securityEntry)}`)

    const { name, symbol, type, goal } = securityEntry
    const id = generateSecurityId(name, symbol)

    // Check if security already exists (dedupe)
    const existing = db.prepare('SELECT id FROM securities WHERE id = ?').get(id)
    if (existing) return existing.id

    const stmt = db.prepare(`
        INSERT INTO securities (id, name, symbol, type, goal)
        VALUES (?, ?, ?, ?, ?)
    `)

    // Coerce all optional fields to null
    const coercedSymbol = symbol == null ? null : symbol
    const coercedType = type == null ? null : type
    const coercedGoal = goal == null ? null : goal

    stmt.run(id, name, coercedSymbol, coercedType, coercedGoal)
    return id
}

/*
 * Import securities into database
 * @sig importSecurities :: (Database, [Entry.Security]) -> [String]
 */
const importSecurities = (db, securities) => map(security => insertSecurity(db, security), securities)

/*
 * Find security by name
 * @sig findSecurityByName :: (Database, String) -> Security?
 */
const findSecurityByName = (db, securityName) => {
    const record = db.prepare('SELECT id, name, symbol, type, goal FROM securities WHERE name = ?').get(securityName)

    return record ? Security.from(record) : null
}

/*
 * Find security by symbol
 * @sig findSecurityBySymbol :: (Database, String) -> Security?
 */
const findSecurityBySymbol = (db, symbol) => {
    const record = db.prepare('SELECT id, name, symbol, type, goal FROM securities WHERE symbol = ?').get(symbol)

    return record ? Security.from(record) : null
}

/*
 * Find security by name or symbol (for backward compatibility)
 * @sig findSecurityByNameOrSymbol :: (Database, String) -> Security?
 */
const findSecurityByNameOrSymbol = (db, identifier) => {
    const record = db
        .prepare('SELECT id, name, symbol, type, goal FROM securities WHERE symbol = ? OR name = ?')
        .get(identifier, identifier)

    return record ? Security.from(record) : null
}

/*
 * Get all securities from database
 * @sig getAllSecurities :: (Database) -> [Security]
 */
const getAllSecurities = db => {
    const records = db.prepare('SELECT id, name, symbol, type, goal FROM securities ORDER BY name').all()

    return map(Security.from, records)
}

/*
 * Get security count
 * @sig getSecurityCount :: (Database) -> Number
 */
const getSecurityCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM securities').get()
    return result.count
}

/*
 * Clear all securities from database
 * @sig clearSecurities :: (Database) -> void
 */
const clearSecurities = db => db.prepare('DELETE FROM securities').run()

export {
    insertSecurity,
    findSecurityByName,
    findSecurityBySymbol,
    findSecurityByNameOrSymbol,
    getAllSecurities,
    getSecurityCount,
    importSecurities,
    clearSecurities,
}
