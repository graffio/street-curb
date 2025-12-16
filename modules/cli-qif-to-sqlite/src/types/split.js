// ABOUTME: Generated type definition for Split
// ABOUTME: Auto-generated from modules/cli-qif-to-sqlite/type-definitions/split.type.js - do not edit manually

/** {@link module:Split} */
/*  Split generated from: modules/cli-qif-to-sqlite/type-definitions/split.type.js
 *
 *  amount  : "Number",
 *  category: "String",
 *  memo    : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a Split instance
 * @sig Split :: (Number, String, String?) -> Split
 */
const Split = function Split(amount, category, memo) {
    const constructorName = 'Split(amount, category, memo)'

    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateString(constructorName, 'category', false, category)
    R.validateString(constructorName, 'memo', true, memo)

    const result = Object.create(prototype)
    result.amount = amount
    result.category = category
    if (memo != null) result.memo = memo
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig splitToString :: () -> String
 */
const splitToString = function () {
    return `Split(${R._toString(this.amount)}, ${R._toString(this.category)}, ${R._toString(this.memo)})`
}

/**
 * Convert to JSON representation
 * @sig splitToJSON :: () -> Object
 */
const splitToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Split', enumerable: false },
    toString: { value: splitToString, enumerable: false },
    toJSON: { value: splitToJSON, enumerable: false },
    constructor: { value: Split, enumerable: false, writable: true, configurable: true },
})

Split.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Split.toString = () => 'Split'
Split.is = v => v && v['@@typeName'] === 'Split'

Split._from = _input => {
    const { amount, category, memo } = _input
    return Split(amount, category, memo)
}
Split.from = Split._from

Split._toFirestore = (o, encodeTimestamps) => ({ ...o })

Split._fromFirestore = (doc, decodeTimestamps) => Split._from(doc)

// Public aliases (override if necessary)
Split.toFirestore = Split._toFirestore
Split.fromFirestore = Split._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Split }
