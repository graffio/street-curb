// ABOUTME: Pure functions for table layout management
// ABOUTME: Creates, transforms, and updates TableLayout for DataTable integration

import { LookupTable } from '@graffio/functional'
import { ColumnDescriptor, TableLayout } from '../types/index.js'

// Creates a TableLayout from column definitions with default widths and no sorting
// @sig initializeTableLayout :: (String, [ColumnDefinition]) -> TableLayout
const initializeTableLayout = (viewId, columns) => {
    const descriptors = columns.map(col => ColumnDescriptor(col.id, col.size || 100, 'none'))
    return TableLayout(viewId, LookupTable(descriptors, ColumnDescriptor, 'id'), [])
}

// Converts TableLayout to DataTable props format
// @sig toDataTableProps :: TableLayout -> { sorting, columnSizing, columnOrder }
const toDataTableProps = tableLayout => {
    const toSortEntry = descriptor => {
        const { id, sortDirection } = descriptor
        if (sortDirection === 'none') return null
        return { id, desc: sortDirection === 'desc' }
    }

    const { columnDescriptors, sortOrder } = tableLayout
    const columnOrder = columnDescriptors.map(d => d.id)
    const columnSizing = Object.fromEntries(columnDescriptors.map(d => [d.id, d.width]))
    const sorting = sortOrder.map(id => toSortEntry(columnDescriptors[id])).filter(Boolean)

    return { sorting, columnSizing, columnOrder }
}

// Applies TanStack sorting state change to TableLayout
// @sig applySortingChange :: (TableLayout, SortingState) -> TableLayout
const applySortingChange = (tableLayout, newSorting) => {
    const applySort = descriptor => {
        const sortEntry = newSorting.find(s => s.id === descriptor.id)
        const direction = sortEntry ? (sortEntry.desc ? 'desc' : 'asc') : 'none'
        return ColumnDescriptor(descriptor.id, descriptor.width, direction)
    }

    const { id, columnDescriptors } = tableLayout
    const updatedDescriptors = LookupTable(columnDescriptors.map(applySort), ColumnDescriptor, 'id')
    const newSortOrder = newSorting.map(s => s.id)
    return TableLayout(id, updatedDescriptors, newSortOrder)
}

// Applies TanStack column sizing state change to TableLayout
// @sig applySizingChange :: (TableLayout, SizingState) -> TableLayout
const applySizingChange = (tableLayout, newSizing) => {
    const applyWidth = descriptor => {
        const { id, sortDirection } = descriptor
        const newWidth = newSizing[id] ?? descriptor.width
        return ColumnDescriptor(id, newWidth, sortDirection)
    }

    const { id, columnDescriptors, sortOrder } = tableLayout
    const updatedDescriptors = LookupTable(columnDescriptors.map(applyWidth), ColumnDescriptor, 'id')
    return TableLayout(id, updatedDescriptors, sortOrder)
}

// Applies TanStack column order change to TableLayout
// @sig applyOrderChange :: (TableLayout, [String]) -> TableLayout
const applyOrderChange = (tableLayout, newOrder) => {
    const { id, columnDescriptors, sortOrder } = tableLayout
    const reorderedDescriptors = LookupTable(
        newOrder.map(colId => columnDescriptors[colId]),
        ColumnDescriptor,
        'id',
    )
    return TableLayout(id, reorderedDescriptors, sortOrder)
}

export { applyOrderChange, applySizingChange, applySortingChange, initializeTableLayout, toDataTableProps }
