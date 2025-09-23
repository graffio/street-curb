/*
 * Bootstrap Service Account Migration (000)
 * ------------------------------------------------------------
 * This migration provisions the org-level bootstrap service account that future infrastructure migrations rely on.
 * Run it only after completing each prerequisite:
 *
 * 1. Automation project exists
 *    • Create `curbmap-automation-admin` in organization `404973578720`
 *      (Console → IAM & Admin → Manage resources → Create project, or
 *      `gcloud projects create curbmap-automation-admin --organization=404973578720`).
 *    • Attach billing (`0127B8-824540-F55374`) via the Billing console or
 *      `gcloud beta billing projects link curbmap-automation-admin --billing-account=0127B8-824540-F55374`.
 *
 * 2. Temporary human authentication
 *    • `gcloud` must be logged in as an admin with org-level IAM and org policy rights (`gcloud auth login`).
 *      Revoke this login once the migration finishes; normal operations should use service accounts.
 *
 * 3. Allow a one-time JSON key mint
 *    • Organization policy `constraints/iam.disableServiceAccountKeyCreation` blocks key creation.
 *      Override the policy for `curbmap-automation-admin`
 *          Console → IAM & Admin → Organization Policies → “Disable service account key creation” → Add override, set enforcement Off
 *      OR, if your account has `setOrgPolicy`
 *          `gcloud resource-manager org-policies disable-enforce constraints/iam.disableServiceAccountKeyCreation --project=curbmap-automation-admin`
 *
 * 4. Set the bootstrap key destination
 *    • Choose a secure path (default `$HOME/.config/curbmap`) and export it:
 *         export BOOTSTRAP_SA_KEY_PATH="$HOME/.config/curbmap/bootstrap-service-account.json"
 *
 * 5. Run the migration
 *    • Example command:
 *         node modules/cli-migrator/src/cli.js modules/curb-map/migrations/config/dev.config.js modules/curb-map/migrations/src/000-bootstrap-service-account.js --apply
 *      The script ensures the service account exists, binds the allowed org roles, prepares the key directory with
 *      `chmod 700`, and mints a key (requires the policy override).
 *
 * 6. Post-run cleanup
 *    • Re-enable the key-creation policy override
 *      (Console or `gcloud resource-manager org-policies enable-enforce ...`).
 *    • Revoke the human login (`gcloud auth revoke admin@curbmap.app`).
 *    • Activate the generated key for future automation runs:
 *         gcloud auth activate-service-account bootstrap-migrator@curbmap-automation-admin.iam.gserviceaccount.com --key-file="$BOOTSTRAP_SA_KEY_PATH"
 *         export GOOGLE_APPLICATION_CREDENTIALS="$BOOTSTRAP_SA_KEY_PATH"
 *         export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$BOOTSTRAP_SA_KEY_PATH"
 *
 * 7. Known limitation
 *    • `roles/firebase.managementAdmin` cannot be bound at the org level; the migration logs a skip for that role.
 *      Assign it later at the project scope (migration 006).
 *
 * The migration is idempotent: reruns reuse the service account, refresh IAM bindings, and reapply directory/key
 * permissions. There is no rollback
 */
import { executeShellCommand } from '@graffio/cli-migrator'
import { existsSync } from 'fs'
import { dirname } from 'path'

/*
 * Expand ~ to the user's home directory for local file paths
 * @sig expandHome :: String -> String
 */
const expandHome = path => {
    const home = process.env.HOME
    if (!home) return path
    return path.startsWith('~') ? path.replace('~', home) : path
}

/*
 * Quote a shell argument defensively for POSIX shells
 * @sig shellQuote :: String -> String
 */
