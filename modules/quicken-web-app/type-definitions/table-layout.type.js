// ABOUTME: Type definition for TableLayout - column and sort state for tables
// ABOUTME: Defines structure for columnDescriptors and sortOrder
/** @module TableLayout */

/* eslint-disable no-undef -- ColumnDescriptor, SortOrder, LookupTable are in scope in generated output */
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

// Extracts sorting spec for DataTable from sortOrder
// @sig toSorting :: TableLayout -> [{ id: String, desc: Boolean }]
TableLayout.toSorting = layout => layout.sortOrder.map(s => ({ id: s.id, desc: s.isDescending }))

// Converts TableLayout to DataTable props format (TanStack Table expects {id, desc} objects)
// @sig toDataTableProps :: TableLayout -> { sorting, columnSizing, columnOrder }
TableLayout.toDataTableProps = tableLayout => {
    const { columnDescriptors, sortOrder } = tableLayout
    const columnOrder = columnDescriptors.map(d => d.id)
    const columnSizing = Object.fromEntries(columnDescriptors.map(d => [d.id, d.width]))
    const sorting = sortOrder.map(s => ({ id: s.id, desc: s.isDescending }))
    return { sorting, columnSizing, columnOrder }
}

// Applies TanStack sorting state change to TableLayout
// @sig applySortingChange :: (TableLayout, SortingState) -> TableLayout
TableLayout.applySortingChange = (tableLayout, newSorting) => {
    const applySort = descriptor => {
        const sortEntry = newSorting.find(s => s.id === descriptor.id)
        const direction = sortEntry ? (sortEntry.desc ? 'desc' : 'asc') : 'none'
        return ColumnDescriptor(descriptor.id, descriptor.width, direction)
    }
    const { id, columnDescriptors } = tableLayout
    const updatedDescriptors = columnDescriptors.updateAll(applySort)
    const newSortOrder = LookupTable(
        newSorting.map(s => SortOrder(s.id, s.desc)),
        SortOrder,
        'id',
    )
    return TableLayout(id, updatedDescriptors, newSortOrder)
}

// Applies TanStack column sizing state change to TableLayout
// @sig applySizingChange :: (TableLayout, SizingState) -> TableLayout
TableLayout.applySizingChange = (tableLayout, newSizing) => {
    const applyWidth = descriptor => {
        const { id, sortDirection } = descriptor
        const newWidth = newSizing[id] ?? descriptor.width
        return ColumnDescriptor(id, newWidth, sortDirection)
    }
    const { id, columnDescriptors, sortOrder } = tableLayout
    const updatedDescriptors = columnDescriptors.updateAll(applyWidth)
    return TableLayout(id, updatedDescriptors, sortOrder)
}

// Applies TanStack column order change to TableLayout
// @sig applyOrderChange :: (TableLayout, [String]) -> TableLayout
TableLayout.applyOrderChange = (tableLayout, newOrder) => {
    const { id, columnDescriptors, sortOrder } = tableLayout
    return TableLayout(id, columnDescriptors.pick(newOrder), sortOrder)
}
