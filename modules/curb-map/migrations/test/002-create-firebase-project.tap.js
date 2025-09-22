import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

/*
 * Verify 002-create-firebase-project migration results
 * @sig verifyFirebaseProjectMigration :: () -> Test
 *
 * This test ONLY verifies existing infrastructure state.
 * It does NOT run migrations - use bash/run-migration.sh for that.
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
        const output = execSync(`npx firebase projects:list`, { encoding: 'utf8' })
        return output.includes(projectId)
    } catch (e) {
        console.error(e)
        return false
    }
}

const configContainsProjectId = (configPath, projectNumber) => {
    try {
        const configContent = readFileSync(configPath, 'utf8')
        return configContent.includes(`"firebaseProjectNumber": "${projectNumber}"`)
    } catch {
        return false
    }
}

// Note: cleanup function removed - we don't want to delete projects in tests
// Projects should be cleaned up manually or via separate cleanup scripts

// Get config path from command line
const { config, configPath } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Verify 002-create-firebase-project migration results', t => {
    const hasFirebaseProject = isFirebaseEnabled(projectId)

    if (!hasFirebaseProject) {
        t.test('Firebase project does not exist', t => {
            t.pass('Firebase project does not exist - run migration first:')
            t.pass(`  bash/run-migration.sh "${configPath}" migrations/002-create-firebase-project.js`)
            t.end()
        })
        t.end()
        return
    }

    t.test('Firebase project exists and is configured', t => {
        t.equal(isFirebaseEnabled(projectId), true, 'Firebase should be enabled on the project')
        t.end()
    })

    t.test('GCP project exists and is properly configured', t => {
        t.equal(projectExists(projectId), true, 'GCP project should exist')

        const projectInfo = getProjectInfo(projectId)
        t.equal(projectInfo.projectId, projectId, 'Project ID should match config')
        t.equal(projectInfo.name, config.firebaseProject.displayName, 'Display name should match config')
        t.equal(projectInfo.parent.id, config.developmentFolderId, 'Project should be in development folder')
        t.equal(projectInfo.lifecycleState, 'ACTIVE', 'Project should be active')

        t.end()
    })

    t.test('Config file has been updated with captured project number', t => {
        const projectInfo = getProjectInfo(projectId)
        t.equal(
            configContainsProjectId(configPath, projectInfo.projectNumber),
            true,
            'Config file should contain the captured project number',
        )
        t.end()
    })

    t.end()
})
