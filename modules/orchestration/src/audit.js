/*
 * SOC2 Audit Logging System
 *
 * Provides comprehensive audit logging for all infrastructure operations
 * to support SOC2 compliance requirements. Creates immutable audit trails
 * in Firestore with structured schema and operator attribution.
 *
 * All infrastructure changes flow through this system for compliance tracking.
 */

import fs from 'fs/promises'
import path from 'path'
import { executeShellCommand } from './shell.js'
import { AuditRecord, OperationDetails } from './types/index.js'

/**
 * Check if running in test context to avoid creating audit files
 * @sig isTestContext :: () -> Boolean
 */
const isTestContext = () =>
    process.env.NODE_ENV === 'test' || process.env.TAP === '1' || process.argv.some(arg => arg.includes('tap'))

/**
 * Write audit entry to daily log file
 * @sig writeAuditEntry :: (Object) -> Promise<Void>
 */
const writeAuditEntry = async logEntry => {
    const auditDir = path.join(process.cwd(), '.audit-logs')

    try {
        await fs.mkdir(auditDir, { recursive: true })
    } catch (error) {
        // Directory might already exist
    }

    const date = new Date().toISOString().split('T')[0]
    const logFile = path.join(auditDir, `infrastructure-${date}.log`)
    const logLine = JSON.stringify(logEntry) + '\n'

    await fs.appendFile(logFile, logLine)
}

/**
 * Create typed audit entry based on operation type and outcome
 * @sig createTypedAuditEntry :: (String, Object) -> AuditRecord
 */
const createTypedAuditEntry = (eventType, auditData, soc2Data) => {
    const auditForDryRun = () =>
        AuditRecord.from({
            ...data,
            ...soc2Data,
            action: 'shell_command_dry_run',
            operationDetails: OperationDetails.ShellExecution(command, null, null),
        })

    const auditForShellExecute = () =>
        AuditRecord.from({
            ...data,
            ...soc2Data,
            action: 'shell_command_execute',
            operationDetails: OperationDetails.ShellExecution(command, auditData.duration, auditData.output || null),
        })

    const command = auditData.command
    const data = {
        auditVersion: '2.0',
        environment: auditData.environment,
        errorMessage: auditData.error || null,
        eventType,
        outcome: auditData.outcome || 'success',
        timestamp: new Date().toISOString(),
    }

    if (eventType === 'infrastructure.shell.dry_run') return auditForDryRun()
    if (eventType === 'infrastructure.shell.execute') return auditForShellExecute()

    throw new Error(`Don't understand eventType: ${eventType}`)
}

/**
 * Log infrastructure operations using typed AuditRecord structure
 *
 * Creates runtime-validated audit records with SOC2 compliance.
 * Currently logs to console/file but structured for future Firestore migration.
 *
 * @sig logInfrastructureOperation :: (String, Object) -> Promise<Void>
 */
const logInfrastructureOperation = async (eventType, auditData, soc2Data) => {
    const auditRecord = createTypedAuditEntry(eventType, auditData, soc2Data)

    if (isTestContext()) {
        console.log(`[AUDIT LOG] ${eventType}:`, JSON.stringify(auditRecord, null, 2))
        return
    }

    // TODO: When Firebase project exists, replace with:
    // await storeInFirestore('audit-logs', auditRecord)
    await writeAuditEntry(auditRecord)
}

/*
 * Execute command with dry-run logic, console logging, and SOC2 audit trail
 * @sig logOrRunShellCommand :: (Boolean, String, Object?) -> Promise<Object>
 */
const logOrRunShellCommand = async (isDryRun, command, soc2Data) => {
    if (isDryRun) {
        await logInfrastructureOperation('infrastructure.shell.dry_run', { command }, soc2Data)
        console.log(`    [DRY-RUN] ${command}`)
        return { status: 'success', output: 'dry-run' }
    }

    const startTime = Date.now()

    try {
        const result = await executeShellCommand(command)
        const auditData = { outcome: 'success', command, output: result.output, duration: Date.now() - startTime }
        await logInfrastructureOperation('infrastructure.shell.execute', auditData, soc2Data)

        return result
    } catch (error) {
        const auditData = { outcome: 'failure', command, error: error.message, duration: Date.now() - startTime }
        await logInfrastructureOperation('infrastructure.shell.execute', auditData, soc2Data)

        throw error
    }
}

export { logOrRunShellCommand }
