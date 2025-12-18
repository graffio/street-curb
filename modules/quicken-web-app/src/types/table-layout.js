// ABOUTME: Generated type definition for TableLayout
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/table-layout.type.js - do not edit manually

/** {@link module:TableLayout} */
/*  TableLayout generated from: modules/quicken-web-app/type-definitions/table-layout.type.js
 *
 *  id               : FieldTypes.tableLayoutId,
 *  columnDescriptors: "{ColumnDescriptor:id}",
 *  sortOrder        : /^[a-zA-Z][a-zA-Z0-9_]*$/
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { ColumnDescriptor } from './column-descriptor.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a TableLayout instance
 * @sig TableLayout :: (String, {ColumnDescriptor}, [SortOrder]) -> TableLayout
 *     SortOrder = /^[a-zA-Z][a-zA-Z0-9_]*$/
 */
const TableLayout = function TableLayout(id, columnDescriptors, sortOrder) {
    const constructorName = 'TableLayout(id, columnDescriptors, sortOrder)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.tableLayoutId, 'id', false, id)
    R.validateLookupTable(constructorName, 'ColumnDescriptor', 'columnDescriptors', false, columnDescriptors)
    R.validateArray(constructorName, 1, 'String', undefined, 'sortOrder', false, sortOrder)

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
        sortOrder: o.sortOrder,
    }

    return result
}

TableLayout._fromFirestore = (doc, decodeTimestamps) =>
    TableLayout._from({
        id: doc.id,
        columnDescriptors: R.lookupTableFromFirestore(ColumnDescriptor, 'id', decodeTimestamps, doc.columnDescriptors),
        sortOrder: doc.sortOrder,
    })

// Public aliases (override if necessary)
TableLayout.toFirestore = TableLayout._toFirestore
TableLayout.fromFirestore = TableLayout._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { TableLayout }
