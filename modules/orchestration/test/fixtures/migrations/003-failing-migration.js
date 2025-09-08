/*
 * Test Migration 003 - Failing Migration
 *
 * This migration is designed to fail during execution for testing
 * error handling and rollback scenarios.
 */

/**
 * Failing test migration function
 * @sig failingTestMigration :: (String, Object) -> Promise<Array<Command>>
 */
const failingTestMigration = async (environment, config) => [
        {
            id: `failing-${environment}-success`,
            description: `Successful step before failure in ${environment}`,
            canRollback: true,
            execute: async () => ({
                status: 'success',
                output: 'This step succeeds',
                data: { step: 'success', environment },
            }),
            rollback: async () => ({ status: 'success', output: 'Successful step rolled back' }),
        },
        {
            id: `failing-${environment}-failure`,
            description: `Failing step in ${environment}`,
            canRollback: false,
            execute: async () => {
                throw new Error('Intentional test failure')
            },
        },
    ]

export default failingTestMigration
