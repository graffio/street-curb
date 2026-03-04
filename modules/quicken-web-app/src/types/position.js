// ABOUTME: Generated type definition for Position
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/entities/position.type.js - do not edit manually

/** {@link module:Position} */
/*  Position generated from: modules/quicken-web-app/type-definitions/entities/position.type.js
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

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Position instance
 * @sig Position :: (String, String, String, String, String, String, String?, Number, Number, Number, Number, Number, Number, Number, Number, Number, Boolean) -> Position
 */
const Position = function Position(
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
        'Position(accountId, accountName, securityId, securityName, securitySymbol, securityType, securityGoal, quantity, costBasis, averageCostPerShare, quotePrice, marketValue, unrealizedGainLoss, unrealizedGainLossPercent, dayGainLoss, dayGainLossPercent, isStale)'

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
    if (securityGoal !== undefined) result.securityGoal = securityGoal
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
 * @sig positionToString :: () -> String
 */
const positionToString = function () {
    return `Position(${R._toString(this.accountId)},
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
 * @sig positionToJSON :: () -> Object
 */
const positionToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Position', enumerable: false },
    toString: { value: positionToString, enumerable: false },
    toJSON: { value: positionToJSON, enumerable: false },
    constructor: { value: Position, enumerable: false, writable: true, configurable: true },
})

Position.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Position.toString = () => 'Position'
Position.is = v => v && v['@@typeName'] === 'Position'

Position._from = _input => {
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
    return Position(
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
Position.from = Position._from

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Position.matchesSearch = (position, query) => {
    if (!query) return true
    const q = query.toLowerCase()
    const { accountName, securityName, securitySymbol } = position
    return (
        securityName.toLowerCase().includes(q) ||
        securitySymbol.toLowerCase().includes(q) ||
        accountName.toLowerCase().includes(q)
    )
}

export { Position }
