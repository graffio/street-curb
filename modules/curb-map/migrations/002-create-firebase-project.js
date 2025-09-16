import { shellBuilder } from '@graffio/orchestration'

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    const displayName = config.firebaseProject.displayName
    const folderId = config.developmentFolderId
    const billingAccountId = config.billingAccountId
    const migrationId = '002-create-firebase-project'

    if (!projectId) throw new Error('Firebase projectId must be defined in config.firebaseProject.projectId')
    if (!folderId) throw new Error('developmentFolderId must be defined in config')
    if (!billingAccountId) throw new Error('billingAccountId must be defined in config')

    // Get the project number from GCP
    const getGcpProjectNumber = async () =>
        await shellBuilder(`gcloud projects describe ${projectId} --format="value(projectNumber)"`)
            .forMigration(migrationId, 'get-existing-project-number')
            .dryRun(isDryRun)
            .run()

    const checkExistingProject = async () => {
        try {
            const result = await shellBuilder(`firebase projects:list`)
                .forMigration(migrationId, 'check-existing-firebase-project')
                .dryRun(isDryRun)
                .run()

            if (isDryRun) return null

            // Check if our project ID appears in Firebase projects list
            const hasFirebase = result.output.includes(projectId)
            if (hasFirebase) {
                const gcpResult = await getGcpProjectNumber()
                const projectNumber = gcpResult.output.trim()
                return { output: projectNumber }
            }

            return null
        } catch (error) {
            // If listing fails, assume project doesn't exist
            return null
        }
    }
    const verifyOrConfigureFirebaseProject = async () => {
        const existingProject = await checkExistingProject()

        if (existingProject) {
            const projectNumber = existingProject.output.trim()
            console.log(`    [SKIP] Firebase project ${projectId} already exists with number: ${projectNumber}`)
            return {
                status: 'success',
                output: `firebase project already exists: ${projectNumber}`,
                capturedIds: { firebaseProjectNumber: projectNumber },
            }
        }

        if (isDryRun) {
            console.log(`    [DRY-RUN] Would check for manual Firebase project creation`)
            return { status: 'success', output: 'dry-run', capturedIds: { firebaseProjectNumber: '123456789012' } }
        }

        // Project doesn't exist - provide manual creation instructions
        console.log(`    [MANUAL ACTION REQUIRED] Firebase project ${projectId} does not exist`)
        console.log(``)
        console.log(`    Please create the Firebase project manually:`)
        console.log(`    1. Go to https://console.firebase.google.com`)
        console.log(`    2. Click "Create a project"`)
        console.log(`    3. Enter project ID: ${projectId}`)
        console.log(`    4. Enter display name: ${displayName}`)
        console.log(`    5. Complete the setup wizard`)
        console.log(``)
        console.log(`    After creating the project, re-run this migration to complete configuration.`)
        console.log(``)

        throw new Error(`Manual Firebase project creation required. Project ID: ${projectId}`)
    }

    const moveProjectToFolder = async () => {
        // Check if project is already in correct folder
        try {
            const result = await shellBuilder(`gcloud projects describe ${projectId} --format="value(parent.id)"`)
                .forMigration(migrationId, 'check-current-folder')
                .dryRun(isDryRun)
                .run()

            if (isDryRun) return { status: 'success', output: 'dry-run' }

            const currentFolder = result.output.trim()
            if (currentFolder === folderId) {
                console.log(`    [SKIP] Project ${projectId} already in correct folder: ${folderId}`)
                return { status: 'success', output: 'already in correct folder' }
            }
        } catch (error) {
            // If we can't check current folder, proceed with move attempt
        }

        // Move project to correct folder
        await shellBuilder(`gcloud projects move ${projectId} --folder=${folderId}`)
            .forMigration(migrationId, 'move-project-to-folder')
            .dryRun(isDryRun)
            .run()

        console.log(`    [EXEC] Moved project ${projectId} to folder ${folderId}`)
        return { status: 'success', output: 'project moved to folder' }
    }

    const attachBillingAccount = async () => {
        // Check if billing is already attached
        try {
            const result = await shellBuilder(
                `gcloud billing projects describe ${projectId} --format="value(billingAccountName)"`,
            )
                .forMigration(migrationId, 'check-billing-account')
                .dryRun(isDryRun)
                .run()

            if (isDryRun) return { status: 'success', output: 'dry-run' }

            const currentBilling = result.output.trim()
            if (currentBilling && currentBilling.includes(billingAccountId)) {
                console.log(`    [SKIP] Billing account ${billingAccountId} already attached`)
                return { status: 'success', output: 'billing already attached' }
            }
        } catch (error) {
            // If we can't check billing, proceed with attachment
        }

        // Attach billing account
        await shellBuilder(`gcloud billing projects link ${projectId} --billing-account=${billingAccountId}`)
            .forMigration(migrationId, 'attach-billing-account')
            .dryRun(isDryRun)
            .run()

        console.log(`    [EXEC] Attached billing account ${billingAccountId} to project ${projectId}`)
        return { status: 'success', output: 'billing account attached' }
    }

    const captureProjectNumber = async () => {
        const result = await getGcpProjectNumber()

        if (isDryRun)
            return { status: 'success', output: 'dry-run', capturedIds: { firebaseProjectNumber: '123456789012' } }

        const projectNumber = result.output.trim()
        if (!projectNumber) throw new Error('Failed to retrieve project number')

        console.log(`    [EXEC] Captured project number: ${projectNumber}`)
        return { status: 'success', output: result.output, capturedIds: { firebaseProjectNumber: projectNumber } }
    }

    verifyOrConfigureFirebaseProject.rollback = async () =>
        await shellBuilder(`gcloud projects delete ${projectId} --quiet`)
            .forMigration(migrationId, 'rollback-delete-firebase-project')
            .dryRun(isDryRun)
            .run()

    const checkAPIEnabled = async apiName => {
        try {
            const command = `gcloud services list --enabled --filter="name:${apiName}" --format="value(name)" --project=${projectId}`
            const result = await shellBuilder(command)
                .forMigration(migrationId, `check-${apiName}-enabled`)
                .dryRun(isDryRun)
                .run()

            if (isDryRun) return false

            return result.output.trim().includes(apiName)
        } catch (error) {
            return false
        }
    }

    // Firebase project creation automatically enables firebase.googleapis.com
    // We only need to enable additional APIs if needed
    const enableAdditionApi = async serviceName => {
        const alreadyEnabled = await checkAPIEnabled(serviceName)

        if (alreadyEnabled) return console.log(`    [SKIP] ${serviceName} already enabled`)

        await shellBuilder(`gcloud services enable ${serviceName} --project=${projectId}`)
            .forMigration(migrationId, 'enable-firebase-hosting-api')
            .dryRun(isDryRun)
            .run()
    }

    const enableAdditionalAPIs = async () => {
        await enableAdditionApi('firebasehosting.googleapis.com')
        await enableAdditionApi('cloudfunctions.googleapis.com')
        await enableAdditionApi('firestore.googleapis.com')
        await enableAdditionApi('storage.googleapis.com')
        await enableAdditionApi('cloudbuild.googleapis.com')
        await enableAdditionApi('firebasehosting.googleapis.com')

        return { status: 'success', output: 'Additional Firebase APIs enabled' }
    }

    return [
        {
            id: 'Verify Firebase Project Exists',
            description: `Verify Firebase project ${projectId} exists (manual creation required if not)`,
            canRollback: true,
            execute: verifyOrConfigureFirebaseProject,
            rollback: verifyOrConfigureFirebaseProject.rollback,
        },
        {
            id: 'Move Project to Folder',
            description: `Move project ${projectId} to Development folder`,
            canRollback: false,
            execute: moveProjectToFolder,
            rollback: () => ({ status: 'success', output: 'folder move rollback not needed' }),
        },
        {
            id: 'Attach Billing Account',
            description: `Attach billing account ${billingAccountId} to project ${projectId}`,
            canRollback: false,
            execute: attachBillingAccount,
            rollback: () => ({ status: 'success', output: 'billing detachment not needed' }),
        },
        {
            id: 'Capture Project Number',
            description: `Capture project number for ${projectId}`,
            canRollback: false,
            execute: captureProjectNumber,
            rollback: () => ({ status: 'success', output: 'project number capture rollback not needed' }),
        },
        {
            id: 'Enable Additional Firebase APIs',
            description: `Enable additional Firebase APIs for project ${projectId}`,
            canRollback: false,
            execute: enableAdditionalAPIs,
            rollback: () => ({ status: 'success', output: 'API disabling not needed' }),
        },
    ]
}

export default createCommands
