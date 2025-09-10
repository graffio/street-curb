#!/usr/bin/env node

/*
 * Infrastructure Migration Orchestrate CLI
 *
 * Simplified CLI for executing migration files with environment-specific
 * configuration and safe-by-default behavior.
 *
 * Usage:
 *   orchestrate <environment> <migration> [--apply] [--rollback] [--audit-to=console|firestore]
 *   orchestrate prod 046                                  # dry-run (safe default)
 *   orchestrate prod 046 --apply                          # actual execution
 *   orchestrate prod 047 --apply --rollback               # rollback execution
 *   orchestrate staging 046 --audit-to=firestore --apply  # with firestore audit
 */

import { existsSync } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'
import { logInfrastructureOperation } from './audit.js'
import { executePlan } from './executor.js'

// Simple argument parser
const parseArgs = () => {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        console.error(
            'Usage: orchestrate <environment> <migration> [--apply] [--rollback] [--audit-to=console|firestore]',
        )
        process.exit(1)
    }

    const environment = args[0]
    const migration = args[1]
    const apply = args.includes('--apply')
    const rollback = args.includes('--rollback')

    const auditToArg = args.find(arg => arg.startsWith('--audit-to='))
    const auditTo = auditToArg ? auditToArg.split('=')[1] : 'console'

    return { environment, migration, apply, rollback, auditTo }
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

            if (result.success) console.log(`✅ Migration ${migration} ${operation} completed successfully`)
            else {
                console.error(`❌ Migration ${migration} ${operation} failed`)
                process.exit(1)
            }
        }

        const { environment, migration, apply, rollback, auditTo } = parseArgs()

        if (!existsSync('./migrations')) throw new Error('Current directory must contain a migrations/ folder')

        // Load migration
        const migrationsDir = resolve('./migrations')
        const files = await readdir(migrationsDir)
        const migrationFiles = files.filter(file => file.startsWith(`${migration}-`) && file.endsWith('.js'))

        if (migrationFiles.length !== 1) throw new Error(`Migration file not found or ambiguous: ${migration}`)

        const migrationPath = join(migrationsDir, migrationFiles[0])
        const migrationModule = await import(migrationPath)
        const migrationFunction = migrationModule.default

        // Load config
        const configPath = join(migrationsDir, 'config', `${environment}.json`)
        const configContent = await readFile(configPath, 'utf8')
        const config = JSON.parse(configContent)

        // Execute migration
        const commands = await migrationFunction(environment, config)
        const auditLogger = createAuditLogger(auditTo)
        const auditContext = {
            source: 'orchestrate-cli',
            user: process.env.USER || 'unknown',
            environment,
            action: rollback ? 'rollback' : 'execute',
            migration,
            dryRun: !apply,
            timestamp: new Date().toISOString(),
        }

        console.log(
            `\n${apply ? 'RUNNING' : 'DRY RUN'}: ${rollback ? 'ROLLBACK' : 'EXECUTE'} migration ${migration} in ${environment}`,
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
