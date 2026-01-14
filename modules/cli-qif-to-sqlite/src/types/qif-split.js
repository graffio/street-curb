// ABOUTME: Generated type definition for QifSplit
// ABOUTME: Auto-generated from modules/cli-qif-to-sqlite/type-definitions/qif-split.type.js - do not edit manually

/** {@link module:QifSplit} */
/*  QifSplit generated from: modules/cli-qif-to-sqlite/type-definitions/qif-split.type.js
 *
 *  amount      : "Number",
 *  categoryName: "String",
 *  memo        : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a QifSplit instance
 * @sig QifSplit :: (Number, String, String?) -> QifSplit
 */
const QifSplit = function QifSplit(amount, categoryName, memo) {
    const constructorName = 'QifSplit(amount, categoryName, memo)'

    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateString(constructorName, 'categoryName', false, categoryName)
    R.validateString(constructorName, 'memo', true, memo)

    const result = Object.create(prototype)
    result.amount = amount
    result.categoryName = categoryName
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
 * @sig qifsplitToString :: () -> String
 */
const qifsplitToString = function () {
    return `QifSplit(${R._toString(this.amount)}, ${R._toString(this.categoryName)}, ${R._toString(this.memo)})`
}

/*
 * Convert to JSON representation
 * @sig qifsplitToJSON :: () -> Object
 */
const qifsplitToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'QifSplit', enumerable: false },
    toString: { value: qifsplitToString, enumerable: false },
    toJSON: { value: qifsplitToJSON, enumerable: false },
    constructor: { value: QifSplit, enumerable: false, writable: true, configurable: true },
})

QifSplit.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
QifSplit.toString = () => 'QifSplit'
QifSplit.is = v => v && v['@@typeName'] === 'QifSplit'

QifSplit._from = _input => {
    const { amount, categoryName, memo } = _input
    return QifSplit(amount, categoryName, memo)
}
QifSplit.from = QifSplit._from

QifSplit._toFirestore = (o, encodeTimestamps) => ({ ...o })

QifSplit._fromFirestore = (doc, decodeTimestamps) => QifSplit._from(doc)

// Public aliases (override if necessary)
QifSplit.toFirestore = QifSplit._toFirestore
QifSplit.fromFirestore = QifSplit._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QifSplit }
