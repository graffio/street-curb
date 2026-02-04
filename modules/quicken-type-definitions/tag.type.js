// ABOUTME: Tag type definition for user-defined transaction labels
// ABOUTME: Optional color and description for visual categorization

import { FieldTypes } from './field-types.js'

// prettier-ignore
export const Tag = {
    name: 'Tag',
    kind: 'tagged',
    fields: {
        id: FieldTypes.tagId,
        name: 'String',
        color: 'String?',
        description: 'String?'
    },
}
