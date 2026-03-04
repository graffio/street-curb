// ABOUTME: Generated type definition for IROutput
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-output.type.js - do not edit manually

/** {@link module:IROutput} */
/*  IROutput generated from: modules/quicken-web-app/type-definitions/ir-output.type.js
 *
 *  show            : "[String]?",
 *  format          : "String?",
 *  orderByField    : "String?",
 *  orderByDirection: FieldTypes.sortDirection,
 *  limit           : "Number?"
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
 * Construct a IROutput instance
 * @sig IROutput :: ([String]?, String?, String?, String?, Number?) -> IROutput
 */
const IROutput = function IROutput(show, format, orderByField, orderByDirection, limit) {
    const constructorName = 'IROutput(show, format, orderByField, orderByDirection, limit)'

    R.validateArray(constructorName, 1, 'String', undefined, 'show', true, show)
    R.validateString(constructorName, 'format', true, format)
    R.validateString(constructorName, 'orderByField', true, orderByField)
    R.validateRegex(constructorName, FieldTypes.sortDirection, 'orderByDirection', true, orderByDirection)
    R.validateNumber(constructorName, 'limit', true, limit)

    const result = Object.create(prototype)
    if (show !== undefined) result.show = show
    if (format !== undefined) result.format = format
    if (orderByField !== undefined) result.orderByField = orderByField
    if (orderByDirection !== undefined) result.orderByDirection = orderByDirection
    if (limit !== undefined) result.limit = limit
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig iroutputToString :: () -> String
 */
const iroutputToString = function () {
    return `IROutput(${R._toString(this.show)},
        ${R._toString(this.format)},
        ${R._toString(this.orderByField)},
        ${R._toString(this.orderByDirection)},
        ${R._toString(this.limit)})`
}

/*
 * Convert to JSON representation
 * @sig iroutputToJSON :: () -> Object
 */
const iroutputToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'IROutput', enumerable: false },
    toString: { value: iroutputToString, enumerable: false },
    toJSON: { value: iroutputToJSON, enumerable: false },
    constructor: { value: IROutput, enumerable: false, writable: true, configurable: true },
})

IROutput.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
IROutput.toString = () => 'IROutput'
IROutput.is = v => v && v['@@typeName'] === 'IROutput'

IROutput._from = _input => {
    const { show, format, orderByField, orderByDirection, limit } = _input
    return IROutput(show, format, orderByField, orderByDirection, limit)
}
IROutput.from = IROutput._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IROutput }
