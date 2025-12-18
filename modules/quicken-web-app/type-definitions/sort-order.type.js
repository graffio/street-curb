/** @module SortOrder */

import { FieldTypes } from './field-types.js'

/**
 * SortOrder represents a single column's sort state in multi-column sorting
 * Position in LookupTable determines sort priority (first = primary sort)
 * @sig SortOrder :: { id: columnDescriptorId, isDescending: Boolean }
 */
// prettier-ignore
export const SortOrder = {
    name: 'SortOrder',
    kind: 'tagged',
    fields: {
        id          : FieldTypes.columnDescriptorId,
        isDescending: 'Boolean',
    },
}
