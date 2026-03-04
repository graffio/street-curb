// ABOUTME: Generated type definition for ExpressionNode
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/expression-node.type.js - do not edit manually

/*  ExpressionNode generated from: modules/quicken-web-app/type-definitions/expression-node.type.js
 *
 *  Literal
 *      value: "Number"
 *  Binary
 *      op   : /^[/+*-]$/,
 *      left : "ExpressionNode",
 *      right: "ExpressionNode"
 *  Call
 *      fn  : "String",
 *      args: "[ExpressionNode]"
 *  Reference
 *      source: FieldTypes.sourceName,
 *      field : "String"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// ExpressionNode constructor
//
// -------------------------------------------------------------------------------------------------------------
const ExpressionNode = {
    toString: () => 'ExpressionNode',
}

// Add hidden properties
Object.defineProperty(ExpressionNode, '@@typeName', { value: 'ExpressionNode', enumerable: false })
Object.defineProperty(ExpressionNode, '@@tagNames', {
    value: ['Literal', 'Binary', 'Call', 'Reference'],
    enumerable: false,
})

// Type prototype with match method
const ExpressionNodePrototype = {}

Object.defineProperty(ExpressionNodePrototype, 'match', {
    value: R.match(ExpressionNode['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ExpressionNodePrototype, 'constructor', {
    value: ExpressionNode,
    enumerable: false,
    writable: true,
    configurable: true,
})

ExpressionNode.prototype = ExpressionNodePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    literal  : function () { return `ExpressionNode.Literal(${R._toString(this.value)})` },
    binary   : function () { return `ExpressionNode.Binary(${R._toString(this.op)}, ${R._toString(this.left)}, ${R._toString(this.right)})` },
    call     : function () { return `ExpressionNode.Call(${R._toString(this.fn)}, ${R._toString(this.args)})` },
    reference: function () { return `ExpressionNode.Reference(${R._toString(this.source)}, ${R._toString(this.field)})` },
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
 * Construct a ExpressionNode.Literal instance
 * @sig Literal :: (Number) -> ExpressionNode.Literal
 */
const LiteralConstructor = function Literal(value) {
    const constructorName = 'ExpressionNode.Literal(value)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateNumber(constructorName, 'value', false, value)

    const result = Object.create(LiteralPrototype)
    result.value = value
    return result
}

ExpressionNode.Literal = LiteralConstructor

/*
 * Construct a ExpressionNode.Binary instance
 * @sig Binary :: (Op, ExpressionNode, ExpressionNode) -> ExpressionNode.Binary
 *     Op = /^[/+*-]$/
 */
const BinaryConstructor = function Binary(op, left, right) {
    const constructorName = 'ExpressionNode.Binary(op, left, right)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, /^[/+*-]$/, 'op', false, op)
    R.validateTag(constructorName, 'ExpressionNode', 'left', false, left)
    R.validateTag(constructorName, 'ExpressionNode', 'right', false, right)

    const result = Object.create(BinaryPrototype)
    result.op = op
    result.left = left
    result.right = right
    return result
}

ExpressionNode.Binary = BinaryConstructor

/*
 * Construct a ExpressionNode.Call instance
 * @sig Call :: (String, [ExpressionNode]) -> ExpressionNode.Call
 */
const CallConstructor = function Call(fn, args) {
    const constructorName = 'ExpressionNode.Call(fn, args)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'fn', false, fn)
    R.validateArray(constructorName, 1, 'Tagged', 'ExpressionNode', 'args', false, args)

    const result = Object.create(CallPrototype)
    result.fn = fn
    result.args = args
    return result
}

ExpressionNode.Call = CallConstructor

/*
 * Construct a ExpressionNode.Reference instance
 * @sig Reference :: (String, String) -> ExpressionNode.Reference
 */
const ReferenceConstructor = function Reference(source, field) {
    const constructorName = 'ExpressionNode.Reference(source, field)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)
    R.validateString(constructorName, 'field', false, field)

    const result = Object.create(ReferencePrototype)
    result.source = source
    result.field = field
    return result
}

ExpressionNode.Reference = ReferenceConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const LiteralPrototype = Object.create(ExpressionNodePrototype, {
    '@@tagName': { value: 'Literal', enumerable: false },
    '@@typeName': { value: 'ExpressionNode', enumerable: false },
    toString: { value: toString.literal, enumerable: false },
    toJSON: { value: toJSON.literal, enumerable: false },
    constructor: { value: LiteralConstructor, enumerable: false, writable: true, configurable: true },
})

const BinaryPrototype = Object.create(ExpressionNodePrototype, {
    '@@tagName': { value: 'Binary', enumerable: false },
    '@@typeName': { value: 'ExpressionNode', enumerable: false },
    toString: { value: toString.binary, enumerable: false },
    toJSON: { value: toJSON.binary, enumerable: false },
    constructor: { value: BinaryConstructor, enumerable: false, writable: true, configurable: true },
})

const CallPrototype = Object.create(ExpressionNodePrototype, {
    '@@tagName': { value: 'Call', enumerable: false },
    '@@typeName': { value: 'ExpressionNode', enumerable: false },
    toString: { value: toString.call, enumerable: false },
    toJSON: { value: toJSON.call, enumerable: false },
    constructor: { value: CallConstructor, enumerable: false, writable: true, configurable: true },
})

const ReferencePrototype = Object.create(ExpressionNodePrototype, {
    '@@tagName': { value: 'Reference', enumerable: false },
    '@@typeName': { value: 'ExpressionNode', enumerable: false },
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
LiteralConstructor.toString = () => 'ExpressionNode.Literal'
BinaryConstructor.toString = () => 'ExpressionNode.Binary'
CallConstructor.toString = () => 'ExpressionNode.Call'
ReferenceConstructor.toString = () => 'ExpressionNode.Reference'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor._from = _input => ExpressionNode.Literal(_input.value)
BinaryConstructor._from = _input => {
    const { op, left, right } = _input
    return ExpressionNode.Binary(op, left, right)
}
CallConstructor._from = _input => ExpressionNode.Call(_input.fn, _input.args)
ReferenceConstructor._from = _input => ExpressionNode.Reference(_input.source, _input.field)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
LiteralConstructor.from = LiteralConstructor._from
BinaryConstructor.from = BinaryConstructor._from
CallConstructor.from = CallConstructor._from
ReferenceConstructor.from = ReferenceConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a ExpressionNode instance
 * @sig is :: Any -> Boolean
 */
ExpressionNode.is = v => {
    const { Literal, Binary, Call, Reference } = ExpressionNode
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Literal || constructor === Binary || constructor === Call || constructor === Reference
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ExpressionNode }
