// ABOUTME: Generated type definition for IRComputedRow
// ABOUTME: Auto-generated from modules/query-language/type-definitions/ir-computed-row.type.js - do not edit manually

/** {@link module:IRComputedRow} */
/*  IRComputedRow generated from: modules/query-language/type-definitions/ir-computed-row.type.js
 *
 *  name      : "String",
 *  expression: "IRPivotExpression"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

import { IRPivotExpression } from './ir-pivot-expression.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRComputedRow instance
 * @sig IRComputedRow :: (String, IRPivotExpression) -> IRComputedRow
 */
const IRComputedRow = function IRComputedRow(name, expression) {
    const constructorName = 'IRComputedRow(name, expression)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'name', false, name)
    R.validateTag(constructorName, 'IRPivotExpression', 'expression', false, expression)

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
 * @sig ircomputedrowToString :: () -> String
 */
const ircomputedrowToString = function () {
    return `IRComputedRow(${R._toString(this.name)}, ${R._toString(this.expression)})`
}

/*
 * Convert to JSON representation
 * @sig ircomputedrowToJSON :: () -> Object
 */
const ircomputedrowToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'IRComputedRow', enumerable: false },
    toString: { value: ircomputedrowToString, enumerable: false },
    toJSON: { value: ircomputedrowToJSON, enumerable: false },
    constructor: { value: IRComputedRow, enumerable: false, writable: true, configurable: true },
})

IRComputedRow.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
IRComputedRow.toString = () => 'IRComputedRow'
IRComputedRow.is = v => v && v['@@typeName'] === 'IRComputedRow'

IRComputedRow._from = _input => IRComputedRow(_input.name, _input.expression)
IRComputedRow.from = IRComputedRow._from

IRComputedRow.fromJSON = json => {
    if (json == null) return json
    const revived = { ...json }
    revived.expression = IRPivotExpression.fromJSON(revived.expression)
    return IRComputedRow._from(revived)
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRComputedRow }
