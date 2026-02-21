// ABOUTME: Generated type definition for Lot
// ABOUTME: Auto-generated from modules/quicken-type-definitions/lot.type.js - do not edit manually

/** {@link module:Lot} */
/*  Lot generated from: modules/quicken-type-definitions/lot.type.js
 *
 *  accountId             : FieldTypes.accountId,
 *  costBasis             : "Number",
 *  createdAt             : "String",
 *  id                    : FieldTypes.lotId,
 *  purchaseDate          : "String",
 *  quantity              : "Number",
 *  remainingQuantity     : "Number",
 *  securityId            : FieldTypes.securityId,
 *  createdByTransactionId: FieldTypes.transactionId,
 *  closedDate            : "String?"
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
 * Construct a Lot instance
 * @sig Lot :: (String, Number, String, String, String, Number, Number, String, String, String?) -> Lot
 */
const Lot = function Lot(
    accountId,
    costBasis,
    createdAt,
    id,
    purchaseDate,
    quantity,
    remainingQuantity,
    securityId,
    createdByTransactionId,
    closedDate,
) {
    const constructorName =
        'Lot(accountId, costBasis, createdAt, id, purchaseDate, quantity, remainingQuantity, securityId, createdByTransactionId, closedDate)'

    R.validateRegex(constructorName, FieldTypes.accountId, 'accountId', false, accountId)
    R.validateNumber(constructorName, 'costBasis', false, costBasis)
    R.validateString(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.lotId, 'id', false, id)
    R.validateString(constructorName, 'purchaseDate', false, purchaseDate)
    R.validateNumber(constructorName, 'quantity', false, quantity)
    R.validateNumber(constructorName, 'remainingQuantity', false, remainingQuantity)
    R.validateRegex(constructorName, FieldTypes.securityId, 'securityId', false, securityId)
    R.validateRegex(constructorName, FieldTypes.transactionId, 'createdByTransactionId', false, createdByTransactionId)
    R.validateString(constructorName, 'closedDate', true, closedDate)

    const result = Object.create(prototype)
    result.accountId = accountId
    result.costBasis = costBasis
    result.createdAt = createdAt
    result.id = id
    result.purchaseDate = purchaseDate
    result.quantity = quantity
    result.remainingQuantity = remainingQuantity
    result.securityId = securityId
    result.createdByTransactionId = createdByTransactionId
    if (closedDate != null) result.closedDate = closedDate
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig lotToString :: () -> String
 */
const lotToString = function () {
    return `Lot(${R._toString(this.accountId)},
        ${R._toString(this.costBasis)},
        ${R._toString(this.createdAt)},
        ${R._toString(this.id)},
        ${R._toString(this.purchaseDate)},
        ${R._toString(this.quantity)},
        ${R._toString(this.remainingQuantity)},
        ${R._toString(this.securityId)},
        ${R._toString(this.createdByTransactionId)},
        ${R._toString(this.closedDate)})`
}

/*
 * Convert to JSON representation
 * @sig lotToJSON :: () -> Object
 */
const lotToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Lot', enumerable: false },
    toString: { value: lotToString, enumerable: false },
    toJSON: { value: lotToJSON, enumerable: false },
    constructor: { value: Lot, enumerable: false, writable: true, configurable: true },
})

Lot.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Lot.toString = () => 'Lot'
Lot.is = v => v && v['@@typeName'] === 'Lot'

Lot._from = _input => {
    const {
        accountId,
        costBasis,
        createdAt,
        id,
        purchaseDate,
        quantity,
        remainingQuantity,
        securityId,
        createdByTransactionId,
        closedDate,
    } = _input
    return Lot(
        accountId,
        costBasis,
        createdAt,
        id,
        purchaseDate,
        quantity,
        remainingQuantity,
        securityId,
        createdByTransactionId,
        closedDate,
    )
}
Lot.from = Lot._from

Lot._toFirestore = (o, encodeTimestamps) => ({ ...o })

Lot._fromFirestore = (doc, decodeTimestamps) => Lot._from(doc)

// Public aliases (override if necessary)
Lot.toFirestore = Lot._toFirestore
Lot.fromFirestore = Lot._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Lot.averageCostPerShare = lot => lot.costBasis / lot.quantity

export { Lot }
