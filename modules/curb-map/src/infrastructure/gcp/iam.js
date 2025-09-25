import { Result } from '../../types/result.js'
import { requestJson, runWithDryRun } from './client.js'

const { Success } = Result

// ---------------------------------------------------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------------------------------------------------

/*
 * List service accounts for a project
 * @sig listServiceAccounts :: { projectId: String, description: String, dryRunConfig: Object } -> Promise<Result>
 */
const listServiceAccounts = async (projectId, description, dryRunConfig) => {
    const url = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`
    return requestJson({ url, method: 'GET', description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Create a service account for a project
 * @sig createServiceAccount :: { projectId: String, accountId: String, displayName: String, description: String, dryRunConfig: Object } -> Promise<Result>
 */
const createServiceAccount = async (projectId, accountId, displayName, description, dryRunConfig) => {
    const url = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`
    const body = { accountId, serviceAccount: { displayName } }
    return requestJson({ url, method: 'POST', body, description, dryRunConfig })
}

/*
 * Get IAM policy for a project
 * @sig getProjectIamPolicy :: { projectId: String, description: String, dryRunConfig: Object } -> Promise<Result>
 */
const getProjectIamPolicy = async (projectId, description, dryRunConfig) => {
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`
    return requestJson({ url, method: 'POST', body: {}, description, dryRunConfig })
}

/*
 * Set IAM policy for a project
 * @sig setProjectIamPolicy :: { projectId: String, policy: Object, description: String, dryRunConfig: Object } -> Promise<Result>
 */
const setProjectIamPolicy = async (projectId, policy, description, dryRunConfig) => {
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`
    return requestJson({ url, method: 'POST', body: { policy }, description, dryRunConfig })
}

// ---------------------------------------------------------------------------------------------------------------------
// `ensure` functions check first and do something only if the prequisite is missing
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Ensure a service account exists for the project
 * @sig ensureServiceAccount :: { projectId: String, accountId: String, displayName: String, dryRunConfig: Object } -> Promise<Result>
 */
const ensureServiceAccount = async (projectId, accountId, displayName, dryRunConfig) => {
    const email = `${accountId}@${projectId}.iam.gserviceaccount.com`
    const description = `Check if service account ${accountId} exists in project ${projectId}`
    const listResult = await listServiceAccounts(projectId, description, dryRunConfig)

    if (Result.Failure.is(listResult)) return listResult // Propagate the listing failure

    const accounts = listResult.value.accounts || []
    const exists = accounts.some(account => account.email === email)
    if (exists) return Success({ email }, 'exists', `Service account ${accountId} already exists`)

    const description1 = `Create service account ${accountId} in project ${projectId}`
    const createResult = await createServiceAccount(projectId, accountId, displayName, description1, dryRunConfig)
    return Result.Success.is(createResult)
        ? Success({ email }, 'created', `Service account ${accountId} created`)
        : createResult
}

/*
 * Ensure a project role binding exists
 * @sig ensureProjectRole :: { projectId: String, role: String, member: String, dryRunConfig: Object } -> Promise<Result>
 */
const ensureProjectRole = async (projectId, role, member, dryRunConfig) => {
    const _ensureProjectRole = async () => {
        const addMemberToExistingBindingWithRole = () => binding => {
            if (binding.role !== role) return binding // we only want to add the member to binding for the right role
            return { ...binding, members: [...new Set([...(binding.members || []), member])] }
        }

        const addMemberToNewRole = () => [...bindings, { role, members: [member] }]
        const addMemberToExistingRole = () => bindings.map(addMemberToExistingBindingWithRole)

        const description = `Get current IAM policy for project ${projectId}`
        const policyResult = await getProjectIamPolicy(projectId, description, dryRunConfig)

        if (Result.Failure.is(policyResult)) return policyResult

        const policy = policyResult.value
        const bindings = policy.bindings || []
        const currentMembers = bindings.find(binding => binding.role === role)?.members || []
        const alreadyBound = currentMembers.includes(member)

        if (alreadyBound) return Success({}, 'exists', `Member ${member} already has role ${role}`)

        const doesRoleAlreadyExist = bindings.some(binding => binding.role === role)
        const updatedBindings = doesRoleAlreadyExist ? addMemberToExistingRole() : addMemberToNewRole()
        const updatedPolicy = { ...policy, bindings: updatedBindings }
        const description1 = `Add ${member} to role ${role} in project ${projectId}`
        const setResult = await setProjectIamPolicy(projectId, updatedPolicy, description1, dryRunConfig)

        return Result.Success.is(setResult) ? Success({}, 'updated', `Added ${member} to role ${role}`) : setResult
    }

    return runWithDryRun(`Bind role ${role} to ${member} for project ${projectId}`, _ensureProjectRole, dryRunConfig)
}

export {
    // GET
    listServiceAccounts,
    // POST
    createServiceAccount,
    getProjectIamPolicy,
    setProjectIamPolicy,
    // ensure
    ensureServiceAccount,
    ensureProjectRole,
}
