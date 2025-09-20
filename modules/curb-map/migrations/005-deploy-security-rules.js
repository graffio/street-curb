import { executeShellCommand } from '@graffio/orchestration'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const createFirebaseConfig = async (projectId, isDryRun) => {
    console.log(`    [INFO] Creating Firebase configuration files (project-agnostic)`)

    const firebaseJson = { firestore: { rules: 'firestore.rules' } }

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
        console.log(`    [DRY-RUN] npx firebase use ${projectId}`)
        console.log(`    [DRY-RUN] npx firebase deploy --only firestore:rules`)
        console.log(`    [DRY-RUN] Rules file: ${rulesPath}`)
    } else {
        console.log(`    [EXEC] set-active-firebase-project`)
        await executeShellCommand(`npx firebase use ${projectId}`)

        console.log(`    [EXEC] deploy-firestore-security-rules`)
        await executeShellCommand(`npx firebase deploy --only firestore:rules`)
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
        },
        {
            id: 'Deploy Firestore Security Rules',
            description: `Deploy Firestore security rules for project ${projectId}`,
            canRollback: false,
            execute: async () => await deploySecurityRules(projectId, isDryRun),
        },
    ]
}

export default createCommands
