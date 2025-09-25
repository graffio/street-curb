import { Result } from '../../types/result.js'
import { requestJson } from './client.js'

const { Success } = Result

// ---------------------------------------------------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Get project billing information
 * @sig getProjectBilling :: (String, String, DryRunConfig) -> Promise<Result>
 */
const getProjectBilling = async (projectId, description, dryRunConfig) => {
    const url = `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`
    return requestJson({ url, method: 'GET', description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Set project billing account
 * @sig setProjectBilling :: (String, String, String, DryRunConfig) -> Promise<Result>
 */
const setProjectBilling = async (projectId, billingAccountId, description, dryRunConfig) => {
    const url = `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`
    const body = { billingAccountName: `billingAccounts/${billingAccountId}`, billingEnabled: true }
    return requestJson({ url, method: 'PUT', body, description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// `ensure` functions check first and do something only if the prerequisite is missing
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Ensure billing account is linked to project
 * @sig ensureBillingLinked :: (String, String, DryRunConfig) -> Promise<Result>
 */
const ensureBillingLinked = async (projectId, billingAccountId, dryRunConfig) => {
    const description = `Check if project ${projectId} has billing linked`
    const getResult = await getProjectBilling(projectId, description, dryRunConfig)

    if (Result.Failure.is(getResult)) return getResult

    const billingInfo = getResult.value
    const currentBillingAccount = billingInfo.billingAccountName
    const targetBillingAccount = `billingAccounts/${billingAccountId}`
    const value = { projectId, billingAccountId }

    if (currentBillingAccount === targetBillingAccount) {
        const message = `Project ${projectId} is already linked to billing account ${billingAccountId}`
        return Success(value, 'exists', message)
    }

    const description2 = `Link billing account ${billingAccountId} to project ${projectId}`
    const result2 = await setProjectBilling(projectId, billingAccountId, description2, dryRunConfig)

    return Result.Success.is(result2)
        ? Success(value, 'updated', `Linked ${projectId} to billing account ${billingAccountId}`)
        : result2
}

export {
    // GET
    getProjectBilling,
    // PUT
    setProjectBilling,
    // ensure
    ensureBillingLinked,
}
