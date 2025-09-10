import { createShellCommand } from '@graffio/orchestration'

const createCommands = config => {
    // prettier-ignore
    const createFolder = nm => `gcloud resource-manager folders create --display-name=${nm} --organization=${(config.organizationId)}`
    const deleteFolder = id => `gcloud resource-manager folders delete ${id}`

    return [
        {
            id: 'create-test-folder',
            description: 'Create Test folder in GCP organization',
            canRollback: true,
            execute: createShellCommand(createFolder('Test')),
            rollback: createShellCommand(deleteFolder(config.testFolderId)),
        },
    ]
}

export default createCommands
