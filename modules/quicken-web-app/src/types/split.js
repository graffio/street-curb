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
const Split = function Split(id, transactionId, categoryId, amount, memo) {
    const constructorName = 'Split(id, transactionId, categoryId, amount, memo)'

    R.validateString(constructorName, 'id', false, id)
    R.validateRegex(constructorName, /^txn_[a-f0-9]{12}(-\d+)?$/, 'transactionId', false, transactionId)
    R.validateString(constructorName, 'categoryId', true, categoryId)
    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateString(constructorName, 'memo', true, memo)

    const result = Object.create(prototype)
    result.id = id
    if (transactionId != null) result.transactionId = transactionId
    if (categoryId != null) result.categoryId = categoryId
    result.amount = amount
    if (memo != null) result.memo = memo
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Split', enumerable: false },

    toString: {
        value: function () {
            return `Split(${R._toString(this.id)}, ${R._toString(this.transactionId)}, ${R._toString(this.categoryId)}, ${R._toString(this.amount)}, ${R._toString(this.memo)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: Split,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Split.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Split.toString = () => 'Split'
Split.is = v => v && v['@@typeName'] === 'Split'

Split._from = o => Split(o.id, o.transactionId, o.categoryId, o.amount, o.memo)
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
