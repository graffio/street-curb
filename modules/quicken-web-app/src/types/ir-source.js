// ABOUTME: Generated type definition for IRSource
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-source.type.js - do not edit manually

/** {@link module:IRSource} */
/*  IRSource generated from: modules/quicken-web-app/type-definitions/ir-source.type.js
 *
 *  name     : FieldTypes.sourceName,
 *  domain   : "IRDomain",
 *  filters  : "[IRFilter]",
 *  dateRange: "IRDateRange?",
 *  groupBy  : FieldTypes.groupDimension
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

import { IRDomain } from './ir-domain.js'
import { IRFilter } from './ir-filter.js'
import { IRDateRange } from './ir-date-range.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRSource instance
 * @sig IRSource :: (String, IRDomain, [IRFilter], IRDateRange?, String?) -> IRSource
 */
const IRSource = function IRSource(name, domain, filters, dateRange, groupBy) {
    const constructorName = 'IRSource(name, domain, filters, dateRange, groupBy)'

    R.validateRegex(constructorName, FieldTypes.sourceName, 'name', false, name)
    R.validateTag(constructorName, 'IRDomain', 'domain', false, domain)
    R.validateArray(constructorName, 1, 'Tagged', 'IRFilter', 'filters', false, filters)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', true, dateRange)
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
 * @sig irsourceToString :: () -> String
 */
const irsourceToString = function () {
    return `IRSource(${R._toString(this.name)},
        ${R._toString(this.domain)},
        ${R._toString(this.filters)},
        ${R._toString(this.dateRange)},
        ${R._toString(this.groupBy)})`
}

/*
 * Convert to JSON representation
 * @sig irsourceToJSON :: () -> Object
 */
const irsourceToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'IRSource', enumerable: false },
    toString: { value: irsourceToString, enumerable: false },
    toJSON: { value: irsourceToJSON, enumerable: false },
    constructor: { value: IRSource, enumerable: false, writable: true, configurable: true },
})

IRSource.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
IRSource.toString = () => 'IRSource'
IRSource.is = v => v && v['@@typeName'] === 'IRSource'

IRSource._from = _input => {
    const { name, domain, filters, dateRange, groupBy } = _input
    return IRSource(name, domain, filters, dateRange, groupBy)
}
IRSource.from = IRSource._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRSource }
