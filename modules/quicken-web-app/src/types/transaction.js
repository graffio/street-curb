// ABOUTME: Generated type definition for Transaction
// ABOUTME: Auto-generated from modules/quicken-type-definitions/transaction.type.js - do not edit manually

/*  Transaction generated from: modules/quicken-type-definitions/transaction.type.js
 *
 *  Bank
 *      accountId      : /^acc_[a-f0-9]{12}$/,
 *      amount         : "Number",
 *      date           : "String",
 *      id             : /^txn_[a-f0-9]{12}(-\d+)?$/,
 *      transactionType: /^bank$/,
 *      address        : "String?",
 *      categoryId     : "String?",
 *      cleared        : "String?",
 *      memo           : "String?",
 *      number         : "String?",
 *      payee          : "String?",
 *      runningBalance : "Number?"
 *  Investment
 *      accountId       : /^acc_[a-f0-9]{12}$/,
 *      date            : "String",
 *      id              : /^txn_[a-f0-9]{12}(-\d+)?$/,
 *      transactionType : /^investment$/,
 *      address         : "String?",
 *      amount          : "Number?",
 *      categoryId      : "String?",
 *      cleared         : "String?",
 *      commission      : "Number?",
 *      investmentAction: /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|WithdrwX|XIn|XOut)$/,
 *      memo            : "String?",
 *      payee           : "String?",
 *      price           : "Number?",
 *      quantity        : "Number?",
 *      runningBalance  : "Number?",
 *      securityId      : "String?"
 *
 */

