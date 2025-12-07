import { map } from '@graffio/functional'
import { Entry, Security } from '../../types/index.js'

/*
 * Insert security into database
 * @sig insertSecurity :: (Database, Entry.Security) -> Number
 */
const insertSecurity = (db, securityEntry) => {
    if (!Entry.Security.is(securityEntry))
        throw new Error(`Expected Entry.Security; found: ${JSON.stringify(securityEntry)}`)

    const stmt = db.prepare(`
        INSERT INTO securities (name, symbol, type, goal)
        VALUES (?, ?, ?, ?)
    `)

    const { name, symbol, type, goal } = securityEntry

    // Coerce all optional fields to null
    const coercedSymbol = symbol == null ? null : symbol
    const coercedType = type == null ? null : type
    const coercedGoal = goal == null ? null : goal

    const result = stmt.run(name, coercedSymbol, coercedType, coercedGoal)
    return result.lastInsertRowid
}

/*
 * Import securities into database
 * @sig importSecurities :: (Database, [Entry.Security]) -> [Number]
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
