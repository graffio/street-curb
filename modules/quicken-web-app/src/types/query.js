// ABOUTME: Generated type definition for Query
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/query.type.js - do not edit manually

/** {@link module:Query} */
/*  Query generated from: modules/quicken-web-app/type-definitions/query.type.js
 *
 *  name       : "String",
 *  description: "String?",
 *  sources    : "{IRSource:name}",
 *  computation: "IRComputation",
 *  output     : "IROutput?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { IRSource } from './ir-source.js'
import { IRComputation } from './ir-computation.js'
import { IROutput } from './ir-output.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Query instance
 * @sig Query :: (String, String?, {IRSource}, IRComputation, IROutput?) -> Query
 */
const Query = function Query(name, description, sources, computation, output) {
    const constructorName = 'Query(name, description, sources, computation, output)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateLookupTable(constructorName, 'IRSource', 'sources', false, sources)
    R.validateTag(constructorName, 'IRComputation', 'computation', false, computation)
    R.validateTag(constructorName, 'IROutput', 'output', true, output)

    const result = Object.create(prototype)
    result.name = name
    if (description !== undefined) result.description = description
    result.sources = sources
    result.computation = computation
    if (output !== undefined) result.output = output
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig queryToString :: () -> String
 */
const queryToString = function () {
    return `Query(${R._toString(this.name)},
        ${R._toString(this.description)},
        ${R._toString(this.sources)},
        ${R._toString(this.computation)},
        ${R._toString(this.output)})`
}

/*
 * Convert to JSON representation
 * @sig queryToJSON :: () -> Object
 */
const queryToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Query', enumerable: false },
    toString: { value: queryToString, enumerable: false },
    toJSON: { value: queryToJSON, enumerable: false },
    constructor: { value: Query, enumerable: false, writable: true, configurable: true },
})

Query.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Query.toString = () => 'Query'
Query.is = v => v && v['@@typeName'] === 'Query'

Query._from = _input => {
    const { name, description, sources, computation, output } = _input
    return Query(name, description, sources, computation, output)
}
Query.from = Query._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Query }
