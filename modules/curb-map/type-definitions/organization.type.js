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
        members         : '{Member:userId}', // LookupTable of members

        createdAt       : 'Date',
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Date',
        updatedBy       : FieldTypes.userId,
    }
}

// Manual serialization DELETED - now auto-generated!
