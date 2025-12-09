/*  Transaction generated from: modules/cli-qif-to-sqlite/type-definitions/transaction.type.js
 *
 *  Bank
 *      accountId      : "Number",
 *      amount         : "Number",
 *      date           : "String",
 *      id             : "Number",
 *      transactionType: /^bank$/,
 *      address        : "String?",
 *      categoryId     : "Number?",
 *      cleared        : "String?",
 *      memo           : "String?",
 *      number         : "String?",
 *      payee          : "String?"
 *  Investment
 *      accountId       : "Number",
 *      date            : "String",
 *      id              : "Number",
 *      transactionType : /^investment$/,
 *      address         : "String?",
 *      amount          : "Number?",
 *      categoryId      : "Number?",
 *      cleared         : "String?",
 *      commission      : "Number?",
 *      investmentAction: /^(Buy|BuyX|CGLong|CGShort|CvrShrt|Div|IntInc|MargInt|MiscExp|MiscInc|ReinvDiv|ReinvInt|ReinvLg|ReinvSh|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|XIn|XOut)$/,
 *      memo            : "String?",
 *      payee           : "String?",
 *      price           : "Number?",
 *      quantity        : "Number?",
 *      securityId      : "Number?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// Transaction constructor
//
// -------------------------------------------------------------------------------------------------------------
const Transaction = {
    toString: () => 'Transaction',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return constructor === Transaction.Bank || constructor === Transaction.Investment
    },
}

// Add hidden properties
Object.defineProperty(Transaction, '@@typeName', { value: 'Transaction', enumerable: false })
Object.defineProperty(Transaction, '@@tagNames', { value: ['Bank', 'Investment'], enumerable: false })

// Type prototype with match method
const TransactionPrototype = {}

Object.defineProperty(TransactionPrototype, 'match', {
    value: R.match(Transaction['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(TransactionPrototype, 'constructor', {
    value: Transaction,
    enumerable: false,
    writable: true,
    configurable: true,
})

Transaction.prototype = TransactionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Transaction.Bank
//
// -------------------------------------------------------------------------------------------------------------
const BankConstructor = function Bank(
    accountId,
    amount,
    date,
    id,
    transactionType,
    address,
    categoryId,
    cleared,
    memo,
    number,
    payee,
) {
    const constructorName =
        'Transaction.Bank(accountId, amount, date, id, transactionType, address, categoryId, cleared, memo, number, payee)'

    R.validateNumber(constructorName, 'accountId', false, accountId)
    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateString(constructorName, 'date', false, date)
    R.validateNumber(constructorName, 'id', false, id)
    R.validateRegex(constructorName, /^bank$/, 'transactionType', false, transactionType)
    R.validateString(constructorName, 'address', true, address)
    R.validateNumber(constructorName, 'categoryId', true, categoryId)
    R.validateString(constructorName, 'cleared', true, cleared)
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'number', true, number)
    R.validateString(constructorName, 'payee', true, payee)

    const result = Object.create(BankPrototype)
    result.accountId = accountId
    result.amount = amount
    result.date = date
    result.id = id
    result.transactionType = transactionType
    if (address != null) result.address = address
    if (categoryId != null) result.categoryId = categoryId
    if (cleared != null) result.cleared = cleared
    if (memo != null) result.memo = memo
    if (number != null) result.number = number
    if (payee != null) result.payee = payee
    return result
}

Transaction.Bank = BankConstructor

const BankPrototype = Object.create(TransactionPrototype, {
    '@@tagName': { value: 'Bank', enumerable: false },
    '@@typeName': { value: 'Transaction', enumerable: false },

    toString: {
        value: function () {
            return `Transaction.Bank(${R._toString(this.accountId)}, ${R._toString(this.amount)}, ${R._toString(this.date)}, ${R._toString(this.id)}, ${R._toString(this.transactionType)}, ${R._toString(this.address)}, ${R._toString(this.categoryId)}, ${R._toString(this.cleared)}, ${R._toString(this.memo)}, ${R._toString(this.number)}, ${R._toString(this.payee)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: BankConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

BankConstructor.prototype = BankPrototype
BankConstructor.is = val => val && val.constructor === BankConstructor
BankConstructor.toString = () => 'Transaction.Bank'
BankConstructor._from = o =>
    Transaction.Bank(
        o.accountId,
        o.amount,
        o.date,
        o.id,
        o.transactionType,
        o.address,
        o.categoryId,
        o.cleared,
        o.memo,
        o.number,
        o.payee,
    )
BankConstructor.from = BankConstructor._from

BankConstructor.toFirestore = o => ({ ...o })
BankConstructor.fromFirestore = BankConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Transaction.Investment
//
// -------------------------------------------------------------------------------------------------------------
const InvestmentConstructor = function Investment(
    accountId,
    date,
    id,
    transactionType,
    address,
    amount,
    categoryId,
    cleared,
    commission,
    investmentAction,
    memo,
    payee,
    price,
    quantity,
    securityId,
) {
    const constructorName =
        'Transaction.Investment(accountId, date, id, transactionType, address, amount, categoryId, cleared, commission, investmentAction, memo, payee, price, quantity, securityId)'

    R.validateNumber(constructorName, 'accountId', false, accountId)
    R.validateString(constructorName, 'date', false, date)
    R.validateNumber(constructorName, 'id', false, id)
    R.validateRegex(constructorName, /^investment$/, 'transactionType', false, transactionType)
    R.validateString(constructorName, 'address', true, address)
    R.validateNumber(constructorName, 'amount', true, amount)
    R.validateNumber(constructorName, 'categoryId', true, categoryId)
    R.validateString(constructorName, 'cleared', true, cleared)
    R.validateNumber(constructorName, 'commission', true, commission)
    R.validateRegex(
        constructorName,
        /^(Buy|BuyX|CGLong|CGShort|CvrShrt|Div|IntInc|MargInt|MiscExp|MiscInc|ReinvDiv|ReinvInt|ReinvLg|ReinvSh|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|XIn|XOut)$/,
        'investmentAction',
        false,
        investmentAction,
    )
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'payee', true, payee)
    R.validateNumber(constructorName, 'price', true, price)
    R.validateNumber(constructorName, 'quantity', true, quantity)
    R.validateNumber(constructorName, 'securityId', true, securityId)

    const result = Object.create(InvestmentPrototype)
    result.accountId = accountId
    result.date = date
    result.id = id
    result.transactionType = transactionType
    if (address != null) result.address = address
    if (amount != null) result.amount = amount
    if (categoryId != null) result.categoryId = categoryId
    if (cleared != null) result.cleared = cleared
    if (commission != null) result.commission = commission
    result.investmentAction = investmentAction
    if (memo != null) result.memo = memo
    if (payee != null) result.payee = payee
    if (price != null) result.price = price
    if (quantity != null) result.quantity = quantity
    if (securityId != null) result.securityId = securityId
    return result
}

Transaction.Investment = InvestmentConstructor

const InvestmentPrototype = Object.create(TransactionPrototype, {
    '@@tagName': { value: 'Investment', enumerable: false },
    '@@typeName': { value: 'Transaction', enumerable: false },

    toString: {
        value: function () {
            return `Transaction.Investment(${R._toString(this.accountId)}, ${R._toString(this.date)}, ${R._toString(this.id)}, ${R._toString(this.transactionType)}, ${R._toString(this.address)}, ${R._toString(this.amount)}, ${R._toString(this.categoryId)}, ${R._toString(this.cleared)}, ${R._toString(this.commission)}, ${R._toString(this.investmentAction)}, ${R._toString(this.memo)}, ${R._toString(this.payee)}, ${R._toString(this.price)}, ${R._toString(this.quantity)}, ${R._toString(this.securityId)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: InvestmentConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

InvestmentConstructor.prototype = InvestmentPrototype
InvestmentConstructor.is = val => val && val.constructor === InvestmentConstructor
InvestmentConstructor.toString = () => 'Transaction.Investment'
InvestmentConstructor._from = o =>
    Transaction.Investment(
        o.accountId,
        o.date,
        o.id,
        o.transactionType,
        o.address,
        o.amount,
        o.categoryId,
        o.cleared,
        o.commission,
        o.investmentAction,
        o.memo,
        o.payee,
        o.price,
        o.quantity,
        o.securityId,
    )
InvestmentConstructor.from = InvestmentConstructor._from

InvestmentConstructor.toFirestore = o => ({ ...o })
InvestmentConstructor.fromFirestore = InvestmentConstructor._from

Transaction._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Transaction[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

Transaction._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Bank') return Transaction.Bank.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Investment') return Transaction.Investment.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized Transaction variant: ${tagName}`)
}

// Public aliases (can be overridden)
Transaction.toFirestore = Transaction._toFirestore
Transaction.fromFirestore = Transaction._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Transaction }
