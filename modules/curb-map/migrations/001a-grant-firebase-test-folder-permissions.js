import { createShellCommand } from '@graffio/orchestration'

// prettier-ignore
const f = {
    grant : id => `gcloud resource-manager folders    add-iam-policy-binding ${id} --member=user:admin@curbmap.app --role=roles/resourcemanager.projectCreator`,
    revoke: id => `gcloud resource-manager folders remove-iam-policy-binding ${id} --member=user:admin@curbmap.app --role=roles/resourcemanager.projectCreator`
}

const createCommands = config => [
    {
        id: 'grant-test-permissions',
        description: 'Grant project creator permissions to Test folder',
        canRollback: true,
        execute: createShellCommand(f.grant(config.testFolderId)),
        rollback: createShellCommand(f.revoke(config.testFolderId)),
    },
]

export default createCommands
