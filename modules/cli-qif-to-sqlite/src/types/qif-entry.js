// ABOUTME: Generated type definition for QifEntry
// ABOUTME: Auto-generated from modules/cli-qif-to-sqlite/type-definitions/qif-entry.type.js - do not edit manually

/*  QifEntry generated from: modules/cli-qif-to-sqlite/type-definitions/qif-entry.type.js
 *
 *  Account
 *      name       : "String",
 *      type       : /^(Bank|Cash|Credit Card|Investment|Mutual|Other Asset|Other Liability|Portfolio|401.k..403.b.)$/,
 *      description: "String?",
 *      creditLimit: "Number?"
 *  Category
 *      name            : "String",
 *      budgetAmount    : "Number?",
 *      description     : "String?",
 *      excluded        : "Boolean?",
 *      isIncomeCategory: "Boolean?",
 *      isTaxRelated    : "Boolean?",
 *      taxSchedule     : "String?"
 *  Class
 *      name       : "String",
 *      subclass   : "String?",
 *      description: "String?"
 *  Payee
 *      name           : "String",
 *      address        : "[String]?",
 *      memo           : "String?",
 *      defaultCategory: "String?"
 *  Price
 *      symbol: "String",
 *      price : "Number",
 *      date  : "Object"
 *  Security
 *      name  : "String",
 *      goal  : "String?",
 *      symbol: "String?",
 *      type  : "String?"
 *  Tag
 *      name       : "String",
 *      color      : "String?",
 *      description: "String?"
 *  TransactionBank
 *      account        : "String",
 *      amount         : "Number",
 *      date           : "Object",
 *      transactionType: /^(Bank|Cash|Credit Card|Invoice|Other Asset|Other Liability)$/,
 *      address        : "[String]?",
 *      category       : "String?",
 *      cleared        : "String?",
 *      memo           : "String?",
 *      number         : "String?",
 *      payee          : "String?",
 *      splits         : "[QifSplit]?"
 *  TransactionInvestment
 *      account        : "String",
 *      date           : "Object",
 *      transactionType: /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|XIn|XOut|WithdrwX)$/,
 *      number         : "String?",
 *      address        : "[String]?",
 *      amount         : "Number?",
 *      category       : "String?",
 *      cleared        : "String?",
 *      commission     : "Number?",
 *      memo           : "String?",
 *      payee          : "String?",
 *      price          : "Number?",
 *      quantity       : "Number?",
 *      security       : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'
import { QifSplit } from './qif-split.js'

// -------------------------------------------------------------------------------------------------------------
//
// QifEntry constructor
//
// -------------------------------------------------------------------------------------------------------------
const QifEntry = {
    toString: () => 'QifEntry',
}

// Add hidden properties
Object.defineProperty(QifEntry, '@@typeName', { value: 'QifEntry', enumerable: false })
Object.defineProperty(QifEntry, '@@tagNames', {
    value: [
        'Account',
        'Category',
        'Class',
        'Payee',
        'Price',
        'Security',
        'Tag',
        'TransactionBank',
        'TransactionInvestment',
    ],
    enumerable: false,
})

// Type prototype with match method
const QifEntryPrototype = {}

Object.defineProperty(QifEntryPrototype, 'match', {
    value: R.match(QifEntry['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(QifEntryPrototype, 'constructor', {
    value: QifEntry,
    enumerable: false,
    writable: true,
    configurable: true,
})

QifEntry.prototype = QifEntryPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    account              : function () { return `QifEntry.Account(${R._toString(this.name)}, ${R._toString(this.type)}, ${R._toString(this.description)}, ${R._toString(this.creditLimit)})` },
    category             : function () { return `QifEntry.Category(${R._toString(this.name)}, ${R._toString(this.budgetAmount)}, ${R._toString(this.description)}, ${R._toString(this.excluded)}, ${R._toString(this.isIncomeCategory)}, ${R._toString(this.isTaxRelated)}, ${R._toString(this.taxSchedule)})` },
    class                : function () { return `QifEntry.Class(${R._toString(this.name)}, ${R._toString(this.subclass)}, ${R._toString(this.description)})` },
    payee                : function () { return `QifEntry.Payee(${R._toString(this.name)}, ${R._toString(this.address)}, ${R._toString(this.memo)}, ${R._toString(this.defaultCategory)})` },
    price                : function () { return `QifEntry.Price(${R._toString(this.symbol)}, ${R._toString(this.price)}, ${R._toString(this.date)})` },
    security             : function () { return `QifEntry.Security(${R._toString(this.name)}, ${R._toString(this.goal)}, ${R._toString(this.symbol)}, ${R._toString(this.type)})` },
    tag                  : function () { return `QifEntry.Tag(${R._toString(this.name)}, ${R._toString(this.color)}, ${R._toString(this.description)})` },
    transactionBank      : function () { return `QifEntry.TransactionBank(${R._toString(this.account)}, ${R._toString(this.amount)}, ${R._toString(this.date)}, ${R._toString(this.transactionType)}, ${R._toString(this.address)}, ${R._toString(this.category)}, ${R._toString(this.cleared)}, ${R._toString(this.memo)}, ${R._toString(this.number)}, ${R._toString(this.payee)}, ${R._toString(this.splits)})` },
    transactionInvestment: function () { return `QifEntry.TransactionInvestment(${R._toString(this.account)}, ${R._toString(this.date)}, ${R._toString(this.transactionType)}, ${R._toString(this.number)}, ${R._toString(this.address)}, ${R._toString(this.amount)}, ${R._toString(this.category)}, ${R._toString(this.cleared)}, ${R._toString(this.commission)}, ${R._toString(this.memo)}, ${R._toString(this.payee)}, ${R._toString(this.price)}, ${R._toString(this.quantity)}, ${R._toString(this.security)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    account              : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    category             : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    class                : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    payee                : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    price                : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    security             : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    tag                  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    transactionBank      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    transactionInvestment: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a QifEntry.Account instance
 * @sig Account :: (String, Type, String?, Number?) -> QifEntry.Account
 *     Type = /^(Bank|Cash|Credit Card|Investment|Mutual|Other Asset|Other Liability|Portfolio|401.k..403.b.)$/
 */
