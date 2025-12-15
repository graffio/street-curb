// ABOUTME: Generated type definition for Segment
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/segment.type.js - do not edit manually

/** {@link module:Segment} */
/*  Segment generated from: modules/curb-map/type-definitions/segment.type.js
 *
 *  id    : FieldTypes.segmentId,
 *  use   : "String",
 *  length: "Number"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a Segment instance
 * @sig Segment :: ([Object], String, Number) -> Segment
 */
const Segment = function Segment(id, use, length) {
    const constructorName = 'Segment(id, use, length)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.segmentId, 'id', false, id)
    R.validateString(constructorName, 'use', false, use)
    R.validateNumber(constructorName, 'length', false, length)

    const result = Object.create(prototype)
    result.id = id
    result.use = use
    result.length = length
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig segmentToString :: () -> String
 */
const segmentToString = function () {
    return `Segment(${R._toString(this.id)}, ${R._toString(this.use)}, ${R._toString(this.length)})`
}

/**
 * Convert to JSON representation
 * @sig segmentToJSON :: () -> Object
 */
const segmentToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Segment', enumerable: false },
    toString: { value: segmentToString, enumerable: false },
    toJSON: { value: segmentToJSON, enumerable: false },
    constructor: { value: Segment, enumerable: false, writable: true, configurable: true },
})

Segment.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Segment.toString = () => 'Segment'
Segment.is = v => v && v['@@typeName'] === 'Segment'

Segment._from = o => {
    const { id, use, length } = o
    return Segment(id, use, length)
}
Segment.from = Segment._from

Segment._toFirestore = (o, encodeTimestamps) => ({ ...o })

Segment._fromFirestore = (doc, decodeTimestamps) => Segment._from(doc)

// Public aliases (override if necessary)
Segment.toFirestore = Segment._toFirestore
Segment.fromFirestore = Segment._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Segment.updateUse = (segment, use) => Segment(segment.id, use, segment.length)

export { Segment }
