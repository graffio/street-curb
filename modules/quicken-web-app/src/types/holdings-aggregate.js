// ABOUTME: Generated type definition for HoldingsAggregate
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/holdings-aggregate.type.js - do not edit manually

/** {@link module:HoldingsAggregate} */
/*  HoldingsAggregate generated from: modules/quicken-web-app/type-definitions/holdings-aggregate.type.js
 *
 *  shares                   : "Number",
 *  costBasis                : "Number",
 *  marketValue              : "Number",
 *  averageCostPerShare      : "Number",
 *  dayGainLoss              : "Number",
 *  dayGainLossPercent       : "Number",
 *  unrealizedGainLoss       : "Number",
 *  unrealizedGainLossPercent: "Number",
 *  count                    : "Number"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a HoldingsAggregate instance
 * @sig HoldingsAggregate :: (Number, Number, Number, Number, Number, Number, Number, Number, Number) -> HoldingsAggregate
 */
const HoldingsAggregate = function HoldingsAggregate(
    shares,
    costBasis,
    marketValue,
    averageCostPerShare,
    dayGainLoss,
    dayGainLossPercent,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    count,
) {
    const constructorName =
        'HoldingsAggregate(shares, costBasis, marketValue, averageCostPerShare, dayGainLoss, dayGainLossPercent, unrealizedGainLoss, unrealizedGainLossPercent, count)'
    R.validateArgumentLength(constructorName, 9, arguments)
    R.validateNumber(constructorName, 'shares', false, shares)
    R.validateNumber(constructorName, 'costBasis', false, costBasis)
    R.validateNumber(constructorName, 'marketValue', false, marketValue)
    R.validateNumber(constructorName, 'averageCostPerShare', false, averageCostPerShare)
    R.validateNumber(constructorName, 'dayGainLoss', false, dayGainLoss)
    R.validateNumber(constructorName, 'dayGainLossPercent', false, dayGainLossPercent)
    R.validateNumber(constructorName, 'unrealizedGainLoss', false, unrealizedGainLoss)
    R.validateNumber(constructorName, 'unrealizedGainLossPercent', false, unrealizedGainLossPercent)
    R.validateNumber(constructorName, 'count', false, count)

    const result = Object.create(prototype)
    result.shares = shares
    result.costBasis = costBasis
    result.marketValue = marketValue
    result.averageCostPerShare = averageCostPerShare
    result.dayGainLoss = dayGainLoss
    result.dayGainLossPercent = dayGainLossPercent
    result.unrealizedGainLoss = unrealizedGainLoss
    result.unrealizedGainLossPercent = unrealizedGainLossPercent
    result.count = count
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig holdingsaggregateToString :: () -> String
 */
const holdingsaggregateToString = function () {
    return `HoldingsAggregate(${R._toString(this.shares)},
        ${R._toString(this.costBasis)},
        ${R._toString(this.marketValue)},
        ${R._toString(this.averageCostPerShare)},
        ${R._toString(this.dayGainLoss)},
        ${R._toString(this.dayGainLossPercent)},
        ${R._toString(this.unrealizedGainLoss)},
        ${R._toString(this.unrealizedGainLossPercent)},
        ${R._toString(this.count)})`
}

/*
 * Convert to JSON representation
 * @sig holdingsaggregateToJSON :: () -> Object
 */
const holdingsaggregateToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'HoldingsAggregate', enumerable: false },
    toString: { value: holdingsaggregateToString, enumerable: false },
    toJSON: { value: holdingsaggregateToJSON, enumerable: false },
    constructor: { value: HoldingsAggregate, enumerable: false, writable: true, configurable: true },
})

HoldingsAggregate.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
HoldingsAggregate.toString = () => 'HoldingsAggregate'
HoldingsAggregate.is = v => v && v['@@typeName'] === 'HoldingsAggregate'

HoldingsAggregate._from = _input => {
    const {
        shares,
        costBasis,
        marketValue,
        averageCostPerShare,
        dayGainLoss,
        dayGainLossPercent,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        count,
    } = _input
    return HoldingsAggregate(
        shares,
        costBasis,
        marketValue,
        averageCostPerShare,
        dayGainLoss,
        dayGainLossPercent,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        count,
    )
}
HoldingsAggregate.from = HoldingsAggregate._from

HoldingsAggregate._toFirestore = (o, encodeTimestamps) => ({ ...o })

HoldingsAggregate._fromFirestore = (doc, decodeTimestamps) => HoldingsAggregate._from(doc)

// Public aliases (override if necessary)
HoldingsAggregate.toFirestore = HoldingsAggregate._toFirestore
HoldingsAggregate.fromFirestore = HoldingsAggregate._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { HoldingsAggregate }
