// ABOUTME: Generated type definition for Intent
// ABOUTME: Auto-generated from modules/keymap/type-definitions/intent.type.js - do not edit manually

/** {@link module:Intent} */
/*  Intent generated from: modules/keymap/type-definitions/intent.type.js
 *
 *  description: "String",
 *  keys       : "[String]",
 *  action     : "Any"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Intent instance
 * @sig Intent :: (String, [String], Any) -> Intent
 */
const Intent = function Intent(description, keys, action) {
    const constructorName = 'Intent(description, keys, action)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'description', false, description)
    R.validateArray(constructorName, 1, 'String', undefined, 'keys', false, keys)

    const result = Object.create(prototype)
    result.description = description
    result.keys = keys
    result.action = action
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig intentToString :: () -> String
 */
const intentToString = function () {
    return `Intent(${R._toString(this.description)}, ${R._toString(this.keys)}, ${R._toString(this.action)})`
}

/*
 * Convert to JSON representation
 * @sig intentToJSON :: () -> Object
 */
const intentToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Intent', enumerable: false },
    toString: { value: intentToString, enumerable: false },
    toJSON: { value: intentToJSON, enumerable: false },
    constructor: { value: Intent, enumerable: false, writable: true, configurable: true },
})

Intent.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Intent.toString = () => 'Intent'
Intent.is = v => v && v['@@typeName'] === 'Intent'

Intent._from = _input => {
    const { description, keys, action } = _input
    return Intent(description, keys, action)
}
Intent.from = Intent._from

Intent._toFirestore = (o, encodeTimestamps) => ({ ...o })

Intent._fromFirestore = (doc, decodeTimestamps) => Intent._from(doc)

// Public aliases (override if necessary)
Intent.toFirestore = Intent._toFirestore
Intent.fromFirestore = Intent._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Intent.hasKey = (intent, key) => intent.keys.includes(key)

export { Intent }
