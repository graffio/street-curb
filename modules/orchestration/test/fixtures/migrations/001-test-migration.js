/*
 * Test Migration 001 - Basic Test Migration
 *
 * This is a test migration file that returns simple command objects
 * for testing the CLI infrastructure.
 */

/**
 * Test migration function
 * @sig testMigration :: (String, Object) -> Promise<Array<Command>>
 */
const testMigration = async (environment, config) => [
        {
            id: `test-${environment}-001`,
            description: `Test migration for ${environment} environment`,
            canRollback: true,
            execute: async () => ({
                status: 'success',
                output: `Test command executed in ${environment}`,
                data: { environment, configReceived: !!config },
            }),
            rollback: async () => ({ status: 'success', output: `Test command rolled back in ${environment}` }),
        },
    ]

export default testMigration
