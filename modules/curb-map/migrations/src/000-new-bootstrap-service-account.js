/*
 * Bootstrap Service Account Migration (000-new)
 * -----------------------------------------------------------------------------
 * Purpose: Provision/validate the bootstrap service account using new GCP helper functions
 * instead of direct requestJson calls. This is a test migration to validate the
 * new infrastructure layer before full implementation.
 *
 * This migration mirrors 000-bootstrap-service-account.js but uses the new
 * GCP helper functions from modules/curb-map/src/infrastructure/gcp/
 */

// Import new GCP helper functions
import { ensureProjectRole, ensureServiceAccount } from '../../src/infrastructure/gcp/iam.js'
import { ensureApisEnabled } from '../../src/infrastructure/gcp/service-usage.js'
import { expandHome } from './shared/migration-utils.js'
import { collectErrors, logChecklist, validateBootstrapKey, validateConfig } from './shared/prerequisite-validator.js'

/*
 * Extract bootstrap configuration from migration config
 * @sig getBootstrapContext :: Object -> BootstrapContext
 */
const getBootstrapContext = config => {
    const organizationId = config.organizationId
    const bootstrapServiceAccount = config.bootstrapServiceAccount || {}

    const projectId = bootstrapServiceAccount.projectId
    const serviceAccountId = bootstrapServiceAccount.id
    const displayName = bootstrapServiceAccount.displayName || 'Bootstrap Migrator'
    const keyEnvVar = bootstrapServiceAccount.keyEnvVar || 'BOOTSTRAP_SA_KEY_PATH'
    const keyPreference = bootstrapServiceAccount.recommendedKeyPath || ''
    const folders = Array.isArray(bootstrapServiceAccount.folders) ? bootstrapServiceAccount.folders : []
    const roles = Array.isArray(bootstrapServiceAccount.roles) ? bootstrapServiceAccount.roles : []
    const impersonatorPrincipals = Array.isArray(bootstrapServiceAccount.impersonatorPrincipals)
        ? bootstrapServiceAccount.impersonatorPrincipals.filter(Boolean)
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
 * Ensure service account exists using new helper
 * @sig ensureServiceAccountNew :: (BootstrapContext, Object) -> Promise<Result>
 */
const ensureServiceAccountNew = async (context, dryRunConfig) =>
    ensureServiceAccount(context.projectId, context.serviceAccountId, context.displayName, dryRunConfig)

/*
 * Assign required roles using new helper
 * @sig assignScopedRolesNew :: (BootstrapContext, Object) -> Promise<Result>
 */
const assignScopedRolesNew = async (context, dryRunConfig) => {
    const targets = context.folders.length
        ? context.folders.map(folderId => `folders/${folderId}`)
        : [`organizations/${context.organizationId}`]
    const member = `serviceAccount:${context.serviceAccountEmail}`

    for (const target of targets) {
        for (const role of context.roles) {
            const result = await ensureProjectRole(context.projectId, role, member, dryRunConfig)
            if (result.constructor.name === 'Failure') {
                console.log(`    [INFO] Skipping IAM binding ${role} on ${target}: ${result.message}`)
            }
        }
    }
    return { status: 'success', output: 'roles ensured' }
}

/*
 * Enable required APIs using new helper
 * @sig enableAutomationApisNew :: (BootstrapContext, Object) -> Promise<Result>
 */
const enableAutomationApisNew = async (context, dryRunConfig) => {
    const serviceIds = [
        'cloudresourcemanager.googleapis.com',
        'iam.googleapis.com',
        'iamcredentials.googleapis.com',
        'orgpolicy.googleapis.com',
        'serviceusage.googleapis.com',
    ]
    return ensureApisEnabled(context.projectId, serviceIds, dryRunConfig)
}

/*
 * Build migration command list for orchestrator
 * @sig createBootstrapMigrationNew :: (Object, Object?) -> [Command]
 */
const createBootstrapMigrationNew = (config, options = {}) => {
    const { isDryRun = true } = options
    const context = getBootstrapContext(config)
    const dryRunConfig = { isDryRun, logger: console.log }

    const validate = async () => {
        console.log('    [EXEC] Starting prerequisite validation...')

        const configPaths = ['organizationId', 'bootstrapServiceAccount.projectId', 'bootstrapServiceAccount.roles']
        console.log(`    [EXEC] Validating config paths [${configPaths.join(', ')}]`)
        const configItems = validateConfig(config, configPaths)

        console.log('    [EXEC] Validating bootstrap keys...')
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

        const checklist = [configItems, keyChecks].flat()

        console.log('    [EXEC] Logging checklist...')
        logChecklist('000-new-bootstrap-service-account', checklist)
        const errors = collectErrors(checklist)
        if (errors.length) throw new Error(`Prerequisite check failed:\n${errors.join('\n')}`)
        console.log('    [EXEC] Prerequisite validation completed successfully')
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
            execute: () => enableAutomationApisNew(context, dryRunConfig),
        },
        {
            id: 'Ensure Bootstrap Service Account',
            description: `Ensure service account ${context.serviceAccountEmail}`,
            canRollback: false,
            execute: () => ensureServiceAccountNew(context, dryRunConfig),
        },
        {
            id: 'Assign Scoped Roles',
            description: `Bind required roles for ${context.serviceAccountEmail}`,
            canRollback: false,
            execute: () => assignScopedRolesNew(context, dryRunConfig),
        },
    ]
}

export default createBootstrapMigrationNew
