/*
 * Firebase Project Migration (002) - Simplified
 * ------------------------------------------------------------
 * Creates a Firebase project with minimal permissions and maximum reliability.
 * Uses Firebase CLI for all heavy lifting to avoid complex API dependencies.
 */

import { getLogger } from '@graffio/cli-migrator/src/logger.js'
import { path } from '@graffio/functional'
import * as PM from '../../src/infrastructure/firebase/project-management.js'

const throwError = e => {
    throw new Error(e)
}

/*
 * Validate prerequisites before creating the Firebase project
 * @sig validatePrerequisites :: (Object) -> Promise<Void>
 */
const validatePrerequisites = async config => {
    const validateConfigPath = p => {
        if (path(p)(config)) getLogger().log(`    config.${p} found`)
        else throw new Error(`Missing config.${p}`)
    }

    const requiredConfigPaths = ['firebaseProject.projectId', 'firebaseProject.displayName']
    requiredConfigPaths.forEach(validateConfigPath)
}

/*
 * Create Firebase project using Firebase CLI (idempotent)
 * @sig createFirebaseProject :: (String, String, String) -> Promise<Void>
 */
const createFirebaseProject = async (projectId, displayName, folderId) => {
    const logger = getLogger()

    const alreadyExists = await PM.doesFirebaseProjectExist(projectId)
    if (alreadyExists) return logger.log(`    ⚠️ Firebase ${projectId} already exists`)

    // Create the Firebase project
    logger.log(`    Creating Firebase project ${projectId}`)
    await PM.createFirebaseProject(projectId, displayName, folderId)

    // Verify creation succeeded
    const nowExists = await PM.doesFirebaseProjectExist(projectId)
    return nowExists
        ? logger.log(`    ✅ Firebase project ${projectId} created and verified`)
        : throwError(`Firebase project ${projectId} creation failed - project not found after creation`)
}

/*
 * Create Firebase project using Firebase CLI (dry-run version)
 * @sig createFirebaseProjectDryRun :: (String) -> Promise<Void>
 */
const createFirebaseProjectDryRun = async projectId => {
    const projectAlreadyExists = await PM.doesFirebaseProjectExist(projectId)
    getLogger().log(
        projectAlreadyExists
            ? `    ⚠️ Firebase ${projectId} already exists`
            : `    ✅ Firebase ${projectId} would be created`,
    )
}

/*
 * Define command list for migration orchestrator
 * @sig createCommands :: (Object, Object?) -> [Command]
 */
const createCommands = config => {
    const { firebaseProject } = config
    const { projectId, displayName } = firebaseProject
    const actualFolderId = config.folderId || config.developmentFolderId

    if (!actualFolderId) throw new Error('Either folderId or developmentFolderId must be specified in config')

    return [
        {
            id: 'Validate Prerequisites',
            description: 'Validate prerequisites before creating the Firebase project',
            canRollback: false,
            execute: () => validatePrerequisites(config),
            dryRun: () => validatePrerequisites(config),
        },
        {
            id: 'Create Firebase Project',
            description: `Create Firebase project ${projectId} with Firebase services`,
            canRollback: false,
            execute: () => createFirebaseProject(projectId, displayName, actualFolderId),
            dryRun: () => createFirebaseProjectDryRun(projectId),
        },
    ]
}

export default createCommands
