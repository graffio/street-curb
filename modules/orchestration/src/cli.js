#!/usr/bin/env node

/*
 * Infrastructure Migration Orchestrate CLI
 *
 * Simplified CLI for executing migration files with explicit configuration
 * and safe-by-default behavior.
 *
 * Usage:
 *   orchestrate <config-file> <migration-file> [--apply] [--rollback] [--audit-to=console|firestore]
 *   orchestrate config/prod.js migrations/046-vpc.js                    # dry-run (safe default)
 *   orchestrate config/prod.js migrations/046-vpc.js --apply            # actual execution
 *   orchestrate config/prod.js migrations/047-cleanup.js --rollback --apply  # rollback execution
 *   orchestrate config/staging.js migrations/046-vpc.js --audit-to=firestore --apply  # with firestore audit
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { basename, dirname, join, resolve } from 'path'
import { executeOrRollbackCommands } from './executor.js'

/*
 * Parse command line arguments
 * @sig parseArgs :: () -> { configFile: String, migrationFile: String, apply: Boolean, mode: String, auditTo: String }
 */
const parseArgs = () => {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        fatalError(
            'Usage: orchestrate <config-file> <migration-file> [--apply] [--rollback] [--audit-to=console|firestore]',
        )
    }

    const configFile = args[0]
    const migrationFile = args[1]
    const apply = args.includes('--apply')
    const mode = args.includes('--rollback') ? 'rollback' : 'execute'

    const auditToArg = args.find(arg => arg.startsWith('--audit-to='))
    const auditTo = auditToArg ? auditToArg.split('=')[1] : 'console'

    return { configFile, migrationFile, apply, mode, auditTo }
}

/*
 * Exit with error message
 * @sig fatalError :: String -> Void
 */
const fatalError = message => {
    console.error(message)
    process.exit(1)
}

/*
 * Parse config file content to extract config object
 * @sig parseConfigFile :: String -> Object
 */
const parseConfigFile = configPath => {
    const configContent = readFileSync(configPath, 'utf8')
    const defaultExportMatch = configContent.match(/export default\s+({[\s\S]*})/)

    if (!defaultExportMatch) throw new Error(`Could not parse config file: ${configPath}`)

    // eslint-disable-next-line no-eval
    return eval(`(${defaultExportMatch[1]})`)
}

/*
 * Write updated config object back to file
 * @sig writeConfigFile :: (String, Object) -> Void
 */
const writeConfigFile = (configPath, updatedConfig) => {
    const updatedContent = `export default ${JSON.stringify(updatedConfig, null, 4)}`
    writeFileSync(configPath, updatedContent)
}

/*
 * Update config file with captured IDs from migration results
 * @sig updateConfigWithCapturedIds :: (ExecutionPlan, String) -> Void
 */
const updateConfigWithCapturedIds = (result, configPath) => {
    const collectCapturedIds = results => {
        const reducer = (acc, result) => (result?.result?.capturedIds ? { ...acc, ...result.result.capturedIds } : acc)
        return results.reduce(reducer, {})
    }

    const capturedIds = collectCapturedIds(result.results)
    if (Object.keys(capturedIds).length === 0) return

    try {
        const configObject = parseConfigFile(configPath)
        const updatedConfig = { ...configObject, ...capturedIds }
        writeConfigFile(configPath, updatedConfig)
        console.log(`   Config updated with captured IDs: ${Object.keys(capturedIds).join(', ')}`)
    } catch (error) {
        console.warn(`   Warning: Could not update config file: ${error.message}`)
    }
}

/*
 * Run corresponding test file for migration if it exists
 * @sig runPostMigrationTapTests :: (String, String, String) -> Promise<Boolean>
 */
const runPostMigrationTapTests = async (migrationName, tapPath, configPath) => {
    if (!existsSync(tapPath)) {
        console.log(`   No test file found at: ${tapPath}`)
        return true
    }

    try {
        console.log(`   Running tests for ${migrationName}...`)
        execSync(`node ${tapPath} ${configPath}`, { encoding: 'utf8', stdio: 'pipe', cwd: process.cwd() })
        console.log(`   ✅ Tests passed`)
    } catch (error) {
        if (error.stdout) console.error(`   Test output: ${error.stdout}`)
        if (error.stderr) console.error(`   Test error: ${error.stderr}`)
        fatalError(`   ❌ Tests failed: ${error.message}`)
    }
}

/*
 * Validate required files exist
 * @sig validateFiles :: (String, String) -> Void
 */
