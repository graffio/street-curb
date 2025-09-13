import { shellBuilder } from '@graffio/orchestration'

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    const displayName = config.firebaseProject.displayName
    const folderId = config.developmentFolderId
    const migrationId = '002-create-firebase-project'

    if (!projectId) throw new Error('Firebase projectId must be defined in config.firebaseProject.projectId')
    if (!folderId) throw new Error('developmentFolderId must be defined in config')

    const createGcpProject = async () => {
        await shellBuilder(`gcloud projects create ${projectId} --name='${displayName}' --folder=${folderId}`)
            .forMigration(migrationId, 'create-gcp-project')
            .dryRun(isDryRun)
            .run()

        const result = await shellBuilder(`gcloud projects describe ${projectId} --format="value(projectNumber)"`)
            .forMigration(migrationId, 'get-project-number')
            .dryRun(isDryRun)
            .run()

        if (isDryRun)
            return { status: 'success', output: 'dry-run', capturedIds: { firebaseProjectNumber: '123456789012' } }

        const projectNumber = result.output.trim()
        if (!projectNumber) throw new Error('Failed to retrieve project number')
        console.log(`    [EXEC] Project created with number: ${projectNumber}`)

        return { status: 'success', output: result.output, capturedIds: { firebaseProjectNumber: projectNumber } }
    }

    createGcpProject.rollback = async () =>
        await shellBuilder(`gcloud projects delete ${projectId} --quiet`)
            .forMigration(migrationId, 'rollback-delete-gcp-project')
            .dryRun(isDryRun)
            .run()

    const addFirebaseToProject = async () =>
        await shellBuilder(`firebase projects:addfirebase ${projectId}`)
            .forMigration(migrationId, 'add-firebase-to-project')
            .dryRun(isDryRun)
            .run()

    addFirebaseToProject.rollback = async () => {
        if (isDryRun) {
            console.log('    [DRY-RUN] Firebase deletion handled by project deletion')
            return { status: 'success', output: 'dry-run' }
        }

        console.log('    [ROLLBACK] Firebase deletion handled by project deletion')
        return { status: 'success', output: 'Firebase deletion handled by project deletion' }
    }

    return [
        {
            id: 'Create GCP Project',
            description: `Create GCP project ${projectId} in Development folder`,
            canRollback: true,
            execute: createGcpProject,
            rollback: createGcpProject.rollback,
        },
        {
            id: 'Add Firebase to Project',
            description: `Add Firebase to project ${projectId}`,
            canRollback: true,
            execute: addFirebaseToProject,
            rollback: addFirebaseToProject.rollback,
        },
    ]
}

export default createCommands
