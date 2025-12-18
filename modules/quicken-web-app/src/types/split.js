// ABOUTME: Generated type definition for Split
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/split.type.js - do not edit manually

/** {@link module:Split} */
/*  Split generated from: modules/quicken-web-app/type-definitions/split.type.js
 *
 *  id           : "String",
 *  transactionId: /^txn_[a-f0-9]{12}(-\d+)?$/,
 *  categoryId   : "String?",
 *  amount       : "Number",
 *  memo         : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Split instance
 * @sig Split :: (String, TransactionId, String?, Number, String?) -> Split
 *     TransactionId = /^txn_[a-f0-9]{12}(-\d+)?$/
 */
const Split = function Split(id, transactionId, categoryId, amount, memo) {
    const constructorName = 'Split(id, transactionId, categoryId, amount, memo)'

    R.validateString(constructorName, 'id', false, id)
    R.validateRegex(constructorName, /^txn_[a-f0-9]{12}(-\d+)?$/, 'transactionId', false, transactionId)
    R.validateString(constructorName, 'categoryId', true, categoryId)
    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateString(constructorName, 'memo', true, memo)

    const result = Object.create(prototype)
    result.id = id
    result.transactionId = transactionId
    if (categoryId != null) result.categoryId = categoryId
    result.amount = amount
    if (memo != null) result.memo = memo
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig splitToString :: () -> String
 */
const splitToString = function () {
    return `Split(${R._toString(this.id)},
        ${R._toString(this.transactionId)},
        ${R._toString(this.categoryId)},
        ${R._toString(this.amount)},
        ${R._toString(this.memo)})`
}

/*
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
    const { id, transactionId, categoryId, amount, memo } = _input
    return Split(id, transactionId, categoryId, amount, memo)
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
