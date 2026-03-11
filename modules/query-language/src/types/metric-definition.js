// ABOUTME: Generated type definition for MetricDefinition
// ABOUTME: Auto-generated from modules/query-language/type-definitions/metric-definition.type.js - do not edit manually

/** {@link module:MetricDefinition} */
/*  MetricDefinition generated from: modules/query-language/type-definitions/metric-definition.type.js
 *
 *  name   : "String",
 *  compute: "String",
 *  level  : FieldTypes.metricLevel
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a MetricDefinition instance
 * @sig MetricDefinition :: (String, String, String) -> MetricDefinition
 */
const MetricDefinition = function MetricDefinition(name, compute, level) {
    const constructorName = 'MetricDefinition(name, compute, level)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'compute', false, compute)
    R.validateRegex(constructorName, FieldTypes.metricLevel, 'level', false, level)

    const result = Object.create(prototype)
    result.name = name
    result.compute = compute
    result.level = level
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig metricdefinitionToString :: () -> String
 */
const metricdefinitionToString = function () {
    return `MetricDefinition(${R._toString(this.name)}, ${R._toString(this.compute)}, ${R._toString(this.level)})`
}

/*
 * Convert to JSON representation
 * @sig metricdefinitionToJSON :: () -> Object
 */
const metricdefinitionToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'MetricDefinition', enumerable: false },
    toString: { value: metricdefinitionToString, enumerable: false },
    toJSON: { value: metricdefinitionToJSON, enumerable: false },
    constructor: { value: MetricDefinition, enumerable: false, writable: true, configurable: true },
})

MetricDefinition.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
MetricDefinition.toString = () => 'MetricDefinition'
MetricDefinition.is = v => v && v['@@typeName'] === 'MetricDefinition'

MetricDefinition._from = _input => {
    const { name, compute, level } = _input
    return MetricDefinition(name, compute, level)
}
MetricDefinition.from = MetricDefinition._from

MetricDefinition.fromJSON = json => (json == null ? json : MetricDefinition._from(json))

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { MetricDefinition }
