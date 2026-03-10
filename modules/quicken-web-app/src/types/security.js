// ABOUTME: Generated type definition for Security
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/entities/security.type.js - do not edit manually

/** {@link module:Security} */
/*  Security generated from: modules/quicken-web-app/type-definitions/entities/security.type.js
 *
 *  id    : FieldTypes.securityId,
 *  name  : "String",
 *  symbol: "String?",
 *  type  : "String?",
 *  goal  : "String?"
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
 * Construct a Security instance
 * @sig Security :: (String, String, String?, String?, String?) -> Security
 */
const Security = function Security(id, name, symbol, type, goal) {
    const constructorName = 'Security(id, name, symbol, type, goal)'

    R.validateRegex(constructorName, FieldTypes.securityId, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'symbol', true, symbol)
    R.validateString(constructorName, 'type', true, type)
    R.validateString(constructorName, 'goal', true, goal)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    if (symbol !== undefined) result.symbol = symbol
    if (type !== undefined) result.type = type
    if (goal !== undefined) result.goal = goal
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

Security.fromJSON = json => (json == null ? json : Security._from(json))

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Security }
