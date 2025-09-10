import { createShellCommand } from '@graffio/orchestration'

// prettier-ignore
const f = {
    grant : id => `gcloud resource-manager folders    add-iam-policy-binding ${id} --member=user:admin@curbmap.app --role=roles/resourcemanager.projectCreator`,
    revoke: id => `gcloud resource-manager folders remove-iam-policy-binding ${id} --member=user:admin@curbmap.app --role=roles/resourcemanager.projectCreator`
}

const createCommands = config => [
    {
        id: 'grant-development-permissions',
        description: 'Grant project creator permissions to Development folder',
        canRollback: true,
        execute: createShellCommand(f.grant(config.developmentFolderId)),
        rollback: createShellCommand(f.revoke(config.developmentFolderId)),
    },

    {
        id: 'grant-staging-permissions',
        description: 'Grant project creator permissions to Staging folder',
        canRollback: true,
        execute: createShellCommand(f.grant(config.stagingFolderId)),
        rollback: createShellCommand(f.revoke(config.stagingFolderId)),
    },

    {
        id: 'grant-production-permissions',
        description: 'Grant project creator permissions to Production folder',
        canRollback: true,
        execute: createShellCommand(f.grant(config.productionFolderId)),
        rollback: createShellCommand(f.revoke(config.productionFolderId)),
    },
]

export default createCommands
