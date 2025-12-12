/** @module ColumnDescriptor */

import { FieldTypes } from './field-types.js'

/**
 * ColumnDescriptor represents a single column's state (width, sort direction)
 * @sig ColumnDescriptor :: { id: columnDescriptorId, width: Number, sortDirection: direction }
 */
// prettier-ignore
export const ColumnDescriptor = {
    name: 'ColumnDescriptor',
    kind: 'tagged',
    fields: {
        id           : FieldTypes.columnDescriptorId,
        width        : 'Number',
        sortDirection: FieldTypes.direction
    },
}
