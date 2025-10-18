/** @module Organization */
import { FieldTypes } from './field-types.js'

/**
 * Organization represents a collection of users working on projects
 */

// prettier-ignore
export const Organization = {
    name: 'Organization',
    kind: 'tagged',
    fields: {
        id              : FieldTypes.organizationId,
        name            : "String",
        status          : /active|suspended/,
        defaultProjectId: FieldTypes.projectId,
        members         : 'Object?', // Map of userId -> {displayName, role, addedAt, addedBy, removedAt, removedBy}

        createdAt       : 'Object', // Date
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Object', // Date
        updatedBy       : FieldTypes.userId,
    }
}

Organization.timestampFields = ['createdAt', 'updatedAt']
Organization.fromFirestore = Organization.from
Organization.toFirestore = o => ({ ...o })
