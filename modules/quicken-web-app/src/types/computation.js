// ABOUTME: Generated type definition for Computation
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/computation.type.js - do not edit manually

/*  Computation generated from: modules/quicken-web-app/type-definitions/computation.type.js
 *
 *  Identity
 *      source: FieldTypes.sourceName
 *  Compare
 *      left : FieldTypes.sourceName,
 *      right: FieldTypes.sourceName
 *  Expression
 *      expression: "ExpressionNode"
 *  FilterEntities
 *      source: FieldTypes.sourceName
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { ExpressionNode } from './expression-node.js'

// -------------------------------------------------------------------------------------------------------------
//
// Computation constructor
//
// -------------------------------------------------------------------------------------------------------------
const Computation = {
    toString: () => 'Computation',
}

// Add hidden properties
Object.defineProperty(Computation, '@@typeName', { value: 'Computation', enumerable: false })
Object.defineProperty(Computation, '@@tagNames', {
    value: ['Identity', 'Compare', 'Expression', 'FilterEntities'],
    enumerable: false,
})

// Type prototype with match method
const ComputationPrototype = {}

Object.defineProperty(ComputationPrototype, 'match', {
    value: R.match(Computation['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ComputationPrototype, 'constructor', {
    value: Computation,
    enumerable: false,
    writable: true,
    configurable: true,
})

Computation.prototype = ComputationPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    identity      : function () { return `Computation.Identity(${R._toString(this.source)})` },
    compare       : function () { return `Computation.Compare(${R._toString(this.left)}, ${R._toString(this.right)})` },
    expression    : function () { return `Computation.Expression(${R._toString(this.expression)})` },
    filterEntities: function () { return `Computation.FilterEntities(${R._toString(this.source)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    identity      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    compare       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    expression    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    filterEntities: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Computation.Identity instance
 * @sig Identity :: (String) -> Computation.Identity
 */
const IdentityConstructor = function Identity(source) {
    const constructorName = 'Computation.Identity(source)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(IdentityPrototype)
    result.source = source
    return result
}

Computation.Identity = IdentityConstructor

/*
 * Construct a Computation.Compare instance
 * @sig Compare :: (String, String) -> Computation.Compare
 */
const CompareConstructor = function Compare(left, right) {
    const constructorName = 'Computation.Compare(left, right)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'left', false, left)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'right', false, right)

    const result = Object.create(ComparePrototype)
    result.left = left
    result.right = right
    return result
}

Computation.Compare = CompareConstructor

/*
 * Construct a Computation.Expression instance
 * @sig Expression :: (ExpressionNode) -> Computation.Expression
 */
const ExpressionConstructor = function Expression(expression) {
    const constructorName = 'Computation.Expression(expression)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'ExpressionNode', 'expression', false, expression)

    const result = Object.create(ExpressionPrototype)
    result.expression = expression
    return result
}

Computation.Expression = ExpressionConstructor

/*
 * Construct a Computation.FilterEntities instance
 * @sig FilterEntities :: (String) -> Computation.FilterEntities
 */
const FilterEntitiesConstructor = function FilterEntities(source) {
    const constructorName = 'Computation.FilterEntities(source)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(FilterEntitiesPrototype)
    result.source = source
    return result
}

Computation.FilterEntities = FilterEntitiesConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const IdentityPrototype = Object.create(ComputationPrototype, {
    '@@tagName': { value: 'Identity', enumerable: false },
    '@@typeName': { value: 'Computation', enumerable: false },
    toString: { value: toString.identity, enumerable: false },
    toJSON: { value: toJSON.identity, enumerable: false },
    constructor: { value: IdentityConstructor, enumerable: false, writable: true, configurable: true },
})

const ComparePrototype = Object.create(ComputationPrototype, {
    '@@tagName': { value: 'Compare', enumerable: false },
    '@@typeName': { value: 'Computation', enumerable: false },
    toString: { value: toString.compare, enumerable: false },
    toJSON: { value: toJSON.compare, enumerable: false },
    constructor: { value: CompareConstructor, enumerable: false, writable: true, configurable: true },
})

const ExpressionPrototype = Object.create(ComputationPrototype, {
    '@@tagName': { value: 'Expression', enumerable: false },
    '@@typeName': { value: 'Computation', enumerable: false },
    toString: { value: toString.expression, enumerable: false },
    toJSON: { value: toJSON.expression, enumerable: false },
    constructor: { value: ExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const FilterEntitiesPrototype = Object.create(ComputationPrototype, {
    '@@tagName': { value: 'FilterEntities', enumerable: false },
    '@@typeName': { value: 'Computation', enumerable: false },
    toString: { value: toString.filterEntities, enumerable: false },
    toJSON: { value: toJSON.filterEntities, enumerable: false },
    constructor: { value: FilterEntitiesConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.prototype = IdentityPrototype
CompareConstructor.prototype = ComparePrototype
ExpressionConstructor.prototype = ExpressionPrototype
FilterEntitiesConstructor.prototype = FilterEntitiesPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.is = val => val && val.constructor === IdentityConstructor
CompareConstructor.is = val => val && val.constructor === CompareConstructor
ExpressionConstructor.is = val => val && val.constructor === ExpressionConstructor
FilterEntitiesConstructor.is = val => val && val.constructor === FilterEntitiesConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.toString = () => 'Computation.Identity'
CompareConstructor.toString = () => 'Computation.Compare'
ExpressionConstructor.toString = () => 'Computation.Expression'
FilterEntitiesConstructor.toString = () => 'Computation.FilterEntities'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor._from = _input => Computation.Identity(_input.source)
CompareConstructor._from = _input => Computation.Compare(_input.left, _input.right)
ExpressionConstructor._from = _input => Computation.Expression(_input.expression)
FilterEntitiesConstructor._from = _input => Computation.FilterEntities(_input.source)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.from = IdentityConstructor._from
CompareConstructor.from = CompareConstructor._from
ExpressionConstructor.from = ExpressionConstructor._from
FilterEntitiesConstructor.from = FilterEntitiesConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a Computation instance
 * @sig is :: Any -> Boolean
 */
Computation.is = v => {
    const { Identity, Compare, Expression, FilterEntities } = Computation
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Identity ||
        constructor === Compare ||
        constructor === Expression ||
        constructor === FilterEntities
    )
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Computation }
