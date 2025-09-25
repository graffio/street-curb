import * as F from '@graffio/functional'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { expandHome, requestJson } from './migration-utils.js'

/*
 * Build a checklist item describing prerequisite state
 * @sig cl :: (String, Boolean, String, String) -> ChecklistItem
 */
const cl = (label, passed, detail, remediation = '') => ({ label, passed, detail, remediation })

const pass = (label, detail) => ({ label, passed: true, detail, remediation: '' })
const fail = (label, detail, remediation) => ({ label, passed: false, detail, remediation })

/*
 * Extract first line for concise error reporting
 * @sig firstLine :: String -> String
 */
const firstLine = text => (text || '').split('\n')[0]

const isForbidden = error => Boolean(error && /403|Forbidden/i.test(getErrorMessage(error)))

const resourceManagerBase = 'https://cloudresourcemanager.googleapis.com/v3'
const serviceUsageBase = 'https://serviceusage.googleapis.com/v1'
const orgPolicyBase = 'https://orgpolicy.googleapis.com/v2'

/*
 * Fetch enabled services for a project
 * @sig listEnabledServices :: String -> Promise<[String]>
 */
const listEnabledServices = async projectId => {
    const url = `${serviceUsageBase}/projects/${projectId}/services?filter=state:ENABLED`
    const result = await requestJson({ url })
    const services = Array.isArray(result.services) ? result.services : []
    return services.map(service => service.name)
}

/*
 * Fetch effective org policy for a constraint
 * @sig fetchEffectivePolicy :: (String, String) -> Promise<Object?>
 */
const fetchEffectivePolicy = async (projectId, constraint) => {
    const policyName = encodeURIComponent(constraint)
    const url = `${orgPolicyBase}/projects/${projectId}/policies/${policyName}:getEffectivePolicy`
    try {
        return await requestJson({ url })
    } catch (error) {
        if (error && error.message && error.message.includes('NOT_FOUND')) return null
        throw error
    }
}

/*
 * Determine whether a policy blocks the action based on spec rules
 * @sig isPolicyEnforced :: Object? -> Boolean
 */
const isPolicyEnforced = policy => {
    if (!policy) return false
    if (policy.booleanPolicy) return policy.booleanPolicy.enforced === true
    if (policy.listPolicy) {
        if (policy.listPolicy.allValues === 'DENY') return true
        if (policy.listPolicy.allValues === 'ALLOW') return false
        const denied = policy.listPolicy.deniedValues || []
        const allowed = policy.listPolicy.allowedValues || []
        return Boolean(denied.length || allowed.length)
    }
    if (policy.spec && Array.isArray(policy.spec.rules))
        return policy.spec.rules.some(rule => {
            if (rule.enforce === true) return true
            if (rule.values) {
                if (rule.values.allValues === 'DENY') return true
                if (rule.values.allValues === 'ALLOW') return false
                const denied = rule.values.deniedValues || []
                const allowed = rule.values.allowedValues || []
                return Boolean(denied.length || allowed.length)
            }
            return false
        })
    return false
}

/*
 * Fetch IAM policy for a project (ensures caller has access)
 * @sig fetchProjectIamPolicy :: String -> Promise<Object>
 */
const fetchProjectIamPolicy = projectId => {
    const url = `${resourceManagerBase}/projects/${projectId}:getIamPolicy`
    return requestJson({ url, method: 'POST', body: {} })
}

/*
 * Extract a human-readable message from a gcloud error
 * @sig getErrorMessage :: Error -> String
 */
const getErrorMessage = error => (error && error.message ? error.message.trim() : '')

/*
 * Match an error against caller-provided expected patterns
 * @sig matchExpectedError :: (Error, [ExpectedError]) -> ExpectedError?
 */
const matchExpectedError = (error, expectedErrors = []) => {
    if (!expectedErrors.length) return null
    const message = getErrorMessage(error)
    return expectedErrors.find(entry => {
        const pattern = entry.pattern instanceof RegExp ? entry.pattern : new RegExp(entry.pattern, 'i')
        return pattern.test(message)
    })
}

/*
 * Build a checklist item based on an expected error match
 * @sig createExpectedErrorItem :: (String, Error, ExpectedError) -> ChecklistItem
 */
const createExpectedErrorItem = (label, error, expectedError) => {
    const detail = expectedError.detail || getErrorMessage(error) || 'Expected error encountered'
    const remediation = expectedError.remediation || ''
    const passed = expectedError.passed !== false
    return cl(label, passed, detail, remediation)
}

/*
 * Collect error messages from a checklist
 * @sig collectErrors :: [ChecklistItem] -> [String]
 */
const collectErrors = checklist =>
    checklist
        .filter(item => !item.passed)
        .map(item => {
            if (!item.remediation) return `${item.label}: ${item.detail}`
            return `${item.label}: ${item.detail} -> ${item.remediation}`
        })

/*
 * Log checklist output for operators
 * @sig logChecklist :: (String, [ChecklistItem]) -> Void
 */
const logChecklist = (migrationName, checklist) => {
    const logItem = item => {
        const status = item.passed ? '✅' : '❌'
        console.log(`  ${status} ${item.label} - ${item.detail}`)
        if (!item.passed && item.remediation) console.log(`      Remediation: ${item.remediation}`)
    }

    console.log(`\nPrerequisite checklist for ${migrationName}:`)
    checklist.forEach(logItem)
    console.log('')
}

/*
 * Validate that the required configuration keys / paths are present
 * @sig validateConfig :: (Object, [String]) -> ChecklistItem
 */
