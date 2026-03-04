// ABOUTME: Generated type definition for QueryOutput
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/query-output.type.js - do not edit manually

/** {@link module:QueryOutput} */
/*  QueryOutput generated from: modules/quicken-web-app/type-definitions/query-output.type.js
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
 * Construct a QueryOutput instance
 * @sig QueryOutput :: ([String]?, String?) -> QueryOutput
 */
const QueryOutput = function QueryOutput(show, format) {
    const constructorName = 'QueryOutput(show, format)'

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
 * @sig queryoutputToString :: () -> String
 */
const queryoutputToString = function () {
    return `QueryOutput(${R._toString(this.show)}, ${R._toString(this.format)})`
}

/*
 * Convert to JSON representation
 * @sig queryoutputToJSON :: () -> Object
 */
const queryoutputToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'QueryOutput', enumerable: false },
    toString: { value: queryoutputToString, enumerable: false },
    toJSON: { value: queryoutputToJSON, enumerable: false },
    constructor: { value: QueryOutput, enumerable: false, writable: true, configurable: true },
})

QueryOutput.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
QueryOutput.toString = () => 'QueryOutput'
QueryOutput.is = v => v && v['@@typeName'] === 'QueryOutput'

QueryOutput._from = _input => QueryOutput(_input.show, _input.format)
QueryOutput.from = QueryOutput._from

QueryOutput._toFirestore = (o, encodeTimestamps) => ({ ...o })

QueryOutput._fromFirestore = (doc, decodeTimestamps) => QueryOutput._from(doc)

// Public aliases (override if necessary)
QueryOutput.toFirestore = QueryOutput._toFirestore
QueryOutput.fromFirestore = QueryOutput._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QueryOutput }
