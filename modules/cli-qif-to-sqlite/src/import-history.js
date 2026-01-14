// ABOUTME: Import history tracking for visibility into changes across imports
// ABOUTME: Records imports, entity changes, and prunes old history per D18

import { randomUUID, createHash } from 'crypto'

const HISTORY_RETENTION_COUNT = 20

const T = {
    // Compute file hash for deduplication detection
    // @sig toFileHash :: String -> String
    toFileHash: content => createHash('sha256').update(content).digest('hex').slice(0, 16),

    // Build summary JSON from change counts
    // @sig toSummary :: Object -> String
    toSummary: counts => JSON.stringify(counts),
}

const A = {
    // Get import IDs to prune (older than retention count)
    // @sig collectOldImportIds :: Database -> [String]
    collectOldImportIds: db => {
        const sql = `
            SELECT importId FROM importHistory
            ORDER BY importedAt DESC
            LIMIT -1 OFFSET ?
        `
        return db
            .prepare(sql)
            .all(HISTORY_RETENTION_COUNT)
            .map(row => row.importId)
    },
}

const E = {
    // Record a new import in history
    // @sig recordImport :: (Database, String, Object) -> String
    recordImport: (db, qifContent, changeCounts) => {
        const importId = randomUUID()
        const fileHash = T.toFileHash(qifContent)
        const summary = T.toSummary(changeCounts)
        db.prepare(
            `
            INSERT INTO importHistory (importId, qifFileHash, summary)
            VALUES (?, ?, ?)
        `,
        ).run(importId, fileHash, summary)
        return importId
    },

    // Record a single entity change for an import
    // @sig recordEntityChange :: (Database, String, String, String, String) -> void
    recordEntityChange: (db, stableId, importId, changeType, entityType) =>
        db
            .prepare(
                `
            INSERT OR REPLACE INTO entityChanges (stableId, importId, changeType, entityType)
            VALUES (?, ?, ?, ?)
        `,
            )
            .run(stableId, importId, changeType, entityType),

    // Update lastModifiedAt on stableIdentities when content changes
    // @sig updateLastModified :: (Database, String) -> void
    updateLastModified: (db, stableId) =>
        db
            .prepare(
                `
            UPDATE stableIdentities SET lastModifiedAt = datetime('now') WHERE id = ?
        `,
            )
            .run(stableId),

    // Remove old imports and their changes beyond retention count
    // @sig pruneOldHistory :: Database -> Number
    pruneOldHistory: db => {
        const oldIds = A.collectOldImportIds(db)
        if (oldIds.length === 0) return 0

        const placeholders = oldIds.map(() => '?').join(', ')
        db.prepare(`DELETE FROM entityChanges WHERE importId IN (${placeholders})`).run(...oldIds)
        db.prepare(`DELETE FROM importHistory WHERE importId IN (${placeholders})`).run(...oldIds)
        return oldIds.length
    },

    // Record a change and update lastModified if needed (callback for forEach)
    // @sig recordChange :: (Database, String, Object) -> void
    recordChange: (db, importId, change) => {
        const { changeType, entityType, stableId } = change
        E.recordEntityChange(db, stableId, importId, changeType, entityType)
        if (changeType === 'modified') E.updateLastModified(db, stableId)
    },
}

// Main function to finalize import history after processing
// @sig finalizeImportHistory :: (Database, String, Object, [Object]) -> String
const finalizeImportHistory = (db, qifContent, changeCounts, changes) => {
    const importId = E.recordImport(db, qifContent, changeCounts)
    changes.forEach(change => E.recordChange(db, importId, change))
    E.pruneOldHistory(db)
    return importId
}

const ImportHistory = { finalizeImportHistory, T, A, E, HISTORY_RETENTION_COUNT }

export { ImportHistory }
