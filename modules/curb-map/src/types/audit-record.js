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
import { OperationDetails } from './operation-details.js'

import * as R from '@graffio/cli-type-generator'

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
AuditRecord.fromFirestore = auditRecord => {
    const operationDetails = OperationDetails.fromFirestore(JSON.parse(auditRecord.operationDetails))
    return AuditRecord.from({
        ...auditRecord,
        operationDetails,
    })
}

export { AuditRecord }