const validateFiles = (configFile, migrationFile) => {
    if (!existsSync(configFile)) throw new Error(`Config file not found: ${configFile}`)
    if (!existsSync(migrationFile)) throw new Error(`Migration file not found: ${migrationFile}`)
}

/*
 * Load and validate config module
 * @sig loadConfig :: String -> Object
 */
const loadConfig = async configPath => {
    const configModule = await import(configPath)
    const config = configModule.default

    if (!config || typeof config !== 'object')
        throw new Error(`Config file must export a default object: ${configPath}`)

    return config
}

/*
 * Load and validate migration module
 * @sig loadMigrationFunction :: String -> Function
 */
const loadMigrationFunction = async migrationPath => {
    const migrationModule = await import(migrationPath)
    const migrationFunction = migrationModule.default

    if (typeof migrationFunction !== 'function')
        throw new Error(`Migration file must export a default function: ${migrationPath}`)

    return migrationFunction
}

/*
 * Execute migration with optional config updates
 * @sig executeMigration :: (Array<Command>, String, String, String, String, Boolean) -> Promise<Void>
 */
const executeMigration = async (commands, configPath, migrationName, tapPath, mode, isDryRun) => {
    const result = await executeOrRollbackCommands(commands, mode)

    let operation = mode === 'rollback' ? 'rollback' : 'execution'
    if (isDryRun) operation = operation + ' dry-run'

    if (result.success) {
        console.log(`\n✅  Migration ${operation} completed successfully`)
    } else {
        // Show detailed failure information
        const failedResults = result.results.filter(r => !r.success)
        console.error(`\n❌  Migration failed during ${operation}`)

        failedResults.forEach(failedResult => {
            console.error(`   Failed command: ${failedResult.command.id}`)
            console.error(`   Description: ${failedResult.command.description}`)
            console.error(`   Error: ${failedResult.error?.message || 'Unknown error'}`)
            if (failedResult.error?.stdout) console.error(`   Output: ${failedResult.error.stdout}`)
            if (failedResult.error?.stderr) console.error(`   Error output: ${failedResult.error.stderr}`)
        })

        process.exit(1)
    }

    if (isDryRun) {
        // In dry-run, show what would be captured but don't actually update config
        const collectCapturedIds = results => {
            const reducer = (acc, result) =>
                result?.result?.capturedIds ? { ...acc, ...result.result.capturedIds } : acc
            return results.reduce(reducer, {})
        }

        const capturedIds = collectCapturedIds(result.results)
        if (Object.keys(capturedIds).length)
            console.log(`⚠️ Would capture IDs: [${Object.keys(capturedIds).join(', ')}]`)

        console.log(`⚠️ Skipping config update and tests in dry-run mode`)
        console.log(``)
        console.log(`Next steps:`)
        console.log(`  # Execute the migration:`)
        console.log(`  ${process.argv.join(' ')} --apply`)
        console.log(``)
    } else if (mode === 'execute') {
        updateConfigWithCapturedIds(result, configPath)
        await runPostMigrationTapTests(migrationName, tapPath, configPath)

        console.log(``)
        console.log(`Next steps:`)
        console.log(`  # Verify results manually:`)
        console.log(`  node ${tapPath.replace(process.cwd() + '/', '')} "${configPath}"`)
        console.log(``)
        console.log(`  # Test idempotency:`)
        console.log(`  ${process.argv.join(' ')}`)
        console.log(``)
    }
}

/*
 * Main CLI execution function
 * @sig main :: () -> Promise<Void>
 */
const main = async () => {
    try {
        const { configFile, migrationFile, apply, mode } = parseArgs()

        validateFiles(configFile, migrationFile)

        const configPath = resolve(configFile)
        const migrationPath = resolve(migrationFile)
        const migrationName = basename(migrationPath, '.js')
        const tapPath = join(dirname(migrationPath), `../test/${migrationName}.tap.js`)

        const config = await loadConfig(configPath)
        const migrationFunction = await loadMigrationFunction(migrationPath)

        const commands = await migrationFunction(config, { isDryRun: !apply })

        console.log()
        console.log(
            `▶️ ${apply ? 'RUNNING' : 'DRY RUN'}: ${mode === 'rollback' ? 'rollback' : 'forward'} ${migrationName}`,
        )
        console.log()

        await executeMigration(commands, configPath, migrationName, tapPath, mode, !apply)
    } catch (error) {
        fatalError(`❌ Orchestration failed: ${error.message}`)
    }
}

main()
