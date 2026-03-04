// ABOUTME: Generated type definition for QueryIR
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/query-ir.type.js - do not edit manually

/** {@link module:QueryIR} */
/*  QueryIR generated from: modules/quicken-web-app/type-definitions/query-ir.type.js
 *
 *  name       : "String",
 *  description: "String?",
 *  sources    : "{QuerySource:name}",
 *  computation: "Computation",
 *  output     : "QueryOutput?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import { QuerySource } from './query-source.js'
import { Computation } from './computation.js'
import { QueryOutput } from './query-output.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a QueryIR instance
 * @sig QueryIR :: (String, String?, {QuerySource}, Computation, QueryOutput?) -> QueryIR
 */
const QueryIR = function QueryIR(name, description, sources, computation, output) {
    const constructorName = 'QueryIR(name, description, sources, computation, output)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateLookupTable(constructorName, 'QuerySource', 'sources', false, sources)
    R.validateTag(constructorName, 'Computation', 'computation', false, computation)
    R.validateTag(constructorName, 'QueryOutput', 'output', true, output)

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
 * @sig queryirToString :: () -> String
 */
const queryirToString = function () {
    return `QueryIR(${R._toString(this.name)},
        ${R._toString(this.description)},
        ${R._toString(this.sources)},
        ${R._toString(this.computation)},
        ${R._toString(this.output)})`
}

/*
 * Convert to JSON representation
 * @sig queryirToJSON :: () -> Object
 */
const queryirToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'QueryIR', enumerable: false },
    toString: { value: queryirToString, enumerable: false },
    toJSON: { value: queryirToJSON, enumerable: false },
    constructor: { value: QueryIR, enumerable: false, writable: true, configurable: true },
})

QueryIR.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
QueryIR.toString = () => 'QueryIR'
QueryIR.is = v => v && v['@@typeName'] === 'QueryIR'

QueryIR._from = _input => {
    const { name, description, sources, computation, output } = _input
    return QueryIR(name, description, sources, computation, output)
}
QueryIR.from = QueryIR._from

QueryIR._toFirestore = (o, encodeTimestamps) => {
    const result = {
        name: o.name,
        sources: R.lookupTableToFirestore(QuerySource, 'name', encodeTimestamps, o.sources),
        computation: Computation.toFirestore(o.computation, encodeTimestamps),
    }

    if (o.description !== undefined) result.description = o.description

    if (o.output !== undefined) result.output = QueryOutput.toFirestore(o.output, encodeTimestamps)

    return result
}

QueryIR._fromFirestore = (doc, decodeTimestamps) =>
    QueryIR._from({
        name: doc.name,
        description: doc.description,
        sources: R.lookupTableFromFirestore(QuerySource, 'name', decodeTimestamps, doc.sources),
        computation: Computation.fromFirestore
            ? Computation.fromFirestore(doc.computation, decodeTimestamps)
            : Computation.from(doc.computation),
        output: QueryOutput.fromFirestore
            ? QueryOutput.fromFirestore(doc.output, decodeTimestamps)
            : QueryOutput.from(doc.output),
    })

// Public aliases (override if necessary)
QueryIR.toFirestore = QueryIR._toFirestore
QueryIR.fromFirestore = QueryIR._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QueryIR }
