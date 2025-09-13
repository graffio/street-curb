import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import tap from 'tap'

/*
 * Test orchestration core config-as-output functionality
 * @sig testConfigAsOutput :: () -> Test
 */

const createTempConfig = (content, timestamp = '2025-09-11-143022') => {
    const configPath = join(process.cwd(), `test-config.${timestamp}.config.js`)
    writeFileSync(configPath, `export default ${JSON.stringify(content, null, 2)}`)
    return configPath
}

const createTempMigration = (shouldCaptureIds = false) => {
    const migrationContent = `
        export default async function(config) {
            return [{
                id: 'test-command',
                description: 'Test command that generates IDs',
                canRollback: false,
                execute: async () => {
                    const output = 'Created folder with ID: 464059598701\\nSome other output\\nTemp resource: temp-123'
                    
                    const result = {
                        status: 'success',
                        output: output,
                        duration: 100
                    }
                    
                    // Migration decides what IDs to capture from its own output
                    if (${JSON.stringify(shouldCaptureIds)}) {
                        const folderId = output.match(/Created folder with ID: (\\d+)/)?.[1]
                        if (folderId) {
                            result.capturedIds = { developmentFolderId: folderId }
                        }
                    }
                    
                    return result
                },
                rollback: async () => ({ status: 'success', output: 'No rollback needed' })
            }]
        }`

    const migrationPath = join(process.cwd(), 'test-migration.js')
    writeFileSync(migrationPath, migrationContent)
    return migrationPath
}

const cleanup = paths =>
    paths.forEach(path => {
        try {
            unlinkSync(path)
        } catch {}
    })

tap.test('Given the enhanced orchestration core', t => {
    t.test('When a migration returns capturedIds in its result', t => {
        const originalConfig = { organizationId: '404973578720' }

        const configPath = createTempConfig(originalConfig)
        const migrationPath = createTempMigration(true) // shouldCaptureIds = true

        t.test('When the migration is executed with --apply', async t => {
            // This would use the enhanced CLI that supports config updates
            const { execSync } = await import('child_process')

            try {
                execSync(`node src/cli.js ${configPath} ${migrationPath} --apply`, { encoding: 'utf8' })

                t.test('Then the config file should be updated with generated IDs', t => {
                    const updatedConfigContent = readFileSync(configPath, 'utf8')
                    // eslint-disable-next-line no-eval
                    const configModule = eval(`(${updatedConfigContent.replace('export default', '')})`)

                    t.equal(
                        configModule.organizationId,
                        originalConfig.organizationId,
                        'Should preserve original config',
                    )
                    t.equal(
                        configModule.developmentFolderId,
                        '464059598701',
                        'Should add folder ID returned in migration capturedIds',
                    )
                    t.end()
                })

                t.end()
            } finally {
                cleanup([configPath, migrationPath])
            }
        })

        t.end()
    })

    t.test('When a migration has a corresponding test file', t => {
        const configPath = createTempConfig({ organizationId: '404973578720' })
        const migrationPath = createTempMigration(false)
        const testPath = join(process.cwd(), 'test-migration.tap.js')

        // Create corresponding test file
        const testContent = `
            import tap from 'tap'
            tap.test('Given test migration', t => {
                t.pass('Test should run automatically after migration')
                t.end()
            })`

        writeFileSync(testPath, testContent)

        t.test('When the migration is executed', async t => {
            const { execSync } = await import('child_process')

            try {
                const result = execSync(`node src/cli.js ${configPath} ${migrationPath} --apply`, { encoding: 'utf8' })

                t.match(
                    result,
                    /Running tests for.*test-migration/,
                    'Then it should automatically run the corresponding test',
                )
                t.match(result, /Tests passed/, 'Then the test results should be reported')
                t.end()
            } finally {
                cleanup([configPath, migrationPath, testPath])
            }
        })

        t.end()
    })

    t.test('When multiple migrations are run sequentially', t => {
        const configPath = createTempConfig({ organizationId: '404973578720' })

        t.test('When the first migration captures IDs and the second migration needs them', async t => {
            // Create a second migration that actually logs the config it receives
            const createSecondMigration = () => {
                const migrationContent = `
                    export default async function(config) {
                        console.log('Second migration config:', JSON.stringify(config, null, 2))
                        return [{
                            id: 'second-command',
                            description: 'Command that uses config from first migration',
                            canRollback: false,
                            execute: async () => ({
                                status: 'success',
                                output: 'Config received: ' + JSON.stringify(config),
                                duration: 50
                            }),
                            rollback: async () => ({ status: 'success', output: 'No rollback needed' })
                        }]
                    }`

                const migrationPath = join(process.cwd(), 'test-migration-2.js')
                writeFileSync(migrationPath, migrationContent)
                return migrationPath
            }

            const migration1Path = createTempMigration(true) // Captures IDs
            const migration2Path = createSecondMigration() // Uses config

            try {
                const { execSync } = await import('child_process')

                // Run first migration
                execSync(`node src/cli.js ${configPath} ${migration1Path} --apply`, { encoding: 'utf8' })

                // Second migration should receive updated config with first migration's IDs
                const result = execSync(`node src/cli.js ${configPath} ${migration2Path} --apply`, { encoding: 'utf8' })

                t.match(
                    result,
                    /developmentFolderId.*464059598701/,
                    'Then the second migration should receive the generated IDs from the first',
                )
                t.end()
            } finally {
                cleanup([configPath, migration1Path, migration2Path])
            }
        })

        t.end()
    })

    t.test('When using timestamped config files', t => {
        const timestamp = '2025-09-11-143022'
        const originalConfig = { organizationId: '404973578720' }

        t.test('When creating a timestamped config', t => {
            const configPath = createTempConfig(originalConfig, timestamp)

            t.ok(configPath.includes(timestamp), 'Then the config file should include the timestamp')
            t.ok(configPath.endsWith('.config.js'), 'Then the config file should have the correct extension')

            cleanup([configPath])
            t.end()
        })

        t.end()
    })

    t.end()
})
