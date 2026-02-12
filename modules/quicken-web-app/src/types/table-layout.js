// ABOUTME: Generated type definition for TableLayout
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/table-layout.type.js - do not edit manually

/** {@link module:TableLayout} */
/*  TableLayout generated from: modules/quicken-web-app/type-definitions/table-layout.type.js
 *
 *  id               : FieldTypes.tableLayoutId,
 *  columnDescriptors: "{ColumnDescriptor:id}",
 *  sortOrder        : "{SortOrder:id}"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { ColumnDescriptor } from './column-descriptor.js'
import { SortOrder } from './sort-order.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a TableLayout instance
 * @sig TableLayout :: (String, {ColumnDescriptor}, {SortOrder}) -> TableLayout
 */
const TableLayout = function TableLayout(id, columnDescriptors, sortOrder) {
    const constructorName = 'TableLayout(id, columnDescriptors, sortOrder)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.tableLayoutId, 'id', false, id)
    R.validateLookupTable(constructorName, 'ColumnDescriptor', 'columnDescriptors', false, columnDescriptors)
    R.validateLookupTable(constructorName, 'SortOrder', 'sortOrder', false, sortOrder)

    const result = Object.create(prototype)
    result.id = id
    result.columnDescriptors = columnDescriptors
    result.sortOrder = sortOrder
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig tablelayoutToString :: () -> String
 */
const tablelayoutToString = function () {
    return `TableLayout(${R._toString(this.id)}, ${R._toString(this.columnDescriptors)}, ${R._toString(this.sortOrder)})`
}

/*
 * Convert to JSON representation
 * @sig tablelayoutToJSON :: () -> Object
 */
const tablelayoutToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'TableLayout', enumerable: false },
    toString: { value: tablelayoutToString, enumerable: false },
    toJSON: { value: tablelayoutToJSON, enumerable: false },
    constructor: { value: TableLayout, enumerable: false, writable: true, configurable: true },
})

TableLayout.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
TableLayout.toString = () => 'TableLayout'
TableLayout.is = v => v && v['@@typeName'] === 'TableLayout'

TableLayout._from = _input => {
    const { id, columnDescriptors, sortOrder } = _input
    return TableLayout(id, columnDescriptors, sortOrder)
}
TableLayout.from = TableLayout._from

TableLayout._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        columnDescriptors: R.lookupTableToFirestore(ColumnDescriptor, 'id', encodeTimestamps, o.columnDescriptors),
        sortOrder: R.lookupTableToFirestore(SortOrder, 'id', encodeTimestamps, o.sortOrder),
    }

    return result
}

TableLayout._fromFirestore = (doc, decodeTimestamps) =>
    TableLayout._from({
        id: doc.id,
        columnDescriptors: R.lookupTableFromFirestore(ColumnDescriptor, 'id', decodeTimestamps, doc.columnDescriptors),
        sortOrder: R.lookupTableFromFirestore(SortOrder, 'id', decodeTimestamps, doc.sortOrder),
    })

// Public aliases (override if necessary)
TableLayout.toFirestore = TableLayout._toFirestore
TableLayout.fromFirestore = TableLayout._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

TableLayout.toSorting = layout =>
    layout.sortOrder.map(s => ({
        id: s.id,
        desc: s.isDescending,
    }))

TableLayout.toDataTableProps = tableLayout => {
    const { columnDescriptors, sortOrder } = tableLayout
    const columnOrder = columnDescriptors.map(d => d.id)
    const columnSizing = Object.fromEntries(columnDescriptors.map(d => [d.id, d.width]))
    const sorting = sortOrder.map(s => ({
        id: s.id,
        desc: s.isDescending,
    }))
    return {
        sorting,
        columnSizing,
        columnOrder,
    }
}

TableLayout.reconcile = (tableLayout, columns) => {
    const { columnDescriptors, sortOrder } = tableLayout
    const missing = columns.filter(col => !columnDescriptors.includesWithId(col.id))
    if (missing.length === 0) return tableLayout
    const merged = missing.reduce(
        (lt, col) => lt.addItem(ColumnDescriptor(col.id, col.size || 100, 'none')),
        columnDescriptors,
    )
    return TableLayout(tableLayout.id, merged, sortOrder)
}

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

TableLayout.applyOrderChange = (tableLayout, newOrder) => {
    const { id, columnDescriptors, sortOrder } = tableLayout
    return TableLayout(id, columnDescriptors.pick(newOrder), sortOrder)
}

export { TableLayout }