const AccountConstructor = function Account(name, type, description, creditLimit) {
    const constructorName = 'QifEntry.Account(name, type, description, creditLimit)'

    R.validateString(constructorName, 'name', false, name)
    R.validateRegex(
        constructorName,
        /^(Bank|Cash|Credit Card|Investment|Mutual|Other Asset|Other Liability|Portfolio|401.k..403.b.)$/,
        'type',
        false,
        type,
    )
    R.validateString(constructorName, 'description', true, description)
    R.validateNumber(constructorName, 'creditLimit', true, creditLimit)

    const result = Object.create(AccountPrototype)
    result.name = name
    result.type = type
    if (description != null) result.description = description
    if (creditLimit != null) result.creditLimit = creditLimit
    return result
}

QifEntry.Account = AccountConstructor

/*
 * Construct a QifEntry.Category instance
 * @sig Category :: (String, Number?, String?, Boolean?, Boolean?, Boolean?, String?) -> QifEntry.Category
 */
const CategoryConstructor = function Category(
    name,
    budgetAmount,
    description,
    excluded,
    isIncomeCategory,
    isTaxRelated,
    taxSchedule,
) {
    const constructorName =
        'QifEntry.Category(name, budgetAmount, description, excluded, isIncomeCategory, isTaxRelated, taxSchedule)'

    R.validateString(constructorName, 'name', false, name)
    R.validateNumber(constructorName, 'budgetAmount', true, budgetAmount)
    R.validateString(constructorName, 'description', true, description)
    R.validateBoolean(constructorName, 'excluded', true, excluded)
    R.validateBoolean(constructorName, 'isIncomeCategory', true, isIncomeCategory)
    R.validateBoolean(constructorName, 'isTaxRelated', true, isTaxRelated)
    R.validateString(constructorName, 'taxSchedule', true, taxSchedule)

    const result = Object.create(CategoryPrototype)
    result.name = name
    if (budgetAmount != null) result.budgetAmount = budgetAmount
    if (description != null) result.description = description
    if (excluded != null) result.excluded = excluded
    if (isIncomeCategory != null) result.isIncomeCategory = isIncomeCategory
    if (isTaxRelated != null) result.isTaxRelated = isTaxRelated
    if (taxSchedule != null) result.taxSchedule = taxSchedule
    return result
}

QifEntry.Category = CategoryConstructor

/*
 * Construct a QifEntry.Class instance
 * @sig Class :: (String, String?, String?) -> QifEntry.Class
 */
