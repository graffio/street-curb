// ABOUTME: Generated type definition for Domain
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/domain.type.js - do not edit manually

/*  Domain generated from: modules/quicken-web-app/type-definitions/domain.type.js
 *
 *  Transactions
 *  Holdings
 *  Accounts
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// Domain constructor
//
// -------------------------------------------------------------------------------------------------------------
const Domain = {
    toString: () => 'Domain',
}

// Add hidden properties
Object.defineProperty(Domain, '@@typeName', { value: 'Domain', enumerable: false })
Object.defineProperty(Domain, '@@tagNames', { value: ['Transactions', 'Holdings', 'Accounts'], enumerable: false })

// Type prototype with match method
const DomainPrototype = {}

Object.defineProperty(DomainPrototype, 'match', {
    value: R.match(Domain['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(DomainPrototype, 'constructor', {
    value: Domain,
    enumerable: false,
    writable: true,
    configurable: true,
})

Domain.prototype = DomainPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    transactions: function () { return `Domain.Transactions()` },
    holdings    : function () { return `Domain.Holdings()` },
    accounts    : function () { return `Domain.Accounts()` },
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
 * Construct a Domain.Transactions instance
 * @sig Transactions :: () -> Domain.Transactions
 */
const TransactionsConstructor = function Transactions() {
    const constructorName = 'Domain.Transactions()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(TransactionsPrototype)

    return result
}

Domain.Transactions = TransactionsConstructor

/*
 * Construct a Domain.Holdings instance
 * @sig Holdings :: () -> Domain.Holdings
 */
const HoldingsConstructor = function Holdings() {
    const constructorName = 'Domain.Holdings()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(HoldingsPrototype)

    return result
}

Domain.Holdings = HoldingsConstructor

/*
 * Construct a Domain.Accounts instance
 * @sig Accounts :: () -> Domain.Accounts
 */
const AccountsConstructor = function Accounts() {
    const constructorName = 'Domain.Accounts()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(AccountsPrototype)

    return result
}

Domain.Accounts = AccountsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const TransactionsPrototype = Object.create(DomainPrototype, {
    '@@tagName': { value: 'Transactions', enumerable: false },
    '@@typeName': { value: 'Domain', enumerable: false },
    toString: { value: toString.transactions, enumerable: false },
    toJSON: { value: toJSON.transactions, enumerable: false },
    constructor: { value: TransactionsConstructor, enumerable: false, writable: true, configurable: true },
})

const HoldingsPrototype = Object.create(DomainPrototype, {
    '@@tagName': { value: 'Holdings', enumerable: false },
    '@@typeName': { value: 'Domain', enumerable: false },
    toString: { value: toString.holdings, enumerable: false },
    toJSON: { value: toJSON.holdings, enumerable: false },
    constructor: { value: HoldingsConstructor, enumerable: false, writable: true, configurable: true },
})

const AccountsPrototype = Object.create(DomainPrototype, {
    '@@tagName': { value: 'Accounts', enumerable: false },
    '@@typeName': { value: 'Domain', enumerable: false },
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
TransactionsConstructor.toString = () => 'Domain.Transactions'
HoldingsConstructor.toString = () => 'Domain.Holdings'
AccountsConstructor.toString = () => 'Domain.Accounts'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor._from = _input => Domain.Transactions()
HoldingsConstructor._from = _input => Domain.Holdings()
AccountsConstructor._from = _input => Domain.Accounts()
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.from = TransactionsConstructor._from
HoldingsConstructor.from = HoldingsConstructor._from
AccountsConstructor.from = AccountsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a Domain instance
 * @sig is :: Any -> Boolean
 */
Domain.is = v => {
    const { Transactions, Holdings, Accounts } = Domain
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Transactions || constructor === Holdings || constructor === Accounts
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Domain }
