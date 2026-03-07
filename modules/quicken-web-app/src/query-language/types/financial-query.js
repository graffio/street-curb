// ABOUTME: Generated type definition for FinancialQuery
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir/financial-query.type.js - do not edit manually

/*  FinancialQuery generated from: modules/quicken-web-app/type-definitions/ir/financial-query.type.js
 *
 *  TransactionQuery
 *      name       : "String",
 *      description: "String?",
 *      filter     : "IRFilter?",
 *      dateRange  : "IRDateRange?",
 *      grouping   : "IRGrouping?",
 *      computed   : "[ComputedRow]?"
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
 *  AccountQuery
 *      name       : "String",
 *      description: "String?",
 *      filter     : "IRFilter?"
 *  ExpressionQuery
 *      name       : "String",
 *      description: "String?",
 *      left       : "FinancialQuery",
 *      right      : "FinancialQuery",
 *      expression : "IRExpression"
 *  SnapshotQuery
 *      name       : "String",
 *      description: "String?",
 *      domain     : FieldTypes.snapshotDomain,
 *      filter     : "IRFilter?",
 *      dateRange  : "IRDateRange",
 *      interval   : FieldTypes.timeSeriesInterval
 *  RunningBalanceQuery
 *      name       : "String",
 *      description: "String?",
 *      filter     : "IRFilter?",
 *      dateRange  : "IRDateRange?"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { IRFilter } from './ir-filter.js'
import { IRDateRange } from './ir-date-range.js'
import { IRGrouping } from './ir-grouping.js'
import { ComputedRow } from './computed-row.js'
import { IRExpression } from './ir-expression.js'

// -------------------------------------------------------------------------------------------------------------
//
// FinancialQuery constructor
//
// -------------------------------------------------------------------------------------------------------------
const FinancialQuery = { toString: () => 'FinancialQuery' }

// Add hidden properties
Object.defineProperty(FinancialQuery, '@@typeName', { value: 'FinancialQuery', enumerable: false })
Object.defineProperty(FinancialQuery, '@@tagNames', {
    value: [
        'TransactionQuery',
        'PositionQuery',
        'AccountQuery',
        'ExpressionQuery',
        'SnapshotQuery',
        'RunningBalanceQuery',
    ],
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
    transactionQuery   : function () { return `FinancialQuery.TransactionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.computed)})` },
    positionQuery      : function () { return `FinancialQuery.PositionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.metrics)}, ${R._toString(this.orderByField)}, ${R._toString(this.orderByDirection)}, ${R._toString(this.limit)})` },
    accountQuery       : function () { return `FinancialQuery.AccountQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)})` },
    expressionQuery    : function () { return `FinancialQuery.ExpressionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.left)}, ${R._toString(this.right)}, ${R._toString(this.expression)})` },
    snapshotQuery      : function () { return `FinancialQuery.SnapshotQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.domain)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.interval)})` },
    runningBalanceQuery: function () { return `FinancialQuery.RunningBalanceQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    transactionQuery   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    positionQuery      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    accountQuery       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    expressionQuery    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    snapshotQuery      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    runningBalanceQuery: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a FinancialQuery.TransactionQuery instance
 * @sig TransactionQuery :: (String, String?, IRFilter?, IRDateRange?, IRGrouping?, [ComputedRow]?) -> FinancialQuery.TransactionQuery
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
    R.validateTag(constructorName, 'IRGrouping', 'grouping', true, grouping)
    R.validateArray(constructorName, 1, 'Tagged', 'ComputedRow', 'computed', true, computed)

    const result = Object.create(TransactionQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    if (dateRange !== undefined) result.dateRange = dateRange
    if (grouping !== undefined) result.grouping = grouping
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
 * Construct a FinancialQuery.AccountQuery instance
 * @sig AccountQuery :: (String, String?, IRFilter?) -> FinancialQuery.AccountQuery
 */