const ClassConstructor = function Class(name, subclass, description) {
    const constructorName = 'QifEntry.Class(name, subclass, description)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'subclass', true, subclass)
    R.validateString(constructorName, 'description', true, description)

    const result = Object.create(ClassPrototype)
    result.name = name
    if (subclass != null) result.subclass = subclass
    if (description != null) result.description = description
    return result
}

QifEntry.Class = ClassConstructor

/*
 * Construct a QifEntry.Payee instance
 * @sig Payee :: (String, [String]?, String?, String?) -> QifEntry.Payee
 */
const PayeeConstructor = function Payee(name, address, memo, defaultCategory) {
    const constructorName = 'QifEntry.Payee(name, address, memo, defaultCategory)'

    R.validateString(constructorName, 'name', false, name)
    R.validateArray(constructorName, 1, 'String', undefined, 'address', true, address)
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'defaultCategory', true, defaultCategory)

    const result = Object.create(PayeePrototype)
    result.name = name
    if (address != null) result.address = address
    if (memo != null) result.memo = memo
    if (defaultCategory != null) result.defaultCategory = defaultCategory
    return result
}

QifEntry.Payee = PayeeConstructor

/*
 * Construct a QifEntry.Price instance
 * @sig Price :: (String, Number, Object) -> QifEntry.Price
 */
const PriceConstructor = function Price(symbol, price, date) {
    const constructorName = 'QifEntry.Price(symbol, price, date)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'symbol', false, symbol)
    R.validateNumber(constructorName, 'price', false, price)
    R.validateObject(constructorName, 'date', false, date)

    const result = Object.create(PricePrototype)
    result.symbol = symbol
    result.price = price
    result.date = date
    return result
}

QifEntry.Price = PriceConstructor

/*
 * Construct a QifEntry.Security instance
 * @sig Security :: (String, String?, String?, String?) -> QifEntry.Security
 */
const SecurityConstructor = function Security(name, goal, symbol, type) {
    const constructorName = 'QifEntry.Security(name, goal, symbol, type)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'goal', true, goal)
    R.validateString(constructorName, 'symbol', true, symbol)
    R.validateString(constructorName, 'type', true, type)

    const result = Object.create(SecurityPrototype)
    result.name = name
    if (goal != null) result.goal = goal
    if (symbol != null) result.symbol = symbol
    if (type != null) result.type = type
    return result
}

QifEntry.Security = SecurityConstructor

/*
 * Construct a QifEntry.Tag instance
 * @sig Tag :: (String, String?, String?) -> QifEntry.Tag
 */
const TagConstructor = function Tag(name, color, description) {
    const constructorName = 'QifEntry.Tag(name, color, description)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'color', true, color)
    R.validateString(constructorName, 'description', true, description)

    const result = Object.create(TagPrototype)
    result.name = name
    if (color != null) result.color = color
    if (description != null) result.description = description
    return result
}

QifEntry.Tag = TagConstructor

/*
 * Construct a QifEntry.TransactionBank instance
 * @sig TransactionBank :: (String, Number, Object, TransactionType, [String]?, String?, String?, String?, String?, String?, [QifSplit]?) -> QifEntry.TransactionBank
 *     TransactionType = /^(Bank|Cash|Credit Card|Invoice|Other Asset|Other Liability)$/
 */
const TransactionBankConstructor = function TransactionBank(
    account,
    amount,
    date,
    transactionType,
    address,
    category,
    cleared,
    memo,
    number,
    payee,
    splits,
) {
    const constructorName =
        'QifEntry.TransactionBank(account, amount, date, transactionType, address, category, cleared, memo, number, payee, splits)'

    R.validateString(constructorName, 'account', false, account)
    R.validateNumber(constructorName, 'amount', false, amount)
    R.validateObject(constructorName, 'date', false, date)
    R.validateRegex(
        constructorName,
        /^(Bank|Cash|Credit Card|Invoice|Other Asset|Other Liability)$/,
        'transactionType',
        false,
        transactionType,
    )
    R.validateArray(constructorName, 1, 'String', undefined, 'address', true, address)
    R.validateString(constructorName, 'category', true, category)
    R.validateString(constructorName, 'cleared', true, cleared)
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'number', true, number)
    R.validateString(constructorName, 'payee', true, payee)
    R.validateArray(constructorName, 1, 'Tagged', 'QifSplit', 'splits', true, splits)

    const result = Object.create(TransactionBankPrototype)
    result.account = account
    result.amount = amount
    result.date = date
    result.transactionType = transactionType
    if (address != null) result.address = address
    if (category != null) result.category = category
    if (cleared != null) result.cleared = cleared
    if (memo != null) result.memo = memo
    if (number != null) result.number = number
    if (payee != null) result.payee = payee
    if (splits != null) result.splits = splits
    return result
}

