import { createShellCommand } from '@graffio/orchestration'

const createCommands = config => {
    // prettier-ignore
    const createFolder = nm => `gcloud resource-manager folders create --display-name=${nm} --organization=${(config.organizationId)}`
    const deleteFolder = id => `gcloud resource-manager folders delete ${id}`

    return [
        {
            id: 'create-development-folder',
            description: 'Create Development folder in GCP organization',
            canRollback: true,
            execute: createShellCommand(createFolder('Development')),
            rollback: createShellCommand(deleteFolder(config.developmentFolderId)),
        },

        {
            id: 'create-staging-folder',
            description: 'Create Staging folder in GCP organization',
            canRollback: true,
            execute: createShellCommand(createFolder('Staging')),
            rollback: createShellCommand(deleteFolder(config.stagingFolderId)),
        },

        {
            id: 'create-production-folder',
            description: 'Create Production folder in GCP organization',
            canRollback: true,
            execute: createShellCommand(createFolder('Production')),
            rollback: createShellCommand(deleteFolder(config.productionFolderId)),
        },
    ]
}

export default createCommands
