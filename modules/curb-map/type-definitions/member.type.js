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

// Member must accept converter for recursive pattern (even though it has no nested types)
Member.fromFirestore = data => Member.from(data)
Member.toFirestore = data => ({ ...data })
