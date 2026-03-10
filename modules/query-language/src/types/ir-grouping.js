// ABOUTME: Generated type definition for IRGrouping
// ABOUTME: Auto-generated from modules/query-language/type-definitions/ir-grouping.type.js - do not edit manually

/** {@link module:IRGrouping} */
/*  IRGrouping generated from: modules/query-language/type-definitions/ir-grouping.type.js
 *
 *  rows   : FieldTypes.groupDimension,
 *  columns: FieldTypes.groupDimension,
 *  only   : "[String]?"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRGrouping instance
 * @sig IRGrouping :: (String, String?, [String]?) -> IRGrouping
 */
const IRGrouping = function IRGrouping(rows, columns, only) {
    const constructorName = 'IRGrouping(rows, columns, only)'

    R.validateRegex(constructorName, FieldTypes.groupDimension, 'rows', false, rows)
    R.validateRegex(constructorName, FieldTypes.groupDimension, 'columns', true, columns)
    R.validateArray(constructorName, 1, 'String', undefined, 'only', true, only)

    const result = Object.create(prototype)
    result.rows = rows
    if (columns !== undefined) result.columns = columns
    if (only !== undefined) result.only = only
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig irgroupingToString :: () -> String
 */
const irgroupingToString = function () {
    return `IRGrouping(${R._toString(this.rows)}, ${R._toString(this.columns)}, ${R._toString(this.only)})`
}

/*
 * Convert to JSON representation
 * @sig irgroupingToJSON :: () -> Object
 */
const irgroupingToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'IRGrouping', enumerable: false },
    toString: { value: irgroupingToString, enumerable: false },
    toJSON: { value: irgroupingToJSON, enumerable: false },
    constructor: { value: IRGrouping, enumerable: false, writable: true, configurable: true },
})

IRGrouping.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
IRGrouping.toString = () => 'IRGrouping'
IRGrouping.is = v => v && v['@@typeName'] === 'IRGrouping'

IRGrouping._from = _input => {
    const { rows, columns, only } = _input
    return IRGrouping(rows, columns, only)
}
IRGrouping.from = IRGrouping._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRGrouping }
