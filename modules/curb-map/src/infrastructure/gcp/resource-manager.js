import { Result } from '../../types/result.js'
import { requestJson } from './client.js'

const { Success } = Result

// ---------------------------------------------------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Get project details
 * @sig getProject :: (String, String, Object) -> Promise<Result>
 */
const getProject = async (projectId, description, dryRunConfig) => {
    const url = `https://cloudresourcemanager.googleapis.com/v3/projects/${projectId}`
    return requestJson({ url, method: 'GET', description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Create a new project
 * @sig createProject :: (String, String, String, String, Object) -> Promise<Result>
 */
const createProject = async (projectId, name, folderId, description, dryRunConfig) => {
    const url = 'https://cloudresourcemanager.googleapis.com/v3/projects'
    const body = { projectId, displayName: name, parent: `folders/${folderId}` }
    return requestJson({ url, method: 'POST', body, description, dryRunConfig })
}

/*
 * Move project to a different folder
 * @sig moveProject :: (String, String, String, Object) -> Promise<Result>
 */
const moveProject = async (projectId, folderId, description, dryRunConfig) => {
    const url = `https://cloudresourcemanager.googleapis.com/v3/projects/${projectId}:move`
    const body = { destinationParent: `folders/${folderId}` }
    return requestJson({ url, method: 'POST', body, description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// `ensure` functions check first and do something only if the prerequisite is missing
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Ensure a project exists
 * @sig ensureProject :: (String, String, String, Object) -> Promise<Result>
 */
const ensureProject = async (projectId, name, folderId, dryRunConfig) => {
    const description = `Check if project ${projectId} exists`
    const getResult = await getProject(projectId, description, dryRunConfig)

    if (Result.Success.is(getResult))
        return Success({ projectId, name }, 'exists', `Project ${projectId} already exists`)

    const description2 = `Create project ${projectId} in folder ${folderId}`
    const result2 = await createProject(projectId, name, folderId, description2, dryRunConfig)
    return Result.Success.is(result2)
        ? Success({ projectId, name }, 'created', `Project ${projectId} created`)
        : result2
}

/*
 * Ensure project is in the correct folder
 * @sig ensureProjectInFolder :: (String, String, Object) -> Promise<Result>
 */
const ensureProjectInFolder = async (projectId, folderId, dryRunConfig) => {
    const description = `Check if project ${projectId} is in folder ${folderId}`
    const getResult = await getProject(projectId, description, dryRunConfig)

    if (Result.Failure.is(getResult)) return getResult

    const project = getResult.value
    const currentParent = project.parent
    const targetParent = `folders/${folderId}`

    if (currentParent === targetParent)
        return Success({ projectId, folderId }, 'exists', `Project ${projectId} already in folder ${folderId}`)

    const description2 = `Move project ${projectId} to folder ${folderId}`
    const result2 = await moveProject(projectId, folderId, description2, dryRunConfig)
    return Result.Success.is(result2)
        ? Success({ projectId, folderId }, 'updated', `Project ${projectId} moved to folder ${folderId}`)
        : result2
}

export {
    // GET
    getProject,
    // POST
    createProject,
    moveProject,
    // ensure
    ensureProject,
    ensureProjectInFolder,
}
