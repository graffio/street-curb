# Phase 1c: Service Account Setup for Firebase Infrastructure Management

## What We're Building
Service account authentication system for SOC2-compliant Firebase infrastructure automation, eliminating manual `firebase login --reauth` requirements.

## Context: SOC2 Infrastructure Phases
**Phase 1a ✅ COMPLETED**: Core Firestore Infrastructure (Tasks 1-3)
- Updated AuditRecord type with regex validation
- Enabled Firestore Database in us-west1
- Deployed Basic Security Rules blocking client access

**Phase 1b 🔲 PENDING**: Audit Data Integration (Tasks 4-5)
- Update audit.js to Write to Firestore
- Create Collection Indexes

**Phase 1c 🔲 CURRENT**: Service Account Authentication (this phase)
- Create Firebase/GCP Service Account
- Configure IAM roles for infrastructure operations
- Update migrations to use service account authentication
- Eliminate manual authentication requirements

## Implementation Requirements

### Service Account Creation

```javascript
// modules/curb-map/migrations/006-create-service-account.js
import { executeShellCommand } from 'modules/cli-migrator'

const createServiceAccount = async (projectId, isDryRun) => {
    console.log(`    [INFO] Creating Firebase infrastructure service account for ${projectId}`)
    
    const serviceAccountName = 'firebase-infrastructure-sa'
    const displayName = 'Firebase Infrastructure Management'
    const serviceAccountEmail = `${serviceAccountName}@${projectId}.iam.gserviceaccount.com`
    
    // Check if service account already exists
    const checkCommand = `gcloud iam service-accounts describe ${serviceAccountEmail} --project=${projectId}`
    
    try {
        await executeShellCommand(checkCommand)
        console.log(`    [SKIP] Service account already exists: ${serviceAccountEmail}`)
        return { status: 'success', output: 'service account already exists' }
    } catch (error) {
        // Service account doesn't exist - create it
    }
    
    if (isDryRun) {
        console.log(`    [DRY-RUN] gcloud iam service-accounts create ${serviceAccountName} --display-name="${displayName}" --project=${projectId}`)
    } else {
        console.log(`    [EXEC] create-firebase-service-account`)
        await executeShellCommand(`gcloud iam service-accounts create ${serviceAccountName} --display-name="${displayName}" --project=${projectId}`)
        console.log(`    [EXEC] Service account created: ${serviceAccountEmail}`)
    }
    
    return { status: 'success', output: 'firebase service account created' }
}

const assignIAMRoles = async (projectId, isDryRun) => {
    console.log(`    [INFO] Assigning IAM roles for Firebase infrastructure management`)
    
    const serviceAccountEmail = `firebase-infrastructure-sa@${projectId}.iam.gserviceaccount.com`
    
    const requiredRoles = [
        'roles/firebase.admin',                    // Firebase Admin access
        'roles/datastore.owner',                   // Firestore database operations
        'roles/securitycenter.admin',              // Security rules management
        'roles/cloudsql.admin',                    // Database administration
        'roles/storage.admin'                      // Cloud Storage access
    ]
    
    for (const role of requiredRoles) {
        if (isDryRun) {
            console.log(`    [DRY-RUN] gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccountEmail}" --role="${role}"`)
        } else {
            console.log(`    [EXEC] assign-iam-role-${role.split('.')[1]}`)
            await executeShellCommand(`gcloud projects add-iam-policy-binding ${projectId} --member="serviceAccount:${serviceAccountEmail}" --role="${role}"`)
        }
    }
    
    if (!isDryRun) {
        console.log(`    [EXEC] IAM roles assigned to service account`)
    }
    
    return { status: 'success', output: 'iam roles assigned' }
}