const shellQuote = value => `'${value.replace(/'/g, "'\\''")}'`

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
    const keyPreference = bootstrap.recommendedKeyPath || '$HOME/.config/curbmap/bootstrap-service-account.json'
    const keyPathRaw = process.env[keyEnvVar]

    if (!organizationId) throw new Error('organizationId must be defined in the migration config')
    if (!projectId) throw new Error('bootstrapServiceAccount.projectId must be defined in the migration config')
    if (!serviceAccountId) throw new Error('bootstrapServiceAccount.id must be defined in the migration config')
    if (!keyPathRaw) throw new Error(`Set ${keyEnvVar} to the bootstrap service account key path (${keyPreference})`)

    const keyPath = expandHome(keyPathRaw)
    const keyDirectory = dirname(keyPath)
    const serviceAccountEmail = `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`
    const roles = Array.isArray(bootstrap.roles) ? bootstrap.roles : []

    if (!roles.length)
        throw new Error('bootstrapServiceAccount.roles must list at least one organization role in config')

    return {
        organizationId,
        projectId,
        serviceAccountEmail,
        serviceAccountId,
        displayName,
        keyEnvVar,
        keyPath,
        keyDirectory,
        roles,
    }
}

/*
 * Create service account if it does not exist
 * @sig ensureServiceAccount :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const ensureServiceAccount = async (context, isDryRun) => {
    const listCommand = `gcloud iam service-accounts list --project=${context.projectId} --format="value(email)" --filter="email:${context.serviceAccountEmail}"`
    const createCommand = `gcloud iam service-accounts create ${context.serviceAccountId} --display-name="${context.displayName}" --project=${context.projectId}`

    if (isDryRun) {
        console.log(`    [DRY-RUN] ${listCommand}`)
        console.log(`    [DRY-RUN] ${createCommand}`)
        return { status: 'success', output: 'dry-run' }
    }

    const result = await executeShellCommand(listCommand)
    const emails = result.output
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
    if (emails.includes(context.serviceAccountEmail)) {
        console.log(`    [SKIP] Service account ${context.serviceAccountEmail} already exists`)
        return { status: 'success', output: 'existing service account' }
    }

    await executeShellCommand(createCommand)
    return { status: 'success', output: 'service account created' }
}

/*
 * Execute or log a shell command based on dry-run mode
 * @sig runCommand :: (Boolean, String) -> Promise<Void>
 */
/*
 * Detect unsupported Firebase org-level role binding errors
 * @sig isUnsupportedFirebaseOrgRole :: Error -> Boolean
 */
const isUnsupportedFirebaseOrgRole = error =>
    Boolean(error?.message && error.message.includes('Role roles/firebase.managementAdmin is not supported'))

/*
 * Log when Firebase management role cannot be assigned at organization scope
 * @sig logUnsupportedFirebaseRole :: String -> Void
 */
const logUnsupportedFirebaseRole = command =>
    console.log(`    [SKIP] ${command} → roles/firebase.managementAdmin must be bound at the project level`)

/*
 * Execute or log a shell command based on dry-run mode
 * @sig runCommand :: (Boolean, String) -> Promise<Void>
 */
const runCommand = async (isDryRun, command) => {
    if (isDryRun) {
        console.log(`    [DRY-RUN] ${command}`)
        return
    }

    try {
        await executeShellCommand(command)
    } catch (error) {
        if (!isUnsupportedFirebaseOrgRole(error)) throw error
        logUnsupportedFirebaseRole(command)
    }
}