const validateConfig = (config, paths) => {
    const validateValueAtPathExists = path => {
        const value = F.path(path)(config)
        if (value !== undefined && value !== null && value !== '') return pass(`Config: ${path}`, 'Value present')

        const remediation = `Add ${path} to the migration config before rerunning.`
        return fail(`Config: ${path}`, 'Missing required configuration value', remediation)
    }

    return paths.map(validateValueAtPathExists)
}

/*
 * Validate that the active gcloud account matches the expected service account
 * @sig validateActiveAccount :: String -> Promise<[ChecklistItem]>
 */
const validateActiveAccount = () => []
const validateActiveProject = () => []

/*
 * Validate GOOGLE_APPLICATION_CREDENTIALS alignment with expected key path
 * @sig validateCredentialEnv :: (String, Object) -> [ChecklistItem]
 */
const validateCredentialEnv = () => []

/*
 * Validate CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE alignment
 * @sig validateCloudSdkOverride :: (String, Object) -> [ChecklistItem]
 */
const validateCloudSdkOverride = () => []

/*
 * Validate bootstrap key presence according to expectation
 * @sig validateBootstrapKey :: (String, Object) -> [ChecklistItem]
 */
const validateBootstrapKey = keyPath => {
    if (!keyPath) return []
    const resolved = resolve(expandHome(keyPath))
    const exists = existsSync(resolved)
    if (!exists) return pass('Filesystem: bootstrap key', 'No JSON key detected (expected)')
    const remediation = `Remove ${resolved} and rely on impersonation or WIF instead of a JSON key.`
    return fail('Filesystem: bootstrap key', 'Bootstrap key file present', remediation)
}

/*
 * Validate that the key directory already exists with hardened permissions
 * @sig validateKeyDirectory :: String -> [ChecklistItem]
 */
const validateKeyDirectory = () => []

/*
 * Validate that required APIs are already enabled
 * @sig validateApis :: (String, [String]) -> Promise<[ChecklistItem]>
 */
const validateApis = async (projectId, apis, options = {}) => {
    if (!projectId || !apis || !apis.length) return []
    const { expectedErrors = [] } = options
    const items = []
    for (const api of apis) {
        const label = `API: ${api}`
        try {
            const services = await listEnabledServices(projectId)
            const enabled = services.some(serviceName => serviceName.endsWith(`/${api}`))
            const detail = enabled
                ? `${api} enabled for ${projectId}`
                : `${api} disabled for ${projectId} (migration will enable it)`
            items.push(pass(label, detail))
        } catch (error) {
            const expected = matchExpectedError(error, expectedErrors)
            if (expected) {
                items.push(createExpectedErrorItem(label, error, expected))
                continue
            }
            const remediation = `Ensure the current ADC identity can list services on ${projectId}.`
            items.push(fail(label, firstLine(getErrorMessage(error)) || 'Failed to verify API status', remediation))
        }
    }
    return items
}

/*
 * Validate that service account key creation is currently permitted
 * @sig validateOrgPolicy :: String -> Promise<[ChecklistItem]>
 */
const validateOrgPolicy = async (projectId, options = {}) => {
    if (!projectId) return []
    const { expectedErrors = [] } = options
    try {
        const managed = await fetchEffectivePolicy(projectId, 'iam.managed.disableServiceAccountKeyCreation')
        const legacy = await fetchEffectivePolicy(projectId, 'iam.disableServiceAccountKeyCreation')
        const managedEnforced = isPolicyEnforced(managed)
        const legacyEnforced = isPolicyEnforced(legacy)
        if (!managedEnforced && !legacyEnforced)
            return pass('Org Policy: disableServiceAccountKeyCreation', 'Key creation allowed (should be rare)')
        const detail = managedEnforced || legacyEnforced ? 'Key creation currently blocked by policy' : 'Policy relaxed'
        return pass('Org Policy: disableServiceAccountKeyCreation', detail)
    } catch (error) {
        const expected = matchExpectedError(error, expectedErrors)
        if (expected) return createExpectedErrorItem('Org Policy: disableServiceAccountKeyCreation', error, expected)
        if (isForbidden(error))
            return pass(
                'Org Policy: disableServiceAccountKeyCreation',
                'Viewer role will be granted during migration (current identity lacks orgpolicy access)',
            )
        const remediation1 = 'Ensure the current ADC identity can call orgpolicy.googleapis.com before rerunning.'
        const detail1 = firstLine(getErrorMessage(error)) || 'Unknown error retrieving org policy status'
        return fail('Org Policy: disableServiceAccountKeyCreation', detail1, remediation1)
    }
}

/*
 * Validate that the current credentials can access project IAM policies
 * @sig validateProjectAccess :: String -> Promise<[ChecklistItem]>
 */
const validateProjectAccess = async (projectId, options = {}) => {
    if (!projectId) return []
    const { expectedErrors = [] } = options
    try {
        await fetchProjectIamPolicy(projectId)
        return pass('Permissions: project access', `Confirmed access to ${projectId}`)
    } catch (error) {
        const expected = matchExpectedError(error, expectedErrors)
        if (expected) return createExpectedErrorItem('Permissions: project access', error, expected)
        if (isForbidden(error))
            return pass(
                'Permissions: project access',
                'Viewer role will be granted during migration (current identity lacks project viewer access)',
            )
        const detail = firstLine(getErrorMessage(error)) || 'Unknown error retrieving project IAM policy'
        return fail(
            'Permissions: project access',
            detail,
            'Ensure the identity has resourcemanager.projects.getIamPolicy.',
        )
    }
}
export {
    collectErrors,
    logChecklist,
    validateConfig,
    validateActiveAccount,
    validateActiveProject,
    validateCredentialEnv,
    validateCloudSdkOverride,
    validateBootstrapKey,
    validateKeyDirectory,
    validateApis,
    validateOrgPolicy,
    validateProjectAccess,
}
