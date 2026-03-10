// ABOUTME: Generated type definition for FinancialQuery
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir/ir-financial-query.type.js - do not edit manually

/*  FinancialQuery generated from: modules/quicken-web-app/type-definitions/ir/ir-financial-query.type.js
 *
 *  TransactionQuery
 *      name       : "String",
 *      description: "String?",
 *      filter     : "IRFilter?",
 *      dateRange  : "IRDateRange?",
 *      grouping   : "IRGrouping",
 *      computed   : "[IRComputedRow]?"
 *  PositionQuery
 *      name            : "String",
 *      description     : "String?",
 *      filter          : "IRFilter?",
 *      dateRange       : "IRDateRange?",
 *      grouping        : "IRGrouping?",
 *      metrics         : "[String]?",
 *      orderByField    : "String?",
 *      orderByDirection: FieldTypes.sortDirection,
 *      limit           : "Number?"
 *  SnapshotQuery
 *      name       : "String",
 *      description: "String?",
 *      domain     : FieldTypes.snapshotDomain,
 *      filter     : "IRFilter?",
 *      grouping   : "IRGrouping?",
 *      dateRange  : "IRDateRange",
 *      interval   : FieldTypes.timeSeriesInterval
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { IRFilter } from './ir-filter.js'
import { IRDateRange } from './ir-date-range.js'
import { IRGrouping } from './ir-grouping.js'
import { IRComputedRow } from './ir-computed-row.js'

// -------------------------------------------------------------------------------------------------------------
//
// FinancialQuery constructor
//
// -------------------------------------------------------------------------------------------------------------
const FinancialQuery = { toString: () => 'FinancialQuery' }

// Add hidden properties
Object.defineProperty(FinancialQuery, '@@typeName', { value: 'FinancialQuery', enumerable: false })
Object.defineProperty(FinancialQuery, '@@tagNames', {
    value: ['TransactionQuery', 'PositionQuery', 'SnapshotQuery'],
    enumerable: false,
})

// Type prototype with match method
const FinancialQueryPrototype = {}

Object.defineProperty(FinancialQueryPrototype, 'match', {
    value: R.match(FinancialQuery['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(FinancialQueryPrototype, 'constructor', {
    value: FinancialQuery,
    enumerable: false,
    writable: true,
    configurable: true,
})

FinancialQuery.prototype = FinancialQueryPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    transactionQuery: function () { return `FinancialQuery.TransactionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.computed)})` },
    positionQuery   : function () { return `FinancialQuery.PositionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.metrics)}, ${R._toString(this.orderByField)}, ${R._toString(this.orderByDirection)}, ${R._toString(this.limit)})` },
    snapshotQuery   : function () { return `FinancialQuery.SnapshotQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.domain)}, ${R._toString(this.filter)}, ${R._toString(this.grouping)}, ${R._toString(this.dateRange)}, ${R._toString(this.interval)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    transactionQuery: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    positionQuery   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    snapshotQuery   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a FinancialQuery.TransactionQuery instance
 * @sig TransactionQuery :: (String, String?, IRFilter?, IRDateRange?, IRGrouping, [IRComputedRow]?) -> FinancialQuery.TransactionQuery
 */
const TransactionQueryConstructor = function TransactionQuery(
    name,
    description,
    filter,
    dateRange,
    grouping,
    computed,
) {
    const constructorName = 'FinancialQuery.TransactionQuery(name, description, filter, dateRange, grouping, computed)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', true, dateRange)
    R.validateTag(constructorName, 'IRGrouping', 'grouping', false, grouping)
    R.validateArray(constructorName, 1, 'Tagged', 'IRComputedRow', 'computed', true, computed)

    const result = Object.create(TransactionQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    if (dateRange !== undefined) result.dateRange = dateRange
    result.grouping = grouping
    if (computed !== undefined) result.computed = computed
    return result
}

FinancialQuery.TransactionQuery = TransactionQueryConstructor

/*
 * Construct a FinancialQuery.PositionQuery instance
 * @sig PositionQuery :: (String, String?, IRFilter?, IRDateRange?, IRGrouping?, [String]?, String?, String?, Number?) -> FinancialQuery.PositionQuery
 */
