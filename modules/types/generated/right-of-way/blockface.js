// Auto-generated static tagged type: Blockface
// Generated from: ../types/src/right-of-way/blockface.type.js
// Fields: { id: "String", geometry: "Object", streetName: "String", segments: "[Segment]" }

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Blockface = function Blockface(id, geometry, streetName, segments) {
    R.validateArgumentLength('Blockface(id, geometry, streetName, segments)', 4, arguments)
    R.validateString('Blockface(id, geometry, streetName, segments)', 'id', false, id)
    R.validateObject('Blockface(id, geometry, streetName, segments)', 'geometry', false, geometry)
    R.validateString('Blockface(id, geometry, streetName, segments)', 'streetName', false, streetName)
    R.validateArray(
        'Blockface(id, geometry, streetName, segments)',
        1,
        'Tagged',
        'Segment',
        'segments',
        false,
        segments,
    )

    const result = Object.create(prototype)
    result.id = id
    result.geometry = geometry
    result.streetName = streetName
    result.segments = segments
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `Blockface(${R._toString(this.id)}, ${R._toString(this.geometry)}, ${R._toString(this.streetName)}, ${R._toString(this.segments)})`
    },
    toJSON() {
        return this
    },
}

Blockface.prototype = prototype
prototype.constructor = Blockface

Object.defineProperty(prototype, '@@typeName', { value: 'Blockface' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Blockface.toString = () => 'Blockface'
Blockface.is = v => v && v['@@typeName'] === 'Blockface'
Blockface.from = o => Blockface(o.id, o.geometry, o.streetName, o.segments)

export { Blockface }
