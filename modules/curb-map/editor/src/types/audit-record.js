// Auto-generated static tagged type: AuditRecord
// Generated from: ../../types/src/audit-record.type.js
// {
//     timestamp       : "String"
//     eventType       : "String"
//     userId          : "String"
//     resource        : "String"
//     action          : "String"
//     outcome         : "String"
//     sourceIP        : "String"
//     operationDetails: "OperationDetails?"
//     errorMessage    : "String?"
//     sessionId       : "String?"
//     environment     : "String?"
//     migrationId     : "String?"
//     auditVersion    : "String"
// }

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const AuditRecord = function AuditRecord(
    timestamp,
    eventType,
    userId,
    resource,
    action,
    outcome,
    sourceIP,
    operationDetails,
    errorMessage,
    sessionId,
    environment,
    migrationId,
    auditVersion,
) {
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'timestamp',
        false,
        timestamp,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'eventType',
        false,
        eventType,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'userId',
        false,
        userId,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'resource',
        false,
        resource,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'action',
        false,
        action,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'outcome',
        false,
        outcome,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'sourceIP',
        false,
        sourceIP,
    )
    R.validateTag(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'OperationDetails',
        'operationDetails',
        true,
        operationDetails,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'errorMessage',
        true,
        errorMessage,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'sessionId',
        true,
        sessionId,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'environment',
        true,
        environment,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'migrationId',
        true,
        migrationId,
    )
    R.validateString(
        'AuditRecord(timestamp, eventType, userId, resource, action, outcome, sourceIP, operationDetails, errorMessage, sessionId, environment, migrationId, auditVersion)',
        'auditVersion',
        false,
        auditVersion,
    )

    const result = Object.create(prototype)
    result.timestamp = timestamp
    result.eventType = eventType
    result.userId = userId
    result.resource = resource
    result.action = action
    result.outcome = outcome
    result.sourceIP = sourceIP
    if (operationDetails != null) result.operationDetails = operationDetails
    if (errorMessage != null) result.errorMessage = errorMessage
    if (sessionId != null) result.sessionId = sessionId
    if (environment != null) result.environment = environment
    if (migrationId != null) result.migrationId = migrationId
    result.auditVersion = auditVersion
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `AuditRecord(${R._toString(this.timestamp)}, ${R._toString(this.eventType)}, ${R._toString(this.userId)}, ${R._toString(this.resource)}, ${R._toString(this.action)}, ${R._toString(this.outcome)}, ${R._toString(this.sourceIP)}, ${R._toString(this.operationDetails)}, ${R._toString(this.errorMessage)}, ${R._toString(this.sessionId)}, ${R._toString(this.environment)}, ${R._toString(this.migrationId)}, ${R._toString(this.auditVersion)})`
    },
    toJSON() {
        return this
    },
}

AuditRecord.prototype = prototype
prototype.constructor = AuditRecord

Object.defineProperty(prototype, '@@typeName', { value: 'AuditRecord' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
AuditRecord.toString = () => 'AuditRecord'
AuditRecord.is = v => v && v['@@typeName'] === 'AuditRecord'
AuditRecord.from = o =>
    AuditRecord(
        o.timestamp,
        o.eventType,
        o.userId,
        o.resource,
        o.action,
        o.outcome,
        o.sourceIP,
        o.operationDetails,
        o.errorMessage,
        o.sessionId,
        o.environment,
        o.migrationId,
        o.auditVersion,
    )

export { AuditRecord }