QifEntry.TransactionBank = TransactionBankConstructor

/*
 * Construct a QifEntry.TransactionInvestment instance
 * @sig TransactionInvestment :: (String, Object, TransactionType, String?, [String]?, Number?, String?, String?, Number?, String?, String?, Number?, Number?, String?) -> QifEntry.TransactionInvestment
 *     TransactionType = /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|XIn|XOut|WithdrwX)$/
 */
const TransactionInvestmentConstructor = function TransactionInvestment(
    account,
    date,
    transactionType,
    number,
    address,
    amount,
    category,
    cleared,
    commission,
    memo,
    payee,
    price,
    quantity,
    security,
) {
    const constructorName =
        'QifEntry.TransactionInvestment(account, date, transactionType, number, address, amount, category, cleared, commission, memo, payee, price, quantity, security)'

    R.validateString(constructorName, 'account', false, account)
    R.validateObject(constructorName, 'date', false, date)
    R.validateRegex(
        constructorName,
        /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|XIn|XOut|WithdrwX)$/,
        'transactionType',
        false,
        transactionType,
    )
    R.validateString(constructorName, 'number', true, number)
    R.validateArray(constructorName, 1, 'String', undefined, 'address', true, address)
    R.validateNumber(constructorName, 'amount', true, amount)
    R.validateString(constructorName, 'category', true, category)
    R.validateString(constructorName, 'cleared', true, cleared)
    R.validateNumber(constructorName, 'commission', true, commission)
    R.validateString(constructorName, 'memo', true, memo)
    R.validateString(constructorName, 'payee', true, payee)
    R.validateNumber(constructorName, 'price', true, price)
    R.validateNumber(constructorName, 'quantity', true, quantity)
    R.validateString(constructorName, 'security', true, security)

    const result = Object.create(TransactionInvestmentPrototype)
    result.account = account
    result.date = date
    result.transactionType = transactionType
    if (number != null) result.number = number
    if (address != null) result.address = address
    if (amount != null) result.amount = amount
    if (category != null) result.category = category
    if (cleared != null) result.cleared = cleared
    if (commission != null) result.commission = commission
    if (memo != null) result.memo = memo
    if (payee != null) result.payee = payee
    if (price != null) result.price = price
    if (quantity != null) result.quantity = quantity
    if (security != null) result.security = security
    return result
}

QifEntry.TransactionInvestment = TransactionInvestmentConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const AccountPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Account', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.account, enumerable: false },
    toJSON: { value: toJSON.account, enumerable: false },
    constructor: { value: AccountConstructor, enumerable: false, writable: true, configurable: true },
})

const CategoryPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Category', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.category, enumerable: false },
    toJSON: { value: toJSON.category, enumerable: false },
    constructor: { value: CategoryConstructor, enumerable: false, writable: true, configurable: true },
})

const ClassPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Class', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.class, enumerable: false },
    toJSON: { value: toJSON.class, enumerable: false },
    constructor: { value: ClassConstructor, enumerable: false, writable: true, configurable: true },
})

const PayeePrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Payee', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.payee, enumerable: false },
    toJSON: { value: toJSON.payee, enumerable: false },
    constructor: { value: PayeeConstructor, enumerable: false, writable: true, configurable: true },
})

const PricePrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Price', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.price, enumerable: false },
    toJSON: { value: toJSON.price, enumerable: false },
    constructor: { value: PriceConstructor, enumerable: false, writable: true, configurable: true },
})

const SecurityPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Security', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.security, enumerable: false },
    toJSON: { value: toJSON.security, enumerable: false },
    constructor: { value: SecurityConstructor, enumerable: false, writable: true, configurable: true },
})

const TagPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'Tag', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.tag, enumerable: false },
    toJSON: { value: toJSON.tag, enumerable: false },
    constructor: { value: TagConstructor, enumerable: false, writable: true, configurable: true },
})

const TransactionBankPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'TransactionBank', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.transactionBank, enumerable: false },
    toJSON: { value: toJSON.transactionBank, enumerable: false },
    constructor: { value: TransactionBankConstructor, enumerable: false, writable: true, configurable: true },
})

const TransactionInvestmentPrototype = Object.create(QifEntryPrototype, {
    '@@tagName': { value: 'TransactionInvestment', enumerable: false },
    '@@typeName': { value: 'QifEntry', enumerable: false },
    toString: { value: toString.transactionInvestment, enumerable: false },
    toJSON: { value: toJSON.transactionInvestment, enumerable: false },
    constructor: { value: TransactionInvestmentConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
AccountConstructor.prototype = AccountPrototype
CategoryConstructor.prototype = CategoryPrototype
ClassConstructor.prototype = ClassPrototype
PayeeConstructor.prototype = PayeePrototype
PriceConstructor.prototype = PricePrototype
SecurityConstructor.prototype = SecurityPrototype
TagConstructor.prototype = TagPrototype
TransactionBankConstructor.prototype = TransactionBankPrototype
TransactionInvestmentConstructor.prototype = TransactionInvestmentPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
AccountConstructor.is = val => val && val.constructor === AccountConstructor
CategoryConstructor.is = val => val && val.constructor === CategoryConstructor
ClassConstructor.is = val => val && val.constructor === ClassConstructor
PayeeConstructor.is = val => val && val.constructor === PayeeConstructor
PriceConstructor.is = val => val && val.constructor === PriceConstructor
SecurityConstructor.is = val => val && val.constructor === SecurityConstructor
TagConstructor.is = val => val && val.constructor === TagConstructor
TransactionBankConstructor.is = val => val && val.constructor === TransactionBankConstructor
TransactionInvestmentConstructor.is = val => val && val.constructor === TransactionInvestmentConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
AccountConstructor.toString = () => 'QifEntry.Account'
CategoryConstructor.toString = () => 'QifEntry.Category'
ClassConstructor.toString = () => 'QifEntry.Class'
PayeeConstructor.toString = () => 'QifEntry.Payee'
PriceConstructor.toString = () => 'QifEntry.Price'
SecurityConstructor.toString = () => 'QifEntry.Security'
TagConstructor.toString = () => 'QifEntry.Tag'
TransactionBankConstructor.toString = () => 'QifEntry.TransactionBank'
TransactionInvestmentConstructor.toString = () => 'QifEntry.TransactionInvestment'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
AccountConstructor._from = _input => {
    const { name, type, description, creditLimit } = _input
    return QifEntry.Account(name, type, description, creditLimit)
}
CategoryConstructor._from = _input => {
    const { name, budgetAmount, description, excluded, isIncomeCategory, isTaxRelated, taxSchedule } = _input
    return QifEntry.Category(name, budgetAmount, description, excluded, isIncomeCategory, isTaxRelated, taxSchedule)
}
ClassConstructor._from = _input => {
    const { name, subclass, description } = _input
    return QifEntry.Class(name, subclass, description)
}
PayeeConstructor._from = _input => {
    const { name, address, memo, defaultCategory } = _input
    return QifEntry.Payee(name, address, memo, defaultCategory)
}
PriceConstructor._from = _input => {
    const { symbol, price, date } = _input
    return QifEntry.Price(symbol, price, date)
}
SecurityConstructor._from = _input => {
    const { name, goal, symbol, type } = _input
    return QifEntry.Security(name, goal, symbol, type)
}
TagConstructor._from = _input => {
    const { name, color, description } = _input
    return QifEntry.Tag(name, color, description)
}
TransactionBankConstructor._from = _input => {
    const { account, amount, date, transactionType, address, category, cleared, memo, number, payee, splits } = _input
    return QifEntry.TransactionBank(
        account,
        amount,
        date,
        transactionType,
        address,
        category,
        cleared,
        memo,
        number,
        payee,
        splits,
    )
}
TransactionInvestmentConstructor._from = _input => {
    const {
        account,
        date,
        transactionType,
        number,
        address,
        amount,
        category,
        cleared,
        commission,
        memo,
        payee,
        price,
        quantity,
        security,
    } = _input
    return QifEntry.TransactionInvestment(
        account,
        date,
        transactionType,
        number,
        address,
        amount,
        category,
        cleared,
        commission,
        memo,
        payee,
        price,
        quantity,
        security,
    )
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
AccountConstructor.from = AccountConstructor._from
CategoryConstructor.from = CategoryConstructor._from
ClassConstructor.from = ClassConstructor._from
PayeeConstructor.from = PayeeConstructor._from
PriceConstructor.from = PriceConstructor._from
SecurityConstructor.from = SecurityConstructor._from
TagConstructor.from = TagConstructor._from
TransactionBankConstructor.from = TransactionBankConstructor._from
TransactionInvestmentConstructor.from = TransactionInvestmentConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

AccountConstructor.toFirestore = o => ({ ...o })
AccountConstructor.fromFirestore = AccountConstructor._from

CategoryConstructor.toFirestore = o => ({ ...o })
CategoryConstructor.fromFirestore = CategoryConstructor._from

ClassConstructor.toFirestore = o => ({ ...o })
ClassConstructor.fromFirestore = ClassConstructor._from

PayeeConstructor.toFirestore = o => ({ ...o })
PayeeConstructor.fromFirestore = PayeeConstructor._from

PriceConstructor.toFirestore = o => ({ ...o })
PriceConstructor.fromFirestore = PriceConstructor._from

SecurityConstructor.toFirestore = o => ({ ...o })
SecurityConstructor.fromFirestore = SecurityConstructor._from

TagConstructor.toFirestore = o => ({ ...o })
TagConstructor.fromFirestore = TagConstructor._from

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (TransactionBank, Function) -> Object
 */
TransactionBankConstructor._toFirestore = (o, encodeTimestamps) => {
    const { account, amount, date, transactionType, address, category, cleared, memo, number, payee, splits } = o
    return {
        account: account,
        amount: amount,
        date: date,
        transactionType: transactionType,
        address: address,
        category: category,
        cleared: cleared,
        memo: memo,
        number: number,
        payee: payee,
        splits: splits.map(item1 => QifSplit.toFirestore(item1, encodeTimestamps)),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> TransactionBank
 */
TransactionBankConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { account, amount, date, transactionType, address, category, cleared, memo, number, payee, splits } = doc
    return TransactionBankConstructor._from({
        account: account,
        amount: amount,
        date: date,
        transactionType: transactionType,
        address: address,
        category: category,
        cleared: cleared,
        memo: memo,
        number: number,
        payee: payee,
        splits: splits.map(item1 =>
            QifSplit.fromFirestore ? QifSplit.fromFirestore(item1, decodeTimestamps) : QifSplit.from(item1),
        ),
    })
}

// Public aliases (can be overridden)
TransactionBankConstructor.toFirestore = TransactionBankConstructor._toFirestore
TransactionBankConstructor.fromFirestore = TransactionBankConstructor._fromFirestore

TransactionInvestmentConstructor.toFirestore = o => ({ ...o })
TransactionInvestmentConstructor.fromFirestore = TransactionInvestmentConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a QifEntry instance
 * @sig is :: Any -> Boolean
 */
QifEntry.is = v => {
    const { Account, Category, Class, Payee, Price, Security, Tag, TransactionBank, TransactionInvestment } = QifEntry
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Account ||
        constructor === Category ||
        constructor === Class ||
        constructor === Payee ||
        constructor === Price ||
        constructor === Security ||
        constructor === Tag ||
        constructor === TransactionBank ||
        constructor === TransactionInvestment
    )
}

/**
 * Serialize QifEntry to Firestore format
 * @sig _toFirestore :: (QifEntry, Function) -> Object
 */
QifEntry._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = QifEntry[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize QifEntry from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> QifEntry
 */
QifEntry._fromFirestore = (doc, decodeTimestamps) => {
    const { Account, Category, Class, Payee, Price, Security, Tag, TransactionBank, TransactionInvestment } = QifEntry
    const tagName = doc['@@tagName']
    if (tagName === 'Account') return Account.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Category') return Category.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Class') return Class.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Payee') return Payee.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Price') return Price.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Security') return Security.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Tag') return Tag.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'TransactionBank') return TransactionBank.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'TransactionInvestment') return TransactionInvestment.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized QifEntry variant: ${tagName}`)
}

// Public aliases (can be overridden)
QifEntry.toFirestore = QifEntry._toFirestore
QifEntry.fromFirestore = QifEntry._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QifEntry }
