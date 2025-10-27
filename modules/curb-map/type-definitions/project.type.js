/** @module Project */
import { FieldTypes } from './field-types.js'

/**
 * Project represents a portion of a blockface with specific use
 * @sig Project :: { use: String, length: Number }
 */

// prettier-ignore
export const Project = {
    name: 'Project',
    kind: 'tagged',
    fields: {
        id            : FieldTypes.projectId,
        organizationId: FieldTypes.organizationId,
        name          : "String",
        createdAt     : 'Date',
        createdBy     : FieldTypes.userId,
        updatedAt     : 'Date',
        updatedBy     : FieldTypes.userId,
    }
}

Project.fromFirestore = Project.from
Project.toFirestore = o => ({ ...o })
