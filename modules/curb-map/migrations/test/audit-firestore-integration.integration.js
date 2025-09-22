import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { FieldTypes } from 'modules/curb-map/type-definitions/index.js'
import { resolve } from 'path'
import tap from 'tap'
import { FirestoreAdminAuditRecord } from '../../src/firestore/firestore-admin-audit-record.js'
import { AuditRecord, OperationDetails } from '../../src/types'

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node audit-firestore-integration.tap.js <config-path>')
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

const validateAuditRecordStructure = auditRecord => {
    const requiredFields = [
        'id',
        'timestamp',
        'eventType',
        'userId',
        'resource',
        'action',
        'outcome',
        'sourceIP',
        'auditVersion',
        'operationDetails',
        'correlationId',
        'environment',
    ]

    return requiredFields.every(field => Object.prototype.hasOwnProperty.call(auditRecord, field))
}

const validateAuditRecordId = auditRecord => {
    // Validate 12-character CUID format: aud_xxxxxxxxxxxx
    const idPattern = /^aud_[a-z0-9]{12}$/
    return idPattern.test(auditRecord.id)
}

// Get config path from command line
const { config } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

// Initialize Firebase Admin SDK
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
admin.initializeApp({ projectId })
const db = admin.firestore()

tap.test('Given the AuditRecord Firestore system', t => {
    t.test('When writing and reading audit records directly', async t => {
        const correlationId = FieldTypes.newCorrelationId()

        const id = FieldTypes.newAuditRecordId()
        const operationDetails = OperationDetails.FirestoreOperation('write', 'infrastructure-audit-logs', id)
        const testAuditRecord = AuditRecord.from({
            id,
            timestamp: new Date().toISOString(),
            eventType: 'infrastructure.test.direct_write',
            userId: 'system@infrastructure.local',
            resource: 'firestore',
            action: 'test_write',
            outcome: 'success',
            sourceIP: '127.0.0.1',
            auditVersion: '2.0',
            operationDetails,
            correlationId,
            environment: 'development',
        })

        // Test write
        await FirestoreAdminAuditRecord.Infrastructure.write(db, testAuditRecord)

        // Test read
        const readRecord = await FirestoreAdminAuditRecord.Infrastructure.read(db, testAuditRecord.id)
        t.ok(validateAuditRecordStructure(readRecord), 'Then read record should have valid structure')
        t.ok(validateAuditRecordId(readRecord), 'Then read record should have valid ID format')
        t.equal(readRecord.id, testAuditRecord.id, 'Then read record should have matching ID')

        // Test query
        const queryResults = await FirestoreAdminAuditRecord.Infrastructure.query(db, [
            ['correlationId', '>=', 'cor_'],
            ['correlationId', '<', 'cor_\uf8ff'],
        ])
        t.ok(queryResults.length > 0, 'Then query should find test records')
        t.ok(
            queryResults.some(r => r.id === testAuditRecord.id),
            'Then query should include our test record',
        )

        // Test delete - cleanup test record
        await FirestoreAdminAuditRecord.Infrastructure.delete(db, testAuditRecord.id)
        t.end()
    })

    t.test('When testing migration audit helper pattern', async t => {
        const migrationId = 'test-audit-helper'
        const correlationId = FieldTypes.newCorrelationId()

        const baseData = {
            userId: 'system@infrastructure.local',
            sourceIP: '127.0.0.1',
            auditVersion: '2.0',
            environment: 'development',
            correlationId,
        }

        // Test start logging
        const startRecord = AuditRecord.from({
            id: FieldTypes.newAuditRecordId(),
            ...baseData,
            timestamp: new Date().toISOString(),
            eventType: 'infrastructure.migration.start',
            resource: 'migration',
            action: 'execute',
            outcome: 'pending',
            operationDetails: OperationDetails.ShellExecution(`migration-${migrationId}`, null, 'migration started'),
        })

        await FirestoreAdminAuditRecord.Infrastructure.write(db, startRecord)

        // Test operation logging
        const opRecord = AuditRecord.from({
            id: FieldTypes.newAuditRecordId(),
            ...baseData,
            timestamp: new Date().toISOString(),
            eventType: 'infrastructure.migration.operation',
            resource: 'migration',
            action: 'test_operation',
            outcome: 'success',
            operationDetails: OperationDetails.GcpProjectOperation(projectId, null, 'us-west1'),
        })

        await FirestoreAdminAuditRecord.Infrastructure.write(db, opRecord)

        // Test complete logging
        const completeRecord = AuditRecord.from({
            id: FieldTypes.newAuditRecordId(),
            ...baseData,
            timestamp: new Date().toISOString(),
            eventType: 'infrastructure.migration.complete',
            resource: 'migration',
            action: 'execute',
            outcome: 'success',
            operationDetails: OperationDetails.ShellExecution(
                `migration-${migrationId}`,
                1200,
                'migration completed successfully',
            ),
        })

        await FirestoreAdminAuditRecord.Infrastructure.write(db, completeRecord)

        // Test that we can query the full audit trail
        const auditTrail = await FirestoreAdminAuditRecord.Infrastructure.query(db, [
            ['correlationId', '==', correlationId],
        ])

        t.equal(auditTrail.length, 3, 'Then audit trail should have start, operation, and complete records')

        const eventTypes = auditTrail.map(r => r.eventType)
        t.ok(eventTypes.includes('infrastructure.migration.start'), 'Then audit trail should include start event')
        t.ok(
            eventTypes.includes('infrastructure.migration.operation'),
            'Then audit trail should include operation event',
        )
        t.ok(eventTypes.includes('infrastructure.migration.complete'), 'Then audit trail should include complete event')

        // SOC2 compliance validation using our test records
        const sampleRecord = auditTrail[0]
        // SOC2 requires: who, what, when, where, outcome
        t.ok(sampleRecord.userId, 'Then audit records should identify WHO (userId)')
        t.ok(sampleRecord.action && sampleRecord.resource, 'Then audit records should identify WHAT (action/resource)')
        t.ok(sampleRecord.timestamp, 'Then audit records should identify WHEN (timestamp)')
        t.ok(sampleRecord.sourceIP, 'Then audit records should identify WHERE (sourceIP)')
        t.ok(sampleRecord.outcome, 'Then audit records should identify OUTCOME')
        t.ok(sampleRecord.correlationId, 'Then audit records should be traceable (correlationId)')
        t.ok(validateAuditRecordId(sampleRecord), 'Then audit records should have valid aud_xxxxxxxxxxxx format')

        // Cleanup test records
        await FirestoreAdminAuditRecord.Infrastructure.delete(db, startRecord.id)
        await FirestoreAdminAuditRecord.Infrastructure.delete(db, opRecord.id)
        await FirestoreAdminAuditRecord.Infrastructure.delete(db, completeRecord.id)
        t.end()
    })

    t.test('When testing error handling with invalid operations', async t => {
        // Test reading non-existent record - should throw
        try {
            await FirestoreAdminAuditRecord.Infrastructure.read(db, 'aud_nonexistent123')
            t.fail('Should have thrown exception for non-existent record')
        } catch (error) {
            t.pass('Then reading non-existent record should throw exception')
        }

        t.end()
    })

    t.end()
})
