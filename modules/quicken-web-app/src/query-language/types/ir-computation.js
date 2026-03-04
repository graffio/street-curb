// ABOUTME: Generated type definition for IRComputation
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir/ir-computation.type.js - do not edit manually

/*  IRComputation generated from: modules/quicken-web-app/type-definitions/ir/ir-computation.type.js
 *
 *  Identity
 *      source: FieldTypes.sourceName
 *  Compare
 *      left : FieldTypes.sourceName,
 *      right: FieldTypes.sourceName
 *  Expression
 *      expression: "IRExpression"
 *  FilterEntities
 *      source: FieldTypes.sourceName
 *  TimeSeries
 *      source  : FieldTypes.sourceName,
 *      interval: FieldTypes.timeSeriesInterval
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { IRExpression } from './ir-expression.js'

// -------------------------------------------------------------------------------------------------------------
//
// IRComputation constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRComputation = { toString: () => 'IRComputation' }

// Add hidden properties
Object.defineProperty(IRComputation, '@@typeName', { value: 'IRComputation', enumerable: false })
Object.defineProperty(IRComputation, '@@tagNames', {
    value: ['Identity', 'Compare', 'Expression', 'FilterEntities', 'TimeSeries'],
    enumerable: false,
})

// Type prototype with match method
const IRComputationPrototype = {}

Object.defineProperty(IRComputationPrototype, 'match', {
    value: R.match(IRComputation['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRComputationPrototype, 'constructor', {
    value: IRComputation,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRComputation.prototype = IRComputationPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    identity      : function () { return `IRComputation.Identity(${R._toString(this.source)})` },
    compare       : function () { return `IRComputation.Compare(${R._toString(this.left)}, ${R._toString(this.right)})` },
    expression    : function () { return `IRComputation.Expression(${R._toString(this.expression)})` },
    filterEntities: function () { return `IRComputation.FilterEntities(${R._toString(this.source)})` },
    timeSeries    : function () { return `IRComputation.TimeSeries(${R._toString(this.source)}, ${R._toString(this.interval)})` },
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
    timeSeries    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRComputation.Identity instance
 * @sig Identity :: (String) -> IRComputation.Identity
 */
const IdentityConstructor = function Identity(source) {
    const constructorName = 'IRComputation.Identity(source)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(IdentityPrototype)
    result.source = source
    return result
}

IRComputation.Identity = IdentityConstructor

/*
 * Construct a IRComputation.Compare instance
 * @sig Compare :: (String, String) -> IRComputation.Compare
 */
const CompareConstructor = function Compare(left, right) {
    const constructorName = 'IRComputation.Compare(left, right)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'left', false, left)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'right', false, right)

    const result = Object.create(ComparePrototype)
    result.left = left
    result.right = right
    return result
}

IRComputation.Compare = CompareConstructor

/*
 * Construct a IRComputation.Expression instance
 * @sig Expression :: (IRExpression) -> IRComputation.Expression
 */
const ExpressionConstructor = function Expression(expression) {
    const constructorName = 'IRComputation.Expression(expression)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateTag(constructorName, 'IRExpression', 'expression', false, expression)

    const result = Object.create(ExpressionPrototype)
    result.expression = expression
    return result
}

IRComputation.Expression = ExpressionConstructor

/*
 * Construct a IRComputation.FilterEntities instance
 * @sig FilterEntities :: (String) -> IRComputation.FilterEntities
 */
const FilterEntitiesConstructor = function FilterEntities(source) {
    const constructorName = 'IRComputation.FilterEntities(source)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(FilterEntitiesPrototype)
    result.source = source
    return result
}

IRComputation.FilterEntities = FilterEntitiesConstructor

/*
 * Construct a IRComputation.TimeSeries instance
 * @sig TimeSeries :: (String, String) -> IRComputation.TimeSeries
 */
const TimeSeriesConstructor = function TimeSeries(source, interval) {
    const constructorName = 'IRComputation.TimeSeries(source, interval)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)
    R.validateRegex(constructorName, FieldTypes.timeSeriesInterval, 'interval', false, interval)

    const result = Object.create(TimeSeriesPrototype)
    result.source = source
    result.interval = interval
    return result
}

