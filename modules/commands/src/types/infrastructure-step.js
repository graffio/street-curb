// Auto-generated static tagged type: InfrastructureStep
// Generated from: ./types/infrastructure-step.type.js
// {
//     adapter    : "String"
//     action     : "String"
//     description: "String"
//     canRollback: "Boolean"
//     additional : "Object?"
// }

import * as R from '@graffio/types-runtime'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const InfrastructureStep = function InfrastructureStep(adapter, action, description, canRollback, additional) {
    R.validateString(
        'InfrastructureStep(adapter, action, description, canRollback, additional)',
        'adapter',
        false,
        adapter,
    )
    R.validateString(
        'InfrastructureStep(adapter, action, description, canRollback, additional)',
        'action',
        false,
        action,
    )
    R.validateString(
        'InfrastructureStep(adapter, action, description, canRollback, additional)',
        'description',
        false,
        description,
    )
    R.validateBoolean(
        'InfrastructureStep(adapter, action, description, canRollback, additional)',
        'canRollback',
        false,
        canRollback,
    )
    R.validateObject(
        'InfrastructureStep(adapter, action, description, canRollback, additional)',
        'additional',
        true,
        additional,
    )

    const result = Object.create(prototype)
    result.adapter = adapter
    result.action = action
    result.description = description
    result.canRollback = canRollback
    if (additional != null) result.additional = additional
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `InfrastructureStep(${R._toString(this.adapter)}, ${R._toString(this.action)}, ${R._toString(this.description)}, ${R._toString(this.canRollback)}, ${R._toString(this.additional)})`
    },
    toJSON() {
        return this
    },
}

InfrastructureStep.prototype = prototype
prototype.constructor = InfrastructureStep

Object.defineProperty(prototype, '@@typeName', { value: 'InfrastructureStep' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
InfrastructureStep.toString = () => 'InfrastructureStep'
InfrastructureStep.is = v => v && v['@@typeName'] === 'InfrastructureStep'
InfrastructureStep.from = o => InfrastructureStep(o.adapter, o.action, o.description, o.canRollback, o.additional)

export { InfrastructureStep }
