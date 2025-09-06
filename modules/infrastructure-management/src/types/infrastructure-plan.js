// Auto-generated static tagged type: InfrastructurePlan
// Generated from: ./types/infrastructure-plan.type.js
// {
//     id       : "String"
//     operation: "String"
//     config   : "Object?"
//     steps    : "[InfrastructureStep]"
// }

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const InfrastructurePlan = function InfrastructurePlan(id, operation, config, steps) {
    R.validateString('InfrastructurePlan(id, operation, config, steps)', 'id', false, id)
    R.validateString('InfrastructurePlan(id, operation, config, steps)', 'operation', false, operation)
    R.validateObject('InfrastructurePlan(id, operation, config, steps)', 'config', true, config)
    R.validateArray(
        'InfrastructurePlan(id, operation, config, steps)',
        1,
        'Tagged',
        'InfrastructureStep',
        'steps',
        false,
        steps,
    )

    const result = Object.create(prototype)
    result.id = id
    result.operation = operation
    if (config != null) result.config = config
    result.steps = steps
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `InfrastructurePlan(${R._toString(this.id)}, ${R._toString(this.operation)}, ${R._toString(this.config)}, ${R._toString(this.steps)})`
    },
    toJSON() {
        return this
    },
}

InfrastructurePlan.prototype = prototype
prototype.constructor = InfrastructurePlan

Object.defineProperty(prototype, '@@typeName', { value: 'InfrastructurePlan' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
InfrastructurePlan.toString = () => 'InfrastructurePlan'
InfrastructurePlan.is = v => v && v['@@typeName'] === 'InfrastructurePlan'
InfrastructurePlan.from = o => InfrastructurePlan(o.id, o.operation, o.config, o.steps)

export { InfrastructurePlan }
