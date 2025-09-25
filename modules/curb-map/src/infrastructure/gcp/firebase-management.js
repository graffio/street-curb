import { Result } from '../../types/result.js'
import { requestJson } from './client.js'

const { Success } = Result

// ---------------------------------------------------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Get Firebase project information
 * @sig getFirebaseProject :: (String, String, Object) -> Promise<Result>
 */
const getFirebaseProject = async (projectId, description, dryRunConfig) => {
    const url = `https://firebase.googleapis.com/v1beta1/projects/${projectId}`
    return requestJson({ url, method: 'GET', description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Add Firebase to a project
 * @sig addFirebaseToProject :: (String, String, Object) -> Promise<Result>
 */
const addFirebaseToProject = async (projectId, description, dryRunConfig) => {
    const url = `https://firebase.googleapis.com/v1beta1/projects/${projectId}:addFirebase`
    return requestJson({ url, method: 'POST', body: {}, description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// `ensure` functions check first and do something only if the prerequisite is missing
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Ensure Firebase is enabled for the project
 * @sig ensureFirebaseEnabled :: (String, Object) -> Promise<Result>
 */
const ensureFirebaseEnabled = async (projectId, dryRunConfig) => {
    const description = `Check if Firebase is enabled for project ${projectId}`
    const getResult = await getFirebaseProject(projectId, description, dryRunConfig)

    if (Result.Success.is(getResult))
        return Success({ projectId }, 'exists', `Firebase already enabled for project ${projectId}`)

    const description2 = `Enable Firebase for project ${projectId}`
    const result2 = await addFirebaseToProject(projectId, description2, dryRunConfig)
    return Result.Success.is(result2)
        ? Success({ projectId }, 'created', `Firebase enabled for project ${projectId}`)
        : result2
}

export {
    // GET
    getFirebaseProject,
    // POST
    addFirebaseToProject,
    // ensure
    ensureFirebaseEnabled,
}
