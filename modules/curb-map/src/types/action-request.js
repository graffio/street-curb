/** {@link module:ActionRequest} */
/*  ActionRequest generated from: modules/curb-map/type-definitions/action-request.type.js
 *
 *  id            : FieldTypes.actionRequestId,
 *  action        : "Action",
 *  actorId       : FieldTypes.actorId,
 *  subjectId     : FieldTypes.subjectId,
 *  subjectType   : /^(user|organization|project)$/,
 *  organizationId: "/^org_[a-z0-9]{12,}$/?",
 *  projectId     : "/^prj_[a-z0-9]{12,}$/?",
 *  idempotencyKey: FieldTypes.idempotencyKey,
 *  resultData    : "Object?",
 *  error         : "String?",
 *  correlationId : FieldTypes.correlationId,
 *  schemaVersion : "Number",
 *  createdAt     : "Date",
 *  processedAt   : "Date?"
 *
 */

import { pick } from '@graffio/functional'
import { Action } from './action.js'
import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const ActionRequest = function ActionRequest(
    id,
    action,
    actorId,
    subjectId,
    subjectType,
    organizationId,
    projectId,
    idempotencyKey,
    resultData,
    error,
    correlationId,
    schemaVersion,
    createdAt,
    processedAt,
) {
    const constructorName =
        'ActionRequest(id, action, actorId, subjectId, subjectType, organizationId, projectId, idempotencyKey, resultData, error, correlationId, schemaVersion, createdAt, processedAt)'

    R.validateRegex(constructorName, FieldTypes.actionRequestId, 'id', false, id)
    R.validateTag(constructorName, 'Action', 'action', false, action)
    R.validateRegex(constructorName, FieldTypes.actorId, 'actorId', false, actorId)
    R.validateRegex(constructorName, FieldTypes.subjectId, 'subjectId', false, subjectId)
    R.validateRegex(constructorName, /^(user|organization|project)$/, 'subjectType', false, subjectType)
    R.validateRegex(constructorName, /^org_[a-z0-9]{12,}$/, 'organizationId', true, organizationId)
    R.validateRegex(constructorName, /^prj_[a-z0-9]{12,}$/, 'projectId', true, projectId)
    R.validateRegex(constructorName, FieldTypes.idempotencyKey, 'idempotencyKey', false, idempotencyKey)
    R.validateObject(constructorName, 'resultData', true, resultData)
    R.validateString(constructorName, 'error', true, error)
    R.validateRegex(constructorName, FieldTypes.correlationId, 'correlationId', false, correlationId)
    R.validateNumber(constructorName, 'schemaVersion', false, schemaVersion)
    R.validateDate(constructorName, 'createdAt', false, createdAt)
    R.validateDate(constructorName, 'processedAt', true, processedAt)

    const result = Object.create(prototype)
    result.id = id
    result.action = action
    result.actorId = actorId
    result.subjectId = subjectId
    result.subjectType = subjectType
    if (organizationId != null) result.organizationId = organizationId
    if (projectId != null) result.projectId = projectId
    result.idempotencyKey = idempotencyKey
    if (resultData != null) result.resultData = resultData
    if (error != null) result.error = error
    result.correlationId = correlationId
    result.schemaVersion = schemaVersion
    result.createdAt = createdAt
    if (processedAt != null) result.processedAt = processedAt
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ActionRequest', enumerable: false },

    toString: {
        value: function () {
            return `ActionRequest(${R._toString(this.id)}, ${R._toString(this.action)}, ${R._toString(this.actorId)}, ${R._toString(this.subjectId)}, ${R._toString(this.subjectType)}, ${R._toString(this.organizationId)}, ${R._toString(this.projectId)}, ${R._toString(this.idempotencyKey)}, ${R._toString(this.resultData)}, ${R._toString(this.error)}, ${R._toString(this.correlationId)}, ${R._toString(this.schemaVersion)}, ${R._toString(this.createdAt)}, ${R._toString(this.processedAt)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: ActionRequest,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ActionRequest.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ActionRequest.toString = () => 'ActionRequest'
ActionRequest.is = v => v && v['@@typeName'] === 'ActionRequest'

ActionRequest._from = o =>
    ActionRequest(
        o.id,
        o.action,
        o.actorId,
        o.subjectId,
        o.subjectType,
        o.organizationId,
        o.projectId,
        o.idempotencyKey,
        o.resultData,
        o.error,
        o.correlationId,
        o.schemaVersion,
        o.createdAt,
        o.processedAt,
    )
ActionRequest.from = ActionRequest._from

// -------------------------------------------------------------------------------------------------------------
//
// Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------
ActionRequest._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        action: Action.toFirestore(o.action, encodeTimestamps),
        actorId: o.actorId,
        subjectId: o.subjectId,
        subjectType: o.subjectType,
        idempotencyKey: o.idempotencyKey,
        correlationId: o.correlationId,
        schemaVersion: o.schemaVersion,
        createdAt: encodeTimestamps(o.createdAt),
    }

    if (o.organizationId != null) result.organizationId = o.organizationId

    if (o.projectId != null) result.projectId = o.projectId

    if (o.resultData != null) result.resultData = o.resultData

    if (o.error != null) result.error = o.error

    if (o.processedAt != null) result.processedAt = encodeTimestamps(o.processedAt)

    return result
}

ActionRequest._fromFirestore = (doc, decodeTimestamps) =>
    ActionRequest._from({
        id: doc.id,
        action: Action.fromFirestore ? Action.fromFirestore(doc.action, decodeTimestamps) : Action.from(doc.action),
        actorId: doc.actorId,
        subjectId: doc.subjectId,
        subjectType: doc.subjectType,
        organizationId: doc.organizationId,
        projectId: doc.projectId,
        idempotencyKey: doc.idempotencyKey,
        resultData: doc.resultData,
        error: doc.error,
        correlationId: doc.correlationId,
        schemaVersion: doc.schemaVersion,
        createdAt: decodeTimestamps(doc.createdAt),
        processedAt: doc.processedAt != null ? decodeTimestamps(doc.processedAt) : undefined,
    })

// Public aliases (override if necessary)
ActionRequest.toFirestore = ActionRequest._toFirestore
ActionRequest.fromFirestore = ActionRequest._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

ActionRequest.toLog = o => {
    const r = pick(['id', 'actorId', 'organizationId', 'projectId', 'idempotencyKey', 'correlationId'], o)
    r.action = Action.toLog(o.action)
    return r
}

export { ActionRequest }
