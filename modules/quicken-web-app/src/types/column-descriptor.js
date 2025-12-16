// ABOUTME: Generated type definition for ColumnDescriptor
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/column-descriptor.type.js - do not edit manually

/** {@link module:ColumnDescriptor} */
/*  ColumnDescriptor generated from: modules/quicken-web-app/type-definitions/column-descriptor.type.js
 *
 *  id           : FieldTypes.columnDescriptorId,
 *  width        : "Number",
 *  sortDirection: FieldTypes.direction
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a ColumnDescriptor instance
 * @sig ColumnDescriptor :: ([Object], Number, [Object]) -> ColumnDescriptor
 */
const ColumnDescriptor = function ColumnDescriptor(id, width, sortDirection) {
    const constructorName = 'ColumnDescriptor(id, width, sortDirection)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.columnDescriptorId, 'id', false, id)
    R.validateNumber(constructorName, 'width', false, width)
    R.validateRegex(constructorName, FieldTypes.direction, 'sortDirection', false, sortDirection)

    const result = Object.create(prototype)
    result.id = id
    result.width = width
    result.sortDirection = sortDirection
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig columndescriptorToString :: () -> String
 */
const columndescriptorToString = function () {
    return `ColumnDescriptor(${R._toString(this.id)}, ${R._toString(this.width)}, ${R._toString(this.sortDirection)})`
}

/**
 * Convert to JSON representation
 * @sig columndescriptorToJSON :: () -> Object
 */
const columndescriptorToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ColumnDescriptor', enumerable: false },
    toString: { value: columndescriptorToString, enumerable: false },
    toJSON: { value: columndescriptorToJSON, enumerable: false },
    constructor: { value: ColumnDescriptor, enumerable: false, writable: true, configurable: true },
})

ColumnDescriptor.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ColumnDescriptor.toString = () => 'ColumnDescriptor'
ColumnDescriptor.is = v => v && v['@@typeName'] === 'ColumnDescriptor'

ColumnDescriptor._from = _input => {
    const { id, width, sortDirection } = _input
    return ColumnDescriptor(id, width, sortDirection)
}
ColumnDescriptor.from = ColumnDescriptor._from

ColumnDescriptor._toFirestore = (o, encodeTimestamps) => ({ ...o })

ColumnDescriptor._fromFirestore = (doc, decodeTimestamps) => ColumnDescriptor._from(doc)

// Public aliases (override if necessary)
ColumnDescriptor.toFirestore = ColumnDescriptor._toFirestore
ColumnDescriptor.fromFirestore = ColumnDescriptor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ColumnDescriptor }
