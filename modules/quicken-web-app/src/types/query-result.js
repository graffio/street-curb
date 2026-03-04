// ABOUTME: Generated type definition for QueryResult
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/derived/query-result.type.js - do not edit manually

/*  QueryResult generated from: modules/quicken-web-app/type-definitions/derived/query-result.type.js
 *
 *  Identity
 *      tree  : "QueryResultTree",
 *      source: FieldTypes.sourceName
 *  Comparison
 *      left  : "QueryResultTree",
 *      right : "QueryResultTree",
 *      source: FieldTypes.sourceName
 *  Scalar
 *      value     : "Number",
 *      expression: "Object"
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
import { QueryResultTree } from './query-result-tree.js'
import { Account } from './account.js'

// -------------------------------------------------------------------------------------------------------------
//
// QueryResult constructor
//
// -------------------------------------------------------------------------------------------------------------
const QueryResult = {
    toString: () => 'QueryResult',
}

// Add hidden properties
Object.defineProperty(QueryResult, '@@typeName', { value: 'QueryResult', enumerable: false })
Object.defineProperty(QueryResult, '@@tagNames', {
    value: ['Identity', 'Comparison', 'Scalar', 'FilteredEntities', 'TimeSeries'],
    enumerable: false,
})

// Type prototype with match method
const QueryResultPrototype = {}

Object.defineProperty(QueryResultPrototype, 'match', {
    value: R.match(QueryResult['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(QueryResultPrototype, 'constructor', {
    value: QueryResult,
    enumerable: false,
    writable: true,
    configurable: true,
})

QueryResult.prototype = QueryResultPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    identity        : function () { return `QueryResult.Identity(${R._toString(this.tree)}, ${R._toString(this.source)})` },
    comparison      : function () { return `QueryResult.Comparison(${R._toString(this.left)}, ${R._toString(this.right)}, ${R._toString(this.source)})` },
    scalar          : function () { return `QueryResult.Scalar(${R._toString(this.value)}, ${R._toString(this.expression)})` },
    filteredEntities: function () { return `QueryResult.FilteredEntities(${R._toString(this.entities)}, ${R._toString(this.source)})` },
    timeSeries      : function () { return `QueryResult.TimeSeries(${R._toString(this.snapshots)}, ${R._toString(this.source)})` },
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
 * Construct a QueryResult.Identity instance
 * @sig Identity :: (QueryResultTree, String) -> QueryResult.Identity
 */
const IdentityConstructor = function Identity(tree, source) {
    const constructorName = 'QueryResult.Identity(tree, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateTag(constructorName, 'QueryResultTree', 'tree', false, tree)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(IdentityPrototype)
    result.tree = tree
    result.source = source
    return result
}

QueryResult.Identity = IdentityConstructor

/*
 * Construct a QueryResult.Comparison instance
 * @sig Comparison :: (QueryResultTree, QueryResultTree, String) -> QueryResult.Comparison
 */
const ComparisonConstructor = function Comparison(left, right, source) {
    const constructorName = 'QueryResult.Comparison(left, right, source)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateTag(constructorName, 'QueryResultTree', 'left', false, left)
    R.validateTag(constructorName, 'QueryResultTree', 'right', false, right)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(ComparisonPrototype)
    result.left = left
    result.right = right
    result.source = source
    return result
}

QueryResult.Comparison = ComparisonConstructor

/*
 * Construct a QueryResult.Scalar instance
 * @sig Scalar :: (Number, Object) -> QueryResult.Scalar
 */
const ScalarConstructor = function Scalar(value, expression) {
    const constructorName = 'QueryResult.Scalar(value, expression)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'value', false, value)
    R.validateObject(constructorName, 'expression', false, expression)

    const result = Object.create(ScalarPrototype)
    result.value = value
    result.expression = expression
    return result
}

QueryResult.Scalar = ScalarConstructor

/*
 * Construct a QueryResult.FilteredEntities instance
 * @sig FilteredEntities :: ([Account], String) -> QueryResult.FilteredEntities
 */
const FilteredEntitiesConstructor = function FilteredEntities(entities, source) {
    const constructorName = 'QueryResult.FilteredEntities(entities, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Account', 'entities', false, entities)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(FilteredEntitiesPrototype)
    result.entities = entities
    result.source = source
    return result
}

QueryResult.FilteredEntities = FilteredEntitiesConstructor

/*
 * Construct a QueryResult.TimeSeries instance
 * @sig TimeSeries :: ([Object], String) -> QueryResult.TimeSeries
 */
const TimeSeriesConstructor = function TimeSeries(snapshots, source) {
    const constructorName = 'QueryResult.TimeSeries(snapshots, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'Object', undefined, 'snapshots', false, snapshots)
    R.validateRegex(constructorName, FieldTypes.sourceName, 'source', false, source)

    const result = Object.create(TimeSeriesPrototype)
    result.snapshots = snapshots
    result.source = source
    return result
}

QueryResult.TimeSeries = TimeSeriesConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const IdentityPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Identity', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.identity, enumerable: false },
    toJSON: { value: toJSON.identity, enumerable: false },
    constructor: { value: IdentityConstructor, enumerable: false, writable: true, configurable: true },
})

const ComparisonPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Comparison', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.comparison, enumerable: false },
    toJSON: { value: toJSON.comparison, enumerable: false },
    constructor: { value: ComparisonConstructor, enumerable: false, writable: true, configurable: true },
})

const ScalarPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Scalar', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.scalar, enumerable: false },
    toJSON: { value: toJSON.scalar, enumerable: false },
    constructor: { value: ScalarConstructor, enumerable: false, writable: true, configurable: true },
})

const FilteredEntitiesPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'FilteredEntities', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.filteredEntities, enumerable: false },
    toJSON: { value: toJSON.filteredEntities, enumerable: false },
    constructor: { value: FilteredEntitiesConstructor, enumerable: false, writable: true, configurable: true },
})

const TimeSeriesPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'TimeSeries', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
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
IdentityConstructor.toString = () => 'QueryResult.Identity'
ComparisonConstructor.toString = () => 'QueryResult.Comparison'
ScalarConstructor.toString = () => 'QueryResult.Scalar'
FilteredEntitiesConstructor.toString = () => 'QueryResult.FilteredEntities'
TimeSeriesConstructor.toString = () => 'QueryResult.TimeSeries'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor._from = _input => QueryResult.Identity(_input.tree, _input.source)
ComparisonConstructor._from = _input => {
    const { left, right, source } = _input
    return QueryResult.Comparison(left, right, source)
}
ScalarConstructor._from = _input => QueryResult.Scalar(_input.value, _input.expression)
FilteredEntitiesConstructor._from = _input => QueryResult.FilteredEntities(_input.entities, _input.source)
TimeSeriesConstructor._from = _input => QueryResult.TimeSeries(_input.snapshots, _input.source)
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
 * Check if value is a QueryResult instance
 * @sig is :: Any -> Boolean
 */
QueryResult.is = v => {
    const { Identity, Comparison, Scalar, FilteredEntities, TimeSeries } = QueryResult
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

export { QueryResult }
