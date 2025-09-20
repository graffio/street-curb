/*  AuditRecord generated from: modules/types/src/audit-record.type.js

    id              : FieldTypes.auditRecordId,
    timestamp       : FieldTypes.timestamp,
    eventType       : FieldTypes.event,
    userId          : FieldTypes.email,
    resource        : FieldTypes.resourceName,
    action          : FieldTypes.resourceName,
    outcome         : /^(success|failure|pending)$/,
    sourceIP        : FieldTypes.ipv4Type,
    auditVersion    : FieldTypes.semanticVersion,
    operationDetails: "OperationDetails",
    errorMessage    : "String?",
    correlationId   : FieldTypes.correlationId,
    environment     : FieldTypes.environment

*/

import { OperationDetails } from '@graffio/orchestration/src/types/index.js'
import { FieldTypes } from '@graffio/types'

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const AuditRecord = function AuditRecord(
    id,
    timestamp,
    eventType,
    userId,
    resource,
    action,
    outcome,
    sourceIP,
    auditVersion,
    operationDetails,
    errorMessage,
    correlationId,
    environment,
) {
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.auditRecordId,
        'id',
        false,
        id,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.timestamp,
        'timestamp',
        false,
        timestamp,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.event,
        'eventType',
        false,
        eventType,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.email,
        'userId',
        false,
        userId,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.resourceName,
        'resource',
        false,
        resource,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.resourceName,
        'action',
        false,
        action,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        /^(success|failure|pending)$/,
        'outcome',
        false,
        outcome,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.ipv4Type,
        'sourceIP',
        false,
        sourceIP,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.semanticVersion,
        'auditVersion',
        false,
        auditVersion,
    )
    R.validateTag(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        'OperationDetails',
        'operationDetails',
        false,
        operationDetails,
    )
    R.validateString(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        'errorMessage',
        true,
        errorMessage,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.correlationId,
        'correlationId',
        false,
        correlationId,
    )
    R.validateRegex(
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)',
        FieldTypes.environment,
        'environment',
        false,
        environment,
    )

    const result = Object.create(prototype)
    result.id = id
    result.timestamp = timestamp
    result.eventType = eventType
    result.userId = userId
    result.resource = resource
    result.action = action
    result.outcome = outcome
    result.sourceIP = sourceIP
    result.auditVersion = auditVersion
    result.operationDetails = operationDetails
    if (errorMessage != null) result.errorMessage = errorMessage
    result.correlationId = correlationId
    result.environment = environment
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `AuditRecord(${R._toString(this.id)}, ${R._toString(this.timestamp)}, ${R._toString(this.eventType)}, ${R._toString(this.userId)}, ${R._toString(this.resource)}, ${R._toString(this.action)}, ${R._toString(this.outcome)}, ${R._toString(this.sourceIP)}, ${R._toString(this.auditVersion)}, ${R._toString(this.operationDetails)}, ${R._toString(this.errorMessage)}, ${R._toString(this.correlationId)}, ${R._toString(this.environment)})`
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
        o.id,
        o.timestamp,
        o.eventType,
        o.userId,
        o.resource,
        o.action,
        o.outcome,
        o.sourceIP,
        o.auditVersion,
        o.operationDetails,
        o.errorMessage,
        o.correlationId,
        o.environment,
    )

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: toFirestore
AuditRecord.toFirestore = auditRecord => ({
    ...auditRecord,
    operationDetails: OperationDetails.toFirestore(auditRecord.operationDetails),
})

// Additional function: fromFirestore
AuditRecord.fromFirestore = auditRecord =>
    AuditRecord.fromFirestore({
        ...auditRecord,
        operationDetails: OperationDetails.fromFirestore(auditRecord.operationDetails),
    })

export { AuditRecord }
