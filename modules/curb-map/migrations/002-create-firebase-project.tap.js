import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

/*
 * Test 002-create-firebase-project migration
 * @sig testFirebaseProjectMigration :: () -> Test
 */

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 002-create-firebase-project.tap.js <config-path>')
        process.exit(1)
    }

    const configContent = readFileSync(configPath, 'utf8')
    const defaultExportMatch = configContent.match(/export default\s+({[\s\S]*})/)

    if (!defaultExportMatch) {
        throw new Error(`Could not parse config file: ${configPath}`)
    }

    // eslint-disable-next-line no-eval
    const config = eval(`(${defaultExportMatch[1]})`)
    return { config, configPath: resolve(configPath) }
}

const runMigration = (configPath, args = '') => {
    const migrationPath = resolve('modules/curb-map/migrations/002-create-firebase-project.js')
    return execSync(`node modules/orchestration/src/cli.js ${configPath} ${migrationPath} ${args}`, {
        encoding: 'utf8',
        cwd: process.cwd(),
    })
}

const projectExists = projectId => {
    try {
        execSync(`gcloud projects describe ${projectId}`, { stdio: 'pipe' })
        return true
    } catch {
        return false
    }
}

const getProjectInfo = projectId => {
    const output = execSync(`gcloud projects describe ${projectId} --format=json`, { encoding: 'utf8' })
    return JSON.parse(output)
}

const isFirebaseEnabled = projectId => {
    try {
        const output = execSync(`firebase projects:list --json`, { encoding: 'utf8' })
        const projects = JSON.parse(output)
        return projects.some(p => p.projectId === projectId)
    } catch {
        return false
    }
}

const configContainsProjectId = (configPath, projectId) => {
    try {
        const configContent = readFileSync(configPath, 'utf8')
        return configContent.includes(`"firebaseProjectId": "${projectId}"`)
    } catch {
        return false
    }
}

const cleanup = projectId => {
    try {
        if (projectExists(projectId)) {
            execSync(`gcloud projects delete ${projectId} --quiet`, { stdio: 'pipe' })
        }
    } catch {}
}

// Get config path from command line
const { config, configPath } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Given the 002-create-firebase-project migration', t => {
    t.test('When the migration has not been run yet', t => {
        t.equal(projectExists(projectId), false, 'Then the Firebase project should not exist')
        t.end()
    })

    t.test('When the migration is run in dry-run mode', t => {
        t.test('When running without --apply flag', t => {
            const result = runMigration(configPath)

            t.match(result, /DRY RUN/, 'Then it should indicate dry run execution')
            t.equal(projectExists(projectId), false, 'Then the Firebase project should not be created')
            t.equal(configContainsProjectId(configPath, projectId), false, 'Then the config should not be updated')

            t.end()
        })

        t.end()
    })

    t.test('When the migration is executed with --apply', t => {
        t.test('When running the migration for the first time', t => {
            const result = runMigration(configPath, '--apply')

            t.match(result, /RUNNING/, 'Then it should indicate actual execution')
            t.match(result, /completed successfully/, 'Then it should complete successfully')

            t.test('When checking the created GCP project', t => {
                t.equal(projectExists(projectId), true, 'Then the GCP project should exist')

                const projectInfo = getProjectInfo(projectId)
                t.equal(projectInfo.projectId, projectId, 'Then the project ID should match')
                t.equal(projectInfo.name, config.firebaseProject.displayName, 'Then the display name should match')
                t.equal(
                    projectInfo.parent.id,
                    config.developmentFolderId,
                    'Then it should be in the Development folder',
                )
                t.equal(projectInfo.lifecycleState, 'ACTIVE', 'Then the project should be active')

                t.end()
            })

            t.test('When checking Firebase integration', t => {
                t.equal(isFirebaseEnabled(projectId), true, 'Then Firebase should be enabled on the project')
                t.end()
            })

            t.test('When checking config file updates', t => {
                t.equal(
                    configContainsProjectId(configPath, projectId),
                    true,
                    'Then the config file should contain the captured project ID',
                )
                t.end()
            })

            cleanup(projectId)
            t.end()
        })

        t.end()
    })

    t.test('When the migration is run again on existing project', t => {
        t.test('When running migration twice', t => {
            // First run
            runMigration(configPath, '--apply')

            // Second run should be idempotent
            const result = runMigration(configPath, '--apply')

            t.match(result, /completed successfully/, 'Then the second run should complete successfully')
            t.equal(projectExists(projectId), true, 'Then the project should still exist')

            cleanup(projectId)
            t.end()
        })

        t.end()
    })

    t.test('When the migration is rolled back', t => {
        t.test('When rolling back after successful creation', t => {
            // Create project first
            runMigration(configPath, '--apply')
            t.equal(projectExists(projectId), true, 'Given the project exists')

            // Rollback
            const result = runMigration(configPath, '--rollback --apply')

            t.match(result, /ROLLBACK/, 'Then it should indicate rollback execution')
            t.match(result, /completed successfully/, 'Then rollback should complete successfully')

            // Project should be deleted (or marked for deletion)
            try {
                const projectInfo = getProjectInfo(projectId)
                t.equal(projectInfo.lifecycleState, 'DELETE_REQUESTED', 'Then project should be marked for deletion')
            } catch {
                t.pass('Then project should no longer exist')
            }

            cleanup(projectId)
            t.end()
        })

        t.end()
    })

    t.end()
})
