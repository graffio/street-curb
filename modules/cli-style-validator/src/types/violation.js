// ABOUTME: Generated type definition for Violation
// ABOUTME: Auto-generated from modules/cli-style-validator/type-definitions/violation.type.js - do not edit manually

/** {@link module:Violation} */
/*  Violation generated from: modules/cli-style-validator/type-definitions/violation.type.js
 *
 *  type    : "String",
 *  line    : "Number",
 *  column  : "Number",
 *  priority: "Number",
 *  message : "String",
 *  rule    : "String"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Violation instance
 * @sig Violation :: (String, Number, Number, Number, String, String) -> Violation
 */
const Violation = function Violation(type, line, column, priority, message, rule) {
    const constructorName = 'Violation(type, line, column, priority, message, rule)'
    R.validateArgumentLength(constructorName, 6, arguments)
    R.validateString(constructorName, 'type', false, type)
    R.validateNumber(constructorName, 'line', false, line)
    R.validateNumber(constructorName, 'column', false, column)
    R.validateNumber(constructorName, 'priority', false, priority)
    R.validateString(constructorName, 'message', false, message)
    R.validateString(constructorName, 'rule', false, rule)

    const result = Object.create(prototype)
    result.type = type
    result.line = line
    result.column = column
    result.priority = priority
    result.message = message
    result.rule = rule
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig violationToString :: () -> String
 */
const violationToString = function () {
    return `Violation(${R._toString(this.type)},
        ${R._toString(this.line)},
        ${R._toString(this.column)},
        ${R._toString(this.priority)},
        ${R._toString(this.message)},
        ${R._toString(this.rule)})`
}

/*
 * Convert to JSON representation
 * @sig violationToJSON :: () -> Object
 */
const violationToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Violation', enumerable: false },
    toString: { value: violationToString, enumerable: false },
    toJSON: { value: violationToJSON, enumerable: false },
    constructor: { value: Violation, enumerable: false, writable: true, configurable: true },
})

Violation.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Violation.toString = () => 'Violation'
Violation.is = v => v && v['@@typeName'] === 'Violation'

Violation._from = _input => {
    const { type, line, column, priority, message, rule } = _input
    return Violation(type, line, column, priority, message, rule)
}
Violation.from = Violation._from

Violation._toFirestore = (o, encodeTimestamps) => ({ ...o })

Violation._fromFirestore = (doc, decodeTimestamps) => Violation._from(doc)

// Public aliases (override if necessary)
Violation.toFirestore = Violation._toFirestore
Violation.fromFirestore = Violation._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Violation }
