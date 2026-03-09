// ABOUTME: Generated type definition for ComputedRow
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir/computed-row.type.js - do not edit manually

/** {@link module:ComputedRow} */
/*  ComputedRow generated from: modules/quicken-web-app/type-definitions/ir/computed-row.type.js
 *
 *  name      : "String",
 *  expression: "PivotExpression"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

import { PivotExpression } from './pivot-expression.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ComputedRow instance
 * @sig ComputedRow :: (String, PivotExpression) -> ComputedRow
 */
const ComputedRow = function ComputedRow(name, expression) {
    const constructorName = 'ComputedRow(name, expression)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateTag(constructorName, 'PivotExpression', 'expression', false, expression)

    const result = Object.create(prototype)
    result.name = name
    result.expression = expression
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig computedrowToString :: () -> String
 */
const computedrowToString = function () {
    return `ComputedRow(${R._toString(this.name)}, ${R._toString(this.expression)})`
}

/*
 * Convert to JSON representation
 * @sig computedrowToJSON :: () -> Object
 */
const computedrowToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ComputedRow', enumerable: false },
    toString: { value: computedrowToString, enumerable: false },
    toJSON: { value: computedrowToJSON, enumerable: false },
    constructor: { value: ComputedRow, enumerable: false, writable: true, configurable: true },
})

ComputedRow.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ComputedRow.toString = () => 'ComputedRow'
ComputedRow.is = v => v && v['@@typeName'] === 'ComputedRow'

ComputedRow._from = _input => ComputedRow(_input.name, _input.expression)
ComputedRow.from = ComputedRow._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ComputedRow }