const AccountQueryConstructor = function AccountQuery(name, description, filter) {
    const constructorName = 'FinancialQuery.AccountQuery(name, description, filter)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)

    const result = Object.create(AccountQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    return result
}

FinancialQuery.AccountQuery = AccountQueryConstructor

/*
 * Construct a FinancialQuery.ExpressionQuery instance
 * @sig ExpressionQuery :: (String, String?, FinancialQuery, FinancialQuery, IRExpression) -> FinancialQuery.ExpressionQuery
 */
const ExpressionQueryConstructor = function ExpressionQuery(name, description, left, right, expression) {
    const constructorName = 'FinancialQuery.ExpressionQuery(name, description, left, right, expression)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'FinancialQuery', 'left', false, left)
    R.validateTag(constructorName, 'FinancialQuery', 'right', false, right)
    R.validateTag(constructorName, 'IRExpression', 'expression', false, expression)

    const result = Object.create(ExpressionQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    result.left = left
    result.right = right
    result.expression = expression
    return result
}

FinancialQuery.ExpressionQuery = ExpressionQueryConstructor

/*
 * Construct a FinancialQuery.SnapshotQuery instance
 * @sig SnapshotQuery :: (String, String?, String, IRFilter?, IRDateRange, String) -> FinancialQuery.SnapshotQuery
 */
const SnapshotQueryConstructor = function SnapshotQuery(name, description, domain, filter, dateRange, interval) {
    const constructorName = 'FinancialQuery.SnapshotQuery(name, description, domain, filter, dateRange, interval)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateRegex(constructorName, FieldTypes.snapshotDomain, 'domain', false, domain)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', false, dateRange)
    R.validateRegex(constructorName, FieldTypes.timeSeriesInterval, 'interval', false, interval)

    const result = Object.create(SnapshotQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    result.domain = domain
    if (filter !== undefined) result.filter = filter
    result.dateRange = dateRange
    result.interval = interval
    return result
}

FinancialQuery.SnapshotQuery = SnapshotQueryConstructor

/*
 * Construct a FinancialQuery.RunningBalanceQuery instance
 * @sig RunningBalanceQuery :: (String, String?, IRFilter?, IRDateRange?) -> FinancialQuery.RunningBalanceQuery
 */
const RunningBalanceQueryConstructor = function RunningBalanceQuery(name, description, filter, dateRange) {
    const constructorName = 'FinancialQuery.RunningBalanceQuery(name, description, filter, dateRange)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', true, dateRange)

    const result = Object.create(RunningBalanceQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    if (dateRange !== undefined) result.dateRange = dateRange
    return result
}

FinancialQuery.RunningBalanceQuery = RunningBalanceQueryConstructor

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

const AccountQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'AccountQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.accountQuery, enumerable: false },
    toJSON: { value: toJSON.accountQuery, enumerable: false },
    constructor: { value: AccountQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const ExpressionQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'ExpressionQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.expressionQuery, enumerable: false },
    toJSON: { value: toJSON.expressionQuery, enumerable: false },
    constructor: { value: ExpressionQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const SnapshotQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'SnapshotQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.snapshotQuery, enumerable: false },
    toJSON: { value: toJSON.snapshotQuery, enumerable: false },
    constructor: { value: SnapshotQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const RunningBalanceQueryPrototype = Object.create(FinancialQueryPrototype, {
    '@@tagName': { value: 'RunningBalanceQuery', enumerable: false },
    '@@typeName': { value: 'FinancialQuery', enumerable: false },
    toString: { value: toString.runningBalanceQuery, enumerable: false },
    toJSON: { value: toJSON.runningBalanceQuery, enumerable: false },
    constructor: { value: RunningBalanceQueryConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.prototype = TransactionQueryPrototype
PositionQueryConstructor.prototype = PositionQueryPrototype
AccountQueryConstructor.prototype = AccountQueryPrototype
ExpressionQueryConstructor.prototype = ExpressionQueryPrototype
SnapshotQueryConstructor.prototype = SnapshotQueryPrototype
RunningBalanceQueryConstructor.prototype = RunningBalanceQueryPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.is = val => val && val.constructor === TransactionQueryConstructor
PositionQueryConstructor.is = val => val && val.constructor === PositionQueryConstructor
AccountQueryConstructor.is = val => val && val.constructor === AccountQueryConstructor
ExpressionQueryConstructor.is = val => val && val.constructor === ExpressionQueryConstructor
SnapshotQueryConstructor.is = val => val && val.constructor === SnapshotQueryConstructor
RunningBalanceQueryConstructor.is = val => val && val.constructor === RunningBalanceQueryConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.toString = () => 'FinancialQuery.TransactionQuery'
PositionQueryConstructor.toString = () => 'FinancialQuery.PositionQuery'
AccountQueryConstructor.toString = () => 'FinancialQuery.AccountQuery'
ExpressionQueryConstructor.toString = () => 'FinancialQuery.ExpressionQuery'
SnapshotQueryConstructor.toString = () => 'FinancialQuery.SnapshotQuery'
RunningBalanceQueryConstructor.toString = () => 'FinancialQuery.RunningBalanceQuery'
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
AccountQueryConstructor._from = _input => {
    const { name, description, filter } = _input
    return FinancialQuery.AccountQuery(name, description, filter)
}
ExpressionQueryConstructor._from = _input => {
    const { name, description, left, right, expression } = _input
    return FinancialQuery.ExpressionQuery(name, description, left, right, expression)
}
SnapshotQueryConstructor._from = _input => {
    const { name, description, domain, filter, dateRange, interval } = _input
    return FinancialQuery.SnapshotQuery(name, description, domain, filter, dateRange, interval)
}
RunningBalanceQueryConstructor._from = _input => {
    const { name, description, filter, dateRange } = _input
    return FinancialQuery.RunningBalanceQuery(name, description, filter, dateRange)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.from = TransactionQueryConstructor._from
PositionQueryConstructor.from = PositionQueryConstructor._from
AccountQueryConstructor.from = AccountQueryConstructor._from
ExpressionQueryConstructor.from = ExpressionQueryConstructor._from
SnapshotQueryConstructor.from = SnapshotQueryConstructor._from
RunningBalanceQueryConstructor.from = RunningBalanceQueryConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a FinancialQuery instance
 * @sig is :: Any -> Boolean
 */
FinancialQuery.is = v => {
    const { TransactionQuery, PositionQuery, AccountQuery, ExpressionQuery, SnapshotQuery, RunningBalanceQuery } =
        FinancialQuery
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === TransactionQuery ||
        constructor === PositionQuery ||
        constructor === AccountQuery ||
        constructor === ExpressionQuery ||
        constructor === SnapshotQuery ||
        constructor === RunningBalanceQuery
    )
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { FinancialQuery }
