// ABOUTME: Generated type definition for SortOrder
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/sort-order.type.js - do not edit manually

/** {@link module:SortOrder} */
/*  SortOrder generated from: modules/quicken-web-app/type-definitions/sort-order.type.js
 *
 *  id          : FieldTypes.columnDescriptorId,
 *  isDescending: "Boolean"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a SortOrder instance
 * @sig SortOrder :: (String, Boolean) -> SortOrder
 */
const SortOrder = function SortOrder(id, isDescending) {
    const constructorName = 'SortOrder(id, isDescending)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.columnDescriptorId, 'id', false, id)
    R.validateBoolean(constructorName, 'isDescending', false, isDescending)

    const result = Object.create(prototype)
    result.id = id
    result.isDescending = isDescending
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig sortorderToString :: () -> String
 */
const sortorderToString = function () {
    return `SortOrder(${R._toString(this.id)}, ${R._toString(this.isDescending)})`
}

/*
 * Convert to JSON representation
 * @sig sortorderToJSON :: () -> Object
 */
const sortorderToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'SortOrder', enumerable: false },
    toString: { value: sortorderToString, enumerable: false },
    toJSON: { value: sortorderToJSON, enumerable: false },
    constructor: { value: SortOrder, enumerable: false, writable: true, configurable: true },
})

SortOrder.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
SortOrder.toString = () => 'SortOrder'
SortOrder.is = v => v && v['@@typeName'] === 'SortOrder'

SortOrder._from = _input => SortOrder(_input.id, _input.isDescending)
SortOrder.from = SortOrder._from

SortOrder._toFirestore = (o, encodeTimestamps) => ({ ...o })

SortOrder._fromFirestore = (doc, decodeTimestamps) => SortOrder._from(doc)

// Public aliases (override if necessary)
SortOrder.toFirestore = SortOrder._toFirestore
SortOrder.fromFirestore = SortOrder._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { SortOrder }
