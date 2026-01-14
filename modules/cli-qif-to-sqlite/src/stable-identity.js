// ABOUTME: Stable identity infrastructure for QIF entity matching across imports
// ABOUTME: Generates prefixed IDs and manages the stableIdentities table

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

const T = {
    // Get next ID from counter table, creating counter row if needed (D23)
    // @sig toNextId :: (Database, String) -> Integer
    toNextId: (db, entityType) => {
        db.prepare('INSERT OR IGNORE INTO stableIdCounters (entityType) VALUES (?)').run(entityType)
        const row = db
            .prepare(
                `
            UPDATE stableIdCounters SET nextId = nextId + 1
            WHERE entityType = ?
            RETURNING nextId - 1 as currentId
        `,
            )
            .get(entityType)
        return row.currentId
    },
}

// Generate a stable ID with entity-type-specific prefix using counter (D23)
// Format: prefix + 12-digit zero-padded number (e.g., txn_000000000001)
// @sig createStableId :: (Database, String) -> String
const createStableId = (db, entityType) => {
    const prefix = PREFIXES[entityType]
    if (!prefix) throw new Error(`Unknown entity type: ${entityType}`)
    const id = T.toNextId(db, entityType)
    return prefix + String(id).padStart(12, '0')
}

// Insert a stable identity record into the database
// @sig insertStableIdentity :: (Database, {id, entityType, signature}) -> void
const insertStableIdentity = (db, { id, entityType, signature }) => {
    const stmt = db.prepare(`
        INSERT INTO stableIdentities (id, entityType, signature)
        VALUES (?, ?, ?)
    `)
    stmt.run(id, entityType, signature)
}

// Lookup stable identity by entityType and signature, returns id or null
// Only returns non-orphaned entities (use findBySignatureIncludingOrphaned for restore logic)
// @sig findBySignature :: (Database, String, String) -> String | null
const findBySignature = (db, entityType, signature) => {
    const stmt = db.prepare(`
        SELECT id FROM stableIdentities
        WHERE entityType = ? AND signature = ? AND orphanedAt IS NULL
    `)
    const row = stmt.get(entityType, signature)
    return row ? row.id : null
}

// Lookup stable identity including orphaned ones, returns {id, orphanedAt} or null
// @sig findBySignatureIncludingOrphaned :: (Database, String, String) -> {id, orphanedAt} | null
const findBySignatureIncludingOrphaned = (db, entityType, signature) => {
    const stmt = db.prepare(`
        SELECT id, orphanedAt FROM stableIdentities
        WHERE entityType = ? AND signature = ?
    `)
    const row = stmt.get(entityType, signature)
    return row ? { id: row.id, orphanedAt: row.orphanedAt } : null
}

// Mark a stable identity as orphaned with current timestamp
// @sig markOrphaned :: (Database, String) -> void
const markOrphaned = (db, stableId) => {
    const stmt = db.prepare(`
        UPDATE stableIdentities SET orphanedAt = datetime('now')
        WHERE id = ?
    `)
    stmt.run(stableId)
}

// Restore an orphaned entity (clear orphanedAt, update lastModifiedAt)
// @sig restoreEntity :: (Database, String) -> void
const restoreEntity = (db, stableId) => {
    const stmt = db.prepare(`
        UPDATE stableIdentities
        SET orphanedAt = NULL, lastModifiedAt = datetime('now')
        WHERE id = ?
    `)
    stmt.run(stableId)
}

// Update lastModifiedAt when entity content changes
// @sig touchEntity :: (Database, String) -> void
const touchEntity = (db, stableId) => {
    const stmt = db.prepare(`
        UPDATE stableIdentities
        SET lastModifiedAt = datetime('now')
        WHERE id = ?
    `)
    stmt.run(stableId)
}

// Query all orphaned identities for an entity type
// @sig findOrphans :: (Database, String) -> [StableIdentity]
const findOrphans = (db, entityType) => {
    const stmt = db.prepare(`
        SELECT id, entityType, signature, orphanedAt FROM stableIdentities
        WHERE entityType = ? AND orphanedAt IS NOT NULL
    `)
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
