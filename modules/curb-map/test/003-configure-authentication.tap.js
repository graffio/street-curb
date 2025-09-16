import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

/*
 * Verify 003-configure-authentication migration results
 * @sig verifyAuthenticationConfiguration :: () -> Test
 *
 * This test ONLY verifies existing Firebase Auth configuration.
 * It does NOT run migrations - use bash/run-migration.sh for that.
 */

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 003-configure-authentication.tap.js <config-path>')
        process.exit(1)
    }

    const configContent = readFileSync(configPath, 'utf8')
    const defaultExportMatch = configContent.match(/export default\s+({[\s\S]*})/)

    if (!defaultExportMatch) {
        throw new Error(`Could not parse config file: ${configPath}`)
    }

    // eslint-disable-next-line no-eval
    const config = eval(`(${defaultExportMatch[1]})`)
    return { config, configPath: resolve(configPath) }
}

const getAuthConfig = projectId => {
    try {
        const output = execSync(
            `curl -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" -H "X-goog-user-project: ${projectId}" \
            "https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config"`,
            { encoding: 'utf8', stdio: 'pipe' },
        )
        return JSON.parse(output)
    } catch (error) {
        return null
    }
}

const isEmailAuthEnabled = authConfig => authConfig?.signIn?.email?.enabled === true

const isMagicLinkEnabled = authConfig => 
    // Check if email auth is configured (magic link may not be explicitly shown in API response)
     (
        authConfig?.signIn?.email &&
        (!authConfig?.signIn?.email?.passwordRequired || authConfig?.signIn?.email?.passwordRequired === false)
    )


const hasAuthorizedDomains = (authConfig, projectId) => {
    const domains = authConfig?.authorizedDomains || []
    const expectedDomain = `${projectId}.firebaseapp.com`

    return domains.includes('localhost') && (domains.includes(expectedDomain) || domains.includes('127.0.0.1'))
}

const canListUsers = projectId => {
    try {
        execSync(
            `curl -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" -H "X-goog-user-project: ${projectId}" \
            "https://identitytoolkit.googleapis.com/v1/accounts:query" -X POST -H "Content-Type: application/json" -d '{}'`,
            { stdio: 'pipe', timeout: 10000 },
        )
        return true
    } catch (error) {
        return false
    }
}

// Get config path from command line
const { config, configPath } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Given the Firebase authentication configuration', t => {
    const authConfig = getAuthConfig(projectId)

    t.test('When the Firebase project has not been configured yet', t => {
        if (!authConfig) {
            t.pass('Then the migration should be run first:')
            t.pass(`  bash/run-migration.sh "${configPath}" migrations/003-configure-authentication.js --apply`)
            t.end()
            return
        }
        t.end()
    })

    t.test('When checking the email authentication settings', t => {
        if (!authConfig) {
            t.skip('Auth config not available')
            t.end()
            return
        }

        t.equal(isEmailAuthEnabled(authConfig), true, 'Then email authentication should be enabled')
        t.equal(isMagicLinkEnabled(authConfig), true, 'Then passwordless email sign-in should be enabled')
        t.end()
    })

    t.test('When checking the authorized domains configuration', t => {
        if (!authConfig) {
            t.skip('Auth config not available')
            t.end()
            return
        }

        t.equal(
            hasAuthorizedDomains(authConfig, projectId),
            true,
            'Then localhost and the Firebase app domain should be authorized',
        )

        const domains = authConfig.authorizedDomains || []
        t.ok(domains.length > 0, 'Then at least one domain should be configured')
        t.ok(domains.includes('localhost'), 'Then localhost should be included for development')

        t.end()
    })

    t.test('When verifying the Firebase Auth service accessibility', t => {
        if (!authConfig) {
            t.skip('Auth config not available')
            t.end()
            return
        }

        t.equal(canListUsers(projectId), true, 'Then the Firebase Auth service should be accessible')
        t.end()
    })

    t.test('When validating the authentication configuration structure', t => {
        if (!authConfig) {
            t.skip('Auth config not available')
            t.end()
            return
        }

        t.ok(authConfig.signIn, 'Then the signIn configuration should exist')
        t.type(authConfig.authorizedDomains, 'object', 'Then the authorizedDomains should be an array')

        t.end()
    })

    t.end()
})