const PositionQueryConstructor = function PositionQuery(
    name,
    description,
    filter,
    dateRange,
    grouping,
    metrics,
    orderByField,
    orderByDirection,
    limit,
) {
    const constructorName =
        'FinancialQuery.PositionQuery(name, description, filter, dateRange, grouping, metrics, orderByField, orderByDirection, limit)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', true, dateRange)
    R.validateTag(constructorName, 'IRGrouping', 'grouping', true, grouping)
    R.validateArray(constructorName, 1, 'String', undefined, 'metrics', true, metrics)
    R.validateString(constructorName, 'orderByField', true, orderByField)
    R.validateRegex(constructorName, FieldTypes.sortDirection, 'orderByDirection', true, orderByDirection)
    R.validateNumber(constructorName, 'limit', true, limit)

    const result = Object.create(PositionQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    if (dateRange !== undefined) result.dateRange = dateRange
    if (grouping !== undefined) result.grouping = grouping
    if (metrics !== undefined) result.metrics = metrics
    if (orderByField !== undefined) result.orderByField = orderByField
    if (orderByDirection !== undefined) result.orderByDirection = orderByDirection
    if (limit !== undefined) result.limit = limit
    return result
}

FinancialQuery.PositionQuery = PositionQueryConstructor

/*
 * Construct a FinancialQuery.SnapshotQuery instance
 * @sig SnapshotQuery :: (String, String?, String, IRFilter?, IRGrouping?, IRDateRange, String) -> FinancialQuery.SnapshotQuery
 */
const SnapshotQueryConstructor = function SnapshotQuery(
    name,
    description,
    domain,
    filter,
    grouping,
    dateRange,
    interval,
) {
    const constructorName =
        'FinancialQuery.SnapshotQuery(name, description, domain, filter, grouping, dateRange, interval)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateRegex(constructorName, FieldTypes.snapshotDomain, 'domain', false, domain)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRGrouping', 'grouping', true, grouping)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', false, dateRange)
    R.validateRegex(constructorName, FieldTypes.timeSeriesInterval, 'interval', false, interval)

    const result = Object.create(SnapshotQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    result.domain = domain
    if (filter !== undefined) result.filter = filter
    if (grouping !== undefined) result.grouping = grouping
    result.dateRange = dateRange
    result.interval = interval
    return result
}

FinancialQuery.SnapshotQuery = SnapshotQueryConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const TransactionQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'TransactionQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.transactionQuery, enumerable: false },
    toJSON: { value: toJSON.transactionQuery, enumerable: false },
    constructor: { value: TransactionQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const PositionQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'PositionQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.positionQuery, enumerable: false },
    toJSON: { value: toJSON.positionQuery, enumerable: false },
    constructor: { value: PositionQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const SnapshotQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'SnapshotQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.snapshotQuery, enumerable: false },
    toJSON: { value: toJSON.snapshotQuery, enumerable: false },
    constructor: { value: SnapshotQueryConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.prototype = TransactionQueryPrototype
PositionQueryConstructor.prototype = PositionQueryPrototype
SnapshotQueryConstructor.prototype = SnapshotQueryPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.is = val => val && val.constructor === TransactionQueryConstructor
PositionQueryConstructor.is = val => val && val.constructor === PositionQueryConstructor
SnapshotQueryConstructor.is = val => val && val.constructor === SnapshotQueryConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.toString = () => 'FinancialQuery.TransactionQuery'
PositionQueryConstructor.toString = () => 'FinancialQuery.PositionQuery'
SnapshotQueryConstructor.toString = () => 'FinancialQuery.SnapshotQuery'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor._from = _input => {
    const { name, description, filter, dateRange, grouping, computed } = _input
    return FinancialQuery.TransactionQuery(name, description, filter, dateRange, grouping, computed)
}
PositionQueryConstructor._from = _input => {
    const { name, description, filter, dateRange, grouping, metrics, orderByField, orderByDirection, limit } = _input
    return FinancialQuery.PositionQuery(
        name,
        description,
        filter,
        dateRange,
        grouping,
        metrics,
        orderByField,
        orderByDirection,
        limit,
    )
}
SnapshotQueryConstructor._from = _input => {
    const { name, description, domain, filter, grouping, dateRange, interval } = _input
    return FinancialQuery.SnapshotQuery(name, description, domain, filter, grouping, dateRange, interval)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.from = TransactionQueryConstructor._from
PositionQueryConstructor.from = PositionQueryConstructor._from
SnapshotQueryConstructor.from = SnapshotQueryConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a FinancialQuery instance
 * @sig is :: Any -> Boolean
 */
FinancialQuery.is = v => {
    const { TransactionQuery, PositionQuery, SnapshotQuery } = FinancialQuery
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === TransactionQuery || constructor === PositionQuery || constructor === SnapshotQuery
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { FinancialQuery }
