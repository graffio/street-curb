// ABOUTME: Generated type definition for IRExpression
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-expression.type.js - do not edit manually

/*  IRExpression generated from: modules/quicken-web-app/type-definitions/ir-expression.type.js
 *
 *  Literal
 *      value: "Number"
 *  Binary
 *      op   : FieldTypes.arithmeticOp,
 *      left : "IRExpression",
 *      right: "IRExpression"
 *  Call
 *      fn  : /^abs$/,
 *      args: "[IRExpression]"
 *  Reference
 *      source: FieldTypes.sourceName,
 *      field : /^[a-zA-Z_][a-zA-Z0-9_]*$/
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRExpression constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRExpression = {
    toString: () => 'IRExpression',
}

// Add hidden properties
Object.defineProperty(IRExpression, '@@typeName', { value: 'IRExpression', enumerable: false })
Object.defineProperty(IRExpression, '@@tagNames', {
    value: ['Literal', 'Binary', 'Call', 'Reference'],
    enumerable: false,
})

// Type prototype with match method
const IRExpressionPrototype = {}

Object.defineProperty(IRExpressionPrototype, 'match', {
    value: R.match(IRExpression['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRExpressionPrototype, 'constructor', {
    value: IRExpression,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRExpression.prototype = IRExpressionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    literal  : function () { return `IRExpression.Literal(${R._toString(this.value)})` },
    binary   : function () { return `IRExpression.Binary(${R._toString(this.op)}, ${R._toString(this.left)}, ${R._toString(this.right)})` },
    call     : function () { return `IRExpression.Call(${R._toString(this.fn)}, ${R._toString(this.args)})` },
    reference: function () { return `IRExpression.Reference(${R._toString(this.source)}, ${R._toString(this.field)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    literal  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    binary   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    call     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    reference: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRExpression.Literal instance
 * @sig Literal :: (Number) -> IRExpression.Literal
 */
const LiteralConstructor = function Literal(value) {
    const constructorName = 'IRExpression.Literal(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'value', false, value)

    const result = Object.create(LiteralPrototype)
    result.value = value
    return result
}

IRExpression.Literal = LiteralConstructor

/*
 * Construct a IRExpression.Binary instance
 * @sig Binary :: (String, IRExpression, IRExpression) -> IRExpression.Binary
 */
const BinaryConstructor = function Binary(op, left, right) {
    const constructorName = 'IRExpression.Binary(op, left, right)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.arithmeticOp, 'op', false, op)
    R.validateTag(constructorName, 'IRExpression', 'left', false, left)
    R.validateTag(constructorName, 'IRExpression', 'right', false, right)

    const result = Object.create(BinaryPrototype)
    result.op = op
    result.left = left
    result.right = right
    return result
}

IRExpression.Binary = BinaryConstructor

/*
 * Construct a IRExpression.Call instance
 * @sig Call :: (Fn, [IRExpression]) -> IRExpression.Call
 *     Fn = /^abs$/
 */
const CallConstructor = function Call(fn, args) {
    const constructorName = 'IRExpression.Call(fn, args)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, /^abs$/, 'fn', false, fn)
    R.validateArray(constructorName, 1, 'Tagged', 'IRExpression', 'args', false, args)

    const result = Object.create(CallPrototype)
    result.fn = fn
    result.args = args
    return result
}

IRExpression.Call = CallConstructor

/*
 * Construct a IRExpression.Reference instance
 * @sig Reference :: (String, Field) -> IRExpression.Reference
 *     Field = /^[a-zA-Z_][a-zA-Z0-9_]*$/
 */
const ReferenceConstructor = function Reference(source, field) {
    const constructorName = 'IRExpression.Reference(source, field)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)
    R.validateRegex(constructorName, /^[a-zA-Z_][a-zA-Z0-9_]*$/, 'field', false, field)

    const result = Object.create(ReferencePrototype)
    result.source = source
    result.field = field
    return result
}

IRExpression.Reference = ReferenceConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const LiteralPrototype = Object.create(IRExpressionPrototype, {
    '@@tagName': { value: 'Literal', enumerable: false },
    '@@typeName': { value: 'IRExpression', enumerable: false },
    toString: { value: toString.literal, enumerable: false },
    toJSON: { value: toJSON.literal, enumerable: false },
    constructor: { value: LiteralConstructor, enumerable: false, writable: true, configurable: true },
})

const BinaryPrototype = Object.create(IRExpressionPrototype, {
    '@@tagName': { value: 'Binary', enumerable: false },
    '@@typeName': { value: 'IRExpression', enumerable: false },
    toString: { value: toString.binary, enumerable: false },
    toJSON: { value: toJSON.binary, enumerable: false },
    constructor: { value: BinaryConstructor, enumerable: false, writable: true, configurable: true },
})

const CallPrototype = Object.create(IRExpressionPrototype, {
    '@@tagName': { value: 'Call', enumerable: false },
    '@@typeName': { value: 'IRExpression', enumerable: false },
    toString: { value: toString.call, enumerable: false },
    toJSON: { value: toJSON.call, enumerable: false },
    constructor: { value: CallConstructor, enumerable: false, writable: true, configurable: true },
})

const ReferencePrototype = Object.create(IRExpressionPrototype, {
    '@@tagName': { value: 'Reference', enumerable: false },
    '@@typeName': { value: 'IRExpression', enumerable: false },
    toString: { value: toString.reference, enumerable: false },
    toJSON: { value: toJSON.reference, enumerable: false },
    constructor: { value: ReferenceConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor.prototype = LiteralPrototype
BinaryConstructor.prototype = BinaryPrototype
CallConstructor.prototype = CallPrototype
ReferenceConstructor.prototype = ReferencePrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor.is = val => val && val.constructor === LiteralConstructor
BinaryConstructor.is = val => val && val.constructor === BinaryConstructor
CallConstructor.is = val => val && val.constructor === CallConstructor
ReferenceConstructor.is = val => val && val.constructor === ReferenceConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor.toString = () => 'IRExpression.Literal'
BinaryConstructor.toString = () => 'IRExpression.Binary'
CallConstructor.toString = () => 'IRExpression.Call'
ReferenceConstructor.toString = () => 'IRExpression.Reference'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor._from = _input => IRExpression.Literal(_input.value)
BinaryConstructor._from = _input => {
    const { op, left, right } = _input
    return IRExpression.Binary(op, left, right)
}
CallConstructor._from = _input => IRExpression.Call(_input.fn, _input.args)
ReferenceConstructor._from = _input => IRExpression.Reference(_input.source, _input.field)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor.from = LiteralConstructor._from
BinaryConstructor.from = BinaryConstructor._from
CallConstructor.from = CallConstructor._from
ReferenceConstructor.from = ReferenceConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRExpression instance
 * @sig is :: Any -> Boolean
 */
IRExpression.is = v => {
    const { Literal, Binary, Call, Reference } = IRExpression
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Literal || constructor === Binary || constructor === Call || constructor === Reference
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRExpression }
