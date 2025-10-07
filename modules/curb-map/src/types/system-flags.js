/** {@link module:SystemFlags} */
/*  SystemFlags generated from: modules/curb-map/type-definitions/system-flags.type.js
 *
 *  id             : /flags/,
 *  triggersEnabled: "Boolean"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const SystemFlags = function SystemFlags(id, triggersEnabled) {
    const constructorName = 'SystemFlags(id, triggersEnabled)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, /flags/, 'id', false, id)
    R.validateBoolean(constructorName, 'triggersEnabled', false, triggersEnabled)

    const result = Object.create(prototype)
    result.id = id
    result.triggersEnabled = triggersEnabled
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `SystemFlags(${R._toString(this.id)}, ${R._toString(this.triggersEnabled)})`
    },
    toJSON() {
        return this
    },
}

SystemFlags.prototype = prototype
prototype.constructor = SystemFlags

Object.defineProperty(prototype, '@@typeName', { value: 'SystemFlags' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
SystemFlags.toString = () => 'SystemFlags'
SystemFlags.is = v => v && v['@@typeName'] === 'SystemFlags'
SystemFlags.from = o => SystemFlags(o.id, o.triggersEnabled)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: toFirestore
SystemFlags.toFirestore = f => ({ ...f })

// Additional function: fromFirestore
SystemFlags.fromFirestore = SystemFlags.from

export { SystemFlags }
