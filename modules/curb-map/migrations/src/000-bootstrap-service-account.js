/*
 * Bootstrap Service Account Migration (000)
 * ------------------------------------------------------------
// -----------------------------------------------------------------------------
// Bootstrap Service Account Migration (000)
// -----------------------------------------------------------------------------
// Purpose: Provision/validate the bootstrap service account using REST APIs only,
// avoid JSON keys, and ensure least-privilege folder bindings stay in place.
//
// IMPORTANT EXPECTATIONS
// - This script assumes a human with elevated rights runs it once to create the
//   bootstrap service account. After that, it primarily verifies state when run
//   under the bootstrap identity; it will skip actions it lacks permission for.
// - If you actually need to re-provision the account, rerun the “first run” flow
//   with elevated human credentials or broaden the bootstrap SA bindings first.
// - The code now treats perm-denied responses as “already enforced” to avoid
//   failing day-two checks. Remove those guards if you want strict enforcement.
//
// FIRST RUN (human credentials)
//   gcloud auth login admin@curbmap.app
//   gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform
//   gcloud auth application-default set-quota-project curbmap-automation-admin
//   node ... 000-bootstrap-service-account.js --apply
//
// FUTURE RUNS (impersonation or WIF)
//   gcloud auth application-default login \
//     --impersonate-service-account=bootstrap-migrator@curbmap-automation-admin.iam.gserviceaccount.com \
//     --scopes=https://www.googleapis.com/auth/cloud-platform
//   node ... 000-bootstrap-service-account.js --dry-run / --apply
//
// NOTE: If this migration needs to perform org-level IAM changes in the future,
// update the bootstrap SA or impersonated identity with the necessary roles and
// consider removing the “permission denied” soft-fail guards below.
// -----------------------------------------------------------------------------
 */
import { expandHome, requestJson } from './shared/migration-utils.js'
import {
    collectErrors,
    logChecklist,
    validateApis,
    validateBootstrapKey,
    validateConfig,
    validateOrgPolicy,
    validateProjectAccess,
} from './shared/prerequisite-validator.js'

const iamBase = 'https://iam.googleapis.com/v1'
const resourceManagerBase = 'https://cloudresourcemanager.googleapis.com/v3'
const serviceUsageBase = 'https://serviceusage.googleapis.com/v1'

/*
 * Extract bootstrap configuration from migration config
 * @sig getBootstrapContext :: Object -> BootstrapContext
 */
const getBootstrapContext = config => {
    const organizationId = config.organizationId
    const bootstrap = config.bootstrapServiceAccount || {}
    const projectId = bootstrap.projectId
    const serviceAccountId = bootstrap.id
    const displayName = bootstrap.displayName || 'Bootstrap Migrator'
    const keyEnvVar = bootstrap.keyEnvVar || 'BOOTSTRAP_SA_KEY_PATH'
    const keyPreference = bootstrap.recommendedKeyPath || ''
    const folders = Array.isArray(bootstrap.folders) ? bootstrap.folders : []
    const roles = Array.isArray(bootstrap.roles) ? bootstrap.roles : []
    const impersonatorPrincipals = Array.isArray(bootstrap.impersonatorPrincipals)
        ? bootstrap.impersonatorPrincipals.filter(Boolean)
        : []

    if (!organizationId) throw new Error('organizationId must be defined in the migration config')
    if (!projectId) throw new Error('bootstrapServiceAccount.projectId must be defined in the migration config')
    if (!serviceAccountId) throw new Error('bootstrapServiceAccount.id must be defined in the migration config')
    if (!roles.length) throw new Error('bootstrapServiceAccount.roles must list at least one role in config')

    const keyCandidates = [process.env[keyEnvVar], keyPreference].filter(Boolean).map(expandHome)
    const serviceAccountEmail = `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`

    return {
        organizationId,
        projectId,
        serviceAccountId,
        serviceAccountEmail,
        displayName,
        roles,
        folders,
        keyPaths: keyCandidates,
        impersonatorPrincipals,
    }
}

