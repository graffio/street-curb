/** @module ActionRequest */

import { pick } from '@graffio/functional'
/**
 * ActionRequest represents a document in the Firestore actionRequests collection
 * and completedActions collection (immutable audit trail for SOC2 compliance)
 * @sig ActionRequest :: (String, Action, Object, Object, String, String?, String, String, String, String?, Object, Object?)
 */
import { Action } from './action.js'
import { FieldTypes } from './field-types.js'

// prettier-ignore
export const ActionRequest = {
    name: 'ActionRequest',
    kind: 'tagged',
    fields: {
        // Identity
        id             : FieldTypes.actionRequestId,

        // Domain payload
        action         : 'Action',

        // Actor/Subject (SOC2)
        actorId        : FieldTypes.actorId,
        subjectId      : FieldTypes.subjectId,
        subjectType    : /^(user|organization|project)$/,

        // Tenant scoping (SOC2)
        organizationId : FieldTypes.organizationId,
        projectId        : '/^prj_[a-z0-9]{12,}$/?', // copied from FieldTypes.projectId for now due to bugs in generator
        
        
        // Orchestration
        status         : /^(pending|completed|failed)$/,
        idempotencyKey : FieldTypes.idempotencyKey,
        resultData     : 'Object?',
        error          : 'String?',

        // Audit trail (SOC2)
        correlationId  : FieldTypes.correlationId,
        schemaVersion  : 'Number',

        // Timestamps (stored as serverTimestamp in Firestore; Date objects here)
        createdAt      : 'Object',  // Date
        processedAt    : 'Object?'  // Date
    }
}

ActionRequest.timestampFields = ['createdAt', 'processedAt']

ActionRequest.toFirestore = actionRequest => ({
    ...actionRequest,
    actor: { id: actionRequest.actorId, type: 'user' },
    subject: { id: actionRequest.subjectId, type: actionRequest.subjectType },
    action: Action.toFirestore(actionRequest.action),
    createdAt: actionRequest.createdAt,
    processedAt: actionRequest?.processedAt,
})

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

ActionRequest.toLog = o => {
    const r = pick(['id', 'actorId', 'organizationId', 'projectId', 'status', 'idempotencyKey', 'correlationId'], o)
    r.action = Action.toLog(o.action)
    return r
}
