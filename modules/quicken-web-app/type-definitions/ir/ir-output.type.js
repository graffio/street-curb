// ABOUTME: Tagged type for query output configuration
// ABOUTME: Controls which fields to show, output format, and post-computation modifiers (orderBy, limit)

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IROutput = {
    name: 'IROutput',
    kind: 'tagged',
    fields: {
        show:             '[String]?',
        format:           'String?',
        orderByField:     'String?',
        orderByDirection: { pattern: FieldTypes.sortDirection, optional: true },
        limit:            'Number?',
    },
}
