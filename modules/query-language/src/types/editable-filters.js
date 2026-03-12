// ABOUTME: Generated type definition for EditableFilters
// ABOUTME: Auto-generated from modules/query-language/type-definitions/editable-filters.type.js - do not edit manually

/** {@link module:EditableFilters} */
/*  EditableFilters generated from: modules/query-language/type-definitions/editable-filters.type.js
 *
 *  categories       : "[String]?",
 *  accounts         : "[String]?",
 *  dateRange        : "IRDateRange?",
 *  groupBy          : "String?",
 *  securities       : "[String]?",
 *  investmentActions: "[String]?",
 *  asOfDate         : "String?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

import { IRDateRange } from './ir-date-range.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a EditableFilters instance
 * @sig EditableFilters :: ([String]?, [String]?, IRDateRange?, String?, [String]?, [String]?, String?) -> EditableFilters
 */
const EditableFilters = function EditableFilters(
    categories,
    accounts,
    dateRange,
    groupBy,
    securities,
    investmentActions,
    asOfDate,
) {
    const constructorName =
        'EditableFilters(categories, accounts, dateRange, groupBy, securities, investmentActions, asOfDate)'

    R.validateArray(constructorName, 1, 'String', undefined, 'categories', true, categories)
    R.validateArray(constructorName, 1, 'String', undefined, 'accounts', true, accounts)
    R.validateTag(constructorName, 'IRDateRange', 'dateRange', true, dateRange)
    R.validateString(constructorName, 'groupBy', true, groupBy)
    R.validateArray(constructorName, 1, 'String', undefined, 'securities', true, securities)
    R.validateArray(constructorName, 1, 'String', undefined, 'investmentActions', true, investmentActions)
    R.validateString(constructorName, 'asOfDate', true, asOfDate)

    const result = Object.create(prototype)
    if (categories !== undefined) result.categories = categories
    if (accounts !== undefined) result.accounts = accounts
    if (dateRange !== undefined) result.dateRange = dateRange
    if (groupBy !== undefined) result.groupBy = groupBy
    if (securities !== undefined) result.securities = securities
    if (investmentActions !== undefined) result.investmentActions = investmentActions
    if (asOfDate !== undefined) result.asOfDate = asOfDate
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig editablefiltersToString :: () -> String
 */
const editablefiltersToString = function () {
    return `EditableFilters(${R._toString(this.categories)},
        ${R._toString(this.accounts)},
        ${R._toString(this.dateRange)},
        ${R._toString(this.groupBy)},
        ${R._toString(this.securities)},
        ${R._toString(this.investmentActions)},
        ${R._toString(this.asOfDate)})`
}

/*
 * Convert to JSON representation
 * @sig editablefiltersToJSON :: () -> Object
 */
const editablefiltersToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'EditableFilters', enumerable: false },
    toString: { value: editablefiltersToString, enumerable: false },
    toJSON: { value: editablefiltersToJSON, enumerable: false },
    constructor: { value: EditableFilters, enumerable: false, writable: true, configurable: true },
})

EditableFilters.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
EditableFilters.toString = () => 'EditableFilters'
EditableFilters.is = v => v && v['@@typeName'] === 'EditableFilters'

EditableFilters._from = _input => {
    const { categories, accounts, dateRange, groupBy, securities, investmentActions, asOfDate } = _input
    return EditableFilters(categories, accounts, dateRange, groupBy, securities, investmentActions, asOfDate)
}
EditableFilters.from = EditableFilters._from

EditableFilters.fromJSON = json => {
    if (json == null) return json
    const revived = { ...json }
    if (revived.dateRange) revived.dateRange = IRDateRange.fromJSON(revived.dateRange)
    return EditableFilters._from(revived)
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { EditableFilters }
