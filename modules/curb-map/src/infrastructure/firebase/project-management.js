import { executeShellCommand } from '@graffio/cli-migrator'

// ---------------------------------------------------------------------------------------------------------------------
// PROJECT MANAGEMENT
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Check if a Firebase project exists by listing all projects
 * @sig doesFirebaseProjectExist :: (String, Object?) -> Promise<Boolean>
 */
const doesFirebaseProjectExist = async (projectId, logger) => {
    const listCommand = `npx firebase projects:list --json`
    const listResult = await executeShellCommand(listCommand, logger)
    const response = JSON.parse(listResult.output)
    const projects = response.result || []

    return projects.some(project => project.projectId === projectId)
}

/*
 * Create a Firebase project using Firebase CLI
 * @sig createFirebaseProject :: (String, String, String, Object?) -> Promise<String>
 */
const createFirebaseProject = async (projectId, displayName, folderId, logger) => {
    const command = `npx firebase projects:create ${projectId} --display-name "${displayName}" --folder ${folderId}`
    const result = await executeShellCommand(command, logger)
    return result.output
}

export { doesFirebaseProjectExist, createFirebaseProject }
