import { createShellCommand } from '../src/core/shell.js'

const f = (environment, config) => {
    // prettier-ignore
    const createFolder = nm => `gcloud resource-manager folders create --display-name=${nm} --organization=${organizationId}`
    const deleteFolder = id => `gcloud resource-manager folders delete ${id}`

    const { organizationId } = config

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

export default (environment, config) => f(environment, config)
