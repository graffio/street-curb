// ABOUTME: Generated type definition for IROutput
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-output.type.js - do not edit manually

/** {@link module:IROutput} */
/*  IROutput generated from: modules/quicken-web-app/type-definitions/ir-output.type.js
 *
 *  show  : "[String]?",
 *  format: "String?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IROutput instance
 * @sig IROutput :: ([String]?, String?) -> IROutput
 */
const IROutput = function IROutput(show, format) {
    const constructorName = 'IROutput(show, format)'

    R.validateArray(constructorName, 1, 'String', undefined, 'show', true, show)
    R.validateString(constructorName, 'format', true, format)

    const result = Object.create(prototype)
    if (show !== undefined) result.show = show
    if (format !== undefined) result.format = format
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig iroutputToString :: () -> String
 */
const iroutputToString = function () {
    return `IROutput(${R._toString(this.show)}, ${R._toString(this.format)})`
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

IROutput._from = _input => IROutput(_input.show, _input.format)
IROutput.from = IROutput._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IROutput }
