// Auto-generated static tagged type: TestCoord
// Generated from: test/fixtures/TestCoord.type.js
// {
//     x: "Number"
//     y: "Number"
// }

import * as R from 'modules/types-generation/index.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const TestCoord = function TestCoord(x, y) {
    R.validateArgumentLength('TestCoord(x, y)', 2, arguments)
    R.validateNumber('TestCoord(x, y)', 'x', false, x)
    R.validateNumber('TestCoord(x, y)', 'y', false, y)

    const result = Object.create(prototype)
    result.x = x
    result.y = y
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `TestCoord(${R._toString(this.x)}, ${R._toString(this.y)})`
    },
    toJSON() {
        return this
    },
}

TestCoord.prototype = prototype
prototype.constructor = TestCoord

Object.defineProperty(prototype, '@@typeName', { value: 'TestCoord' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
TestCoord.toString = () => 'TestCoord'
TestCoord.is = v => v && v['@@typeName'] === 'TestCoord'
TestCoord.from = o => TestCoord(o.x, o.y)

export { TestCoord }
