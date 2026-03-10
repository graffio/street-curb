// ABOUTME: Generated type definition for CategoryAggregate
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/derived/category-aggregate.type.js - do not edit manually

/** {@link module:CategoryAggregate} */
/*  CategoryAggregate generated from: modules/quicken-web-app/type-definitions/derived/category-aggregate.type.js
 *
 *  total  : "Number",
 *  count  : "Number",
 *  columns: "Object?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a CategoryAggregate instance
 * @sig CategoryAggregate :: (Number, Number, Object?) -> CategoryAggregate
 */
const CategoryAggregate = function CategoryAggregate(total, count, columns) {
    const constructorName = 'CategoryAggregate(total, count, columns)'

    R.validateNumber(constructorName, 'total', false, total)
    R.validateNumber(constructorName, 'count', false, count)
    R.validateObject(constructorName, 'columns', true, columns)

    const result = Object.create(prototype)
    result.total = total
    result.count = count
    if (columns !== undefined) result.columns = columns
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
    return `CategoryAggregate(${R._toString(this.total)}, ${R._toString(this.count)}, ${R._toString(this.columns)})`
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

CategoryAggregate._from = _input => {
    const { total, count, columns } = _input
    return CategoryAggregate(total, count, columns)
}
CategoryAggregate.from = CategoryAggregate._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { CategoryAggregate }
