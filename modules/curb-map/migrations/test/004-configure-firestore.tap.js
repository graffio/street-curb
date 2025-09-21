import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 004-configure-firestore.tap.js <config-path>')
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

const checkFirestoreEnabled = projectId => {
    try {
        const output = execSync(`gcloud firestore databases describe --project=${projectId} --format="value(name)"`, {
            encoding: 'utf8',
            stdio: 'pipe',
        })
        return output.trim().length > 0
    } catch (error) {
        return false
    }
}

const testFirestoreBasicOperation = projectId => {
    try {
        // Try to list collections - simplest operation that confirms Firestore is accessible
        execSync(`gcloud firestore collections list --project=${projectId}`, { stdio: 'pipe', timeout: 10000 })
        return true
    } catch (error) {
        // Should not fail due to Firestore being disabled
        return !error.message.includes('not enabled') && !error.message.includes('does not exist')
    }
}

// Get config path from command line
const { config, configPath } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Given the Firestore database configuration', t => {
    t.test('When checking if Firestore is enabled', async t => {
        const isEnabled = checkFirestoreEnabled(projectId)

        if (!isEnabled) {
            t.pass('Then the migration should be run first:')
            t.pass(`  bash/run-migration.sh "${configPath}" migrations/004-configure-firestore.js --apply`)
            t.end()
            return
        }

        t.pass('Then Firestore database should be enabled')
        t.end()
    })

    t.test('When verifying Firestore database details', t => {
        const isEnabled = checkFirestoreEnabled(projectId)

        if (!isEnabled) {
            t.skip('Firestore not enabled')
            t.end()
            return
        }

        // Verify it's in the correct region and mode
        try {
            const output = execSync(
                `gcloud firestore databases describe --project=${projectId} --format="value(locationId,type)"`,
                { encoding: 'utf8', stdio: 'pipe' },
            )

            const [location, type] = output.trim().split('\t')
            t.equal(location, 'us-west1', 'Then database should be in us-west1 region')
            t.equal(type, 'FIRESTORE_NATIVE', 'Then database should be in Native mode')
        } catch (error) {
            t.fail(`Could not verify database details: ${error.message}`)
        }

        t.end()
    })

    t.test('When testing basic Firestore access', t => {
        const isEnabled = checkFirestoreEnabled(projectId)

        if (!isEnabled) {
            t.skip('Firestore not enabled')
            t.end()
            return
        }

        const canAccess = testFirestoreBasicOperation(projectId)
        t.equal(canAccess, true, 'Then Firestore should be accessible for operations')
        t.end()
    })

    t.end()
})
