/** @module Organization */
import { FieldTypes } from './field-types.js'

/**
 * Organization represents a portion of a blockface with specific use
 * @sig Organization :: { use: String, length: Number }
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
        
        createdAt       : 'Object', // Date
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Object', // Date
        updatedBy       : FieldTypes.userId,
    }
}

Organization.timestampFields = ['createdAt', 'updatedAt']
Organization.fromFirestore = Organization.from
Organization.toFirestore = o => ({ ...o })