/*
 * Assign required organization roles to the service account
 * @sig assignOrganizationRoles :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const assignOrganizationRoles = async (context, isDryRun) => {
    const getCommand = role =>
        `gcloud organizations add-iam-policy-binding ${context.organizationId} --member="serviceAccount:${context.serviceAccountEmail}" --role="${role}"`

    if (!context.roles?.length)
        throw new Error('bootstrapServiceAccount.roles must list the required organization roles in config')

    for (const role of context.roles) await runCommand(isDryRun, getCommand(role))

    return { status: 'success', output: 'roles ensured' }
}

/*
 * Harden an existing key directory with chmod 700
 * @sig hardenExistingDirectory :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const hardenExistingDirectory = async (context, isDryRun) => {
    const command = `chmod 700 ${shellQuote(context.keyDirectory)}`
    isDryRun ? console.log(`    [DRY-RUN] ${command}`) : await executeShellCommand(command)
    return { status: 'success', output: 'directory hardened' }
}

/*
 * Create and harden the key directory
 * @sig createKeyDirectory :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const createKeyDirectory = async (context, isDryRun) => {
    const createCommand = `mkdir -p ${shellQuote(context.keyDirectory)}`
    const chmodCommand = `chmod 700 ${shellQuote(context.keyDirectory)}`

    isDryRun ? console.log(`    [DRY-RUN] ${createCommand}`) : await executeShellCommand(createCommand)
    isDryRun ? console.log(`    [DRY-RUN] ${chmodCommand} `) : await executeShellCommand(chmodCommand)
    return { status: 'success', output: 'directory created' }
}

/*
 * Ensure the key directory exists and set strict permissions
 * @sig ensureKeyDirectory :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const ensureKeyDirectory = async (context, isDryRun) =>
    existsSync(context.keyDirectory)
        ? hardenExistingDirectory(context, isDryRun)
        : createKeyDirectory(context, isDryRun)

/*
 * Harden an existing key file with chmod 600
 * @sig hardenExistingKey :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const hardenExistingKey = async (context, isDryRun) => {
    const chmodCommand = `chmod 600 ${shellQuote(context.keyPath)}`
    isDryRun ? console.log(`    [DRY-RUN] ${chmodCommand}`) : await executeShellCommand(chmodCommand)
    console.log(`    [SKIP] Key file already exists at ${context.keyPath}`)
    return { status: 'success', output: 'key hardened' }
}

/*
 * Create and harden a new key file
 * @sig createKeyFile :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const createKeyFile = async (context, isDryRun) => {
    const createKeyCommand = `gcloud iam service-accounts keys create ${shellQuote(context.keyPath)} --iam-account=${context.serviceAccountEmail}`
    const chmodCommand = `chmod 600 ${shellQuote(context.keyPath)}`

    isDryRun ? console.log(`    [DRY-RUN] ${createKeyCommand}`) : await executeShellCommand(createKeyCommand)
    isDryRun ? console.log(`    [DRY-RUN] ${chmodCommand}    `) : await executeShellCommand(chmodCommand)
    return { status: 'success', output: 'key created' }
}

/*
 * Ensure a key file exists and is hardened with chmod 600
 * @sig ensureKeyFile :: (BootstrapContext, Boolean) -> Promise<Result>
 */
const ensureKeyFile = async (context, isDryRun) =>
    existsSync(context.keyPath) ? hardenExistingKey(context, isDryRun) : createKeyFile(context, isDryRun)

/*
 * Define command list for migration orchestrator
 * @sig createBootstrapMigration :: (Object, Object?) -> [Command]
 */
const createBootstrapMigration = (config, options = {}) => {
    const { isDryRun = true } = options
    const context = getBootstrapContext(config)

    return [
        {
            id: 'Ensure Bootstrap Service Account',
            description: `Ensure service account ${context.serviceAccountEmail} exists in ${context.projectId}`,
            canRollback: true,
            execute: () => ensureServiceAccount(context, isDryRun),
        },
        {
            id: 'Assign Organization Roles',
            description: `Assign required organization roles to ${context.serviceAccountEmail}`,
            canRollback: false,
            execute: () => assignOrganizationRoles(context, isDryRun),
        },
        {
            id: 'Ensure Key Directory',
            description: `Ensure secure directory for ${context.keyEnvVar} (${context.keyDirectory})`,
            canRollback: false,
            execute: () => ensureKeyDirectory(context, isDryRun),
        },
        {
            id: 'Ensure Key File',
            description: `Ensure hardened JSON key at ${context.keyPath}`,
            canRollback: false,
            execute: () => ensureKeyFile(context, isDryRun),
        },
    ]
}

export default createBootstrapMigration
