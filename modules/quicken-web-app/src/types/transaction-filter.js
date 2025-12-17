// ABOUTME: Generated type definition for TransactionFilter
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/transaction-filter.type.js - do not edit manually

/** {@link module:TransactionFilter} */
/*  TransactionFilter generated from: modules/quicken-web-app/type-definitions/transaction-filter.type.js
 *
 *  id                : FieldTypes.viewId,
 *  dateRange         : "Object?",
 *  dateRangeKey      : "String",
 *  filterQuery       : "String",
 *  searchQuery       : "String",
 *  selectedCategories: "[String]",
 *  currentSearchIndex: "Number",
 *  currentRowIndex   : "Number",
 *  customStartDate   : "Object?",
 *  customEndDate     : "Object?"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a TransactionFilter instance
 * @sig TransactionFilter :: (String, Object?, String, String, String, [String], Number, Number, Object?, Object?) -> TransactionFilter
 */
const TransactionFilter = function TransactionFilter(
    id,
    dateRange,
    dateRangeKey,
    filterQuery,
    searchQuery,
    selectedCategories,
    currentSearchIndex,
    currentRowIndex,
    customStartDate,
    customEndDate,
) {
    const constructorName =
        'TransactionFilter(id, dateRange, dateRangeKey, filterQuery, searchQuery, selectedCategories, currentSearchIndex, currentRowIndex, customStartDate, customEndDate)'

    R.validateRegex(constructorName, FieldTypes.viewId, 'id', false, id)
    R.validateObject(constructorName, 'dateRange', true, dateRange)
    R.validateString(constructorName, 'dateRangeKey', false, dateRangeKey)
    R.validateString(constructorName, 'filterQuery', false, filterQuery)
    R.validateString(constructorName, 'searchQuery', false, searchQuery)
    R.validateArray(constructorName, 1, 'String', undefined, 'selectedCategories', false, selectedCategories)
    R.validateNumber(constructorName, 'currentSearchIndex', false, currentSearchIndex)
    R.validateNumber(constructorName, 'currentRowIndex', false, currentRowIndex)
    R.validateObject(constructorName, 'customStartDate', true, customStartDate)
    R.validateObject(constructorName, 'customEndDate', true, customEndDate)

    const result = Object.create(prototype)
    result.id = id
    if (dateRange != null) result.dateRange = dateRange
    result.dateRangeKey = dateRangeKey
    result.filterQuery = filterQuery
    result.searchQuery = searchQuery
    result.selectedCategories = selectedCategories
    result.currentSearchIndex = currentSearchIndex
    result.currentRowIndex = currentRowIndex
    if (customStartDate != null) result.customStartDate = customStartDate
    if (customEndDate != null) result.customEndDate = customEndDate
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig transactionfilterToString :: () -> String
 */
const transactionfilterToString = function () {
    return `TransactionFilter(${R._toString(this.id)},
        ${R._toString(this.dateRange)},
        ${R._toString(this.dateRangeKey)},
        ${R._toString(this.filterQuery)},
        ${R._toString(this.searchQuery)},
        ${R._toString(this.selectedCategories)},
        ${R._toString(this.currentSearchIndex)},
        ${R._toString(this.currentRowIndex)},
        ${R._toString(this.customStartDate)},
        ${R._toString(this.customEndDate)})`
}

/*
 * Convert to JSON representation
 * @sig transactionfilterToJSON :: () -> Object
 */
const transactionfilterToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'TransactionFilter', enumerable: false },
    toString: { value: transactionfilterToString, enumerable: false },
    toJSON: { value: transactionfilterToJSON, enumerable: false },
    constructor: { value: TransactionFilter, enumerable: false, writable: true, configurable: true },
})

TransactionFilter.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
TransactionFilter.toString = () => 'TransactionFilter'
TransactionFilter.is = v => v && v['@@typeName'] === 'TransactionFilter'

TransactionFilter._from = _input => {
    const {
        id,
        dateRange,
        dateRangeKey,
        filterQuery,
        searchQuery,
        selectedCategories,
        currentSearchIndex,
        currentRowIndex,
        customStartDate,
        customEndDate,
    } = _input
    return TransactionFilter(
        id,
        dateRange,
        dateRangeKey,
        filterQuery,
        searchQuery,
        selectedCategories,
        currentSearchIndex,
        currentRowIndex,
        customStartDate,
        customEndDate,
    )
}
TransactionFilter.from = TransactionFilter._from

TransactionFilter._toFirestore = (o, encodeTimestamps) => ({ ...o })

TransactionFilter._fromFirestore = (doc, decodeTimestamps) => TransactionFilter._from(doc)

// Public aliases (override if necessary)
TransactionFilter.toFirestore = TransactionFilter._toFirestore
TransactionFilter.fromFirestore = TransactionFilter._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { TransactionFilter }