import { anyFieldContains, containsIgnoreCase } from '@graffio/functional'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// Transaction constructor
//
// -------------------------------------------------------------------------------------------------------------
const Transaction = {
    toString: () => 'Transaction',
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
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    bank      : function () { return `Transaction.Bank(${R._toString(this.accountId)}, ${R._toString(this.amount)}, ${R._toString(this.date)}, ${R._toString(this.id)}, ${R._toString(this.transactionType)}, ${R._toString(this.address)}, ${R._toString(this.categoryId)}, ${R._toString(this.cleared)}, ${R._toString(this.memo)}, ${R._toString(this.number)}, ${R._toString(this.payee)}, ${R._toString(this.runningBalance)})` },
    investment: function () { return `Transaction.Investment(${R._toString(this.accountId)}, ${R._toString(this.date)}, ${R._toString(this.id)}, ${R._toString(this.transactionType)}, ${R._toString(this.address)}, ${R._toString(this.amount)}, ${R._toString(this.categoryId)}, ${R._toString(this.cleared)}, ${R._toString(this.commission)}, ${R._toString(this.investmentAction)}, ${R._toString(this.memo)}, ${R._toString(this.payee)}, ${R._toString(this.price)}, ${R._toString(this.quantity)}, ${R._toString(this.runningBalance)}, ${R._toString(this.securityId)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    bank      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    investment: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a Transaction.Bank instance
 * @sig Bank :: (AccountId, Number, String, Id, TransactionType, String?, String?, String?, String?, String?, String?, Number?) -> Transaction.Bank
 *     AccountId = /^acc_[a-f0-9]{12}$/
 *     Id = /^txn_[a-f0-9]{12}(-\d+)?$/
 *     TransactionType = /^bank$/
 */
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
    runningBalance,
) {
    const constructorName =
        'Transaction.Bank(accountId, amount, date, id, transactionType, address, categoryId, cleared, memo, number, payee, runningBalance)'

    R.validateRegex(constructorName, /^acc_[a-f0-9]{12}$/, 'accountId', false, accountId)
    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateString(constructorName, 'date', false, date)
    R.validateRegex(constructorName, /^txn_[a-f0-9]{12}(-\d+)?$/, 'id', false, id)
    R.validateRegex(constructorName, /^bank$/, 'transactionType', false, transactionType)
    R.validateString(constructorName, 'address', true, address)
    R.validateString(constructorName, 'categoryId', true, categoryId)
    R.validateString(constructorName, 'cleared', true, cleared)
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'number', true, number)
    R.validateString(constructorName, 'payee', true, payee)
    R.validateNumber(constructorName, 'runningBalance', true, runningBalance)

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
    if (runningBalance != null) result.runningBalance = runningBalance
    return result
}

Transaction.Bank = BankConstructor

/*
 * Construct a Transaction.Investment instance
 * @sig Investment :: (AccountId, String, Id, TransactionType, String?, Number?, String?, String?, Number?, InvestmentAction, String?, String?, Number?, Number?, Number?, String?) -> Transaction.Investment
 *     AccountId = /^acc_[a-f0-9]{12}$/
 *     Id = /^txn_[a-f0-9]{12}(-\d+)?$/
 *     TransactionType = /^investment$/
 *     InvestmentAction = /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|WithdrwX|XIn|XOut)$/
 */
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
    runningBalance,
    securityId,
) {
    const constructorName =
        'Transaction.Investment(accountId, date, id, transactionType, address, amount, categoryId, cleared, commission, investmentAction, memo, payee, price, quantity, runningBalance, securityId)'

    R.validateRegex(constructorName, /^acc_[a-f0-9]{12}$/, 'accountId', false, accountId)
    R.validateString(constructorName, 'date', false, date)
    R.validateRegex(constructorName, /^txn_[a-f0-9]{12}(-\d+)?$/, 'id', false, id)
    R.validateRegex(constructorName, /^investment$/, 'transactionType', false, transactionType)
    R.validateString(constructorName, 'address', true, address)
    R.validateNumber(constructorName, 'amount', true, amount)
    R.validateString(constructorName, 'categoryId', true, categoryId)
    R.validateString(constructorName, 'cleared', true, cleared)
    R.validateNumber(constructorName, 'commission', true, commission)
    R.validateRegex(
        constructorName,
        /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|WithdrwX|XIn|XOut)$/,
        'investmentAction',
        false,
        investmentAction,
    )
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'payee', true, payee)
    R.validateNumber(constructorName, 'price', true, price)
    R.validateNumber(constructorName, 'quantity', true, quantity)
    R.validateNumber(constructorName, 'runningBalance', true, runningBalance)
    R.validateString(constructorName, 'securityId', true, securityId)

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
    if (runningBalance != null) result.runningBalance = runningBalance
    if (securityId != null) result.securityId = securityId
    return result
}

Transaction.Investment = InvestmentConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const BankPrototype = Object.create(TransactionPrototype, {
    '@@tagName': { value: 'Bank', enumerable: false },
    '@@typeName': { value: 'Transaction', enumerable: false },
    toString: { value: toString.bank, enumerable: false },
    toJSON: { value: toJSON.bank, enumerable: false },
    constructor: { value: BankConstructor, enumerable: false, writable: true, configurable: true },
})

const InvestmentPrototype = Object.create(TransactionPrototype, {
    '@@tagName': { value: 'Investment', enumerable: false },
    '@@typeName': { value: 'Transaction', enumerable: false },
    toString: { value: toString.investment, enumerable: false },
    toJSON: { value: toJSON.investment, enumerable: false },
    constructor: { value: InvestmentConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
BankConstructor.prototype = BankPrototype
InvestmentConstructor.prototype = InvestmentPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
BankConstructor.is = val => val && val.constructor === BankConstructor
InvestmentConstructor.is = val => val && val.constructor === InvestmentConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
BankConstructor.toString = () => 'Transaction.Bank'
InvestmentConstructor.toString = () => 'Transaction.Investment'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
BankConstructor._from = _input => {
    const {
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
        runningBalance,
    } = _input
    return Transaction.Bank(
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
        runningBalance,
    )
}
InvestmentConstructor._from = _input => {
    const {
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
        runningBalance,
        securityId,
    } = _input
    return Transaction.Investment(
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
        runningBalance,
        securityId,
    )
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
BankConstructor.from = BankConstructor._from
InvestmentConstructor.from = InvestmentConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

BankConstructor.toFirestore = o => ({ ...o })
BankConstructor.fromFirestore = BankConstructor._from

InvestmentConstructor.toFirestore = o => ({ ...o })
InvestmentConstructor.fromFirestore = InvestmentConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a Transaction instance
 * @sig is :: Any -> Boolean
 */
Transaction.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Transaction.Bank || constructor === Transaction.Investment
}

/**
 * Serialize Transaction to Firestore format
 * @sig _toFirestore :: (Transaction, Function) -> Object
 */
Transaction._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Transaction[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize Transaction from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Transaction
 */
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

Transaction.toCategoryName = (txn, categories) => {
    if (!txn.categoryId) return null
    return categories.get(txn.categoryId).name
}

Transaction.toSecurityName = (txn, securities) => {
    if (!txn.securityId) return null
    const security = securities.get(txn.securityId)
    return security.symbol || security.name
}

Transaction.toRegisterRow = txn => ({
    transaction: txn,
    runningBalance: txn.runningBalance,
})

Transaction.toEnriched = (txn, categories, accounts) => ({
    ...txn,
    categoryName: Transaction.toCategoryName(txn, categories) || 'Uncategorized',
    accountName: accounts.get(txn.accountId).name,
})

Transaction.matchesAnyText = (query, fields, categories, securities) => txn => {
    const matchesFields = anyFieldContains(fields)(query)
    const matches = containsIgnoreCase(query)
    if (matchesFields(txn)) return true
    if (matches(Transaction.toCategoryName(txn, categories))) return true
    if (securities && matches(Transaction.toSecurityName(txn, securities))) return true
    return false
}

Transaction.matchesSearch = (query, categories) => txn => {
    if (!query.trim()) return false
    if (Transaction.matchesAnyText(query, ['payee', 'memo', 'address', 'number'], categories, null)(txn)) return true
    return containsIgnoreCase(query)(String(txn.amount))
}

Transaction.matchesText = (query, categories, securities) => txn => {
    if (!query.trim()) return true
    return Transaction.matchesAnyText(query, ['memo', 'payee', 'investmentAction'], categories, securities)(txn)
}

Transaction.isInDateRange = dateRange => txn => {
    const { start, end } = dateRange
    if (!start && !end) return true
    const startStr = start ? start.toISOString().slice(0, 10) : null
    const endStr = end ? end.toISOString().slice(0, 10) : null
    if (startStr && txn.date < startStr) return false
    if (endStr && txn.date > endStr) return false
    return true
}

Transaction.matchesCategories = (selected, categories) => txn => {
    if (!selected.length) return true
    const categoryName = Transaction.toCategoryName(txn, categories)
    if (!categoryName) return false
    return selected.some(s => categoryName === s || categoryName.startsWith(s + ':'))
}

Transaction.isInAccount = accountId => txn => txn.accountId === accountId

Transaction.matchesSecurities = securityIds => txn => !securityIds.length || securityIds.includes(txn.securityId)

Transaction.matchesInvestmentActions = actions => txn => !actions.length || actions.includes(txn.investmentAction)

Transaction.collectSearchMatchIds = (transactions, query, categories) =>
    transactions.filter(Transaction.matchesSearch(query, categories)).map(t => t.id)

Transaction.enrichAll = (transactions, categories, accounts) =>
    transactions.map(txn => Transaction.toEnriched(txn, categories, accounts))

Transaction.toRegisterRows = transactions => transactions.map(Transaction.toRegisterRow)

Transaction.findEarliest = transactions => {
    if (transactions.length === 0) return null
    return transactions.reduce((earliest, txn) => {
        const d = new Date(txn.date)
        return d < earliest ? d : earliest
    }, new Date(transactions[0].date))
}

Transaction.currentBalance = transactions => transactions.reduce((sum, txn) => sum + txn.amount, 0)

Transaction.balanceAsOf = (isoDate, transactions) =>
    transactions.filter(txn => txn.date <= isoDate).reduce((sum, txn) => sum + txn.amount, 0)

Transaction.balanceBreakdown = transactions => {
    const cleared = transactions
        .filter(txn => txn.cleared === 'R' || txn.cleared === 'c')
        .reduce((sum, txn) => sum + txn.amount, 0)
    const total = transactions.reduce((sum, txn) => sum + txn.amount, 0)
    return {
        cleared,
        uncleared: total - cleared,
        total,
    }
}

Transaction.reconciliationDifference = (statementBalance, transactions) => {
    const { cleared } = Transaction.balanceBreakdown(transactions)
    return statementBalance - cleared
}

export { Transaction }
