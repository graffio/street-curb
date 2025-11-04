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
        removedBy  : '^usr_[a-z0-9]{12,}$/?',
    },
}

// Manual serialization DELETED - now auto-generated with proper Date handling!
