#!/usr/bin/env node

/*
 * Infrastructure Migration Orchestrate CLI
 *
 * Command-line interface for executing migration files with environment-specific
 * configuration and safe-by-default behavior.
 *
 * Usage:
 *   orchestrate <environment> <action> <migration> [--apply]
 *   orchestrate prod execute 046           # dry-run (safe default)
 *   orchestrate prod execute 046 --apply  # actual execution
 *   orchestrate staging rollback 047 --apply
 */

/*
 * Type Definitions (for documentation only - no runtime validation):
 *
 * CommandResult :: {
 *     status  : /success|failure/,
 *     output  : String,
 *     duration: Number,
 *     result  : Object
 * }
 *
 * Command :: {
 *     id         : String,
 *     description: String,
 *     canRollback: Boolean,
 *     execute    : ()            -> Promise<CommandResult>,
 *     rollback?  : CommandResult -> Promise<CommandResult>
 * }
 
 * AuditContext :: {
 *     source     : String,
 *     user       : String,
 *     environment: String,
 *     action     : String,
 *     migration  : String,
 *     dryRun     : Boolean,
 *     commandLine: String,
 *     cwd        : String,
 *     timestamp  : String
 * }
 *
 * AuditLogger :: { log: Object -> Void }
 
 
 */
import { existsSync } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { executePlan } from './index.js'

/**
 * Create audit logger for CLI operations
 * @sig createAuditLogger :: console|database -> AuditLogger
 */
const createAuditLogger = (auditLoggerType = 'console') => {
    // TODO: Implement SOC2-compliant database audit logger
    if (auditLoggerType === 'database')
        console.warn('Database audit logger not yet implemented, falling back to console')

    return { log: entry => console.log(`[AUDIT] ${JSON.stringify(entry)}`) }
}

/**
 * Load environment configuration
 * @sig loadEnvironmentConfig :: String -> Promise<Object>
 */
const loadEnvironmentConfig = async environment => {
    const configPath = join(resolve('./migrations'), 'config', `${environment}.json`)
    if (!existsSync(configPath)) throw new Error(`Environment config not found: ${configPath}`)

    try {
        const configContent = await readFile(configPath, 'utf8')
        return JSON.parse(configContent)
    } catch (error) {
        throw new Error(`Failed to load environment config: ${error.message}`)
    }
}

/**
 * Load migration file
 * @sig loadMigrationFile :: String -> Promise<Function>
 */
const loadMigrationFile = async migration => {
    const migrationsDir = resolve('./migrations')

    try {
        const files = await readdir(migrationsDir)
        const migrationFiles = files.filter(file => file.startsWith(`${migration}-`) && file.endsWith('.js'))

        if (migrationFiles.length === 0)
            throw new Error(`Migration file not found: ${migration}-*.js in ${migrationsDir}`)
        if (migrationFiles.length > 1)
            throw new Error(`Multiple migration files found for ${migration}: ${migrationFiles.join(', ')}`)

        const migrationPath = join(migrationsDir, migrationFiles[0])

        const migrationModule = await import(migrationPath)
        const migrationFunction = migrationModule.default

        if (typeof migrationFunction !== 'function')
            throw new Error(`Migration file must export a default function: ${migrationPath}`)

        return migrationFunction
    } catch (error) {
        if (error.code === 'ENOENT') throw new Error(`Migrations directory not found: ${migrationsDir}`)
        throw new Error(`Failed to load migration file: ${error.message}`)
    }
}

/**
 * Validate migration commands
 * @sig validateCommands :: [Command] -> Void
 */
// prettier-ignore
const validateCommands = commands => {
    const validateCommand = (command, index) => {
        if (!command || typeof command !== 'object') throw new Error(`Command at index ${index} must be an object`)
        
        const { id, description, canRollback, execute, rollback } = command
        
        if (!id          || typeof id          !== 'string')   throw new Error(`at index ${index} must have a string id property`)
        if (!description || typeof description !== 'string')   throw new Error(`at index ${index} must have a string description property`)
        if (                typeof canRollback !== 'boolean')  throw new Error(`at index ${index} must have a boolean canRollback property`)
        if (                typeof execute     !== 'function') throw new Error(`at index ${index} must have an execute function`)
        if (canRollback  && typeof rollback    !== 'function') throw new Error(`at index ${index} must have a rollback function when canRollback is true`)
    }

    if (!Array.isArray(commands)) throw new Error('Migration function must return an array of commands')
    commands.forEach(validateCommand)
}

