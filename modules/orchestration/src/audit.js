/*
 * SOC2 Audit Logging System
 *
 * Provides comprehensive audit logging for all infrastructure operations
 * to support SOC2 compliance requirements. Creates immutable audit trails
 * with operator attribution and detailed operation context.
 *
 * All infrastructure changes flow through this system for compliance tracking.
 */

import fs from 'fs/promises'
import path from 'path'

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
 * Log infrastructure operations for SOC2 compliance
 *
 * Creates immutable audit records for all infrastructure changes.
 * Critical for compliance reporting and security incident investigation.
 *
 * @sig logInfrastructureOperation :: (String, Object) -> Promise<Void>
 */
const logInfrastructureOperation = async (eventType, data) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        operator: data.operator || process.env.USER || 'unknown',
        ...data,
        auditVersion: '1.0',
    }

    if (isTestContext()) {
        console.log(`[AUDIT LOG] ${eventType}:`, JSON.stringify(logEntry, null, 2))
        return
    }

    await writeAuditEntry(logEntry)
}

export { logInfrastructureOperation }
