// ABOUTME: Generated type definition for IRFinancialQuery
// ABOUTME: Auto-generated from modules/query-language/type-definitions/ir-financial-query.type.js - do not edit manually

/*  IRFinancialQuery generated from: modules/query-language/type-definitions/ir-financial-query.type.js
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
 *      filter     : "IRFilter?",
 *      dateRange  : "IRDateRange",
 *      grouping   : "IRGrouping?",
 *      domain     : FieldTypes.snapshotDomain,
 *      interval   : FieldTypes.timeSeriesInterval
 *  AccountQuery
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
import { IRComputedRow } from './ir-computed-row.js'

// -------------------------------------------------------------------------------------------------------------
//
// IRFinancialQuery constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRFinancialQuery = { toString: () => 'IRFinancialQuery' }

// Add hidden properties
Object.defineProperty(IRFinancialQuery, '@@typeName', { value: 'IRFinancialQuery', enumerable: false })
Object.defineProperty(IRFinancialQuery, '@@tagNames', {
    value: ['TransactionQuery', 'PositionQuery', 'SnapshotQuery', 'AccountQuery'],
    enumerable: false,
})

// Type prototype with match method
const IRFinancialQueryPrototype = {}

Object.defineProperty(IRFinancialQueryPrototype, 'match', {
    value: R.match(IRFinancialQuery['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRFinancialQueryPrototype, 'constructor', {
    value: IRFinancialQuery,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRFinancialQuery.prototype = IRFinancialQueryPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    transactionQuery: function () { return `IRFinancialQuery.TransactionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.computed)})` },
    positionQuery   : function () { return `IRFinancialQuery.PositionQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.metrics)}, ${R._toString(this.orderByField)}, ${R._toString(this.orderByDirection)}, ${R._toString(this.limit)})` },
    snapshotQuery   : function () { return `IRFinancialQuery.SnapshotQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)}, ${R._toString(this.grouping)}, ${R._toString(this.domain)}, ${R._toString(this.interval)})` },
    accountQuery    : function () { return `IRFinancialQuery.AccountQuery(${R._toString(this.name)}, ${R._toString(this.description)}, ${R._toString(this.filter)}, ${R._toString(this.dateRange)})` },
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
    accountQuery    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRFinancialQuery.TransactionQuery instance
 * @sig TransactionQuery :: (String, String?, IRFilter?, IRDateRange?, IRGrouping, [IRComputedRow]?) -> IRFinancialQuery.TransactionQuery
 */
const TransactionQueryConstructor = function TransactionQuery(
    name,
    description,
    filter,
    dateRange,
    grouping,
    computed,
) {
    const constructorName =
        'IRFinancialQuery.TransactionQuery(name, description, filter, dateRange, grouping, computed)'

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

IRFinancialQuery.TransactionQuery = TransactionQueryConstructor

/*
 * Construct a IRFinancialQuery.PositionQuery instance
 * @sig PositionQuery :: (String, String?, IRFilter?, IRDateRange?, IRGrouping?, [String]?, String?, String?, Number?) -> IRFinancialQuery.PositionQuery
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
        'IRFinancialQuery.PositionQuery(name, description, filter, dateRange, grouping, metrics, orderByField, orderByDirection, limit)'

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

IRFinancialQuery.PositionQuery = PositionQueryConstructor

/*
 * Construct a IRFinancialQuery.SnapshotQuery instance
 * @sig SnapshotQuery :: (String, String?, IRFilter?, IRDateRange, IRGrouping?, String, String) -> IRFinancialQuery.SnapshotQuery
 */
const SnapshotQueryConstructor = function SnapshotQuery(
    name,
    description,
    filter,
    dateRange,
    grouping,
    domain,
    interval,
) {
    const constructorName =
        'IRFinancialQuery.SnapshotQuery(name, description, filter, dateRange, grouping, domain, interval)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', false, dateRange)
    R.validateTag(constructorName, 'IRGrouping', 'grouping', true, grouping)
    R.validateRegex(constructorName, FieldTypes.snapshotDomain, 'domain', false, domain)
    R.validateRegex(constructorName, FieldTypes.timeSeriesInterval, 'interval', false, interval)

    const result = Object.create(SnapshotQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    result.dateRange = dateRange
    if (grouping !== undefined) result.grouping = grouping
    result.domain = domain
    result.interval = interval
    return result
}

IRFinancialQuery.SnapshotQuery = SnapshotQueryConstructor

/*
 * Construct a IRFinancialQuery.AccountQuery instance
 * @sig AccountQuery :: (String, String?, IRFilter?, IRDateRange?) -> IRFinancialQuery.AccountQuery
 */
const AccountQueryConstructor = function AccountQuery(name, description, filter, dateRange) {
    const constructorName = 'IRFinancialQuery.AccountQuery(name, description, filter, dateRange)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateTag(constructorName, 'IRFilter', 'filter', true, filter)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', true, dateRange)

    const result = Object.create(AccountQueryPrototype)
    result.name = name
    if (description !== undefined) result.description = description
    if (filter !== undefined) result.filter = filter
    if (dateRange !== undefined) result.dateRange = dateRange
    return result
}

IRFinancialQuery.AccountQuery = AccountQueryConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const TransactionQueryPrototype = Object.create(IRFinancialQueryPrototype, {
    '@@tagName': { value: 'TransactionQuery', enumerable: false },
    '@@typeName': { value: 'IRFinancialQuery', enumerable: false },
    toString: { value: toString.transactionQuery, enumerable: false },
    toJSON: { value: toJSON.transactionQuery, enumerable: false },
    constructor: { value: TransactionQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const PositionQueryPrototype = Object.create(IRFinancialQueryPrototype, {
    '@@tagName': { value: 'PositionQuery', enumerable: false },
    '@@typeName': { value: 'IRFinancialQuery', enumerable: false },
    toString: { value: toString.positionQuery, enumerable: false },
    toJSON: { value: toJSON.positionQuery, enumerable: false },
    constructor: { value: PositionQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const SnapshotQueryPrototype = Object.create(IRFinancialQueryPrototype, {
    '@@tagName': { value: 'SnapshotQuery', enumerable: false },
    '@@typeName': { value: 'IRFinancialQuery', enumerable: false },
    toString: { value: toString.snapshotQuery, enumerable: false },
    toJSON: { value: toJSON.snapshotQuery, enumerable: false },
    constructor: { value: SnapshotQueryConstructor, enumerable: false, writable: true, configurable: true },
})

const AccountQueryPrototype = Object.create(IRFinancialQueryPrototype, {
    '@@tagName': { value: 'AccountQuery', enumerable: false },
    '@@typeName': { value: 'IRFinancialQuery', enumerable: false },
    toString: { value: toString.accountQuery, enumerable: false },
    toJSON: { value: toJSON.accountQuery, enumerable: false },
    constructor: { value: AccountQueryConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.prototype = TransactionQueryPrototype
PositionQueryConstructor.prototype = PositionQueryPrototype
SnapshotQueryConstructor.prototype = SnapshotQueryPrototype
AccountQueryConstructor.prototype = AccountQueryPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.is = val => val && val.constructor === TransactionQueryConstructor
PositionQueryConstructor.is = val => val && val.constructor === PositionQueryConstructor
SnapshotQueryConstructor.is = val => val && val.constructor === SnapshotQueryConstructor
AccountQueryConstructor.is = val => val && val.constructor === AccountQueryConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.toString = () => 'IRFinancialQuery.TransactionQuery'
PositionQueryConstructor.toString = () => 'IRFinancialQuery.PositionQuery'
SnapshotQueryConstructor.toString = () => 'IRFinancialQuery.SnapshotQuery'
AccountQueryConstructor.toString = () => 'IRFinancialQuery.AccountQuery'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor._from = _input => {
    const { name, description, filter, dateRange, grouping, computed } = _input
    return IRFinancialQuery.TransactionQuery(name, description, filter, dateRange, grouping, computed)
}
PositionQueryConstructor._from = _input => {
    const { name, description, filter, dateRange, grouping, metrics, orderByField, orderByDirection, limit } = _input
    return IRFinancialQuery.PositionQuery(
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
    const { name, description, filter, dateRange, grouping, domain, interval } = _input
    return IRFinancialQuery.SnapshotQuery(name, description, filter, dateRange, grouping, domain, interval)
}
AccountQueryConstructor._from = _input => {
    const { name, description, filter, dateRange } = _input
    return IRFinancialQuery.AccountQuery(name, description, filter, dateRange)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
TransactionQueryConstructor.from = TransactionQueryConstructor._from
PositionQueryConstructor.from = PositionQueryConstructor._from
SnapshotQueryConstructor.from = SnapshotQueryConstructor._from
AccountQueryConstructor.from = AccountQueryConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRFinancialQuery instance
 * @sig is :: Any -> Boolean
 */
IRFinancialQuery.is = v => {
    const { TransactionQuery, PositionQuery, SnapshotQuery, AccountQuery } = IRFinancialQuery
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === TransactionQuery ||
        constructor === PositionQuery ||
        constructor === SnapshotQuery ||
        constructor === AccountQuery
    )
}

IRFinancialQuery.fromJSON = json => {
    if (json == null) return json
    const tag = json['@@tagName']
    if (!tag) throw new TypeError(`IRFinancialQuery.fromJSON: missing @@tagName on ${R._toString(json)}`)
    if (!IRFinancialQuery['@@tagNames'].includes(tag))
        throw new TypeError(`IRFinancialQuery.fromJSON: unknown variant "${tag}"`)
    const revived = { ...json }
    if (revived.filter) revived.filter = IRFilter.fromJSON(revived.filter)
    if (revived.dateRange) revived.dateRange = IRDateRange.fromJSON(revived.dateRange)
    if (revived.grouping) revived.grouping = IRGrouping.fromJSON(revived.grouping)
    if (revived.computed) revived.computed = revived.computed.map(item => IRComputedRow.fromJSON(item))
    return IRFinancialQuery[tag]._from(revived)
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRFinancialQuery }
