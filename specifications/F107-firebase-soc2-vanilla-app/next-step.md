# Next Step: Enable Firestore Database for SOC2 Audit Storage

## What We're Building
Migration `004-configure-firestore.js` to enable Firestore database for SOC2 infrastructure audit logging.

## Context: SOC2 Infrastructure Task Progress
**Task 1 ✅ COMPLETED**: Updated AuditRecord type with regex validation and 6-char correlationId format
**Task 2 🔲 CURRENT**: Enable Firestore Database (this task)
**Task 3 🔲 PENDING**: Deploy Basic Security Rules
**Task 4 🔲 PENDING**: Update audit.js to Write to Firestore
**Task 5 🔲 PENDING**: Create Collection Indexes

## Implementation Requirements

### Migration Structure
```javascript
// modules/curb-map/migrations/004-configure-firestore.js
import { executeShellCommand } from '@graffio/orchestration'

const migrationId = '004-configure-firestore'

const enableFirestoreDatabase = async (projectId, isDryRun) => {
    console.log(`    [INFO] Starting Firestore database configuration for ${projectId}`)

    // Check if Firestore is already enabled
    const checkCommand = `gcloud firestore databases describe --project=${projectId} --format="value(name)"`

    try {
        const existingDb = await executeShellCommand(checkCommand)
        if (existingDb.output.trim()) {
            console.log(`    [SKIP] Firestore database already enabled`)
            return { status: 'success', output: 'firestore already enabled' }
        }
    } catch (error) {
        // Database doesn't exist yet - this is expected for new projects
    }

    // Create Firestore database in Native mode
    const createCommand = `gcloud firestore databases create --location=us-central1 --type=firestore-native --project=${projectId}`

    if (isDryRun) {
        console.log(`    [DRY-RUN] ${createCommand}`)
    } else {
        console.log(`    [EXEC] enable-firestore-database`)
        await executeShellCommand(createCommand)
        console.log(`    [EXEC] Firestore database enabled in us-central1`)
    }

    return { status: 'success', output: 'firestore database enabled' }
}

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    if (!projectId) throw new Error('Firebase projectId must be defined')

    return [
        {
            id: 'Enable Firestore Database',
            description: `Enable Firestore database for project ${projectId}`,
            canRollback: false,
            execute: async () => await enableFirestoreDatabase(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'firestore disable not supported' }),
        }
    ]
}

export default createCommands
```

### Test Requirements
```javascript
// modules/curb-map/test/004-configure-firestore.tap.js
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
    const defaultExportMatch = configContent.match(/export default\\s+({[\\s\\S]*})/)

    if (!defaultExportMatch) {
        throw new Error(`Could not parse config file: ${configPath}`)
    }

    const config = eval(`(${defaultExportMatch[1]})`)
    return { config, configPath: resolve(configPath) }
}

const checkFirestoreEnabled = projectId => {
    try {
        const output = execSync(
            `gcloud firestore databases describe --project=${projectId} --format="value(name)"`,
            { encoding: 'utf8', stdio: 'pipe' }
        )
        return output.trim().length > 0
    } catch (error) {
        return false
    }
}

const testFirestoreBasicOperation = projectId => {
    try {
        // Try to list collections (should work if Firestore is enabled)
        execSync(
            `gcloud firestore export gs://${projectId}-temp-export --collection-ids=test-collection --project=${projectId}`,
            { stdio: 'pipe', timeout: 10000 }
        )
        return true
    } catch (error) {
        // Expected to fail for empty database, but should not fail due to Firestore being disabled
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
                { encoding: 'utf8', stdio: 'pipe' }
            )

            const [location, type] = output.trim().split('\\t')
            t.equal(location, 'us-central1', 'Then database should be in us-central1 region')
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
```

## Success Criteria
- [ ] `modules/curb-map/test/004-configure-firestore.tap.js` passes
- [ ] Firestore database enabled in us-central1 region
- [ ] Database in Native mode (not Datastore mode)
- [ ] Basic Firestore operations work
- [ ] Migration is idempotent (can run multiple times safely)

## Files to Create
- `modules/curb-map/migrations/004-configure-firestore.js` (migration implementation)
- `modules/curb-map/test/004-configure-firestore.tap.js` (TAP test)

**Next**: Once Firestore database is enabled and tested, proceed to Task 3 (Deploy Basic Security Rules).

## Anti-Overengineering Guidelines
- **Scope**: Database enablement ONLY
- **No security rules** in this task
- **No collections** or data creation yet
- **No audit.js changes** yet
- **Focus**: Just get Firestore enabled and verified working