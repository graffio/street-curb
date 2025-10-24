/** {@link module:Segment} */
/*  Segment generated from: modules/curb-map/type-definitions/segment.type.js
 *
 *  use   : "String",
 *  length: "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Segment = function Segment(use, length) {
    const constructorName = 'Segment(use, length)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'use', false, use)
    R.validateNumber(constructorName, 'length', false, length)

    const result = Object.create(prototype)
    result.use = use
    result.length = length
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Segment', enumerable: false },

    toString: {
        value: function () {
            return `Segment(${R._toString(this.use)}, ${R._toString(this.length)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: Segment,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Segment.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Segment.toString = () => 'Segment'
Segment.is = v => v && v['@@typeName'] === 'Segment'
Segment.from = o => Segment(o.use, o.length)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: updateUse
Segment.updateUse = (segment, use) => Segment(use, segment.length)

export { Segment }
