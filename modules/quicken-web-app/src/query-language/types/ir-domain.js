// ABOUTME: Generated type definition for IRDomain
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir/ir-domain.type.js - do not edit manually

/*  IRDomain generated from: modules/quicken-web-app/type-definitions/ir/ir-domain.type.js
 *
 *  Transactions
 *  Positions
 *  Accounts
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// IRDomain constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRDomain = { toString: () => 'IRDomain' }

// Add hidden properties
Object.defineProperty(IRDomain, '@@typeName', { value: 'IRDomain', enumerable: false })
Object.defineProperty(IRDomain, '@@tagNames', { value: ['Transactions', 'Positions', 'Accounts'], enumerable: false })

// Type prototype with match method
const IRDomainPrototype = {}

Object.defineProperty(IRDomainPrototype, 'match', { value: R.match(IRDomain['@@tagNames']), enumerable: false })

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
    positions   : function () { return `IRDomain.Positions()` },
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
    positions   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
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
 * Construct a IRDomain.Positions instance
 * @sig Positions :: () -> IRDomain.Positions
 */
const PositionsConstructor = function Positions() {
    const constructorName = 'IRDomain.Positions()'
    R.validateArgumentLength(constructorName, 0, arguments)

    const result = Object.create(PositionsPrototype)

    return result
}

IRDomain.Positions = PositionsConstructor

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

const PositionsPrototype = Object.create(IRDomainPrototype, {
    '@@tagName': { value: 'Positions', enumerable: false },
    '@@typeName': { value: 'IRDomain', enumerable: false },
    toString: { value: toString.positions, enumerable: false },
    toJSON: { value: toJSON.positions, enumerable: false },
    constructor: { value: PositionsConstructor, enumerable: false, writable: true, configurable: true },
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
PositionsConstructor.prototype = PositionsPrototype
AccountsConstructor.prototype = AccountsPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.is = val => val && val.constructor === TransactionsConstructor
PositionsConstructor.is = val => val && val.constructor === PositionsConstructor
AccountsConstructor.is = val => val && val.constructor === AccountsConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.toString = () => 'IRDomain.Transactions'
PositionsConstructor.toString = () => 'IRDomain.Positions'
AccountsConstructor.toString = () => 'IRDomain.Accounts'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor._from = _input => IRDomain.Transactions()
PositionsConstructor._from = _input => IRDomain.Positions()
AccountsConstructor._from = _input => IRDomain.Accounts()
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
TransactionsConstructor.from = TransactionsConstructor._from
PositionsConstructor.from = PositionsConstructor._from
AccountsConstructor.from = AccountsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRDomain instance
 * @sig is :: Any -> Boolean
 */
IRDomain.is = v => {
    const { Transactions, Positions, Accounts } = IRDomain
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Transactions || constructor === Positions || constructor === Accounts
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRDomain }
