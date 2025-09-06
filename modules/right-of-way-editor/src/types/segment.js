// Auto-generated static tagged type: Segment
// Generated from: ./types/segment.type.js
// {
//     use   : "String"
//     length: "Number"
// }

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Segment = function Segment(use, length) {
    R.validateArgumentLength('Segment(use, length)', 2, arguments)
    R.validateString('Segment(use, length)', 'use', false, use)
    R.validateNumber('Segment(use, length)', 'length', false, length)

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
const prototype = {
    toString: function () {
        return `Segment(${R._toString(this.use)}, ${R._toString(this.length)})`
    },
    toJSON() {
        return this
    },
}

Segment.prototype = prototype
prototype.constructor = Segment

Object.defineProperty(prototype, '@@typeName', { value: 'Segment' }) // Add hidden @@typeName property

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
