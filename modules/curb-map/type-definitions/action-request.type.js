/** @module ActionRequest */

import { pick } from '@graffio/functional'
/**
 * ActionRequest represents a document in the completedActions collection
 * (immutable audit trail for SOC2 compliance)
 * @sig ActionRequest :: (String, Action, Object, Object, String, String?, String, String, String?, Object, Object?)
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

        // Tenant scoping (SOC2) - optional because some user actions aren't org-scoped
        organizationId : '/^org_[a-z0-9]{12,}$/?', // copied from FieldTypes.organizationId for now due to bugs in generator
        projectId      : '/^prj_[a-z0-9]{12,}$/?', // copied from FieldTypes.projectId for now due to bugs in generator
        
        
        // Orchestration
        idempotencyKey : FieldTypes.idempotencyKey,
        resultData     : 'Object?',
        error          : 'String?',

        // Audit trail (SOC2)
        correlationId  : FieldTypes.correlationId,
        schemaVersion  : 'Number',

        createdAt      : 'Date',
        processedAt    : 'Date?'
    }
}

ActionRequest.toLog = o => {
    const r = pick(['id', 'actorId', 'organizationId', 'projectId', 'idempotencyKey', 'correlationId'], o)
    r.action = Action.toLog(o.action)
    return r
}
