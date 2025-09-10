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

import { existsSync } from 'fs'
import { resolve } from 'path'
import { logInfrastructureOperation } from './audit.js'
import { executePlan } from './executor.js'

// Simple argument parser
const parseArgs = () => {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        console.error(
            'Usage: orchestrate <config-file> <migration-file> [--apply] [--rollback] [--audit-to=console|firestore]',
        )
        process.exit(1)
    }

    const configFile = args[0]
    const migrationFile = args[1]
    const apply = args.includes('--apply')
    const rollback = args.includes('--rollback')

    const auditToArg = args.find(arg => arg.startsWith('--audit-to='))
    const auditTo = auditToArg ? auditToArg.split('=')[1] : 'console'

    return { configFile, migrationFile, apply, rollback, auditTo }
}

// Create audit logger
const createAuditLogger = (auditTo = 'console') => {
    if (auditTo === 'firestore') console.warn('Firestore audit logger not yet implemented, falling back to file')

    return entry => {
        // Use SOC2-compliant file-based audit logging
        logInfrastructureOperation(entry.type || 'infrastructure-operation', entry).catch(error =>
            console.error('Audit logging failed:', error),
        )
    }
}

// Main execution
const main = async () => {
    try {
        const dryRun = async () =>
            auditLogger({ type: 'dry-run', phase: 'complete', commandCount: commands.length, ...auditContext })

        const run = async () => {
            const mode = rollback ? 'rollback' : 'execute'
            const result = await executePlan(commands, { auditLogger, auditContext, mode })
            const operation = rollback ? 'rollback' : 'execution'

            if (result.success) console.log(`✅ Migration ${migrationFile} ${operation} completed successfully`)
            else {
                console.error(`❌ Migration ${migrationFile} ${operation} failed`)
                process.exit(1)
            }
        }

        const { configFile, migrationFile, apply, rollback, auditTo } = parseArgs()

        // Validate files exist
        if (!existsSync(configFile)) throw new Error(`Config file not found: ${configFile}`)
        if (!existsSync(migrationFile)) throw new Error(`Migration file not found: ${migrationFile}`)

        // Load config file directly
        const configPath = resolve(configFile)
        const configModule = await import(configPath)
        const config = configModule.default

        if (!config || typeof config !== 'object')
            throw new Error(`Config file must export a default object: ${configPath}`)

        // Load migration file directly
        const migrationPath = resolve(migrationFile)
        const migrationModule = await import(migrationPath)
        const migrationFunction = migrationModule.default

        if (typeof migrationFunction !== 'function')
            throw new Error(`Migration file must export a default function: ${migrationPath}`)

        // Extract environment name from config file (e.g., "prod.js" -> "prod")
        const configFileName = configFile.split('/').pop().replace(/\.js$/, '')

        // Execute migration with config only
        const commands = await migrationFunction(config)
        const auditLogger = createAuditLogger(auditTo)
        const auditContext = {
            source: 'orchestrate-cli',
            user: process.env.USER || 'unknown',
            environment: configFileName,
            action: rollback ? 'rollback' : 'execute',
            migration: migrationFile,
            dryRun: !apply,
            timestamp: new Date().toISOString(),
        }

        console.log(
            `\n${apply ? 'RUNNING' : 'DRY RUN'}: ${rollback ? 'ROLLBACK' : 'EXECUTE'} migration ${migrationFile} with ${configFileName}`,
        )
        commands.forEach(cmd => {
            const executeCmd = rollback && cmd.rollback ? cmd.rollback.command : cmd.execute.command
            console.log(`   ${cmd.id.padEnd(30)} → ${cmd.description}`)
            console.log(`   ${' '.repeat(30)}   ${executeCmd}`)
        })

        apply ? await run() : await dryRun()
    } catch (error) {
        console.error(`❌ Orchestration failed: ${error.message}`)
        process.exit(1)
    }
}

main()
