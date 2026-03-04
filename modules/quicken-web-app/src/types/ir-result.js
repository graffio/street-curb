// ABOUTME: Generated type definition for IRResult
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-result.type.js - do not edit manually

/*  IRResult generated from: modules/quicken-web-app/type-definitions/ir-result.type.js
 *
 *  Identity
 *      tree  : "IRResultTree",
 *      source: FieldTypes.sourceName
 *  Comparison
 *      left  : "IRResultTree",
 *      right : "IRResultTree",
 *      source: FieldTypes.sourceName
 *  Scalar
 *      value     : "Number",
 *      expression: "IRExpression"
 *  FilteredEntities
 *      entities: "[Account]",
 *      source  : FieldTypes.sourceName
 *  TimeSeries
 *      snapshots: "[Object]",
 *      source   : FieldTypes.sourceName
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { IRResultTree } from './ir-result-tree.js'
import { IRExpression } from './ir-expression.js'
import { Account } from './account.js'

// -------------------------------------------------------------------------------------------------------------
//
// IRResult constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRResult = {
    toString: () => 'IRResult',
}

// Add hidden properties
Object.defineProperty(IRResult, '@@typeName', { value: 'IRResult', enumerable: false })
Object.defineProperty(IRResult, '@@tagNames', {
    value: ['Identity', 'Comparison', 'Scalar', 'FilteredEntities', 'TimeSeries'],
    enumerable: false,
})

// Type prototype with match method
const IRResultPrototype = {}

Object.defineProperty(IRResultPrototype, 'match', {
    value: R.match(IRResult['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRResultPrototype, 'constructor', {
    value: IRResult,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRResult.prototype = IRResultPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    identity        : function () { return `IRResult.Identity(${R._toString(this.tree)}, ${R._toString(this.source)})` },
    comparison      : function () { return `IRResult.Comparison(${R._toString(this.left)}, ${R._toString(this.right)}, ${R._toString(this.source)})` },
    scalar          : function () { return `IRResult.Scalar(${R._toString(this.value)}, ${R._toString(this.expression)})` },
    filteredEntities: function () { return `IRResult.FilteredEntities(${R._toString(this.entities)}, ${R._toString(this.source)})` },
    timeSeries      : function () { return `IRResult.TimeSeries(${R._toString(this.snapshots)}, ${R._toString(this.source)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    identity        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    comparison      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    scalar          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    filteredEntities: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    timeSeries      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRResult.Identity instance
 * @sig Identity :: (IRResultTree, String) -> IRResult.Identity
 */
const IdentityConstructor = function Identity(tree, source) {
    const constructorName = 'IRResult.Identity(tree, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateTag(constructorName, 'IRResultTree', 'tree', false, tree)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(IdentityPrototype)
    result.tree = tree
    result.source = source
    return result
}

IRResult.Identity = IdentityConstructor

/*
 * Construct a IRResult.Comparison instance
 * @sig Comparison :: (IRResultTree, IRResultTree, String) -> IRResult.Comparison
 */
const ComparisonConstructor = function Comparison(left, right, source) {
    const constructorName = 'IRResult.Comparison(left, right, source)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateTag(constructorName, 'IRResultTree', 'left', false, left)
    R.validateTag(constructorName, 'IRResultTree', 'right', false, right)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(ComparisonPrototype)
    result.left = left
    result.right = right
    result.source = source
    return result
}

IRResult.Comparison = ComparisonConstructor

/*
 * Construct a IRResult.Scalar instance
 * @sig Scalar :: (Number, IRExpression) -> IRResult.Scalar
 */
const ScalarConstructor = function Scalar(value, expression) {
    const constructorName = 'IRResult.Scalar(value, expression)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'value', false, value)
    R.validateTag(constructorName, 'IRExpression', 'expression', false, expression)

    const result = Object.create(ScalarPrototype)
    result.value = value
    result.expression = expression
    return result
}

IRResult.Scalar = ScalarConstructor

/*
 * Construct a IRResult.FilteredEntities instance
 * @sig FilteredEntities :: ([Account], String) -> IRResult.FilteredEntities
 */
const FilteredEntitiesConstructor = function FilteredEntities(entities, source) {
    const constructorName = 'IRResult.FilteredEntities(entities, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Account', 'entities', false, entities)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(FilteredEntitiesPrototype)
    result.entities = entities
    result.source = source
    return result
}

IRResult.FilteredEntities = FilteredEntitiesConstructor

/*
 * Construct a IRResult.TimeSeries instance
 * @sig TimeSeries :: ([Object], String) -> IRResult.TimeSeries
 */