const generateServiceAccountKey = async (projectId, isDryRun) => {
    console.log(`    [INFO] Generating service account key for automated authentication`)
    
    const serviceAccountEmail = `firebase-infrastructure-sa@${projectId}.iam.gserviceaccount.com`
    const keyFilePath = `service-accounts/${projectId}-firebase-infrastructure-key.json`
    
    if (isDryRun) {
        console.log(`    [DRY-RUN] mkdir -p service-accounts`)
        console.log(`    [DRY-RUN] gcloud iam service-accounts keys create ${keyFilePath} --iam-account=${serviceAccountEmail}`)
        console.log(`    [DRY-RUN] Key would be saved to: ${keyFilePath}`)
    } else {
        console.log(`    [EXEC] create-service-account-directory`)
        await executeShellCommand(`mkdir -p service-accounts`)
        
        console.log(`    [EXEC] generate-service-account-key`)
        await executeShellCommand(`gcloud iam service-accounts keys create ${keyFilePath} --iam-account=${serviceAccountEmail}`)
        
        console.log(`    [EXEC] Service account key generated: ${keyFilePath}`)
        console.log(`    [INFO] IMPORTANT: Secure this key file - it provides full Firebase admin access`)
    }
    
    return { status: 'success', output: `service account key: ${keyFilePath}` }
}

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    if (!projectId) throw new Error('Firebase projectId must be defined')
    
    return [
        {
            id: 'Create Firebase Service Account',
            description: `Create service account for Firebase infrastructure management`,
            canRollback: true,
            execute: async () => await createServiceAccount(projectId, isDryRun),
            rollback: async () => {
                const serviceAccountEmail = `firebase-infrastructure-sa@${projectId}.iam.gserviceaccount.com`
                await executeShellCommand(`gcloud iam service-accounts delete ${serviceAccountEmail} --project=${projectId} --quiet`)
                return { status: 'success', output: 'service account deleted' }
            }
        },
        {
            id: 'Assign IAM Roles',
            description: `Assign Firebase admin roles to service account`,
            canRollback: false,
            execute: async () => await assignIAMRoles(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'iam role rollback not supported' })
        },
        {
            id: 'Generate Service Account Key',
            description: `Generate authentication key for automated deployments`,
            canRollback: false,
            execute: async () => await generateServiceAccountKey(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'key generation rollback not supported' })
        }
    ]
}

export default createCommands
```

### Authentication Integration

```javascript
// modules/curb-map/shared/firebase-auth.js
import { executeShellCommand } from 'modules/cli-migrator'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export const authenticateWithServiceAccount = async (projectId) => {
    const keyFilePath = resolve(`service-accounts/${projectId}-firebase-infrastructure-key.json`)
    
    try {
        // Verify key file exists
        readFileSync(keyFilePath, 'utf8')
        
        // Activate service account
        await executeShellCommand(`gcloud auth activate-service-account --key-file=${keyFilePath}`)
        
        // Set application default credentials
        process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath
        
        console.log(`    [AUTH] Service account authentication active for ${projectId}`)
        return { status: 'success', keyFilePath }
    } catch (error) {
        throw new Error(`Service account authentication failed: ${error.message}`)
    }
}
```

### Updated Migration Pattern
```javascript
// Example: modules/curb-map/migrations/005-deploy-security-rules.js (updated)
import { authenticateWithServiceAccount } from '../shared/firebase-auth.js'

const deploySecurityRules = async (projectId, isDryRun) => {
    console.log(`    [INFO] Starting Firestore security rules deployment for ${projectId}`)

    if (!isDryRun) {
        // Authenticate with service account before Firebase operations
        await authenticateWithServiceAccount(projectId)
    }

    const rulesPath = resolve('firestore.rules')

    // Verify rules file exists
    try {
        readFileSync(rulesPath, 'utf8')
    } catch (error) {
        throw new Error(`Security rules file not found: ${rulesPath}`)
    }

    if (isDryRun) {
        console.log(`    [DRY-RUN] npx firebase use ${projectId}`)
        console.log(`    [DRY-RUN] npx firebase deploy --only firestore:rules`)
    } else {
        console.log(`    [EXEC] set-active-firebase-project`)
        await executeShellCommand(`npx firebase use ${projectId}`)

        console.log(`    [EXEC] deploy-firestore-security-rules`)
        await executeShellCommand(`npx firebase deploy --only firestore:rules`)
        console.log(`    [EXEC] Firestore security rules deployed`)
    }

    return { status: 'success', output: 'firestore security rules deployed' }
}
```

## Security Considerations

### Service Account Key Management
- **Storage**: Keep service account keys in `service-accounts/` directory (gitignored)
- **Access**: Restrict key file permissions to owner only (`chmod 600`)
- **Rotation**: Implement regular key rotation (90-day cycle recommended)
- **Backup**: Secure backup of keys for disaster recovery

### IAM Principle of Least Privilege
- **Minimal Roles**: Only assign roles required for infrastructure operations
- **Project Scoped**: Service accounts are project-specific, not organization-wide
- **Regular Audit**: Review and audit service account permissions quarterly

### SOC2 Compliance Requirements
- **Audit Trail**: All service account operations logged to infrastructure audit logs
- **Access Control**: Service account keys secured with proper access controls
- **Change Management**: Service account creation follows change management process

## Test Requirements
```javascript
// modules/curb-map/test/006-create-service-account.tap.js
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 006-create-service-account.tap.js <config-path>')
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

