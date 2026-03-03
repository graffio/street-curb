// ABOUTME: Generated type definition for QuerySource
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/query-source.type.js - do not edit manually

/** {@link module:QuerySource} */
/*  QuerySource generated from: modules/quicken-web-app/type-definitions/query-source.type.js
 *
 *  name     : FieldTypes.sourceName,
 *  domain   : "Domain",
 *  filters  : "[QueryFilter]",
 *  dateRange: "DateRange?",
 *  groupBy  : FieldTypes.groupDimension
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

import { Domain } from './domain.js'
import { QueryFilter } from './query-filter.js'
import { DateRange } from './date-range.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a QuerySource instance
 * @sig QuerySource :: (String, Domain, [QueryFilter], DateRange?, String?) -> QuerySource
 */
const QuerySource = function QuerySource(name, domain, filters, dateRange, groupBy) {
    const constructorName = 'QuerySource(name, domain, filters, dateRange, groupBy)'

    R.validateRegex(constructorName, FieldTypes.sourceName, 'name', false, name)
    R.validateTag(constructorName, 'Domain', 'domain', false, domain)
    R.validateArray(constructorName, 1, 'Tagged', 'QueryFilter', 'filters', false, filters)
    R.validateTag(constructorName, 'DateRange', 'dateRange', true, dateRange)
    R.validateRegex(constructorName, FieldTypes.groupDimension, 'groupBy', true, groupBy)

    const result = Object.create(prototype)
    result.name = name
    result.domain = domain
    result.filters = filters
    if (dateRange !== undefined) result.dateRange = dateRange
    if (groupBy !== undefined) result.groupBy = groupBy
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig querysourceToString :: () -> String
 */
const querysourceToString = function () {
    return `QuerySource(${R._toString(this.name)},
        ${R._toString(this.domain)},
        ${R._toString(this.filters)},
        ${R._toString(this.dateRange)},
        ${R._toString(this.groupBy)})`
}

/*
 * Convert to JSON representation
 * @sig querysourceToJSON :: () -> Object
 */
const querysourceToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'QuerySource', enumerable: false },
    toString: { value: querysourceToString, enumerable: false },
    toJSON: { value: querysourceToJSON, enumerable: false },
    constructor: { value: QuerySource, enumerable: false, writable: true, configurable: true },
})

QuerySource.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
QuerySource.toString = () => 'QuerySource'
QuerySource.is = v => v && v['@@typeName'] === 'QuerySource'

QuerySource._from = _input => {
    const { name, domain, filters, dateRange, groupBy } = _input
    return QuerySource(name, domain, filters, dateRange, groupBy)
}
QuerySource.from = QuerySource._from

QuerySource._toFirestore = (o, encodeTimestamps) => {
    const result = {
        name: o.name,
        domain: Domain.toFirestore(o.domain, encodeTimestamps),
        filters: o.filters.map(item1 => QueryFilter.toFirestore(item1, encodeTimestamps)),
    }

    if (o.dateRange !== undefined) result.dateRange = DateRange.toFirestore(o.dateRange, encodeTimestamps)

    if (o.groupBy !== undefined) result.groupBy = o.groupBy

    return result
}

QuerySource._fromFirestore = (doc, decodeTimestamps) =>
    QuerySource._from({
        name: doc.name,
        domain: Domain.fromFirestore ? Domain.fromFirestore(doc.domain, decodeTimestamps) : Domain.from(doc.domain),
        filters: doc.filters.map(item1 =>
            QueryFilter.fromFirestore ? QueryFilter.fromFirestore(item1, decodeTimestamps) : QueryFilter.from(item1),
        ),
        dateRange: DateRange.fromFirestore
            ? DateRange.fromFirestore(doc.dateRange, decodeTimestamps)
            : DateRange.from(doc.dateRange),
        groupBy: doc.groupBy,
    })

// Public aliases (override if necessary)
QuerySource.toFirestore = QuerySource._toFirestore
QuerySource.fromFirestore = QuerySource._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QuerySource }
