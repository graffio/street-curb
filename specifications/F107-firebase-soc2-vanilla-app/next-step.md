# Next Step: Deploy Basic Security Rules for SOC2 Audit Collections

## What We're Building
Migration `005-deploy-security-rules.js` to create Firebase configuration files and deploy Firestore security rules that enforce SOC2 audit data protection.

## Context: SOC2 Infrastructure Task Progress
**Task 1 ✅ COMPLETED**: Updated AuditRecord type with regex validation and 6-char correlationId format
**Task 2 ✅ COMPLETED**: Enable Firestore Database
**Task 3 🔲 CURRENT**: Deploy Basic Security Rules (this task)
**Task 4 🔲 PENDING**: Update audit.js to Write to Firestore
**Task 5 🔲 PENDING**: Create Collection Indexes

## Implementation Requirements

### Firebase Configuration Files

#### firebase.json
```json
// modules/curb-map/firebase.json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### Security Rules Content
```javascript
// modules/curb-map/firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // SOC2 Audit Collections - READ ONLY via service account
    match /infrastructure-audit-logs/{document} {
      // Block ALL client access - only service accounts can write
      allow read, write: if false;
    }

    match /user-audit-logs/{document} {
      // Block ALL client access - only service accounts can write
      allow read, write: if false;
    }

    // Default: Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Migration Structure
```javascript
// modules/curb-map/migrations/005-deploy-security-rules.js
import { executeShellCommand } from '@graffio/orchestration'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const createFirebaseConfig = async (projectId, isDryRun) => {
    console.log(`    [INFO] Creating Firebase configuration files (project-agnostic)`)

    const firebaseJson = {
        firestore: {
            rules: 'firestore.rules'
        }
    }

    const rulesContent = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // SOC2 Audit Collections - READ ONLY via service account
    match /infrastructure-audit-logs/{document} {
      // Block ALL client access - only service accounts can write
      allow read, write: if false;
    }

    match /user-audit-logs/{document} {
      // Block ALL client access - only service accounts can write
      allow read, write: if false;
    }

    // Default: Deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`

    if (isDryRun) {
        console.log(`    [DRY-RUN] Would create firebase.json`)
        console.log(`    [DRY-RUN] Would create firestore.rules`)
    } else {
        console.log(`    [EXEC] create-firebase-config-files`)

        // Write firebase.json (project-agnostic)
        await executeShellCommand(`cat > firebase.json << 'EOF'
${JSON.stringify(firebaseJson, null, 2)}
EOF`)

        // Write firestore.rules (same rules for all projects)
        await executeShellCommand(`cat > firestore.rules << 'EOF'
${rulesContent}EOF`)

        console.log(`    [EXEC] Firebase configuration files created`)
    }

    return { status: 'success', output: 'firebase config files created' }
}

const deploySecurityRules = async (projectId, isDryRun) => {
    console.log(`    [INFO] Starting Firestore security rules deployment for ${projectId}`)

    const rulesPath = resolve('firestore.rules')

    // Verify rules file exists
    try {
        readFileSync(rulesPath, 'utf8')
    } catch (error) {
        throw new Error(`Security rules file not found: ${rulesPath}`)
    }

    if (isDryRun) {
        console.log(`    [DRY-RUN] firebase use ${projectId}`)
        console.log(`    [DRY-RUN] firebase deploy --only firestore:rules`)
        console.log(`    [DRY-RUN] Rules file: ${rulesPath}`)
    } else {
        console.log(`    [EXEC] set-active-firebase-project`)
        await executeShellCommand(`firebase use ${projectId}`)

        console.log(`    [EXEC] deploy-firestore-security-rules`)
        await executeShellCommand(`firebase deploy --only firestore:rules`)
        console.log(`    [EXEC] Firestore security rules deployed`)
    }

    return { status: 'success', output: 'firestore security rules deployed' }
}

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    if (!projectId) throw new Error('Firebase projectId must be defined')

    return [
        {
            id: 'Create Firebase Configuration Files',
            description: `Create Firebase configuration files for project ${projectId}`,
            canRollback: false,
            execute: async () => await createFirebaseConfig(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'firebase config rollback not supported' }),
        },
        {
            id: 'Deploy Firestore Security Rules',
            description: `Deploy Firestore security rules for project ${projectId}`,
            canRollback: false,
            execute: async () => await deploySecurityRules(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'security rules rollback not supported' }),
        }
    ]
}

export default createCommands
```

### Test Requirements
```javascript
// modules/curb-map/test/005-deploy-security-rules.tap.js
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 005-deploy-security-rules.tap.js <config-path>')
        process.exit(1)
    }

    const configContent = readFileSync(configPath, 'utf8')
    const defaultExportMatch = configContent.match(/export default\\s+({[\\s\\S]*})/)

    if (!defaultExportMatch) {
        throw new Error(`Could not parse config file: ${configPath}`)
    }

    // eslint-disable-next-line no-eval
    const config = eval(`(${defaultExportMatch[1]})`)
    return { config, configPath: resolve(configPath) }
}

const checkSecurityRulesDeployed = projectId => {
    try {
        execSync(`firebase use ${projectId}`, { stdio: 'pipe' })
        const output = execSync(`firebase firestore:rules:list --format json`, {
            encoding: 'utf8',
            stdio: 'pipe',
        })
        const rules = JSON.parse(output)
        return rules && rules.length > 0
    } catch (error) {
        return false
    }
}