const checkServiceAccountExists = projectId => {
    try {
        const serviceAccountEmail = `firebase-infrastructure-sa@${projectId}.iam.gserviceaccount.com`
        execSync(`gcloud iam service-accounts describe ${serviceAccountEmail} --project=${projectId}`, {
            stdio: 'pipe'
        })
        return true
    } catch (error) {
        return false
    }
}

const checkServiceAccountKey = projectId => {
    const keyFilePath = resolve(`service-accounts/${projectId}-firebase-infrastructure-key.json`)
    return existsSync(keyFilePath)
}

const checkIAMRoles = projectId => {
    try {
        const serviceAccountEmail = `firebase-infrastructure-sa@${projectId}.iam.gserviceaccount.com`
        const output = execSync(`gcloud projects get-iam-policy ${projectId} --format=json`, {
            encoding: 'utf8',
            stdio: 'pipe'
        })

        const policy = JSON.parse(output)
        const requiredRoles = ['roles/firebase.admin', 'roles/datastore.owner']

        return requiredRoles.every(role => {
            const binding = policy.bindings?.find(b => b.role === role)
            return binding?.members?.includes(`serviceAccount:${serviceAccountEmail}`)
        })
    } catch (error) {
        return false
    }
}

// Get config path from command line
const { config, configPath } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Given the service account configuration', t => {
    t.test('When checking if service account exists', t => {
        const exists = checkServiceAccountExists(projectId)

        if (!exists) {
            t.pass('Then the migration should be run first:')
            t.pass(`  bash/run-migration.sh "${configPath}" migrations/006-create-service-account.js --apply`)
            t.end()
            return
        }

        t.pass('Then Firebase service account should exist')
        t.end()
    })

    t.test('When checking service account IAM roles', t => {
        const exists = checkServiceAccountExists(projectId)

        if (!exists) {
            t.skip('Service account not created')
            t.end()
            return
        }

        const hasRoles = checkIAMRoles(projectId)
        t.equal(hasRoles, true, 'Then service account should have required Firebase admin roles')
        t.end()
    })

    t.test('When checking service account key file', t => {
        const exists = checkServiceAccountExists(projectId)

        if (!exists) {
            t.skip('Service account not created')
            t.end()
            return
        }

        const hasKey = checkServiceAccountKey(projectId)
        t.equal(hasKey, true, 'Then service account key file should exist locally')
        t.end()
    })

    t.end()
})
```

## Success Criteria
- [ ] Service account created with appropriate display name
- [ ] Required IAM roles assigned (Firebase Admin, Datastore Owner, etc.)
- [ ] Service account key generated and stored securely
- [ ] Authentication helper function works correctly
- [ ] Updated migrations use service account authentication
- [ ] No more manual `firebase login --reauth` required
- [ ] All operations maintain SOC2 audit trail

## Files to Create
- `modules/curb-map/migrations/006-create-service-account.js` (service account setup)
- `modules/curb-map/test/006-create-service-account.tap.js` (comprehensive testing)
- `modules/curb-map/shared/firebase-auth.js` (authentication helper)
- `modules/curb-map/service-accounts/` (directory for key storage - gitignored)
- `.gitignore` updates to exclude service account keys

## Security Checklist
- [ ] Service account keys excluded from version control
- [ ] Key file permissions restricted to owner only
- [ ] IAM roles follow principle of least privilege
- [ ] Service account operations logged for SOC2 compliance
- [ ] Key rotation procedure documented
- [ ] Disaster recovery plan for service account access

**Next**: Once service account authentication is established, proceed to Phase 1b (Tasks 4-5) for Firestore audit data integration.

## Anti-Overengineering Guidelines
- **Scope**: Service account setup and authentication ONLY
- **No complex key management systems** - simple file-based approach
- **No automated key rotation** in this phase
- **No multi-project service accounts** - one per Firebase project
- **Focus**: Eliminate manual authentication for infrastructure operations
