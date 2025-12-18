/** @module TableLayout */

import { FieldTypes } from './field-types.js'

/**
 * TableLayout represents all column state for a table view
 * columnDescriptors order = display order, sortOrder = sort priority
 * @sig TableLayout :: { id: tableLayoutId, columnDescriptors: {ColumnDescriptor:id}, sortOrder: {SortOrder:id} }
 */
// prettier-ignore
export const TableLayout = {
    name: 'TableLayout',
    kind: 'tagged',
    fields: {
        id               : FieldTypes.tableLayoutId,
        columnDescriptors: '{ColumnDescriptor:id}',
        sortOrder        : '{SortOrder:id}',
    },
}
