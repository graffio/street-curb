// ABOUTME: Generated type definition for Category
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/category.type.js - do not edit manually

/** {@link module:Category} */
/*  Category generated from: modules/quicken-web-app/type-definitions/category.type.js
 *
 *  id              : /^cat_[a-f0-9]{12}$/,
 *  name            : "String",
 *  description     : "String?",
 *  budgetAmount    : "Number?",
 *  isIncomeCategory: "Boolean?",
 *  isTaxRelated    : "Boolean?",
 *  taxSchedule     : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Category instance
 * @sig Category :: (Id, String, String?, Number?, Boolean?, Boolean?, String?) -> Category
 *     Id = /^cat_[a-f0-9]{12}$/
 */
const Category = function Category(id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule) {
    const constructorName = 'Category(id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule)'

    R.validateRegex(constructorName, /^cat_[a-f0-9]{12}$/, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'description', true, description)
    R.validateNumber(constructorName, 'budgetAmount', true, budgetAmount)
    R.validateBoolean(constructorName, 'isIncomeCategory', true, isIncomeCategory)
    R.validateBoolean(constructorName, 'isTaxRelated', true, isTaxRelated)
    R.validateString(constructorName, 'taxSchedule', true, taxSchedule)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    if (description != null) result.description = description
    if (budgetAmount != null) result.budgetAmount = budgetAmount
    if (isIncomeCategory != null) result.isIncomeCategory = isIncomeCategory
    if (isTaxRelated != null) result.isTaxRelated = isTaxRelated
    if (taxSchedule != null) result.taxSchedule = taxSchedule
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig categoryToString :: () -> String
 */
const categoryToString = function () {
    return `Category(${R._toString(this.id)},
        ${R._toString(this.name)},
        ${R._toString(this.description)},
        ${R._toString(this.budgetAmount)},
        ${R._toString(this.isIncomeCategory)},
        ${R._toString(this.isTaxRelated)},
        ${R._toString(this.taxSchedule)})`
}

/*
 * Convert to JSON representation
 * @sig categoryToJSON :: () -> Object
 */
const categoryToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Category', enumerable: false },
    toString: { value: categoryToString, enumerable: false },
    toJSON: { value: categoryToJSON, enumerable: false },
    constructor: { value: Category, enumerable: false, writable: true, configurable: true },
})

Category.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Category.toString = () => 'Category'
Category.is = v => v && v['@@typeName'] === 'Category'

Category._from = _input => {
    const { id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule } = _input
    return Category(id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule)
}
Category.from = Category._from

Category._toFirestore = (o, encodeTimestamps) => ({ ...o })

Category._fromFirestore = (doc, decodeTimestamps) => Category._from(doc)

// Public aliases (override if necessary)
Category.toFirestore = Category._toFirestore
Category.fromFirestore = Category._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Category }
