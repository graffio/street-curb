import { shellBuilder } from '@graffio/orchestration'

const migrationId = '003-configure-authentication'

// helper to hide thrown errors that just mean "isn't configured yet")
const runShellCommandSwallowingThrow = async (command, operationName, isDryRun) => {
    try {
        const result = await shellBuilder(command).forMigration(migrationId, operationName).dryRun(isDryRun).run()
        return result.output
    } catch (error) {
        console.error(error)
        return null
    }
}
const getAccessTokenForProject = async projectId => {
    // Get token - quota project will be set via X-goog-user-project header in curl
    const token = await shellBuilder(`gcloud auth application-default print-access-token`)
        .forMigration(migrationId, 'get-auth-token')
        .run()

    return token.output.trim()
}

const enableMagicLink = async (projectId, isDryRun) => {
    // Check current auth config using Admin v2 API
    const accessToken = await getAccessTokenForProject(projectId)
    const getConfigCommand = `curl -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`
    const addMagicLink = `curl -X PATCH -H "Authorization: Bearer ${accessToken}" -H "x-goog-user-project: ${projectId}" -H "Content-Type: application/json" -d '{"signIn":{"email":{"enabled":true,"passwordRequired":false}}}' "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired"`

    const authConfigTest = await runShellCommandSwallowingThrow(getConfigCommand, 'check-auth-config', isDryRun)
    if (!authConfigTest) throw new Error('Firebase authentication not initialized')

    console.log(`    [DEBUG] Current auth config:`, authConfigTest)

    if (authConfigTest.includes('"email"') && authConfigTest.includes('"enableEmailLinkSignin":true')) {
        console.log(`    [SKIP] Email authentication already configured`)
        return { status: 'success', output: 'email auth already enabled' }
    }

    await shellBuilder(addMagicLink).forMigration(migrationId, 'enable-magic-link-auth').dryRun(isDryRun).run()

    // Verify the configuration was actually set
    const verifyCommand = `curl -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`
    const verifyResult = await runShellCommandSwallowingThrow(verifyCommand, 'verify-auth-config', isDryRun)
    console.log(`    [DEBUG] Config after PATCH:`, verifyResult)

    if (!isDryRun) console.log(`    [EXEC] Magic link authentication enabled`)
    return { status: 'success', output: 'magic link auth enabled' }
}

const configureAuthorizedDomains = async (projectId, isDryRun) => {
    const authDomain = `${projectId}.firebaseapp.com`
    const accessToken = await getAccessTokenForProject(projectId)

    const getConfigCommand = `curl -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`

    const currentConfig = await runShellCommandSwallowingThrow(getConfigCommand, 'check-authorized-domains', isDryRun)
    if (currentConfig && currentConfig.includes('localhost') && currentConfig.includes(authDomain)) {
        console.log(`    [SKIP] Authorized domains already configured`)
        return { status: 'success', output: 'auth domains already configured' }
    }

    const patchCommand = `curl -X PATCH "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config" -H "Authorization: Bearer ${accessToken}" -H "X-goog-user-project: ${projectId}" -H "Content-Type: application/json" -d '{"authorizedDomains":["localhost","127.0.0.1","${authDomain}"]}'`

    await shellBuilder(patchCommand).forMigration(migrationId, 'configure-authorized-domains').dryRun(isDryRun).run()

    if (!isDryRun) console.log(`    [EXEC] Authorized domains configured: localhost, 127.0.0.1, ${authDomain}`)
    return { status: 'success', output: 'auth domains configured' }
}

const createCommands = (config, { isDryRun = true } = {}) => {
    const projectId = config.firebaseProject.projectId
    if (!projectId) throw new Error('Firebase projectId must be defined in config.firebaseProject.projectId')

    return [
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
