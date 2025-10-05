/** @module QueueItem */

/**
 * QueueItem represents a document in the Firestore update_queue collection
 * @sig QueueItem :: (String, Action, String, String, Object, String, Object?, String?, Object?)
 */
import { Action } from './action.js'
import { FieldTypes } from './field-types.js'

// prettier-ignore
export const QueueItem = {
    name: 'QueueItem',
    kind: 'tagged',
    fields: {
        id            : FieldTypes.queueItemId,
        actorId       : FieldTypes.actorId,
        action        : 'Action',
        idempotencyKey: FieldTypes.idempotencyKey,
        status        : /^(pending|completed|failed)$/,
        resultData    : 'Object?',
        error         : 'String?',
        
        // createdAts in Firestore; dates here
        createdAt     : 'Object', // Date
        processedAt   : 'Object?' // Date
    }
}

QueueItem.timestampFields = ['createdAt', 'processedAt']

QueueItem.toFirestore = queueItem => ({
    ...queueItem,
    actor: { id: queueItem.actorId, type: 'user' },
    action: Action.toFirestore(queueItem.action),
    createdAt: queueItem.createdAt,
    processedAt: queueItem?.processedAt,
})

QueueItem.fromFirestore = queueItem =>
    QueueItem.from({
        ...queueItem,
        actorId: queueItem.actor.id,
        action: Action.fromFirestore(queueItem.action),
        createdAt: queueItem.createdAt,
        processedAt: queueItem?.processedAt,
    })
