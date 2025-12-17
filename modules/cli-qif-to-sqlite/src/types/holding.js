// ABOUTME: Generated type definition for Holding
// ABOUTME: Auto-generated from modules/cli-qif-to-sqlite/type-definitions/holding.type.js - do not edit manually

/** {@link module:Holding} */
/*  Holding generated from: modules/cli-qif-to-sqlite/type-definitions/holding.type.js
 *
 *  accountId      : /^acc_[a-f0-9]{12}$/,
 *  avgCostPerShare: "Number",
 *  costBasis      : "Number",
 *  lastUpdated    : "String",
 *  quantity       : "Number",
 *  securityId     : /^sec_[a-f0-9]{12}$/
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Holding instance
 * @sig Holding :: (AccountId, Number, Number, String, Number, SecurityId) -> Holding
 *     AccountId = /^acc_[a-f0-9]{12}$/
 *     SecurityId = /^sec_[a-f0-9]{12}$/
 */
const Holding = function Holding(accountId, avgCostPerShare, costBasis, lastUpdated, quantity, securityId) {
    const constructorName = 'Holding(accountId, avgCostPerShare, costBasis, lastUpdated, quantity, securityId)'
    R.validateArgumentLength(constructorName, 6, arguments)
    R.validateRegex(constructorName, /^acc_[a-f0-9]{12}$/, 'accountId', false, accountId)
    R.validateNumber(constructorName, 'avgCostPerShare', false, avgCostPerShare)
    R.validateNumber(constructorName, 'costBasis', false, costBasis)
    R.validateString(constructorName, 'lastUpdated', false, lastUpdated)
    R.validateNumber(constructorName, 'quantity', false, quantity)
    R.validateRegex(constructorName, /^sec_[a-f0-9]{12}$/, 'securityId', false, securityId)

    const result = Object.create(prototype)
    result.accountId = accountId
    result.avgCostPerShare = avgCostPerShare
    result.costBasis = costBasis
    result.lastUpdated = lastUpdated
    result.quantity = quantity
    result.securityId = securityId
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig holdingToString :: () -> String
 */
const holdingToString = function () {
    return `Holding(${R._toString(this.accountId)},
        ${R._toString(this.avgCostPerShare)},
        ${R._toString(this.costBasis)},
        ${R._toString(this.lastUpdated)},
        ${R._toString(this.quantity)},
        ${R._toString(this.securityId)})`
}

/*
 * Convert to JSON representation
 * @sig holdingToJSON :: () -> Object
 */
const holdingToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Holding', enumerable: false },
    toString: { value: holdingToString, enumerable: false },
    toJSON: { value: holdingToJSON, enumerable: false },
    constructor: { value: Holding, enumerable: false, writable: true, configurable: true },
})

Holding.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Holding.toString = () => 'Holding'
Holding.is = v => v && v['@@typeName'] === 'Holding'

Holding._from = _input => {
    const { accountId, avgCostPerShare, costBasis, lastUpdated, quantity, securityId } = _input
    return Holding(accountId, avgCostPerShare, costBasis, lastUpdated, quantity, securityId)
}
Holding.from = Holding._from

Holding._toFirestore = (o, encodeTimestamps) => ({ ...o })

Holding._fromFirestore = (doc, decodeTimestamps) => Holding._from(doc)

// Public aliases (override if necessary)
Holding.toFirestore = Holding._toFirestore
Holding.fromFirestore = Holding._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Holding }
