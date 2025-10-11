/** {@link module:ActionRequest} */
/*  ActionRequest generated from: modules/curb-map/type-definitions/action-request.type.js
 *
 *  id            : FieldTypes.actionRequestId,
 *  action        : "Action",
 *  actorId       : FieldTypes.actorId,
 *  subjectId     : FieldTypes.subjectId,
 *  subjectType   : /^(user|organization|project)$/,
 *  organizationId: FieldTypes.organizationId,
 *  projectId     : "/^prj_[a-z0-9]{12,}$/?",
 *  status        : /^(pending|completed|failed)$/,
 *  idempotencyKey: FieldTypes.idempotencyKey,
 *  resultData    : "Object?",
 *  error         : "String?",
 *  correlationId : FieldTypes.correlationId,
 *  schemaVersion : "Number",
 *  createdAt     : "Object",
 *  processedAt   : "Object?"
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
    status,
    idempotencyKey,
    resultData,
    error,
    correlationId,
    schemaVersion,
    createdAt,
    processedAt,
) {
    const constructorName =
        'ActionRequest(id, action, actorId, subjectId, subjectType, organizationId, projectId, status, idempotencyKey, resultData, error, correlationId, schemaVersion, createdAt, processedAt)'

    R.validateRegex(constructorName, FieldTypes.actionRequestId, 'id', false, id)
    R.validateTag(constructorName, 'Action', 'action', false, action)
    R.validateRegex(constructorName, FieldTypes.actorId, 'actorId', false, actorId)
    R.validateRegex(constructorName, FieldTypes.subjectId, 'subjectId', false, subjectId)
    R.validateRegex(constructorName, /^(user|organization|project)$/, 'subjectType', false, subjectType)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, /^prj_[a-z0-9]{12,}$/, 'projectId', true, projectId)
    R.validateRegex(constructorName, /^(pending|completed|failed)$/, 'status', false, status)
    R.validateRegex(constructorName, FieldTypes.idempotencyKey, 'idempotencyKey', false, idempotencyKey)
    R.validateObject(constructorName, 'resultData', true, resultData)
    R.validateString(constructorName, 'error', true, error)
    R.validateRegex(constructorName, FieldTypes.correlationId, 'correlationId', false, correlationId)
    R.validateNumber(constructorName, 'schemaVersion', false, schemaVersion)
    R.validateObject(constructorName, 'createdAt', false, createdAt)
    R.validateObject(constructorName, 'processedAt', true, processedAt)

    const result = Object.create(prototype)
    result.id = id
    result.action = action
    result.actorId = actorId
    result.subjectId = subjectId
    result.subjectType = subjectType
    result.organizationId = organizationId
    if (projectId != null) result.projectId = projectId
    result.status = status
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
const prototype = {
    toString: function () {
        return `ActionRequest(${R._toString(this.id)}, ${R._toString(this.action)}, ${R._toString(this.actorId)}, ${R._toString(this.subjectId)}, ${R._toString(this.subjectType)}, ${R._toString(this.organizationId)}, ${R._toString(this.projectId)}, ${R._toString(this.status)}, ${R._toString(this.idempotencyKey)}, ${R._toString(this.resultData)}, ${R._toString(this.error)}, ${R._toString(this.correlationId)}, ${R._toString(this.schemaVersion)}, ${R._toString(this.createdAt)}, ${R._toString(this.processedAt)})`
    },
    toJSON() {
        return this
    },
}

ActionRequest.prototype = prototype
prototype.constructor = ActionRequest

Object.defineProperty(prototype, '@@typeName', { value: 'ActionRequest' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ActionRequest.toString = () => 'ActionRequest'
ActionRequest.is = v => v && v['@@typeName'] === 'ActionRequest'
ActionRequest.from = o =>
    ActionRequest(
        o.id,
        o.action,
        o.actorId,
        o.subjectId,
        o.subjectType,
        o.organizationId,
        o.projectId,
        o.status,
        o.idempotencyKey,
        o.resultData,
        o.error,
        o.correlationId,
        o.schemaVersion,
        o.createdAt,
        o.processedAt,
    )

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: timestampFields
ActionRequest.timestampFields = ['createdAt', 'processedAt']

// Additional function: toFirestore
ActionRequest.toFirestore = actionRequest => ({
    ...actionRequest,
    actor: {
        id: actionRequest.actorId,
        type: 'user',
    },
    subject: {
        id: actionRequest.subjectId,
        type: actionRequest.subjectType,
    },
    action: Action.toFirestore(actionRequest.action),
    createdAt: actionRequest.createdAt,
    processedAt: actionRequest?.processedAt,
})

// Additional function: fromFirestore
ActionRequest.fromFirestore = actionRequest =>
    ActionRequest.from({
        ...actionRequest,
        actorId: actionRequest.actor.id,
        subjectId: actionRequest.subject.id,
        subjectType: actionRequest.subject.type,
        action: Action.fromFirestore(actionRequest.action),
        createdAt: actionRequest.createdAt,
        processedAt: actionRequest?.processedAt,
    })

// Additional function: toLog
ActionRequest.toLog = o => {
    const r = pick(['id', 'actorId', 'organizationId', 'projectId', 'status', 'idempotencyKey', 'correlationId'], o)
    r.action = Action.toLog(o.action)
    return r
}

export { ActionRequest }
