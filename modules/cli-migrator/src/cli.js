#!/usr/bin/env node

/*
 * Infrastructure Migration Orchestrate CLI
 *
 * Simplified CLI for executing migration files with explicit configuration
 * and safe-by-default behavior.
 *
 * Usage:
 *   orchestrate <config-file> <migration-file> [--apply] [--rollback] [--audit-to=logger.firestore]
 *   orchestrate config/prod.js migrations/046-vpc.js                    # dry-run (safe default)
 *   orchestrate config/prod.js migrations/046-vpc.js --apply            # actual execution
 *   orchestrate config/prod.js migrations/047-cleanup.js --rollback --apply  # rollback execution
 *   orchestrate config/staging.js migrations/046-vpc.js --audit-to=firestore --apply  # with firestore audit
 */

import { existsSync } from 'fs'
import { basename, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createLogger, getLogger } from './logger.js'

/*
 * Execute commands directly with immediate logging
 * @sig executeCommands :: (Array<Command>, Boolean, Boolean) -> Promise<Void>
 */
const executeCommands = async (commands, isRollback, isDryRun = false) => {
    const prefix = command => commands.indexOf(command) + 1 + '.'
    const logger = getLogger()

    for (const command of commands) {
        // Show command description
        logger.log(`${prefix(command)} ${command.id} → ${command.description}`)
        logger.log() // Add blank line after description

        if (isRollback && !command.canRollback) throw new Error(`${command.description} cannot be rolled back`)

        // Execute the appropriate function
        let result
        // prettier-ignore
        try {
            if      (isRollback) result = await command.rollback()
            else if ( isDryRun)  result = await command.dryRun()
            else if (!isDryRun)  result = await command.execute()
            else throw new Error('whoa!')
        } catch (e) {
            const s = `Command failed: '${command.description}'` + '\n    wrapped error:' + e.stack.replace('Error:', '')
            throw new Error(s)
        }

        // Log success message from result
        if (result && result.message) logger.log(`\n    ✅ ${result.message}`)

        logger.log() // Add blank line after execution
    }
}

/*
 * Parse command line arguments
 * @sig parseArgs :: () -> { configFile: String, migrationFile: String, apply: Boolean, mode: String, auditTo: String }
 */
const parseArgs = () => {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        const s = 'Usage: migrate <config-file> <migration-file> [--apply] [--rollback] [--audit-to=logger.firestore]'
        getLogger.error(s)
        process.exit(1)
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
 * Load and validate config module
 * @sig loadConfig :: String -> Object
 */
const loadConfig = async configPath => {
    const configModule = await import(configPath)
    const conf = configModule.default
    if (!conf || typeof conf !== 'object') throw new Error(`Config file must export a default object: ${configPath}`)
    return conf
}

/*
 * Load and validate migration module
 * @sig loadMigrationFunction :: String -> Function
 */
const loadMigrationFunction = async migrationPath => {
    const migrationModule = await import(migrationPath)
    const f = migrationModule.default
    if (typeof f !== 'function') throw new Error(`Migration file must export a default function: ${migrationPath}`)
    return f
}

/*
 * Main CLI execution function
 * @sig main :: () -> Promise<Void>
 */
const main = async () => {
    const { configFile, migrationFile, apply, mode } = parseArgs()
    const logger = createLogger()

    if (!existsSync(configFile)) throw new Error(`Config file not found: ${configFile}`)
    if (!existsSync(migrationFile)) throw new Error(`Migration file not found: ${migrationFile}`)

    // dynamically load config and migration function
    const configPath = resolve(configFile)
    const migrationPath = resolve(migrationFile)
    const migrationName = basename(migrationPath, '.js')
    const config = await loadConfig(configPath)
    const migrationFunction = await loadMigrationFunction(migrationPath)

    const commands = await migrationFunction(config)

    logger.log()
    logger.log(`▶️ ${apply ? 'RUNNING' : 'DRY RUN'}: ${mode === 'rollback' ? 'rollback' : 'forward'} ${migrationName}`)
    logger.log()

    if (mode === 'rollback') await executeCommands(commands.reverse(), true, false)
    else await executeCommands(commands, false, !apply)

    let operation = mode === 'rollback' ? 'rollback' : 'execution'
    if (!apply) operation = operation + ' dry-run'
    logger.log(` ✅  Migration ${operation} completed successfully`)

    const fullPath = fileURLToPath(import.meta.url)
    const currentDir = process.cwd()
    const relativeCliPath = relative(currentDir, fullPath)

    if (!apply) {
        logger.log(`⚠️ Skipping config update and tests in dry-run mode`)
        logger.log(``)
        logger.log(`Next steps:`)
        logger.log(`${relativeCliPath} ${process.argv.slice(-2).join(' ')} --apply`)

        logger.log(``)
    }
}

main()
