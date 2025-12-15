// ABOUTME: Generated type definition for AuditRecord
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/audit-record.type.js - do not edit manually

/** {@link module:AuditRecord} */
/*  AuditRecord generated from: modules/curb-map/type-definitions/audit-record.type.js
 *
 *  id              : FieldTypes.auditRecordId,
 *  timestamp       : FieldTypes.timestamp,
 *  eventType       : FieldTypes.event,
 *  userId          : FieldTypes.email,
 *  resource        : FieldTypes.resourceName,
 *  action          : FieldTypes.resourceName,
 *  outcome         : /^(success|failure|pending)$/,
 *  sourceIP        : FieldTypes.ipv4Type,
 *  auditVersion    : FieldTypes.semanticVersion,
 *  operationDetails: "OperationDetails",
 *  errorMessage    : "String?",
 *  correlationId   : FieldTypes.correlationId,
 *  environment     : FieldTypes.environment
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

import { OperationDetails } from './operation-details.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a AuditRecord instance
 * @sig AuditRecord :: ([Object], [Object], [Object], [Object], [Object], [Object], Outcome, [Object], [Object], OperationDetails, String?, [Object], [Object]) -> AuditRecord
 *     Outcome = /^(success|failure|pending)$/
 */
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
    const constructorName =
        'AuditRecord(id, timestamp, eventType, userId, resource, action, outcome, sourceIP, auditVersion, operationDetails, errorMessage, correlationId, environment)'

    R.validateRegex(constructorName, FieldTypes.auditRecordId, 'id', false, id)
    R.validateRegex(constructorName, FieldTypes.timestamp, 'timestamp', false, timestamp)
    R.validateRegex(constructorName, FieldTypes.event, 'eventType', false, eventType)
    R.validateRegex(constructorName, FieldTypes.email, 'userId', false, userId)
    R.validateRegex(constructorName, FieldTypes.resourceName, 'resource', false, resource)
    R.validateRegex(constructorName, FieldTypes.resourceName, 'action', false, action)
    R.validateRegex(constructorName, /^(success|failure|pending)$/, 'outcome', false, outcome)
    R.validateRegex(constructorName, FieldTypes.ipv4Type, 'sourceIP', false, sourceIP)
    R.validateRegex(constructorName, FieldTypes.semanticVersion, 'auditVersion', false, auditVersion)
    R.validateTag(constructorName, 'OperationDetails', 'operationDetails', false, operationDetails)
    R.validateString(constructorName, 'errorMessage', true, errorMessage)
    R.validateRegex(constructorName, FieldTypes.correlationId, 'correlationId', false, correlationId)
    R.validateRegex(constructorName, FieldTypes.environment, 'environment', false, environment)

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
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig auditrecordToString :: () -> String
 */
const auditrecordToString = function () {
    return `AuditRecord(
        ${R._toString(this.id)},
        ${R._toString(this.timestamp)},
        ${R._toString(this.eventType)},
        ${R._toString(this.userId)},
        ${R._toString(this.resource)},
        ${R._toString(this.action)},
        ${R._toString(this.outcome)},
        ${R._toString(this.sourceIP)},
        ${R._toString(this.auditVersion)},
        ${R._toString(this.operationDetails)},
        ${R._toString(this.errorMessage)},
        ${R._toString(this.correlationId)},
        ${R._toString(this.environment)},
    )`
}

/**
 * Convert to JSON representation
 * @sig auditrecordToJSON :: () -> Object
 */
const auditrecordToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'AuditRecord', enumerable: false },
    toString: { value: auditrecordToString, enumerable: false },
    toJSON: { value: auditrecordToJSON, enumerable: false },
    constructor: { value: AuditRecord, enumerable: false, writable: true, configurable: true },
})

AuditRecord.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
AuditRecord.toString = () => 'AuditRecord'
AuditRecord.is = v => v && v['@@typeName'] === 'AuditRecord'

AuditRecord._from = o => {
    const {
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
    } = o
    return AuditRecord(
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
    )
}
AuditRecord.from = AuditRecord._from

AuditRecord._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        timestamp: o.timestamp,
        eventType: o.eventType,
        userId: o.userId,
        resource: o.resource,
        action: o.action,
        outcome: o.outcome,
        sourceIP: o.sourceIP,
        auditVersion: o.auditVersion,
        operationDetails: OperationDetails.toFirestore(o.operationDetails, encodeTimestamps),
        correlationId: o.correlationId,
        environment: o.environment,
    }

    if (o.errorMessage != null) result.errorMessage = o.errorMessage

    return result
}

AuditRecord._fromFirestore = (doc, decodeTimestamps) =>
    AuditRecord._from({
        id: doc.id,
        timestamp: doc.timestamp,
        eventType: doc.eventType,
        userId: doc.userId,
        resource: doc.resource,
        action: doc.action,
        outcome: doc.outcome,
        sourceIP: doc.sourceIP,
        auditVersion: doc.auditVersion,
        operationDetails: OperationDetails.fromFirestore
            ? OperationDetails.fromFirestore(doc.operationDetails, decodeTimestamps)
            : OperationDetails.from(doc.operationDetails),
        errorMessage: doc.errorMessage,
        correlationId: doc.correlationId,
        environment: doc.environment,
    })

// Public aliases (override if necessary)
AuditRecord.toFirestore = AuditRecord._toFirestore
AuditRecord.fromFirestore = AuditRecord._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { AuditRecord }
