// ABOUTME: Generated type definition for EnrichedAccount
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/enriched-account.type.js - do not edit manually

/** {@link module:EnrichedAccount} */
/*  EnrichedAccount generated from: modules/quicken-web-app/type-definitions/enriched-account.type.js
 *
 *  id          : "String",
 *  account     : "Account",
 *  balance     : "Number",
 *  dayChange   : "Number",
 *  dayChangePct: "Number?"
 *
 */

import { currentBalance } from '@graffio/financial-computations/banking'

import * as R from '@graffio/cli-type-generator'

import { Account } from './account.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a EnrichedAccount instance
 * @sig EnrichedAccount :: (String, Account, Number, Number, Number?) -> EnrichedAccount
 */
const EnrichedAccount = function EnrichedAccount(id, account, balance, dayChange, dayChangePct) {
    const constructorName = 'EnrichedAccount(id, account, balance, dayChange, dayChangePct)'

    R.validateString(constructorName, 'id', false, id)
    R.validateTag(constructorName, 'Account', 'account', false, account)
    R.validateNumber(constructorName, 'balance', false, balance)
    R.validateNumber(constructorName, 'dayChange', false, dayChange)
    R.validateNumber(constructorName, 'dayChangePct', true, dayChangePct)

    const result = Object.create(prototype)
    result.id = id
    result.account = account
    result.balance = balance
    result.dayChange = dayChange
    if (dayChangePct != null) result.dayChangePct = dayChangePct
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig enrichedaccountToString :: () -> String
 */
const enrichedaccountToString = function () {
    return `EnrichedAccount(${R._toString(this.id)},
        ${R._toString(this.account)},
        ${R._toString(this.balance)},
        ${R._toString(this.dayChange)},
        ${R._toString(this.dayChangePct)})`
}

/*
 * Convert to JSON representation
 * @sig enrichedaccountToJSON :: () -> Object
 */
const enrichedaccountToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'EnrichedAccount', enumerable: false },
    toString: { value: enrichedaccountToString, enumerable: false },
    toJSON: { value: enrichedaccountToJSON, enumerable: false },
    constructor: { value: EnrichedAccount, enumerable: false, writable: true, configurable: true },
})

EnrichedAccount.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
EnrichedAccount.toString = () => 'EnrichedAccount'
EnrichedAccount.is = v => v && v['@@typeName'] === 'EnrichedAccount'

EnrichedAccount._from = _input => {
    const { id, account, balance, dayChange, dayChangePct } = _input
    return EnrichedAccount(id, account, balance, dayChange, dayChangePct)
}
EnrichedAccount.from = EnrichedAccount._from

EnrichedAccount._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        account: Account.toFirestore(o.account, encodeTimestamps),
        balance: o.balance,
        dayChange: o.dayChange,
    }

    if (o.dayChangePct != null) result.dayChangePct = o.dayChangePct

    return result
}

EnrichedAccount._fromFirestore = (doc, decodeTimestamps) =>
    EnrichedAccount._from({
        id: doc.id,
        account: Account.fromFirestore
            ? Account.fromFirestore(doc.account, decodeTimestamps)
            : Account.from(doc.account),
        balance: doc.balance,
        dayChange: doc.dayChange,
        dayChangePct: doc.dayChangePct,
    })

// Public aliases (override if necessary)
EnrichedAccount.toFirestore = EnrichedAccount._toFirestore
EnrichedAccount.fromFirestore = EnrichedAccount._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

EnrichedAccount.HOLDINGS_BALANCE_TYPES = ['Investment', '401(k)/403(b)']

EnrichedAccount.sumHoldingsForAccount = (holdings, accountId) => {
    const accountHoldings = holdings.filter(h => h.accountId === accountId)
    const balance = accountHoldings.reduce((sum, h) => sum + h.marketValue, 0)
    const dayChange = accountHoldings.reduce((sum, h) => sum + h.dayGainLoss, 0)
    const dayChangePct = balance !== 0 ? dayChange / (balance - dayChange) : null
    return {
        balance,
        dayChange,
        dayChangePct,
    }
}

EnrichedAccount.sumBankBalance = (transactions, accountId) => {
    if (!transactions || transactions.length === 0) return 0
    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.amount != null)
    return currentBalance(accountTransactions)
}

EnrichedAccount.fromAccount = (account, holdings, transactions) => {
    const { id } = account
    if (EnrichedAccount.HOLDINGS_BALANCE_TYPES.includes(account.type)) {
        const { balance, dayChange, dayChangePct } = EnrichedAccount.sumHoldingsForAccount(holdings, id)
        return EnrichedAccount(id, account, balance, dayChange, dayChangePct)
    }
    return EnrichedAccount(id, account, EnrichedAccount.sumBankBalance(transactions, id), 0, null)
}

EnrichedAccount.enrichAll = (accounts, holdings, transactions) =>
    accounts.map(account => EnrichedAccount.fromAccount(account, holdings, transactions))

export { EnrichedAccount }