const TimeSeriesConstructor = function TimeSeries(snapshots, source) {
    const constructorName = 'IRResult.TimeSeries(snapshots, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'Object', undefined, 'snapshots', false, snapshots)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(TimeSeriesPrototype)
    result.snapshots = snapshots
    result.source = source
    return result
}

IRResult.TimeSeries = TimeSeriesConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const IdentityPrototype = Object.create(IRResultPrototype, {
    '@@tagName': { value: 'Identity', enumerable: false },
    '@@typeName': { value: 'IRResult', enumerable: false },
    toString: { value: toString.identity, enumerable: false },
    toJSON: { value: toJSON.identity, enumerable: false },
    constructor: { value: IdentityConstructor, enumerable: false, writable: true, configurable: true },
})

const ComparisonPrototype = Object.create(IRResultPrototype, {
    '@@tagName': { value: 'Comparison', enumerable: false },
    '@@typeName': { value: 'IRResult', enumerable: false },
    toString: { value: toString.comparison, enumerable: false },
    toJSON: { value: toJSON.comparison, enumerable: false },
    constructor: { value: ComparisonConstructor, enumerable: false, writable: true, configurable: true },
})

const ScalarPrototype = Object.create(IRResultPrototype, {
    '@@tagName': { value: 'Scalar', enumerable: false },
    '@@typeName': { value: 'IRResult', enumerable: false },
    toString: { value: toString.scalar, enumerable: false },
    toJSON: { value: toJSON.scalar, enumerable: false },
    constructor: { value: ScalarConstructor, enumerable: false, writable: true, configurable: true },
})

const FilteredEntitiesPrototype = Object.create(IRResultPrototype, {
    '@@tagName': { value: 'FilteredEntities', enumerable: false },
    '@@typeName': { value: 'IRResult', enumerable: false },
    toString: { value: toString.filteredEntities, enumerable: false },
    toJSON: { value: toJSON.filteredEntities, enumerable: false },
    constructor: { value: FilteredEntitiesConstructor, enumerable: false, writable: true, configurable: true },
})

const TimeSeriesPrototype = Object.create(IRResultPrototype, {
    '@@tagName': { value: 'TimeSeries', enumerable: false },
    '@@typeName': { value: 'IRResult', enumerable: false },
    toString: { value: toString.timeSeries, enumerable: false },
    toJSON: { value: toJSON.timeSeries, enumerable: false },
    constructor: { value: TimeSeriesConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.prototype = IdentityPrototype
ComparisonConstructor.prototype = ComparisonPrototype
ScalarConstructor.prototype = ScalarPrototype
FilteredEntitiesConstructor.prototype = FilteredEntitiesPrototype
TimeSeriesConstructor.prototype = TimeSeriesPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.is = val => val && val.constructor === IdentityConstructor
ComparisonConstructor.is = val => val && val.constructor === ComparisonConstructor
ScalarConstructor.is = val => val && val.constructor === ScalarConstructor
FilteredEntitiesConstructor.is = val => val && val.constructor === FilteredEntitiesConstructor
TimeSeriesConstructor.is = val => val && val.constructor === TimeSeriesConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.toString = () => 'IRResult.Identity'
ComparisonConstructor.toString = () => 'IRResult.Comparison'
ScalarConstructor.toString = () => 'IRResult.Scalar'
FilteredEntitiesConstructor.toString = () => 'IRResult.FilteredEntities'
TimeSeriesConstructor.toString = () => 'IRResult.TimeSeries'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor._from = _input => IRResult.Identity(_input.tree, _input.source)
ComparisonConstructor._from = _input => {
    const { left, right, source } = _input
    return IRResult.Comparison(left, right, source)
}
ScalarConstructor._from = _input => IRResult.Scalar(_input.value, _input.expression)
FilteredEntitiesConstructor._from = _input => IRResult.FilteredEntities(_input.entities, _input.source)
TimeSeriesConstructor._from = _input => IRResult.TimeSeries(_input.snapshots, _input.source)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.from = IdentityConstructor._from
ComparisonConstructor.from = ComparisonConstructor._from
ScalarConstructor.from = ScalarConstructor._from
FilteredEntitiesConstructor.from = FilteredEntitiesConstructor._from
TimeSeriesConstructor.from = TimeSeriesConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRResult instance
 * @sig is :: Any -> Boolean
 */
IRResult.is = v => {
    const { Identity, Comparison, Scalar, FilteredEntities, TimeSeries } = IRResult
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Identity ||
        constructor === Comparison ||
        constructor === Scalar ||
        constructor === FilteredEntities ||
        constructor === TimeSeries
    )
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRResult }
