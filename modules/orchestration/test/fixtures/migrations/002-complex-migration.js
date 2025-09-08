/*
 * Test Migration 002 - Complex Multi-Command Migration
 *
 * This migration returns multiple commands for testing sequential execution
 * and rollback scenarios.
 */

/**
 * Complex test migration function
 * @sig complexTestMigration :: (String, Object) -> Promise<Array<Command>>
 */
const complexTestMigration = async (environment, config) => [
        {
            id: `complex-${environment}-step-1`,
            description: `First step of complex migration in ${environment}`,
            canRollback: true,
            execute: async () => ({ status: 'success', output: 'Step 1 executed', data: { step: 1, environment } }),
            rollback: async () => ({ status: 'success', output: 'Step 1 rolled back' }),
        },
        {
            id: `complex-${environment}-step-2`,
            description: `Second step of complex migration in ${environment}`,
            canRollback: true,
            execute: async () => ({ status: 'success', output: 'Step 2 executed', data: { step: 2, environment } }),
            rollback: async () => ({ status: 'success', output: 'Step 2 rolled back' }),
        },
    ]

export default complexTestMigration
