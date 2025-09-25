import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

/*
 * Load migration config for assertions
 * @sig loadConfig :: String -> { config: Object, configPath: String }
 */
const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 000-new-bootstrap-service-account.tap.js <config-path>')
        process.exit(1)
    }

    const content = readFileSync(configPath, 'utf8')
    const match = content.match(/export default\s+({[\s\S]*})/)
    if (!match) throw new Error(`Could not parse config file: ${configPath}`)

    // eslint-disable-next-line no-eval
    const config = eval(`(${match[1]})`)
    return { config, configPath: resolve(configPath) }
}

/*
 * Extract validation booleans from bootstrap settings
 * @sig ensureBootstrapFields :: Object -> Object
 */
const ensureBootstrapFields = config => {
    const bootstrap = config.bootstrapServiceAccount || {}
    const requiredRoles = [
        'roles/resourcemanager.projectCreator',
        'roles/serviceusage.serviceUsageAdmin',
        'roles/billing.projectManager',
    ]

    const hasRoles =
        Array.isArray(bootstrap.roles) &&
        requiredRoles.every(role => bootstrap.roles.includes(role)) &&
        bootstrap.roles.length === requiredRoles.length

    return {
        hasProjectId: Boolean(bootstrap.projectId),
        hasId: Boolean(bootstrap.id),
        hasDisplayName: Boolean(bootstrap.displayName),
        hasEnvVar: Boolean(bootstrap.keyEnvVar),
        hasRoles,
    }
}

tap.test('Given a migration config that defines the bootstrap service account (new version)', t => {
    const { config, configPath } = loadConfig(process.argv[2])
    const bootstrap = config.bootstrapServiceAccount

    t.ok(bootstrap, 'When we inspect the migration config, then the bootstrap section should exist')

    t.test('When we validate the bootstrap fields', t => {
        const status = ensureBootstrapFields(config)
        t.ok(status.hasProjectId, 'Then the config includes the automation project ID')
        t.ok(status.hasId, 'Then the config includes the bootstrap service account ID')
        t.ok(status.hasDisplayName, 'Then the config includes the display name for operators')
        t.ok(status.hasEnvVar, 'Then the config declares the required environment variable')
        t.ok(status.hasRoles, 'Then the config enumerates the three required organization roles')
        t.end()
    })

    t.test('When we document the config path for operators', t => {
        t.equal(typeof configPath, 'string', 'Then the config path should be resolved for logging')
        t.end()
    })

    t.end()
})