const testSecurityRulesContent = projectId => {
    try {
        execSync(`firebase use ${projectId}`, { stdio: 'pipe' })
        const output = execSync(`firebase firestore:rules:get`, {
            encoding: 'utf8',
            stdio: 'pipe',
        })

        // Check for our specific SOC2 audit collection rules
        const hasInfrastructureRules = output.includes('infrastructure-audit-logs')
        const hasUserRules = output.includes('user-audit-logs')
        const hasDefaultDeny = output.includes('allow read, write: if false')

        return hasInfrastructureRules && hasUserRules && hasDefaultDeny
    } catch (error) {
        return false
    }
}

const testFirebaseConfigIntegration = projectId => {
    try {
        // Test Firebase CLI can validate our rules file
        execSync(`firebase use ${projectId}`, { stdio: 'pipe' })
        execSync(`firebase firestore:rules:validate`, {
            stdio: 'pipe',
            timeout: 10000,
        })
        return true
    } catch (error) {
        return false
    }
}

const testFirestoreAccessBlocked = async projectId => {
    try {
        // Try to read from audit collection (should fail due to security rules)
        execSync(`gcloud firestore documents list infrastructure-audit-logs --project ${projectId} --limit 1`, {
            stdio: 'pipe',
            timeout: 5000,
        })
        // If this succeeds, rules are not working properly
        return false
    } catch (error) {
        // Expected to fail due to security rules - this is good
        return error.message.includes('PERMISSION_DENIED') || error.message.includes('Missing or insufficient permissions')
    }
}

// Get config path from command line
const { config, configPath } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Given the Firestore security rules configuration', t => {
    t.test('When checking if security rules are deployed', async t => {
        const areDeployed = checkSecurityRulesDeployed(projectId)

        if (!areDeployed) {
            t.pass('Then the migration should be run first:')
            t.pass(`  bash/run-migration.sh "${configPath}" migrations/005-deploy-security-rules.js --apply`)
            t.end()
            return
        }

        t.pass('Then Firestore security rules should be deployed')
        t.end()
    })

    t.test('When verifying security rules content', t => {
        const areDeployed = checkSecurityRulesDeployed(projectId)

        if (!areDeployed) {
            t.skip('Security rules not deployed')
            t.end()
            return
        }

        const hasCorrectRules = testSecurityRulesContent(projectId)
        t.equal(hasCorrectRules, true, 'Then rules should contain SOC2 audit collection protection')
        t.end()
    })

    t.test('When testing security rules enforcement', async t => {
        const areDeployed = checkSecurityRulesDeployed(projectId)

        if (!areDeployed) {
            t.skip('Security rules not deployed')
            t.end()
            return
        }

        const isAccessBlocked = await testFirestoreAccessBlocked(projectId)
        t.equal(isAccessBlocked, true, 'Then client access to audit collections should be blocked')
        t.end()
    })

    t.test('When checking Firebase configuration files exist locally', t => {
        const firebaseJsonPath = resolve('firebase.json')
        const rulesPath = resolve('firestore.rules')

        try {
            // Check firebase.json
            const firebaseJson = JSON.parse(readFileSync(firebaseJsonPath, 'utf8'))
            t.ok(firebaseJson.firestore, 'Then firebase.json should contain firestore configuration')
            t.equal(firebaseJson.firestore.rules, 'firestore.rules', 'Then firebase.json should point to firestore.rules')

            // Check firestore.rules
            const rulesContent = readFileSync(rulesPath, 'utf8')
            t.ok(rulesContent.includes('infrastructure-audit-logs'), 'Then firestore.rules should contain infrastructure audit rules')
            t.ok(rulesContent.includes('user-audit-logs'), 'Then firestore.rules should contain user audit rules')
            t.ok(rulesContent.includes('allow read, write: if false'), 'Then firestore.rules should deny all access')
        } catch (error) {
            t.fail(`Firebase configuration files should exist: ${error.message}`)
        }

        t.end()
    })

    t.test('When testing Firebase CLI integration', t => {
        const projectId = config.firebaseProject?.projectId

        if (!projectId) {
            t.skip('No project ID provided')
            t.end()
            return
        }

        const canValidateRules = testFirebaseConfigIntegration(projectId)
        t.equal(canValidateRules, true, 'Then Firebase CLI should validate our rules configuration')
        t.end()
    })

    t.end()
})
```

## Success Criteria
- [ ] `modules/curb-map/test/005-deploy-security-rules.tap.js` passes
- [ ] Firebase configuration files created (`firebase.json`, `firestore.rules`)
- [ ] Firebase CLI can validate rules configuration using `firebase use`
- [ ] Security rules deployed to Firebase project successfully
- [ ] Client access to audit collections blocked (PERMISSION_DENIED)
- [ ] Rules contain infrastructure-audit-logs and user-audit-logs protection
- [ ] Default deny rule for all other collections
- [ ] Multiple projects can use same configuration without conflicts

## Files to Create
- `modules/curb-map/firebase.json` (Firebase CLI configuration - project-agnostic)
- `modules/curb-map/firestore.rules` (Firestore security rules - universal)
- `modules/curb-map/migrations/005-deploy-security-rules.js` (migration implementation)
- `modules/curb-map/test/005-deploy-security-rules.tap.js` (TAP test)

**Next**: Once security rules are deployed and tested, proceed to Task 4 (Update audit.js to Write to Firestore).

## Anti-Overengineering Guidelines
- **Scope**: Basic security rules ONLY
- **No complex authentication** logic yet
- **No user-specific permissions** - just block all client access
- **No data validation** rules - just access control
- **Focus**: Protect SOC2 audit data from client access