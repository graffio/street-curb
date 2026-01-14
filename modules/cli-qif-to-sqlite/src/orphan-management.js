// ABOUTME: Orphan management utilities for stable identity entities
// ABOUTME: Lists and acknowledges orphaned entities per D10 and D13

const ORPHAN_QUERY =
    'SELECT id, contentHash, orphanedAt FROM stableIdentities WHERE entityType = ? AND orphanedAt IS NOT NULL'
const ACKNOWLEDGE_SQL =
    "UPDATE stableIdentities SET acknowledgedAt = datetime('now') WHERE id = ? AND orphanedAt IS NOT NULL"

const A = {
    // Query orphaned entities by type from stableIdentities table
    // @sig collectOrphans :: (Database, String) -> [Object]
    collectOrphans: (db, entityType) => db.prepare(ORPHAN_QUERY).all(entityType),
}

const E = {
    // Mark an orphan as intentionally acknowledged in database
    // @sig persistAcknowledge :: (Database, String) -> Boolean
    persistAcknowledge: (db, stableId) => db.prepare(ACKNOWLEDGE_SQL).run(stableId).changes > 0,
}

// List all orphaned entities of a given type
// @sig listOrphans :: (Database, String) -> [Object]
const listOrphans = (db, entityType) => A.collectOrphans(db, entityType)

// Acknowledge an orphan so it doesn't appear in warnings
// @sig acknowledgeOrphan :: (Database, String) -> Boolean
const acknowledgeOrphan = (db, stableId) => E.persistAcknowledge(db, stableId)

const OrphanManagement = { listOrphans, acknowledgeOrphan }

export { OrphanManagement }
