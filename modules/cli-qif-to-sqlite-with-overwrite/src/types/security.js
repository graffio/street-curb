// ABOUTME: Generated type definition for Security
// ABOUTME: Auto-generated from modules/quicken-type-definitions/security.type.js - do not edit manually

/** {@link module:Security} */
/*  Security generated from: modules/quicken-type-definitions/security.type.js
 *
 *  id    : /^sec_[a-f0-9]{12}$/,
 *  name  : "String",
 *  symbol: "String?",
 *  type  : "String?",
 *  goal  : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Security instance
 * @sig Security :: (Id, String, String?, String?, String?) -> Security
 *     Id = /^sec_[a-f0-9]{12}$/
 */
const Security = function Security(id, name, symbol, type, goal) {
    const constructorName = 'Security(id, name, symbol, type, goal)'

    R.validateRegex(constructorName, /^sec_[a-f0-9]{12}$/, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'symbol', true, symbol)
    R.validateString(constructorName, 'type', true, type)
    R.validateString(constructorName, 'goal', true, goal)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    if (symbol != null) result.symbol = symbol
    if (type != null) result.type = type
    if (goal != null) result.goal = goal
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig securityToString :: () -> String
 */
const securityToString = function () {
    return `Security(${R._toString(this.id)},
        ${R._toString(this.name)},
        ${R._toString(this.symbol)},
        ${R._toString(this.type)},
        ${R._toString(this.goal)})`
}

/*
 * Convert to JSON representation
 * @sig securityToJSON :: () -> Object
 */
const securityToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Security', enumerable: false },
    toString: { value: securityToString, enumerable: false },
    toJSON: { value: securityToJSON, enumerable: false },
    constructor: { value: Security, enumerable: false, writable: true, configurable: true },
})

Security.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Security.toString = () => 'Security'
Security.is = v => v && v['@@typeName'] === 'Security'

Security._from = _input => {
    const { id, name, symbol, type, goal } = _input
    return Security(id, name, symbol, type, goal)
}
Security.from = Security._from

Security._toFirestore = (o, encodeTimestamps) => ({ ...o })

Security._fromFirestore = (doc, decodeTimestamps) => Security._from(doc)

// Public aliases (override if necessary)
Security.toFirestore = Security._toFirestore
Security.fromFirestore = Security._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Security }