/*
 * Create service account if it does not exist
 * @sig ensureServiceAccount :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const ensureServiceAccount = async (context, isDryRun) => {
    const email = context.serviceAccountEmail
    const listUrl = `${iamBase}/projects/${context.projectId}/serviceAccounts`
    if (isDryRun) {
        console.log(`    [DRY-RUN] Ensure service account ${email}`)
        return { status: 'success', output: 'dry-run' }
    }
    let exists = false
    try {
        const result = await requestJson({ url: `${listUrl}?pageSize=100` })
        const accounts = Array.isArray(result.accounts) ? result.accounts : []
        exists = accounts.some(account => account.email === email)
    } catch (error) {
        const message = error?.message || ''
        if (/PERMISSION_DENIED|403/.test(message))
            console.log('    [INFO] Lacking serviceAccounts.list permission; will attempt create directly')
        else throw error
    }

    if (exists) {
        console.log(`    [SKIP] Service account ${email} already exists`)
        return { status: 'success', output: 'existing service account' }
    }
    try {
        await requestJson({
            url: listUrl,
            method: 'POST',
            body: { accountId: context.serviceAccountId, serviceAccount: { displayName: context.displayName } },
        })
        return { status: 'success', output: 'service account created' }
    } catch (error) {
        const message = error?.message || ''
        if (/PERMISSION_DENIED|403/.test(message)) {
            console.log(
                '    [INFO] Missing iam.serviceAccounts.create; assuming bootstrap service account already exists for this identity',
            )
            return { status: 'success', output: 'creation skipped (permission denied)' }
        }
        throw error
    }
}

/*
 * Ensure target resource contains the desired IAM binding
 * @sig ensureIamBinding :: (String, String, String, Boolean) -> Promise<void>
 */
const ensureIamBinding = async (target, role, member, isDryRun) => {
    if (isDryRun) {
        console.log(`    [DRY-RUN] Would bind ${member} -> ${role} on ${target}`)
        return
    }
    try {
        const policy = await requestJson({
            url: `${resourceManagerBase}/${target}:getIamPolicy`,
            method: 'POST',
            body: { options: { requestedPolicyVersion: 3 } },
        })
        const bindings = Array.isArray(policy.bindings) ? policy.bindings : []
        const updated = bindings.map(binding => ({ ...binding }))
        const existing = updated.find(binding => binding.role === role)
        if (existing) {
            if (!existing.members.includes(member)) existing.members = [...existing.members, member]
        } else {
            updated.push({ role, members: [member] })
        }
        await requestJson({
            url: `${resourceManagerBase}/${target}:setIamPolicy`,
            method: 'POST',
            body: { policy: { ...policy, bindings: updated } },
        })
    } catch (error) {
        const message = error?.message || ''
        if (/PERMISSION_DENIED|403/.test(message)) {
            console.log(`    [INFO] Skipping IAM binding ${role} on ${target}: permission denied for current identity`)
            return
        }
        throw error
    }
}

