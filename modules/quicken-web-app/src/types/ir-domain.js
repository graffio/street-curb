// ABOUTME: Generated type definition for IRDomain
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-domain.type.js - do not edit manually

/*  IRDomain generated from: modules/quicken-web-app/type-definitions/ir-domain.type.js
 *
 *  Transactions
 *  Holdings
 *  Accounts
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRDomain constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRDomain = {
    toString: () => 'IRDomain',
}

// Add hidden properties
Object.defineProperty(IRDomain, '@@typeName', { value: 'IRDomain', enumerable: false })
Object.defineProperty(IRDomain, '@@tagNames', { value: ['Transactions', 'Holdings', 'Accounts'], enumerable: false })

// Type prototype with match method
const IRDomainPrototype = {}

Object.defineProperty(IRDomainPrototype, 'match', {
    value: R.match(IRDomain['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRDomainPrototype, 'constructor', {
    value: IRDomain,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRDomain.prototype = IRDomainPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    transactions: function () { return `IRDomain.Transactions()` },
    holdings    : function () { return `IRDomain.Holdings()` },
    accounts    : function () { return `IRDomain.Accounts()` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    transactions: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    holdings    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    accounts    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a IRDomain.Transactions instance
 * @sig Transactions :: () -> IRDomain.Transactions
 */
const TransactionsConstructor = function Transactions() {
    const constructorName = 'IRDomain.Transactions()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(TransactionsPrototype)

    return result
}

IRDomain.Transactions = TransactionsConstructor

/*
 * Construct a IRDomain.Holdings instance
 * @sig Holdings :: () -> IRDomain.Holdings
 */
const HoldingsConstructor = function Holdings() {
    const constructorName = 'IRDomain.Holdings()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(HoldingsPrototype)

    return result
}

IRDomain.Holdings = HoldingsConstructor

/*
 * Construct a IRDomain.Accounts instance
 * @sig Accounts :: () -> IRDomain.Accounts
 */
const AccountsConstructor = function Accounts() {
    const constructorName = 'IRDomain.Accounts()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(AccountsPrototype)

    return result
}

IRDomain.Accounts = AccountsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const TransactionsPrototype = Object.create(IRDomainPrototype, {
    '@@tagName': { value: 'Transactions', enumerable: false },
    '@@typeName': { value: 'IRDomain', enumerable: false },
    toString: { value: toString.transactions, enumerable: false },
    toJSON: { value: toJSON.transactions, enumerable: false },
    constructor: { value: TransactionsConstructor, enumerable: false, writable: true, configurable: true },
})

const HoldingsPrototype = Object.create(IRDomainPrototype, {
    '@@tagName': { value: 'Holdings', enumerable: false },
    '@@typeName': { value: 'IRDomain', enumerable: false },
    toString: { value: toString.holdings, enumerable: false },
    toJSON: { value: toJSON.holdings, enumerable: false },
    constructor: { value: HoldingsConstructor, enumerable: false, writable: true, configurable: true },
})

const AccountsPrototype = Object.create(IRDomainPrototype, {
    '@@tagName': { value: 'Accounts', enumerable: false },
    '@@typeName': { value: 'IRDomain', enumerable: false },
    toString: { value: toString.accounts, enumerable: false },
    toJSON: { value: toJSON.accounts, enumerable: false },
    constructor: { value: AccountsConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.prototype = TransactionsPrototype
HoldingsConstructor.prototype = HoldingsPrototype
AccountsConstructor.prototype = AccountsPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.is = val => val && val.constructor === TransactionsConstructor
HoldingsConstructor.is = val => val && val.constructor === HoldingsConstructor
AccountsConstructor.is = val => val && val.constructor === AccountsConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.toString = () => 'IRDomain.Transactions'
HoldingsConstructor.toString = () => 'IRDomain.Holdings'
AccountsConstructor.toString = () => 'IRDomain.Accounts'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor._from = _input => IRDomain.Transactions()
HoldingsConstructor._from = _input => IRDomain.Holdings()
AccountsConstructor._from = _input => IRDomain.Accounts()
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.from = TransactionsConstructor._from
HoldingsConstructor.from = HoldingsConstructor._from
AccountsConstructor.from = AccountsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRDomain instance
 * @sig is :: Any -> Boolean
 */
IRDomain.is = v => {
    const { Transactions, Holdings, Accounts } = IRDomain
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Transactions || constructor === Holdings || constructor === Accounts
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRDomain }
