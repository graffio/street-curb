import { Result } from '../../types/result.js'
import { requestJson } from './client.js'

const { Success } = Result

// ---------------------------------------------------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------------------------------------------------

/*
 * List enabled services for a project
 * @sig listServices :: (String, String, Object) -> Promise<Result>
 */
const listServices = async (projectId, description, dryRunConfig) => {
    const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services?filter=state:ENABLED`
    return requestJson({ url, method: 'GET', description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Enable a single service
 * @sig enableService :: (String, String, String, Object) -> Promise<Result>
 */
const enableService = async (projectId, serviceId, description, dryRunConfig) => {
    const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceId}:enable`
    return requestJson({ url, method: 'POST', body: {}, description, dryRunConfig })
}

/*
 * Enable multiple services in batch
 * @sig enableServicesBatch :: (String, [String], String, Object) -> Promise<Result>
 */
const enableServicesBatch = async (projectId, serviceIds, description, dryRunConfig) => {
    const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services:batchEnable`
    return requestJson({ url, method: 'POST', body: { serviceIds }, description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// `ensure` functions check first and do something only if the prerequisite is missing
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Ensure required APIs are enabled
 * @sig ensureApisEnabled :: (String, [String], Object) -> Promise<Result>
 */
const ensureApisEnabled = async (projectId, serviceIds, dryRunConfig) => {
    const description = `Check which services are enabled for project ${projectId}`
    const listResult = await listServices(projectId, description, dryRunConfig)

    if (Result.Failure.is(listResult)) return listResult

    const value = { projectId, serviceIds }
    const enabledServices = listResult.value.services || []
    const enabledServiceNames = enabledServices.map(service => service.name)
    const missingServices = serviceIds.filter(
        serviceId => !enabledServiceNames.includes(`projects/${projectId}/services/${serviceId}`),
    )

    if (missingServices.length === 0)
        return Success(value, 'exists', `All required services already enabled for project ${projectId}`)

    const enableDescription = `Enable missing services for project ${projectId}: ${missingServices.join(', ')}`
    const enableResult = await enableServicesBatch(projectId, missingServices, enableDescription, dryRunConfig)
    return Result.Success.is(enableResult)
        ? Success(value, 'updated', `Enabled services for project ${projectId}`)
        : enableResult
}

export {
    // GET
    listServices,
    // POST
    enableService,
    enableServicesBatch,
    // ensure
    ensureApisEnabled,
}
