import { executeShellCommand } from '@graffio/cli-migrator'

const getAccessTokenForProject = async () => {
    const result = await executeShellCommand('gcloud auth application-default print-access-token')
    return result.output.trim()
}

const tryShellCommand = async (command, operationName) => {
    try {
        console.log(`    [EXEC] ${operationName}`)
        const result = await executeShellCommand(command)
        return result.output
    } catch (error) {
        console.error(`    [ERROR] ${operationName} failed:`, error.message)
        return null
    }
}

const enableMagicLink = async (projectId, isDryRun) => {
    console.log(`    [INFO] Starting magic link configuration for ${projectId}`)

    const accessToken = await getAccessTokenForProject()
    const getConfigCommand = `curl -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`

    const authConfigTest = await tryShellCommand(getConfigCommand, 'check-auth-config')
    if (!authConfigTest) throw new Error('Firebase authentication not initialized')

    if (authConfigTest.includes('"email"') && authConfigTest.includes('"enableEmailLinkSignin":true')) {
        console.log(`    [SKIP] Email authentication already configured`)
        return { status: 'success', output: 'email auth already enabled' }
    }

    const addMagicLink = `curl -X PATCH -H "Authorization: Bearer ${accessToken}" -H "x-goog-user-project: ${projectId}" -H "Content-Type: application/json" -d '{"signIn":{"email":{"enabled":true,"passwordRequired":false}}}' "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired"`

    if (isDryRun) {
        console.log(`    [DRY-RUN] ${addMagicLink}`)
    } else {
        console.log(`    [EXEC] enable-magic-link-auth`)
        await executeShellCommand(addMagicLink)
        console.log(`    [EXEC] Magic link authentication enabled`)
    }

    return { status: 'success', output: 'magic link auth enabled' }
}

const configureAuthorizedDomains = async (projectId, isDryRun) => {
    console.log(`    [INFO] Starting authorized domains configuration for ${projectId}`)

    const authDomain = `${projectId}.firebaseapp.com`
    const accessToken = await getAccessTokenForProject()
    const getConfigCommand = `curl -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`

    const currentConfig = await tryShellCommand(getConfigCommand, 'check-authorized-domains')
    if (currentConfig && currentConfig.includes('localhost') && currentConfig.includes(authDomain)) {
        console.log(`    [SKIP] Authorized domains already configured`)
        return { status: 'success', output: 'auth domains already configured' }
    }

    const patchCommand = `curl -X PATCH "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config" -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" -H "Content-Type: application/json" -d '{"authorizedDomains":["localhost","127.0.0.1","${authDomain}"]}'`

    if (isDryRun) {
        console.log(`    [DRY-RUN] ${patchCommand}`)
    } else {
        console.log(`    [EXEC] configure-authorized-domains`)
        await executeShellCommand(patchCommand)
        console.log(`    [EXEC] Authorized domains configured: localhost, 127.0.0.1, ${authDomain}`)
    }

    return { status: 'success', output: 'auth domains configured' }
}

const initializeAuthentication = async (projectId, isDryRun) => {
    console.log(`    [INFO] Checking if Firebase Authentication is initialized for ${projectId}`)

    const accessToken = await getAccessTokenForProject()
    const checkCommand = `curl -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`

    const currentConfig = await tryShellCommand(checkCommand, 'check-auth-initialization')

    if (currentConfig && currentConfig.includes('"signIn"')) {
        console.log(`    [SKIP] Firebase Authentication already initialized`)
        return { status: 'success', output: 'auth already initialized' }
    }

    // Authentication not initialized - provide manual instructions
    console.log(`    [MANUAL ACTION REQUIRED] Firebase Authentication not initialized`)
    console.log(``)
    console.log(`    Please initialize Firebase Authentication manually:`)
    console.log(`    1. Go to https://console.firebase.google.com/project/${projectId}/authentication`)
    console.log(`    2. Click "Get Started"`)
    console.log(`    3. Wait for initialization to complete`)
    console.log(`    4. Re-run this migration to continue`)
    console.log(``)

    if (isDryRun) {
        console.log(`    [DRY-RUN] Would require manual Authentication initialization`)
        return { status: 'success', output: 'dry-run - manual init required' }
    }

    throw new Error(
        `Manual Firebase Authentication initialization required. Visit: https://console.firebase.google.com/project/${projectId}/authentication`,
    )
}

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    if (!projectId) throw new Error('Firebase projectId must be defined in config.firebaseProject.projectId')

    return [
        {
            id: 'Initialize Firebase Authentication',
            description: `Initialize Firebase Authentication service for ${projectId}`,
            canRollback: false,
            execute: async () => await initializeAuthentication(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'auth initialization rollback not supported' }),
        },
        {
            id: 'Enable Magic Link Authentication',
            description: `Enable passwordless email link sign-in for ${projectId}`,
            canRollback: false,
            execute: async () => await enableMagicLink(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'auth provider rollback not supported' }),
        },
        {
            id: 'Configure Authorized Domains',
            description: `Configure authorized domains for ${projectId}`,
            canRollback: false,
            execute: async () => await configureAuthorizedDomains(projectId, isDryRun),
            rollback: () => ({ status: 'success', output: 'auth domains rollback not supported' }),
        },
    ]
}

export default createCommands