/**
 * Check if current directory has migrations folder
 * @sig checkMigrationsDirectory :: () -> Void
 */
const checkMigrationsDirectory = () => {
    if (!existsSync('./migrations')) throw new Error('Current directory must contain a migrations/ folder')
    if (!existsSync('./migrations/config')) throw new Error('migrations/ folder must contain a config/ subdirectory')
}

/**
 * Create audit context for CLI operations
 * @sig createAuditContext :: (String, String, String, Boolean, Array) -> AuditContext
 */
const createAuditContext = (environment, action, migration, isApply, argv) => ({
    source: 'orchestrate-cli',
    user: process.env.USER || 'unknown',
    environment,
    action,
    migration,
    dryRun: !isApply,
    commandLine: process.argv.join(' '),
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
})

/**
 * Handle orchestrate command
 * @sig handleOrchestrateCommand :: Object -> Promise<Void>
 */
const handleOrchestrateCommand = async argv => {
    try {
        // Check project structure
        checkMigrationsDirectory()

        const { environment, action, migration, apply, auditLogger: auditLoggerType } = argv
        const isApply = Boolean(apply)

        // Load environment configuration
        console.log(`📋 Loading ${environment} configuration...`)
        const config = await loadEnvironmentConfig(environment)

        // Load migration file
        console.log(`📦 Loading migration ${migration}...`)
        const migrationFunction = await loadMigrationFile(migration)

        // Execute migration function to get commands
        console.log(`⚙️  Generating commands for ${action}...`)
        const commands = await migrationFunction(environment, config)

        // Validate commands
        validateCommands(commands)

        // Create audit logger and context
        const auditLogger = createAuditLogger(auditLoggerType)
        const auditContext = createAuditContext(environment, action, migration, isApply, argv)

        // Show what we're about to do
        if (isApply) {
            console.log(`🚀 Executing ${action} for migration ${migration} in ${environment}`)
            console.log(`   Commands to execute: ${commands.length}`)
        } else {
            console.log(`🔍 DRY RUN: ${action} for migration ${migration} in ${environment}`)
            console.log(`   Commands that would execute: ${commands.length}`)
            commands.forEach((command, i) => console.log(`   ${i + 1}. ${command.description} (id: ${command.id})`))
        }

        // Execute or dry-run the plan
        if (isApply) {
            const result = await executePlan(commands, { auditLogger, auditContext })

            if (result.success) {
                console.log(`✅ Migration ${migration} ${action} completed successfully`)
                console.log(`   Executed commands: ${result.executedCommands.length}`)
            } else {
                console.error(`❌ Migration ${migration} ${action} failed`)
                console.log(`   Executed commands: ${result.executedCommands.length}`)
                console.log(`   Rollback commands: ${result.rollbackCommands.length}`)
                process.exit(1)
            }
        } else {
            console.log(`✅ Dry run completed - use --apply to execute for real`)
            // Still log the dry run attempt
            auditLogger.log({ type: 'dry-run', phase: 'complete', commandCount: commands.length, ...auditContext })
        }

        // Exit successfully
        process.exit(0)
    } catch (error) {
        console.error(`❌ Orchestration failed: ${error.message}`)
        process.exit(1)
    }
}

// CLI setup
yargs(hideBin(process.argv))
    .scriptName('orchestrate')
    .usage('$0 <environment> <action> <migration> [options]')
    .command(
        '$0 <environment> <action> <migration>',
        'Execute migration with environment-specific configuration',
        yargs =>
            yargs
                .positional('environment', { describe: 'Target environment', type: 'string' })
                .positional('action', {
                    describe: 'Action to perform',
                    choices: ['execute', 'rollback'],
                    type: 'string',
                })
                .positional('migration', { describe: 'Migration identifier', type: 'string' })
                .option('apply', {
                    describe: 'Actually execute the migration (default is dry-run)',
                    type: 'boolean',
                    default: false,
                })
                .option('audit-logger', {
                    describe: 'Audit logging method for SOC2 compliance',
                    choices: ['console', 'firestore', 'database'],
                    type: 'string',
                    default: 'console',
                }),
        handleOrchestrateCommand,
    )
    .help()
    .alias('help', 'h')
    .version('1.0.0')
    .alias('version', 'V')
    .demandCommand(3, 'You must specify environment, action, and migration')
    .strict()
    .parse()
