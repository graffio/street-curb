// ABOUTME: Generated type definition for NamedLocation
// ABOUTME: Auto-generated from modules/cli-style-validator/type-definitions/named-location.type.js - do not edit manually

/** {@link module:NamedLocation} */
/*  NamedLocation generated from: modules/cli-style-validator/type-definitions/named-location.type.js
 *
 *  name: "String",
 *  line: "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a NamedLocation instance
 * @sig NamedLocation :: (String, Number) -> NamedLocation
 */
const NamedLocation = function NamedLocation(name, line) {
    const constructorName = 'NamedLocation(name, line)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateNumber(constructorName, 'line', false, line)

    const result = Object.create(prototype)
    result.name = name
    result.line = line
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig namedlocationToString :: () -> String
 */
const namedlocationToString = function () {
    return `NamedLocation(${R._toString(this.name)}, ${R._toString(this.line)})`
}

/*
 * Convert to JSON representation
 * @sig namedlocationToJSON :: () -> Object
 */
const namedlocationToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'NamedLocation', enumerable: false },
    toString: { value: namedlocationToString, enumerable: false },
    toJSON: { value: namedlocationToJSON, enumerable: false },
    constructor: { value: NamedLocation, enumerable: false, writable: true, configurable: true },
})

NamedLocation.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
NamedLocation.toString = () => 'NamedLocation'
NamedLocation.is = v => v && v['@@typeName'] === 'NamedLocation'

NamedLocation._from = _input => NamedLocation(_input.name, _input.line)
NamedLocation.from = NamedLocation._from

NamedLocation._toFirestore = (o, encodeTimestamps) => ({ ...o })

NamedLocation._fromFirestore = (doc, decodeTimestamps) => NamedLocation._from(doc)

// Public aliases (override if necessary)
NamedLocation.toFirestore = NamedLocation._toFirestore
NamedLocation.fromFirestore = NamedLocation._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { NamedLocation }
