import { createShellCommand } from '../src/shell.js'

// prettier-ignore
const createCommand = config => {
    const execute = createShellCommand(
        'firebase', ['projects:create', config.firebaseProjectId],
        { errorPatterns: ['Error:', 'permission', 'denied', 'failed'] }
    )

    const rollback = createShellCommand(
        'firebase', ['projects:delete', config.firebaseProjectId, '--force'],
        { errorPatterns: ['Error:', 'failed'] }
    )
    
    return {
        id: 'create-firebase-project',
        description: `Create Firebase project ${config.firebaseProjectId}`,
        canRollback: true,
        execute,
        rollback,
    }
}

export default (environment, config) => [createCommand(config)]
