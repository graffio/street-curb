/** @module Member */
import { FieldTypes } from './field-types.js'

/**
 * Member represents a user's role within an organization or project
 */
// prettier-ignore
export const Member = {
    name: 'Member',
    kind: 'tagged',
    fields: {
        userId     : FieldTypes.userId,
        displayName: 'String',
        role       : FieldTypes.role,

        addedAt    : 'Date',
        addedBy    : FieldTypes.userId,
        removedAt  : 'Date?',
        removedBy  : { pattern: FieldTypes.userId, optional: true },
    },
}

// Manual serialization DELETED - now auto-generated with proper Date handling!
