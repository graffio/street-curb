// ABOUTME: Generated type definition for IRPivotExpression
// ABOUTME: Auto-generated from modules/query-language/type-definitions/ir-pivot-expression.type.js - do not edit manually

/*  IRPivotExpression generated from: modules/query-language/type-definitions/ir-pivot-expression.type.js
 *
 *  RowRef
 *      name: "String"
 *  Literal
 *      value: "Number"
 *  Binary
 *      op   : FieldTypes.arithmeticOp,
 *      left : "IRPivotExpression",
 *      right: "IRPivotExpression"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRPivotExpression constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRPivotExpression = { toString: () => 'IRPivotExpression' }

// Add hidden properties
Object.defineProperty(IRPivotExpression, '@@typeName', { value: 'IRPivotExpression', enumerable: false })
Object.defineProperty(IRPivotExpression, '@@tagNames', { value: ['RowRef', 'Literal', 'Binary'], enumerable: false })

// Type prototype with match method
const IRPivotExpressionPrototype = {}

Object.defineProperty(IRPivotExpressionPrototype, 'match', {
    value: R.match(IRPivotExpression['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRPivotExpressionPrototype, 'constructor', {
    value: IRPivotExpression,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRPivotExpression.prototype = IRPivotExpressionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    rowRef : function () { return `IRPivotExpression.RowRef(${R._toString(this.name)})` },
    literal: function () { return `IRPivotExpression.Literal(${R._toString(this.value)})` },
    binary : function () { return `IRPivotExpression.Binary(${R._toString(this.op)}, ${R._toString(this.left)}, ${R._toString(this.right)})` },
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
 * Construct a IRPivotExpression.RowRef instance
 * @sig RowRef :: (String) -> IRPivotExpression.RowRef
 */
const RowRefConstructor = function RowRef(name) {
    const constructorName = 'IRPivotExpression.RowRef(name)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateString(constructorName, 'name', false, name)

    const result = Object.create(RowRefPrototype)
    result.name = name
    return result
}

IRPivotExpression.RowRef = RowRefConstructor

/*
 * Construct a IRPivotExpression.Literal instance
 * @sig Literal :: (Number) -> IRPivotExpression.Literal
 */
const LiteralConstructor = function Literal(value) {
    const constructorName = 'IRPivotExpression.Literal(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'value', false, value)

    const result = Object.create(LiteralPrototype)
    result.value = value
    return result
}

IRPivotExpression.Literal = LiteralConstructor

/*
 * Construct a IRPivotExpression.Binary instance
 * @sig Binary :: (String, IRPivotExpression, IRPivotExpression) -> IRPivotExpression.Binary
 */
const BinaryConstructor = function Binary(op, left, right) {
    const constructorName = 'IRPivotExpression.Binary(op, left, right)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.arithmeticOp, 'op', false, op)
    R.validateTag(constructorName, 'IRPivotExpression', 'left', false, left)
    R.validateTag(constructorName, 'IRPivotExpression', 'right', false, right)

    const result = Object.create(BinaryPrototype)
    result.op = op
    result.left = left
    result.right = right
    return result
}

IRPivotExpression.Binary = BinaryConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const RowRefPrototype = Object.create(IRPivotExpressionPrototype, {
    '@@tagName': { value: 'RowRef', enumerable: false },
    '@@typeName': { value: 'IRPivotExpression', enumerable: false },
    toString: { value: toString.rowRef, enumerable: false },
    toJSON: { value: toJSON.rowRef, enumerable: false },
    constructor: { value: RowRefConstructor, enumerable: false, writable: true, configurable: true },
})

const LiteralPrototype = Object.create(IRPivotExpressionPrototype, {
    '@@tagName': { value: 'Literal', enumerable: false },
    '@@typeName': { value: 'IRPivotExpression', enumerable: false },
    toString: { value: toString.literal, enumerable: false },
    toJSON: { value: toJSON.literal, enumerable: false },
    constructor: { value: LiteralConstructor, enumerable: false, writable: true, configurable: true },
})

const BinaryPrototype = Object.create(IRPivotExpressionPrototype, {
    '@@tagName': { value: 'Binary', enumerable: false },
    '@@typeName': { value: 'IRPivotExpression', enumerable: false },
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
RowRefConstructor.toString = () => 'IRPivotExpression.RowRef'
LiteralConstructor.toString = () => 'IRPivotExpression.Literal'
BinaryConstructor.toString = () => 'IRPivotExpression.Binary'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor._from = _input => IRPivotExpression.RowRef(_input.name)
LiteralConstructor._from = _input => IRPivotExpression.Literal(_input.value)
BinaryConstructor._from = _input => {
    const { op, left, right } = _input
    return IRPivotExpression.Binary(op, left, right)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
RowRefConstructor.from = RowRefConstructor._from
LiteralConstructor.from = LiteralConstructor._from
BinaryConstructor.from = BinaryConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRPivotExpression instance
 * @sig is :: Any -> Boolean
 */
IRPivotExpression.is = v => {
    const { RowRef, Literal, Binary } = IRPivotExpression
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === RowRef || constructor === Literal || constructor === Binary
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRPivotExpression }
