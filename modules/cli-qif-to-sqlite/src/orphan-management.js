// ABOUTME: Orphan management utilities for stable identity entities
// ABOUTME: Lists and acknowledges orphaned entities per D10 and D13

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const ORPHAN_QUERY =
    'SELECT id, contentHash, orphanedAt FROM stableIdentities WHERE entityType = ? AND orphanedAt IS NOT NULL'
const ACKNOWLEDGE_SQL =
    "UPDATE stableIdentities SET acknowledgedAt = datetime('now') WHERE id = ? AND orphanedAt IS NOT NULL"

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Query orphaned entities by type from stableIdentities table
// @sig findOrphans :: (Database, String) -> [Object]
const findOrphans = (db, entityType) => db.prepare(ORPHAN_QUERY).all(entityType)

// Mark an orphan as intentionally acknowledged in database
// @sig persistAcknowledge :: (Database, String) -> Boolean
const persistAcknowledge = (db, stableId) => db.prepare(ACKNOWLEDGE_SQL).run(stableId).changes > 0

const OrphanManagement = { findOrphans, persistAcknowledge }

export { OrphanManagement }
