// ABOUTME: Generated type definition for DailyPortfolio
// ABOUTME: Auto-generated from modules/cli-qif-to-sqlite/type-definitions/daily-portfolio.type.js - do not edit manually

/** {@link module:DailyPortfolio} */
/*  DailyPortfolio generated from: modules/cli-qif-to-sqlite/type-definitions/daily-portfolio.type.js
 *
 *  accountId         : /^acc_[a-f0-9]{12}$/,
 *  accountName       : "String",
 *  date              : "String",
 *  cashBalance       : "Number",
 *  totalMarketValue  : "Number",
 *  totalCostBasis    : "Number",
 *  unrealizedGainLoss: "Number",
 *  holdings          : "[Object]"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a DailyPortfolio instance
 * @sig DailyPortfolio :: (AccountId, String, String, Number, Number, Number, Number, [Object]) -> DailyPortfolio
 *     AccountId = /^acc_[a-f0-9]{12}$/
 */
const DailyPortfolio = function DailyPortfolio(
    accountId,
    accountName,
    date,
    cashBalance,
    totalMarketValue,
    totalCostBasis,
    unrealizedGainLoss,
    holdings,
) {
    const constructorName =
        'DailyPortfolio(accountId, accountName, date, cashBalance, totalMarketValue, totalCostBasis, unrealizedGainLoss, holdings)'
    R.validateArgumentLength(constructorName, 8, arguments)
    R.validateRegex(constructorName, /^acc_[a-f0-9]{12}$/, 'accountId', false, accountId)
    R.validateString(constructorName, 'accountName', false, accountName)
    R.validateString(constructorName, 'date', false, date)
    R.validateNumber(constructorName, 'cashBalance', false, cashBalance)
    R.validateNumber(constructorName, 'totalMarketValue', false, totalMarketValue)
    R.validateNumber(constructorName, 'totalCostBasis', false, totalCostBasis)
    R.validateNumber(constructorName, 'unrealizedGainLoss', false, unrealizedGainLoss)
    R.validateArray(constructorName, 1, 'Object', undefined, 'holdings', false, holdings)

    const result = Object.create(prototype)
    result.accountId = accountId
    result.accountName = accountName
    result.date = date
    result.cashBalance = cashBalance
    result.totalMarketValue = totalMarketValue
    result.totalCostBasis = totalCostBasis
    result.unrealizedGainLoss = unrealizedGainLoss
    result.holdings = holdings
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig dailyportfolioToString :: () -> String
 */
const dailyportfolioToString = function () {
    return `DailyPortfolio(${R._toString(this.accountId)},
        ${R._toString(this.accountName)},
        ${R._toString(this.date)},
        ${R._toString(this.cashBalance)},
        ${R._toString(this.totalMarketValue)},
        ${R._toString(this.totalCostBasis)},
        ${R._toString(this.unrealizedGainLoss)},
        ${R._toString(this.holdings)})`
}

/*
 * Convert to JSON representation
 * @sig dailyportfolioToJSON :: () -> Object
 */
const dailyportfolioToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'DailyPortfolio', enumerable: false },
    toString: { value: dailyportfolioToString, enumerable: false },
    toJSON: { value: dailyportfolioToJSON, enumerable: false },
    constructor: { value: DailyPortfolio, enumerable: false, writable: true, configurable: true },
})

DailyPortfolio.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
DailyPortfolio.toString = () => 'DailyPortfolio'
DailyPortfolio.is = v => v && v['@@typeName'] === 'DailyPortfolio'

DailyPortfolio._from = _input => {
    const {
        accountId,
        accountName,
        date,
        cashBalance,
        totalMarketValue,
        totalCostBasis,
        unrealizedGainLoss,
        holdings,
    } = _input
    return DailyPortfolio(
        accountId,
        accountName,
        date,
        cashBalance,
        totalMarketValue,
        totalCostBasis,
        unrealizedGainLoss,
        holdings,
    )
}
DailyPortfolio.from = DailyPortfolio._from

DailyPortfolio._toFirestore = (o, encodeTimestamps) => ({ ...o })

DailyPortfolio._fromFirestore = (doc, decodeTimestamps) => DailyPortfolio._from(doc)

// Public aliases (override if necessary)
DailyPortfolio.toFirestore = DailyPortfolio._toFirestore
DailyPortfolio.fromFirestore = DailyPortfolio._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { DailyPortfolio }
