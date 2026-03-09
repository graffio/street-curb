// ABOUTME: Generated type definition for QueryResult
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/derived/query-result.type.js - do not edit manually

/*  QueryResult generated from: modules/quicken-web-app/type-definitions/derived/query-result.type.js
 *
 *  Identity
 *      tree  : "QueryResultTree",
 *      source: FieldTypes.sourceName
 *  TimeSeries
 *      snapshots: "[Object]",
 *      source   : FieldTypes.sourceName
 *  Pivot
 *      columns  : "[String]",
 *      rows     : "[String]",
 *      cells    : "Object",
 *      computed : "Object",
 *      rowTotals: "Object"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { QueryResultTree } from './query-result-tree.js'

// -------------------------------------------------------------------------------------------------------------
//
// QueryResult constructor
//
// -------------------------------------------------------------------------------------------------------------
const QueryResult = { toString: () => 'QueryResult' }

// Add hidden properties
Object.defineProperty(QueryResult, '@@typeName', { value: 'QueryResult', enumerable: false })
Object.defineProperty(QueryResult, '@@tagNames', { value: ['Identity', 'TimeSeries', 'Pivot'], enumerable: false })

// Type prototype with match method
const QueryResultPrototype = {}

Object.defineProperty(QueryResultPrototype, 'match', { value: R.match(QueryResult['@@tagNames']), enumerable: false })

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
    identity  : function () { return `QueryResult.Identity(${R._toString(this.tree)}, ${R._toString(this.source)})` },
    timeSeries: function () { return `QueryResult.TimeSeries(${R._toString(this.snapshots)}, ${R._toString(this.source)})` },
    pivot     : function () { return `QueryResult.Pivot(${R._toString(this.columns)}, ${R._toString(this.rows)}, ${R._toString(this.cells)}, ${R._toString(this.computed)}, ${R._toString(this.rowTotals)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    identity  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    timeSeries: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    pivot     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
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

/*
 * Construct a QueryResult.Pivot instance
 * @sig Pivot :: ([String], [String], Object, Object, Object) -> QueryResult.Pivot
 */
const PivotConstructor = function Pivot(columns, rows, cells, computed, rowTotals) {
    const constructorName = 'QueryResult.Pivot(columns, rows, cells, computed, rowTotals)'
    R.validateArgumentLength(constructorName, 5, arguments)
    R.validateArray(constructorName, 1, 'String', undefined, 'columns', false, columns)
    R.validateArray(constructorName, 1, 'String', undefined, 'rows', false, rows)
    R.validateObject(constructorName, 'cells', false, cells)
    R.validateObject(constructorName, 'computed', false, computed)
    R.validateObject(constructorName, 'rowTotals', false, rowTotals)

    const result = Object.create(PivotPrototype)
    result.columns = columns
    result.rows = rows
    result.cells = cells
    result.computed = computed
    result.rowTotals = rowTotals
    return result
}

QueryResult.Pivot = PivotConstructor

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

const TimeSeriesPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'TimeSeries', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.timeSeries, enumerable: false },
    toJSON: { value: toJSON.timeSeries, enumerable: false },
    constructor: { value: TimeSeriesConstructor, enumerable: false, writable: true, configurable: true },
})

const PivotPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Pivot', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.pivot, enumerable: false },
    toJSON: { value: toJSON.pivot, enumerable: false },
    constructor: { value: PivotConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.prototype = IdentityPrototype
TimeSeriesConstructor.prototype = TimeSeriesPrototype
PivotConstructor.prototype = PivotPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.is = val => val && val.constructor === IdentityConstructor
TimeSeriesConstructor.is = val => val && val.constructor === TimeSeriesConstructor
PivotConstructor.is = val => val && val.constructor === PivotConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.toString = () => 'QueryResult.Identity'
TimeSeriesConstructor.toString = () => 'QueryResult.TimeSeries'
PivotConstructor.toString = () => 'QueryResult.Pivot'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor._from = _input => QueryResult.Identity(_input.tree, _input.source)
TimeSeriesConstructor._from = _input => QueryResult.TimeSeries(_input.snapshots, _input.source)
PivotConstructor._from = _input => {
    const { columns, rows, cells, computed, rowTotals } = _input
    return QueryResult.Pivot(columns, rows, cells, computed, rowTotals)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.from = IdentityConstructor._from
TimeSeriesConstructor.from = TimeSeriesConstructor._from
PivotConstructor.from = PivotConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a QueryResult instance
 * @sig is :: Any -> Boolean
 */
QueryResult.is = v => {
    const { Identity, TimeSeries, Pivot } = QueryResult
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Identity || constructor === TimeSeries || constructor === Pivot
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QueryResult }
