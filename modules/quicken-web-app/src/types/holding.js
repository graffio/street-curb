// ABOUTME: Generated type definition for Holding
// ABOUTME: Auto-generated from modules/quicken-type-definitions/holding.type.js - do not edit manually

/** {@link module:Holding} */
/*  Holding generated from: modules/quicken-type-definitions/holding.type.js
 *
 *  accountId                : FieldTypes.accountId,
 *  accountName              : "String",
 *  securityId               : FieldTypes.securityId,
 *  securityName             : "String",
 *  securitySymbol           : "String",
 *  securityType             : "String",
 *  securityGoal             : "String?",
 *  quantity                 : "Number",
 *  costBasis                : "Number",
 *  averageCostPerShare      : "Number",
 *  quotePrice               : "Number",
 *  marketValue              : "Number",
 *  unrealizedGainLoss       : "Number",
 *  unrealizedGainLossPercent: "Number",
 *  dayGainLoss              : "Number",
 *  dayGainLossPercent       : "Number",
 *  isStale                  : "Boolean"
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
 * Construct a Holding instance
 * @sig Holding :: (String, String, String, String, String, String, String?, Number, Number, Number, Number, Number, Number, Number, Number, Number, Boolean) -> Holding
 */
const Holding = function Holding(
    accountId,
    accountName,
    securityId,
    securityName,
    securitySymbol,
    securityType,
    securityGoal,
    quantity,
    costBasis,
    averageCostPerShare,
    quotePrice,
    marketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    dayGainLoss,
    dayGainLossPercent,
    isStale,
) {
    const constructorName =
        'Holding(accountId, accountName, securityId, securityName, securitySymbol, securityType, securityGoal, quantity, costBasis, averageCostPerShare, quotePrice, marketValue, unrealizedGainLoss, unrealizedGainLossPercent, dayGainLoss, dayGainLossPercent, isStale)'

    R.validateRegex(constructorName, FieldTypes.accountId, 'accountId', false, accountId)
    R.validateString(constructorName, 'accountName', false, accountName)
    R.validateRegex(constructorName, FieldTypes.securityId, 'securityId', false, securityId)
    R.validateString(constructorName, 'securityName', false, securityName)
    R.validateString(constructorName, 'securitySymbol', false, securitySymbol)
    R.validateString(constructorName, 'securityType', false, securityType)
    R.validateString(constructorName, 'securityGoal', true, securityGoal)
    R.validateNumber(constructorName, 'quantity', false, quantity)
    R.validateNumber(constructorName, 'costBasis', false, costBasis)
    R.validateNumber(constructorName, 'averageCostPerShare', false, averageCostPerShare)
    R.validateNumber(constructorName, 'quotePrice', false, quotePrice)
    R.validateNumber(constructorName, 'marketValue', false, marketValue)
    R.validateNumber(constructorName, 'unrealizedGainLoss', false, unrealizedGainLoss)
    R.validateNumber(constructorName, 'unrealizedGainLossPercent', false, unrealizedGainLossPercent)
    R.validateNumber(constructorName, 'dayGainLoss', false, dayGainLoss)
    R.validateNumber(constructorName, 'dayGainLossPercent', false, dayGainLossPercent)
    R.validateBoolean(constructorName, 'isStale', false, isStale)

    const result = Object.create(prototype)
    result.accountId = accountId
    result.accountName = accountName
    result.securityId = securityId
    result.securityName = securityName
    result.securitySymbol = securitySymbol
    result.securityType = securityType
    if (securityGoal != null) result.securityGoal = securityGoal
    result.quantity = quantity
    result.costBasis = costBasis
    result.averageCostPerShare = averageCostPerShare
    result.quotePrice = quotePrice
    result.marketValue = marketValue
    result.unrealizedGainLoss = unrealizedGainLoss
    result.unrealizedGainLossPercent = unrealizedGainLossPercent
    result.dayGainLoss = dayGainLoss
    result.dayGainLossPercent = dayGainLossPercent
    result.isStale = isStale
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig holdingToString :: () -> String
 */
const holdingToString = function () {
    return `Holding(${R._toString(this.accountId)},
        ${R._toString(this.accountName)},
        ${R._toString(this.securityId)},
        ${R._toString(this.securityName)},
        ${R._toString(this.securitySymbol)},
        ${R._toString(this.securityType)},
        ${R._toString(this.securityGoal)},
        ${R._toString(this.quantity)},
        ${R._toString(this.costBasis)},
        ${R._toString(this.averageCostPerShare)},
        ${R._toString(this.quotePrice)},
        ${R._toString(this.marketValue)},
        ${R._toString(this.unrealizedGainLoss)},
        ${R._toString(this.unrealizedGainLossPercent)},
        ${R._toString(this.dayGainLoss)},
        ${R._toString(this.dayGainLossPercent)},
        ${R._toString(this.isStale)})`
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
    const {
        accountId,
        accountName,
        securityId,
        securityName,
        securitySymbol,
        securityType,
        securityGoal,
        quantity,
        costBasis,
        averageCostPerShare,
        quotePrice,
        marketValue,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        dayGainLoss,
        dayGainLossPercent,
        isStale,
    } = _input
    return Holding(
        accountId,
        accountName,
        securityId,
        securityName,
        securitySymbol,
        securityType,
        securityGoal,
        quantity,
        costBasis,
        averageCostPerShare,
        quotePrice,
        marketValue,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        dayGainLoss,
        dayGainLossPercent,
        isStale,
    )
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

Holding.matchesSearch = (holding, query) => {
    if (!query) return true
    const q = query.toLowerCase()
    const { accountName, securityName, securitySymbol } = holding
    return (
        securityName.toLowerCase().includes(q) ||
        securitySymbol.toLowerCase().includes(q) ||
        accountName.toLowerCase().includes(q)
    )
}

export { Holding }