IRComputation.TimeSeries = TimeSeriesConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const IdentityPrototype = Object.create(IRComputationPrototype, {
    '@@tagName': { value: 'Identity', enumerable: false },
    '@@typeName': { value: 'IRComputation', enumerable: false },
    toString: { value: toString.identity, enumerable: false },
    toJSON: { value: toJSON.identity, enumerable: false },
    constructor: { value: IdentityConstructor, enumerable: false, writable: true, configurable: true },
})

const ComparePrototype = Object.create(IRComputationPrototype, {
    '@@tagName': { value: 'Compare', enumerable: false },
    '@@typeName': { value: 'IRComputation', enumerable: false },
    toString: { value: toString.compare, enumerable: false },
    toJSON: { value: toJSON.compare, enumerable: false },
    constructor: { value: CompareConstructor, enumerable: false, writable: true, configurable: true },
})

const ExpressionPrototype = Object.create(IRComputationPrototype, {
    '@@tagName': { value: 'Expression', enumerable: false },
    '@@typeName': { value: 'IRComputation', enumerable: false },
    toString: { value: toString.expression, enumerable: false },
    toJSON: { value: toJSON.expression, enumerable: false },
    constructor: { value: ExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const FilterEntitiesPrototype = Object.create(IRComputationPrototype, {
    '@@tagName': { value: 'FilterEntities', enumerable: false },
    '@@typeName': { value: 'IRComputation', enumerable: false },
    toString: { value: toString.filterEntities, enumerable: false },
    toJSON: { value: toJSON.filterEntities, enumerable: false },
    constructor: { value: FilterEntitiesConstructor, enumerable: false, writable: true, configurable: true },
})

const TimeSeriesPrototype = Object.create(IRComputationPrototype, {
    '@@tagName': { value: 'TimeSeries', enumerable: false },
    '@@typeName': { value: 'IRComputation', enumerable: false },
    toString: { value: toString.timeSeries, enumerable: false },
    toJSON: { value: toJSON.timeSeries, enumerable: false },
    constructor: { value: TimeSeriesConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.prototype = IdentityPrototype
CompareConstructor.prototype = ComparePrototype
ExpressionConstructor.prototype = ExpressionPrototype
FilterEntitiesConstructor.prototype = FilterEntitiesPrototype
TimeSeriesConstructor.prototype = TimeSeriesPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.is = val => val && val.constructor === IdentityConstructor
CompareConstructor.is = val => val && val.constructor === CompareConstructor
ExpressionConstructor.is = val => val && val.constructor === ExpressionConstructor
FilterEntitiesConstructor.is = val => val && val.constructor === FilterEntitiesConstructor
TimeSeriesConstructor.is = val => val && val.constructor === TimeSeriesConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.toString = () => 'IRComputation.Identity'
CompareConstructor.toString = () => 'IRComputation.Compare'
ExpressionConstructor.toString = () => 'IRComputation.Expression'
FilterEntitiesConstructor.toString = () => 'IRComputation.FilterEntities'
TimeSeriesConstructor.toString = () => 'IRComputation.TimeSeries'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor._from = _input => IRComputation.Identity(_input.source)
CompareConstructor._from = _input => IRComputation.Compare(_input.left, _input.right)
ExpressionConstructor._from = _input => IRComputation.Expression(_input.expression)
FilterEntitiesConstructor._from = _input => IRComputation.FilterEntities(_input.source)
TimeSeriesConstructor._from = _input => IRComputation.TimeSeries(_input.source, _input.interval)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.from = IdentityConstructor._from
CompareConstructor.from = CompareConstructor._from
ExpressionConstructor.from = ExpressionConstructor._from
FilterEntitiesConstructor.from = FilterEntitiesConstructor._from
TimeSeriesConstructor.from = TimeSeriesConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRComputation instance
 * @sig is :: Any -> Boolean
 */
IRComputation.is = v => {
    const { Identity, Compare, Expression, FilterEntities, TimeSeries } = IRComputation
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Identity ||
        constructor === Compare ||
        constructor === Expression ||
        constructor === FilterEntities ||
        constructor === TimeSeries
    )
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRComputation }
