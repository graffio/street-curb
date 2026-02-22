// ABOUTME: Copy-then-replace rollback strategy for safe database imports
// ABOUTME: Copies database before import, replaces on success, discards on error per D16
// COMPLEXITY: function-naming — withRollback is an established higher-order function pattern (like withTransaction)
// COMPLEXITY: export-structure — withRollback is an established higher-order function pattern (like withTransaction)

import { copyFileSync, unlinkSync, existsSync, renameSync } from 'fs'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Generate working copy path from original database path
    // @sig toWorkingCopyPath :: String -> String
    toWorkingCopyPath: dbPath => `${dbPath}.working`,

    // Generate backup path from original database path
    // @sig toBackupPath :: String -> String
    toBackupPath: dbPath => `${dbPath}.backup`,

    // Extract error context for detailed error reporting
    // @sig toErrorContext :: (Error, Object) -> Object
    toErrorContext: (error, progress) => {
        const { currentEntity, currentEntityType, processed, stage, total } = progress
        return {
            message: error.message,
            stack: error.stack,
            entity: currentEntity || undefined,
            entityType: currentEntityType || undefined,
            stage: stage || 'unknown',
            processed: processed || 0,
            total: total || 0,
        }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a progress tracker for detailed error reporting
    // @sig createProgressTracker :: () -> Object
    createProgressTracker: () => ({
        stage: 'initializing',
        currentEntityType: undefined,
        currentEntity: undefined,
        processed: 0,
        total: 0,
    }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Copy database file to working copy
    // @sig copyToWorking :: String -> String
    copyToWorking: dbPath => {
        const workingPath = T.toWorkingCopyPath(dbPath)
        if (existsSync(dbPath)) copyFileSync(dbPath, workingPath)
        return workingPath
    },

    // Replace original with working copy on success
    // @sig replaceOnSuccess :: String -> void
    replaceOnSuccess: dbPath => {
        const workingPath = T.toWorkingCopyPath(dbPath)
        const backupPath = T.toBackupPath(dbPath)

        // Create backup of original
        if (existsSync(dbPath)) renameSync(dbPath, backupPath)

        // Move working copy to original location
        if (existsSync(workingPath)) renameSync(workingPath, dbPath)

        // Remove backup after successful replacement
        if (existsSync(backupPath)) unlinkSync(backupPath)
    },

    // Discard working copy on error, preserving original
    // @sig discardOnError :: String -> void
    discardOnError: dbPath => {
        const workingPath = T.toWorkingCopyPath(dbPath)
        if (existsSync(workingPath)) unlinkSync(workingPath)
    },

    // Remove any leftover temporary files (working copy, backup)
    // @sig removeTemporaryFiles :: String -> void
    removeTemporaryFiles: dbPath => {
        const workingPath = T.toWorkingCopyPath(dbPath)
        const backupPath = T.toBackupPath(dbPath)
        if (existsSync(workingPath)) unlinkSync(workingPath)
        if (existsSync(backupPath)) unlinkSync(backupPath)
    },
}

// Execute an import operation with rollback protection
// @sig withRollback :: (String, Function, Function) -> Object
const withRollback = (dbPath, openDatabase, importFn) => {
    const progress = F.createProgressTracker()
    const workingPath = E.copyToWorking(dbPath)

    const db = openDatabase(workingPath)
    try {
        progress.stage = 'importing'
        const result = importFn(db, progress)
        db.close()
        E.replaceOnSuccess(dbPath)
        return { success: true, result }
    } catch (error) {
        db.close()
        E.discardOnError(dbPath)
        return { success: false, error: T.toErrorContext(error, progress) }
    }
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const Rollback = { withRollback }

export { Rollback }