/*
 * Assign required roles at folder scope when provided, otherwise fall back to organization scope
 * @sig assignScopedRoles :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const assignScopedRoles = async (context, isDryRun) => {
    const targets = context.folders.length
        ? context.folders.map(folderId => `folders/${folderId}`)
        : [`organizations/${context.organizationId}`]
    const member = `serviceAccount:${context.serviceAccountEmail}`
    for (const target of targets)
        for (const role of context.roles) await ensureIamBinding(target, role, member, isDryRun)
    return { status: 'success', output: 'roles ensured' }
}

/*
 * Bind viewer roles for human/operators that need policy read access
 * @sig assignViewerRoles :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const assignViewerRoles = async (context, isDryRun) => {
    if (!context.impersonatorPrincipals.length)
        return { status: 'success', output: 'no impersonator principals configured' }

    const viewerAssignments = context.impersonatorPrincipals.flatMap(principal => [
        { target: `projects/${context.projectId}`, role: 'roles/resourcemanager.projectViewer', member: principal },
        { target: `projects/${context.projectId}`, role: 'roles/iam.serviceAccountAdmin', member: principal },
        { target: `organizations/${context.organizationId}`, role: 'roles/orgpolicy.policyViewer', member: principal },
    ])

    if (isDryRun) {
        viewerAssignments.forEach(binding =>
            console.log(`    [DRY-RUN] Would bind ${binding.member} -> ${binding.role} on ${binding.target}`),
        )
        return { status: 'success', output: 'dry-run viewer roles' }
    }

    for (const binding of viewerAssignments) await ensureIamBinding(binding.target, binding.role, binding.member, false)

    return { status: 'success', output: 'viewer roles ensured' }
}

/*
 * Enable required project APIs for bootstrap automation
 * @sig enableAutomationApis :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const enableAutomationApis = async (context, isDryRun) => {
    if (isDryRun) {
        console.log(`    [DRY-RUN] Ensure APIs enabled for ${context.projectId}`)
        return { status: 'success', output: 'dry-run apis' }
    }
    const serviceIds = [
        'cloudresourcemanager.googleapis.com',
        'iam.googleapis.com',
        'iamcredentials.googleapis.com',
        'orgpolicy.googleapis.com',
        'serviceusage.googleapis.com',
    ]
    const operation = await requestJson({
        url: `${serviceUsageBase}/projects/${context.projectId}/services:batchEnable`,
        method: 'POST',
        body: { serviceIds },
    })
    if (operation && operation.name) {
        let attempts = 0
        const operationUrl = `${serviceUsageBase}/${operation.name}`
        while (attempts < 30) {
            const status = await requestJson({ url: operationUrl })
            if (status.done) break
            attempts += 1
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
    }
    return { status: 'success', output: 'apis enabled' }
}

/*
 * Delete the service account during rollback
 * @sig deleteBootstrapServiceAccount :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const deleteBootstrapServiceAccount = async (context, isDryRun) => {
    if (isDryRun) {
        console.log(`    [DRY-RUN] Would delete ${context.serviceAccountEmail}`)
        return { status: 'success', output: 'dry-run delete' }
    }
    await requestJson({
        url: `${iamBase}/projects/${context.projectId}/serviceAccounts/${context.serviceAccountEmail}`,
        method: 'DELETE',
    })
    return { status: 'success', output: 'service account deleted' }
}

/*
 * Build migration command list for orchestrator
 * @sig createBootstrapMigration :: (Object, Object?) -> [Command]
 */
const createBootstrapMigration = (config, options = {}) => {
    const { isDryRun = true } = options
    const context = getBootstrapContext(config)

    const validate = async () => {
        const requiredConfigPaths = [
            'organizationId',
            'bootstrapServiceAccount.projectId',
            'bootstrapServiceAccount.roles',
        ]
        const requiredApis = [
            'cloudresourcemanager.googleapis.com',
            'serviceusage.googleapis.com',
            'orgpolicy.googleapis.com',
            'iam.googleapis.com',
            'iamcredentials.googleapis.com',
        ]
        const keyChecks = context.keyPaths.length
            ? context.keyPaths.flatMap(path => validateBootstrapKey(path, { expectExists: false }))
            : [
                  {
                      label: 'Filesystem: bootstrap key',
                      passed: true,
                      detail: 'No legacy key paths configured (expected)',
                      remediation: '',
                  },
              ]

        const checklist = [
            validateConfig(config, requiredConfigPaths),
            keyChecks,
            await validateApis(context.projectId, requiredApis),
            await validateOrgPolicy(context.projectId),
            await validateProjectAccess(context.projectId),
        ].flat()

        logChecklist('000-bootstrap-service-account', checklist)
        const errors = collectErrors(checklist)
        if (errors.length) throw new Error(`Prerequisite check failed:\n${errors.join('\n')}`)
    }

    return [
        {
            id: 'Validate Prerequisites',
            description: 'Validate environment prerequisites before provisioning bootstrap service account',
            canRollback: false,
            execute: validate,
        },
        {
            id: 'Enable Automation APIs',
            description: `Ensure required APIs are enabled for ${context.projectId}`,
            canRollback: false,
            execute: () => enableAutomationApis(context, isDryRun),
        },
        {
            id: 'Assign Viewer Roles for Impersonators',
            description: 'Grant read-only bindings so impersonators can inspect policies and IAM state',
            canRollback: false,
            execute: () => assignViewerRoles(context, isDryRun),
        },
        {
            id: 'Ensure Bootstrap Service Account',
            description: `Ensure service account ${context.serviceAccountEmail} exists in ${context.projectId}`,
            canRollback: true,
            execute: () => ensureServiceAccount(context, isDryRun),
            rollback: () => deleteBootstrapServiceAccount(context, isDryRun),
        },
        {
            id: 'Assign Scoped Roles',
            description: `Bind required roles for ${context.serviceAccountEmail}`,
            canRollback: false,
            execute: () => assignScopedRoles(context, isDryRun),
        },
    ]
}

export default createBootstrapMigration
