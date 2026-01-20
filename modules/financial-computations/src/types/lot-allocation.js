// ABOUTME: Generated type definition for LotAllocation
// ABOUTME: Auto-generated from modules/quicken-type-definitions/lot-allocation.type.js - do not edit manually

/** {@link module:LotAllocation} */
/*  LotAllocation generated from: modules/quicken-type-definitions/lot-allocation.type.js
 *
 *  id                : /^la_[a-f0-9]{12}$/,
 *  lotId             : /^lot_[a-f0-9]{12}$/,
 *  transactionId     : /^txn_[a-f0-9]{12}(-\d+)?$/,
 *  sharesAllocated   : "Number",
 *  costBasisAllocated: "Number",
 *  date              : "String"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a LotAllocation instance
 * @sig LotAllocation :: (Id, LotId, TransactionId, Number, Number, String) -> LotAllocation
 *     Id = /^la_[a-f0-9]{12}$/
 *     LotId = /^lot_[a-f0-9]{12}$/
 *     TransactionId = /^txn_[a-f0-9]{12}(-\d+)?$/
 */
const LotAllocation = function LotAllocation(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date) {
    const constructorName = 'LotAllocation(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)'
    R.validateArgumentLength(constructorName, 6, arguments)
    R.validateRegex(constructorName, /^la_[a-f0-9]{12}$/, 'id', false, id)
    R.validateRegex(constructorName, /^lot_[a-f0-9]{12}$/, 'lotId', false, lotId)
    R.validateRegex(constructorName, /^txn_[a-f0-9]{12}(-\d+)?$/, 'transactionId', false, transactionId)
    R.validateNumber(constructorName, 'sharesAllocated', false, sharesAllocated)
    R.validateNumber(constructorName, 'costBasisAllocated', false, costBasisAllocated)
    R.validateString(constructorName, 'date', false, date)

    const result = Object.create(prototype)
    result.id = id
    result.lotId = lotId
    result.transactionId = transactionId
    result.sharesAllocated = sharesAllocated
    result.costBasisAllocated = costBasisAllocated
    result.date = date
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig lotallocationToString :: () -> String
 */
const lotallocationToString = function () {
    return `LotAllocation(${R._toString(this.id)},
        ${R._toString(this.lotId)},
        ${R._toString(this.transactionId)},
        ${R._toString(this.sharesAllocated)},
        ${R._toString(this.costBasisAllocated)},
        ${R._toString(this.date)})`
}

/*
 * Convert to JSON representation
 * @sig lotallocationToJSON :: () -> Object
 */
const lotallocationToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'LotAllocation', enumerable: false },
    toString: { value: lotallocationToString, enumerable: false },
    toJSON: { value: lotallocationToJSON, enumerable: false },
    constructor: { value: LotAllocation, enumerable: false, writable: true, configurable: true },
})

LotAllocation.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
LotAllocation.toString = () => 'LotAllocation'
LotAllocation.is = v => v && v['@@typeName'] === 'LotAllocation'

LotAllocation._from = _input => {
    const { id, lotId, transactionId, sharesAllocated, costBasisAllocated, date } = _input
    return LotAllocation(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
}
LotAllocation.from = LotAllocation._from

LotAllocation._toFirestore = (o, encodeTimestamps) => ({ ...o })

LotAllocation._fromFirestore = (doc, decodeTimestamps) => LotAllocation._from(doc)

// Public aliases (override if necessary)
LotAllocation.toFirestore = LotAllocation._toFirestore
LotAllocation.fromFirestore = LotAllocation._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { LotAllocation }
