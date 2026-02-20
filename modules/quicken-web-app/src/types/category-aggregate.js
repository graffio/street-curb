// ABOUTME: Generated type definition for CategoryAggregate
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/category-aggregate.type.js - do not edit manually

/** {@link module:CategoryAggregate} */
/*  CategoryAggregate generated from: modules/quicken-web-app/type-definitions/category-aggregate.type.js
 *
 *  total: "Number",
 *  count: "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a CategoryAggregate instance
 * @sig CategoryAggregate :: (Number, Number) -> CategoryAggregate
 */
const CategoryAggregate = function CategoryAggregate(total, count) {
    const constructorName = 'CategoryAggregate(total, count)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'total', false, total)
    R.validateNumber(constructorName, 'count', false, count)

    const result = Object.create(prototype)
    result.total = total
    result.count = count
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Convert to string representation
 * @sig categoryaggregateToString :: () -> String
 */
const categoryaggregateToString = function () {
    return `CategoryAggregate(${R._toString(this.total)}, ${R._toString(this.count)})`
}

/*
 * Convert to JSON representation
 * @sig categoryaggregateToJSON :: () -> Object
 */
const categoryaggregateToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'CategoryAggregate', enumerable: false },
    toString: { value: categoryaggregateToString, enumerable: false },
    toJSON: { value: categoryaggregateToJSON, enumerable: false },
    constructor: { value: CategoryAggregate, enumerable: false, writable: true, configurable: true },
})

CategoryAggregate.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
CategoryAggregate.toString = () => 'CategoryAggregate'
CategoryAggregate.is = v => v && v['@@typeName'] === 'CategoryAggregate'

CategoryAggregate._from = _input => CategoryAggregate(_input.total, _input.count)
CategoryAggregate.from = CategoryAggregate._from

CategoryAggregate._toFirestore = (o, encodeTimestamps) => ({ ...o })

CategoryAggregate._fromFirestore = (doc, decodeTimestamps) => CategoryAggregate._from(doc)

// Public aliases (override if necessary)
CategoryAggregate.toFirestore = CategoryAggregate._toFirestore
CategoryAggregate.fromFirestore = CategoryAggregate._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { CategoryAggregate }
