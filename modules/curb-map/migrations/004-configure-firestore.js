import { executeShellCommand } from '@graffio/orchestration'

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
    const createCommand = `gcloud firestore databases create --location=us-west1 --type=firestore-native --project=${projectId}`

    if (isDryRun) {
        console.log(`    [DRY-RUN] ${createCommand}`)
    } else {
        console.log(`    [EXEC] enable-firestore-database`)
        await executeShellCommand(createCommand)
        console.log(`    [EXEC] Firestore database enabled in us-west1`)
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
        },
    ]
}

export default createCommands
