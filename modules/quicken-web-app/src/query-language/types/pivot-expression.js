// ABOUTME: Generated type definition for PivotExpression
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir/pivot-expression.type.js - do not edit manually

/*  PivotExpression generated from: modules/quicken-web-app/type-definitions/ir/pivot-expression.type.js
 *
 *  RowRef
 *      name: "String"
 *  Literal
 *      value: "Number"
 *  Binary
 *      op   : FieldTypes.arithmeticOp,
 *      left : "PivotExpression",
 *      right: "PivotExpression"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// PivotExpression constructor
//
// -------------------------------------------------------------------------------------------------------------
const PivotExpression = { toString: () => 'PivotExpression' }

// Add hidden properties
Object.defineProperty(PivotExpression, '@@typeName', { value: 'PivotExpression', enumerable: false })
Object.defineProperty(PivotExpression, '@@tagNames', { value: ['RowRef', 'Literal', 'Binary'], enumerable: false })

// Type prototype with match method
const PivotExpressionPrototype = {}

Object.defineProperty(PivotExpressionPrototype, 'match', {
    value: R.match(PivotExpression['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(PivotExpressionPrototype, 'constructor', {
    value: PivotExpression,
    enumerable: false,
    writable: true,
    configurable: true,
})

PivotExpression.prototype = PivotExpressionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    rowRef : function () { return `PivotExpression.RowRef(${R._toString(this.name)})` },
    literal: function () { return `PivotExpression.Literal(${R._toString(this.value)})` },
    binary : function () { return `PivotExpression.Binary(${R._toString(this.op)}, ${R._toString(this.left)}, ${R._toString(this.right)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    rowRef : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    literal: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    binary : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a PivotExpression.RowRef instance
 * @sig RowRef :: (String) -> PivotExpression.RowRef
 */
const RowRefConstructor = function RowRef(name) {
    const constructorName = 'PivotExpression.RowRef(name)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'name', false, name)

    const result = Object.create(RowRefPrototype)
    result.name = name
    return result
}

PivotExpression.RowRef = RowRefConstructor

/*
 * Construct a PivotExpression.Literal instance
 * @sig Literal :: (Number) -> PivotExpression.Literal
 */
const LiteralConstructor = function Literal(value) {
    const constructorName = 'PivotExpression.Literal(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'value', false, value)

    const result = Object.create(LiteralPrototype)
    result.value = value
    return result
}

PivotExpression.Literal = LiteralConstructor

/*
 * Construct a PivotExpression.Binary instance
 * @sig Binary :: (String, PivotExpression, PivotExpression) -> PivotExpression.Binary
 */
const BinaryConstructor = function Binary(op, left, right) {
    const constructorName = 'PivotExpression.Binary(op, left, right)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.arithmeticOp, 'op', false, op)
    R.validateTag(constructorName, 'PivotExpression', 'left', false, left)
    R.validateTag(constructorName, 'PivotExpression', 'right', false, right)

    const result = Object.create(BinaryPrototype)
    result.op = op
    result.left = left
    result.right = right
    return result
}

PivotExpression.Binary = BinaryConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const RowRefPrototype = Object.create(PivotExpressionPrototype, {
    '@@tagName': { value: 'RowRef', enumerable: false },
    '@@typeName': { value: 'PivotExpression', enumerable: false },
    toString: { value: toString.rowRef, enumerable: false },
    toJSON: { value: toJSON.rowRef, enumerable: false },
    constructor: { value: RowRefConstructor, enumerable: false, writable: true, configurable: true },
})

const LiteralPrototype = Object.create(PivotExpressionPrototype, {
    '@@tagName': { value: 'Literal', enumerable: false },
    '@@typeName': { value: 'PivotExpression', enumerable: false },
    toString: { value: toString.literal, enumerable: false },
    toJSON: { value: toJSON.literal, enumerable: false },
    constructor: { value: LiteralConstructor, enumerable: false, writable: true, configurable: true },
})

const BinaryPrototype = Object.create(PivotExpressionPrototype, {
    '@@tagName': { value: 'Binary', enumerable: false },
    '@@typeName': { value: 'PivotExpression', enumerable: false },
    toString: { value: toString.binary, enumerable: false },
    toJSON: { value: toJSON.binary, enumerable: false },
    constructor: { value: BinaryConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor.prototype = RowRefPrototype
LiteralConstructor.prototype = LiteralPrototype
BinaryConstructor.prototype = BinaryPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor.is = val => val && val.constructor === RowRefConstructor
LiteralConstructor.is = val => val && val.constructor === LiteralConstructor
BinaryConstructor.is = val => val && val.constructor === BinaryConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor.toString = () => 'PivotExpression.RowRef'
LiteralConstructor.toString = () => 'PivotExpression.Literal'
BinaryConstructor.toString = () => 'PivotExpression.Binary'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor._from = _input => PivotExpression.RowRef(_input.name)
LiteralConstructor._from = _input => PivotExpression.Literal(_input.value)
BinaryConstructor._from = _input => {
    const { op, left, right } = _input
    return PivotExpression.Binary(op, left, right)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor.from = RowRefConstructor._from
LiteralConstructor.from = LiteralConstructor._from
BinaryConstructor.from = BinaryConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a PivotExpression instance
 * @sig is :: Any -> Boolean
 */
PivotExpression.is = v => {
    const { RowRef, Literal, Binary } = PivotExpression
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === RowRef || constructor === Literal || constructor === Binary
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { PivotExpression }
