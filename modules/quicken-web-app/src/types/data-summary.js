// ABOUTME: Generated type definition for DataSummary
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/data-summary.type.js - do not edit manually

/** {@link module:DataSummary} */
/*  DataSummary generated from: modules/quicken-web-app/type-definitions/data-summary.type.js
 *
 *  categories  : "[String]",
 *  accounts    : "[AccountSummary]",
 *  accountTypes: "[String]",
 *  payees      : "[String]"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

import { AccountSummary } from './account-summary.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a DataSummary instance
 * @sig DataSummary :: ([String], [AccountSummary], [String], [String]) -> DataSummary
 */
const DataSummary = function DataSummary(categories, accounts, accountTypes, payees) {
    const constructorName = 'DataSummary(categories, accounts, accountTypes, payees)'
    R.validateArgumentLength(constructorName, 4, arguments)
    R.validateArray(constructorName, 1, 'String', undefined, 'categories', false, categories)
    R.validateArray(constructorName, 1, 'Tagged', 'AccountSummary', 'accounts', false, accounts)
    R.validateArray(constructorName, 1, 'String', undefined, 'accountTypes', false, accountTypes)
    R.validateArray(constructorName, 1, 'String', undefined, 'payees', false, payees)

    const result = Object.create(prototype)
    result.categories = categories
    result.accounts = accounts
    result.accountTypes = accountTypes
    result.payees = payees
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig datasummaryToString :: () -> String
 */
const datasummaryToString = function () {
    return `DataSummary(${R._toString(this.categories)},
        ${R._toString(this.accounts)},
        ${R._toString(this.accountTypes)},
        ${R._toString(this.payees)})`
}

/*
 * Convert to JSON representation
 * @sig datasummaryToJSON :: () -> Object
 */
const datasummaryToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'DataSummary', enumerable: false },
    toString: { value: datasummaryToString, enumerable: false },
    toJSON: { value: datasummaryToJSON, enumerable: false },
    constructor: { value: DataSummary, enumerable: false, writable: true, configurable: true },
})

DataSummary.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
DataSummary.toString = () => 'DataSummary'
DataSummary.is = v => v && v['@@typeName'] === 'DataSummary'

DataSummary._from = _input => {
    const { categories, accounts, accountTypes, payees } = _input
    return DataSummary(categories, accounts, accountTypes, payees)
}
DataSummary.from = DataSummary._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { DataSummary }
