// ABOUTME: Stable identity infrastructure for QIF entity matching across imports
// ABOUTME: Generates prefixed IDs and manages the stableIdentities table

// Statement cache keyed by database instance (auto-clears when db is garbage collected)
const stmtCache = new WeakMap()

// ID pool for batch allocation (keyed by db, then entityType)
const idPoolCache = new WeakMap()
const BATCH_SIZE = 1000

const PREFIXES = {
    Account: 'acc_',
    Category: 'cat_',
    Tag: 'tag_',
    Security: 'sec_',
    Transaction: 'txn_',
    Split: 'spl_',
    Price: 'prc_',
    Lot: 'lot_',
    LotAllocation: 'la_',
}

const E = {
    // Get or create cached prepared statement for a database
    // @sig persistCachedStatement :: (Database, String, String) -> Statement
    persistCachedStatement: (db, key, sql) => {
        if (!stmtCache.has(db)) stmtCache.set(db, {})
        const cache = stmtCache.get(db)
        if (!cache[key]) cache[key] = db.prepare(sql)
        return cache[key]
    },

    // Get or create ID pool for a database
    // @sig persistIdPool :: Database -> {entityType: {nextId, maxId}}
    persistIdPool: db => {
        if (!idPoolCache.has(db)) idPoolCache.set(db, {})
        return idPoolCache.get(db)
    },

    // Reserve a batch of IDs from counter table, returns {startId, endId}
    // @sig persistReservedIdBatch :: (Database, String, Number) -> {startId, endId}
    persistReservedIdBatch: (db, entityType, count) => {
        const insertStmt = E.persistCachedStatement(
            db,
            'counterInsert',
            'INSERT OR IGNORE INTO stableIdCounters (entityType) VALUES (?)',
        )
        const updateSql =
            'UPDATE stableIdCounters SET nextId = nextId + ? WHERE entityType = ? RETURNING nextId - ? as startId'
        const updateStmt = E.persistCachedStatement(db, 'counterBatchUpdate', updateSql)
        insertStmt.run(entityType)
        const row = updateStmt.get(count, entityType, count)
        return { startId: row.startId, endId: row.startId + count - 1 }
    },

    // Get next ID using batch allocation (refills pool when empty)
    // @sig queryNextId :: (Database, String) -> Integer
    queryNextId: (db, entityType) => {
        const pool = E.persistIdPool(db)
        if (!pool[entityType] || pool[entityType].nextId > pool[entityType].maxId) {
            const { startId, endId } = E.persistReservedIdBatch(db, entityType, BATCH_SIZE)
            pool[entityType] = { nextId: startId, maxId: endId }
        }
        return pool[entityType].nextId++
    },
}

// Generate a stable ID with entity-type-specific prefix using counter (D23)
// Format: prefix + 12-digit zero-padded number (e.g., txn_000000000001)
// @sig createStableId :: (Database, String) -> String
const createStableId = (db, entityType) => {
    const prefix = PREFIXES[entityType]
    if (!prefix) throw new Error(`Unknown entity type: ${entityType}`)
    const id = E.queryNextId(db, entityType)
    return prefix + String(id).padStart(12, '0')
}

// Insert a stable identity record into the database
// @sig insertStableIdentity :: (Database, {id, entityType, signature}) -> void
const insertStableIdentity = (db, { id, entityType, signature }) => {
    const stmt = E.persistCachedStatement(
        db,
        'insertIdentity',
        'INSERT INTO stableIdentities (id, entityType, signature) VALUES (?, ?, ?)',
    )
    stmt.run(id, entityType, signature)
}

// Lookup stable identity by entityType and signature, returns id or null
// Only returns non-orphaned entities (use findBySignatureIncludingOrphaned for restore logic)
// @sig findBySignature :: (Database, String, String) -> String | null
const findBySignature = (db, entityType, signature) => {
    const stmt = E.persistCachedStatement(
        db,
        'findActive',
        'SELECT id FROM stableIdentities WHERE entityType = ? AND signature = ? AND orphanedAt IS NULL',
    )
    const row = stmt.get(entityType, signature)
    return row ? row.id : null
}

// Lookup stable identity including orphaned ones, returns {id, orphanedAt} or null
// @sig findBySignatureIncludingOrphaned :: (Database, String, String) -> {id, orphanedAt} | null
const findBySignatureIncludingOrphaned = (db, entityType, signature) => {
    const stmt = E.persistCachedStatement(
        db,
        'findAll',
        'SELECT id, orphanedAt FROM stableIdentities WHERE entityType = ? AND signature = ?',
    )
    const row = stmt.get(entityType, signature)
    return row ? { id: row.id, orphanedAt: row.orphanedAt } : null
}

// Mark a stable identity as orphaned with current timestamp
// @sig markOrphaned :: (Database, String) -> void
const markOrphaned = (db, stableId) => {
    const stmt = E.persistCachedStatement(
        db,
        'markOrphaned',
        "UPDATE stableIdentities SET orphanedAt = datetime('now') WHERE id = ?",
    )
    stmt.run(stableId)
}

// Restore an orphaned entity (clear orphanedAt, update lastModifiedAt)
// @sig restoreEntity :: (Database, String) -> void
const restoreEntity = (db, stableId) => {
    const stmt = E.persistCachedStatement(
        db,
        'restore',
        "UPDATE stableIdentities SET orphanedAt = NULL, lastModifiedAt = datetime('now') WHERE id = ?",
    )
    stmt.run(stableId)
}

// Update lastModifiedAt when entity content changes
// @sig touchEntity :: (Database, String) -> void
const touchEntity = (db, stableId) => {
    const stmt = E.persistCachedStatement(
        db,
        'touch',
        "UPDATE stableIdentities SET lastModifiedAt = datetime('now') WHERE id = ?",
    )
    stmt.run(stableId)
}

// Query all orphaned identities for an entity type
// @sig findOrphans :: (Database, String) -> [StableIdentity]
const findOrphans = (db, entityType) => {
    const cols = 'id, entityType, signature, orphanedAt'
    const sql = `SELECT ${cols} FROM stableIdentities WHERE entityType = ? AND orphanedAt IS NOT NULL`
    const stmt = E.persistCachedStatement(db, 'findOrphans', sql)
    return stmt.all(entityType)
}

const StableIdentity = {
    createStableId,
    insertStableIdentity,
    findBySignature,
    findBySignatureIncludingOrphaned,
    markOrphaned,
    restoreEntity,
    touchEntity,
    findOrphans,
}

export { StableIdentity }
