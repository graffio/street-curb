import { createShellCommand } from '../src/shell.js'

// prettier-ignore
const f = (environment, config) => {
    const grant  = id => `gcloud resource-manager folders add-iam-policy-binding ${id} --member=user:admin@curbmap.app --role=roles/resourcemanager.projectCreator`
    const revoke = id => `gcloud resource-manager folders remove-iam-policy-binding ${id} --member=user:admin@curbmap.app --role=roles/resourcemanager.projectCreator`

    return [
        {
            id: 'grant-development-permissions',
            description: 'Grant project creator permissions to Development folder',
            canRollback: true,
            execute: createShellCommand(grant(config.developmentFolderId)),
            rollback: createShellCommand(revoke(config.developmentFolderId)),
        },

        {
            id: 'grant-staging-permissions',
            description: 'Grant project creator permissions to Staging folder',
            canRollback: true,
            execute: createShellCommand(grant(config.stagingFolderId)),
            rollback: createShellCommand(revoke(config.stagingFolderId)),
        },

        {
            id: 'grant-production-permissions',
            description: 'Grant project creator permissions to Production folder',
            canRollback: true,
            execute: createShellCommand(grant(config.productionFolderId)),
            rollback: createShellCommand(revoke(config.productionFolderId)),
        },
    ]
}

export default (environment, config) => f(environment, config)
