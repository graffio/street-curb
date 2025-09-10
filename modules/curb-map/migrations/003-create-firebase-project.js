import { createShellCommand } from '@graffio/orchestration'

const createCommands = config => {
    if (!config.firebaseProjectId) throw new Error('Firebase projectId must be defined in the config file')

    /* prettier-ignore */
    const x = ({
        id: 'create-firebase-project',
        description: `Create Firebase project ${config.firebaseProjectId}`,
        canRollback: true,
        execute:  createShellCommand(`firebase projects:create ${config.firebaseProjectId}`,         { errorPatterns: ['Error:', 'permission', 'denied', 'failed'] }),
        rollback: createShellCommand(`firebase projects:delete ${config.firebaseProjectId} --force`, { errorPatterns: ['Error:'                        , 'failed'] }),
    })

    return [x]
}

export default createCommands
