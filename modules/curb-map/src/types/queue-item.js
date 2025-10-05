/** {@link module:QueueItem} */
/*  QueueItem generated from: modules/curb-map/type-definitions/queue-item.type.js
 *
 *  id            : FieldTypes.queueItemId,
 *  actorId       : FieldTypes.actorId,
 *  action        : "Action",
 *  idempotencyKey: FieldTypes.idempotencyKey,
 *  status        : /^(pending|completed|failed)$/,
 *  resultData    : "Object?",
 *  error         : "String?",
 *  createdAt     : "Object",
 *  processedAt   : "Object?"
 *
 */

import { Action } from './action.js'
import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const QueueItem = function QueueItem(
    id,
    actorId,
    action,
    idempotencyKey,
    status,
    resultData,
    error,
    createdAt,
    processedAt,
) {
    const constructorName =
        'QueueItem(id, actorId, action, idempotencyKey, status, resultData, error, createdAt, processedAt)'

    R.validateRegex(constructorName, FieldTypes.queueItemId, 'id', false, id)
    R.validateRegex(constructorName, FieldTypes.actorId, 'actorId', false, actorId)
    R.validateTag(constructorName, 'Action', 'action', false, action)
    R.validateRegex(constructorName, FieldTypes.idempotencyKey, 'idempotencyKey', false, idempotencyKey)
    R.validateRegex(constructorName, /^(pending|completed|failed)$/, 'status', false, status)
    R.validateObject(constructorName, 'resultData', true, resultData)
    R.validateString(constructorName, 'error', true, error)
    R.validateObject(constructorName, 'createdAt', false, createdAt)
    R.validateObject(constructorName, 'processedAt', true, processedAt)

    const result = Object.create(prototype)
    result.id = id
    result.actorId = actorId
    result.action = action
    result.idempotencyKey = idempotencyKey
    result.status = status
    if (resultData != null) result.resultData = resultData
    if (error != null) result.error = error
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
        return `QueueItem(${R._toString(this.id)}, ${R._toString(this.actorId)}, ${R._toString(this.action)}, ${R._toString(this.idempotencyKey)}, ${R._toString(this.status)}, ${R._toString(this.resultData)}, ${R._toString(this.error)}, ${R._toString(this.createdAt)}, ${R._toString(this.processedAt)})`
    },
    toJSON() {
        return this
    },
}

QueueItem.prototype = prototype
prototype.constructor = QueueItem

Object.defineProperty(prototype, '@@typeName', { value: 'QueueItem' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
QueueItem.toString = () => 'QueueItem'
QueueItem.is = v => v && v['@@typeName'] === 'QueueItem'
QueueItem.from = o =>
    QueueItem(o.id, o.actorId, o.action, o.idempotencyKey, o.status, o.resultData, o.error, o.createdAt, o.processedAt)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: timestampFields
QueueItem.timestampFields = ['createdAt', 'processedAt']

// Additional function: toFirestore
QueueItem.toFirestore = queueItem => ({
    ...queueItem,
    actor: {
        id: queueItem.actorId,
        type: 'user',
    },
    action: Action.toFirestore(queueItem.action),
    createdAt: queueItem.createdAt,
    processedAt: queueItem?.processedAt,
})

// Additional function: fromFirestore
QueueItem.fromFirestore = queueItem =>
    QueueItem.from({
        ...queueItem,
        actorId: queueItem.actor.id,
        action: Action.fromFirestore(queueItem.action),
        createdAt: queueItem.createdAt,
        processedAt: queueItem?.processedAt,
    })

export { QueueItem }
