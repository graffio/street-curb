// ABOUTME: Generated type definition for PositionAggregate
// ABOUTME: Auto-generated from modules/query-language/type-definitions/position-aggregate.type.js - do not edit manually

/** {@link module:PositionAggregate} */
/*  PositionAggregate generated from: modules/query-language/type-definitions/position-aggregate.type.js
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

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a PositionAggregate instance
 * @sig PositionAggregate :: (Number, Number, Number, Number, Number, Number, Number, Number, Number) -> PositionAggregate
 */
const PositionAggregate = function PositionAggregate(
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
        'PositionAggregate(shares, costBasis, marketValue, averageCostPerShare, dayGainLoss, dayGainLossPercent, unrealizedGainLoss, unrealizedGainLossPercent, count)'
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
 * @sig positionaggregateToString :: () -> String
 */
const positionaggregateToString = function () {
    return `PositionAggregate(${R._toString(this.shares)},
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
 * @sig positionaggregateToJSON :: () -> Object
 */
const positionaggregateToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'PositionAggregate', enumerable: false },
    toString: { value: positionaggregateToString, enumerable: false },
    toJSON: { value: positionaggregateToJSON, enumerable: false },
    constructor: { value: PositionAggregate, enumerable: false, writable: true, configurable: true },
})

PositionAggregate.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
PositionAggregate.toString = () => 'PositionAggregate'
PositionAggregate.is = v => v && v['@@typeName'] === 'PositionAggregate'

PositionAggregate._from = _input => {
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
    return PositionAggregate(
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
PositionAggregate.from = PositionAggregate._from

PositionAggregate.fromJSON = json => (json == null ? json : PositionAggregate._from(json))

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { PositionAggregate }
