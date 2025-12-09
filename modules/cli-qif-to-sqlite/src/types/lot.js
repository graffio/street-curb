/** {@link module:Lot} */
/*  Lot generated from: modules/cli-qif-to-sqlite/type-definitions/lot.type.js
 *
 *  accountId             : /^acc_[a-f0-9]{12}$/,
 *  costBasis             : "Number",
 *  createdAt             : "String",
 *  id                    : /^lot_[a-f0-9]{12}$/,
 *  purchaseDate          : "String",
 *  quantity              : "Number",
 *  remainingQuantity     : "Number",
 *  securityId            : /^sec_[a-f0-9]{12}$/,
 *  createdByTransactionId: /^txn_[a-f0-9]{12}(-\d+)?$/,
 *  closedDate            : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
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

    R.validateRegex(constructorName, /^acc_[a-f0-9]{12}$/, 'accountId', false, accountId)
    R.validateNumber(constructorName, 'costBasis', false, costBasis)
    R.validateString(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, /^lot_[a-f0-9]{12}$/, 'id', false, id)
    R.validateString(constructorName, 'purchaseDate', false, purchaseDate)
    R.validateNumber(constructorName, 'quantity', false, quantity)
    R.validateNumber(constructorName, 'remainingQuantity', false, remainingQuantity)
    R.validateRegex(constructorName, /^sec_[a-f0-9]{12}$/, 'securityId', false, securityId)
    R.validateRegex(
        constructorName,
        /^txn_[a-f0-9]{12}(-\d+)?$/,
        'createdByTransactionId',
        false,
        createdByTransactionId,
    )
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
    if (createdByTransactionId != null) result.createdByTransactionId = createdByTransactionId
    if (closedDate != null) result.closedDate = closedDate
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Lot', enumerable: false },

    toString: {
        value: function () {
            return `Lot(${R._toString(this.accountId)}, ${R._toString(this.costBasis)}, ${R._toString(this.createdAt)}, ${R._toString(this.id)}, ${R._toString(this.purchaseDate)}, ${R._toString(this.quantity)}, ${R._toString(this.remainingQuantity)}, ${R._toString(this.securityId)}, ${R._toString(this.createdByTransactionId)}, ${R._toString(this.closedDate)})`
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
        value: Lot,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Lot.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Lot.toString = () => 'Lot'
Lot.is = v => v && v['@@typeName'] === 'Lot'

Lot._from = o =>
    Lot(
        o.accountId,
        o.costBasis,
        o.createdAt,
        o.id,
        o.purchaseDate,
        o.quantity,
        o.remainingQuantity,
        o.securityId,
        o.createdByTransactionId,
        o.closedDate,
    )
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

Lot.isOpen = lot => lot.closedDate === null

Lot.isClosed = lot => lot.closedDate !== null

export { Lot }
