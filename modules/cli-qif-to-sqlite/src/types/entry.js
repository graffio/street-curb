/*  Entry generated from: modules/cli-qif-to-sqlite/type-definitions/entry.type.js
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
 *      splits         : "[Split]?"
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
import { Split } from './split.js'

// -------------------------------------------------------------------------------------------------------------
//
// Entry constructor
//
// -------------------------------------------------------------------------------------------------------------
const Entry = {
    toString: () => 'Entry',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === Entry.Account ||
            constructor === Entry.Category ||
            constructor === Entry.Class ||
            constructor === Entry.Payee ||
            constructor === Entry.Price ||
            constructor === Entry.Security ||
            constructor === Entry.Tag ||
            constructor === Entry.TransactionBank ||
            constructor === Entry.TransactionInvestment
        )
    },
}

// Add hidden properties
Object.defineProperty(Entry, '@@typeName', { value: 'Entry', enumerable: false })
Object.defineProperty(Entry, '@@tagNames', {
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
const EntryPrototype = {}

Object.defineProperty(EntryPrototype, 'match', {
    value: R.match(Entry['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(EntryPrototype, 'constructor', {
    value: Entry,
    enumerable: false,
    writable: true,
    configurable: true,
})

Entry.prototype = EntryPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Account
//
// -------------------------------------------------------------------------------------------------------------
const AccountConstructor = function Account(name, type, description, creditLimit) {
    const constructorName = 'Entry.Account(name, type, description, creditLimit)'

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

Entry.Account = AccountConstructor

const AccountPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Account', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Account(${R._toString(this.name)}, ${R._toString(this.type)}, ${R._toString(this.description)}, ${R._toString(this.creditLimit)})`
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
        value: AccountConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

AccountConstructor.prototype = AccountPrototype
AccountConstructor.is = val => val && val.constructor === AccountConstructor
AccountConstructor.toString = () => 'Entry.Account'
AccountConstructor._from = o => Entry.Account(o.name, o.type, o.description, o.creditLimit)
AccountConstructor.from = AccountConstructor._from

AccountConstructor.toFirestore = o => ({ ...o })
AccountConstructor.fromFirestore = AccountConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Category
//
// -------------------------------------------------------------------------------------------------------------
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
        'Entry.Category(name, budgetAmount, description, excluded, isIncomeCategory, isTaxRelated, taxSchedule)'

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

Entry.Category = CategoryConstructor

const CategoryPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Category', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Category(${R._toString(this.name)}, ${R._toString(this.budgetAmount)}, ${R._toString(this.description)}, ${R._toString(this.excluded)}, ${R._toString(this.isIncomeCategory)}, ${R._toString(this.isTaxRelated)}, ${R._toString(this.taxSchedule)})`
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
        value: CategoryConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

CategoryConstructor.prototype = CategoryPrototype
CategoryConstructor.is = val => val && val.constructor === CategoryConstructor
CategoryConstructor.toString = () => 'Entry.Category'
CategoryConstructor._from = o =>
    Entry.Category(o.name, o.budgetAmount, o.description, o.excluded, o.isIncomeCategory, o.isTaxRelated, o.taxSchedule)
CategoryConstructor.from = CategoryConstructor._from

CategoryConstructor.toFirestore = o => ({ ...o })
CategoryConstructor.fromFirestore = CategoryConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Class
//
// -------------------------------------------------------------------------------------------------------------
const ClassConstructor = function Class(name, subclass, description) {
    const constructorName = 'Entry.Class(name, subclass, description)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'subclass', true, subclass)
    R.validateString(constructorName, 'description', true, description)

    const result = Object.create(ClassPrototype)
    result.name = name
    if (subclass != null) result.subclass = subclass
    if (description != null) result.description = description
    return result
}

Entry.Class = ClassConstructor

const ClassPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Class', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Class(${R._toString(this.name)}, ${R._toString(this.subclass)}, ${R._toString(this.description)})`
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
        value: ClassConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ClassConstructor.prototype = ClassPrototype
ClassConstructor.is = val => val && val.constructor === ClassConstructor
ClassConstructor.toString = () => 'Entry.Class'
ClassConstructor._from = o => Entry.Class(o.name, o.subclass, o.description)
ClassConstructor.from = ClassConstructor._from

ClassConstructor.toFirestore = o => ({ ...o })
ClassConstructor.fromFirestore = ClassConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Payee
//
// -------------------------------------------------------------------------------------------------------------
const PayeeConstructor = function Payee(name, address, memo, defaultCategory) {
    const constructorName = 'Entry.Payee(name, address, memo, defaultCategory)'

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

Entry.Payee = PayeeConstructor

const PayeePrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Payee', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Payee(${R._toString(this.name)}, ${R._toString(this.address)}, ${R._toString(this.memo)}, ${R._toString(this.defaultCategory)})`
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
        value: PayeeConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

PayeeConstructor.prototype = PayeePrototype
PayeeConstructor.is = val => val && val.constructor === PayeeConstructor
PayeeConstructor.toString = () => 'Entry.Payee'
PayeeConstructor._from = o => Entry.Payee(o.name, o.address, o.memo, o.defaultCategory)
PayeeConstructor.from = PayeeConstructor._from

PayeeConstructor.toFirestore = o => ({ ...o })
PayeeConstructor.fromFirestore = PayeeConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Price
//
// -------------------------------------------------------------------------------------------------------------
const PriceConstructor = function Price(symbol, price, date) {
    const constructorName = 'Entry.Price(symbol, price, date)'
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

Entry.Price = PriceConstructor

const PricePrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Price', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Price(${R._toString(this.symbol)}, ${R._toString(this.price)}, ${R._toString(this.date)})`
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
        value: PriceConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

PriceConstructor.prototype = PricePrototype
PriceConstructor.is = val => val && val.constructor === PriceConstructor
PriceConstructor.toString = () => 'Entry.Price'
PriceConstructor._from = o => Entry.Price(o.symbol, o.price, o.date)
PriceConstructor.from = PriceConstructor._from

PriceConstructor.toFirestore = o => ({ ...o })
PriceConstructor.fromFirestore = PriceConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Security
//
// -------------------------------------------------------------------------------------------------------------
const SecurityConstructor = function Security(name, goal, symbol, type) {
    const constructorName = 'Entry.Security(name, goal, symbol, type)'

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

Entry.Security = SecurityConstructor

const SecurityPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Security', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Security(${R._toString(this.name)}, ${R._toString(this.goal)}, ${R._toString(this.symbol)}, ${R._toString(this.type)})`
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
        value: SecurityConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

SecurityConstructor.prototype = SecurityPrototype
SecurityConstructor.is = val => val && val.constructor === SecurityConstructor
SecurityConstructor.toString = () => 'Entry.Security'
SecurityConstructor._from = o => Entry.Security(o.name, o.goal, o.symbol, o.type)
SecurityConstructor.from = SecurityConstructor._from

SecurityConstructor.toFirestore = o => ({ ...o })
SecurityConstructor.fromFirestore = SecurityConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.Tag
//
// -------------------------------------------------------------------------------------------------------------
const TagConstructor = function Tag(name, color, description) {
    const constructorName = 'Entry.Tag(name, color, description)'

    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'color', true, color)
    R.validateString(constructorName, 'description', true, description)

    const result = Object.create(TagPrototype)
    result.name = name
    if (color != null) result.color = color
    if (description != null) result.description = description
    return result
}

Entry.Tag = TagConstructor

const TagPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'Tag', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.Tag(${R._toString(this.name)}, ${R._toString(this.color)}, ${R._toString(this.description)})`
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
        value: TagConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

TagConstructor.prototype = TagPrototype
TagConstructor.is = val => val && val.constructor === TagConstructor
TagConstructor.toString = () => 'Entry.Tag'
TagConstructor._from = o => Entry.Tag(o.name, o.color, o.description)
TagConstructor.from = TagConstructor._from

TagConstructor.toFirestore = o => ({ ...o })
TagConstructor.fromFirestore = TagConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.TransactionBank
//
// -------------------------------------------------------------------------------------------------------------
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
        'Entry.TransactionBank(account, amount, date, transactionType, address, category, cleared, memo, number, payee, splits)'

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
    R.validateArray(constructorName, 1, 'Tagged', 'Split', 'splits', true, splits)

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

Entry.TransactionBank = TransactionBankConstructor

const TransactionBankPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'TransactionBank', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.TransactionBank(${R._toString(this.account)}, ${R._toString(this.amount)}, ${R._toString(this.date)}, ${R._toString(this.transactionType)}, ${R._toString(this.address)}, ${R._toString(this.category)}, ${R._toString(this.cleared)}, ${R._toString(this.memo)}, ${R._toString(this.number)}, ${R._toString(this.payee)}, ${R._toString(this.splits)})`
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
        value: TransactionBankConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

TransactionBankConstructor.prototype = TransactionBankPrototype
TransactionBankConstructor.is = val => val && val.constructor === TransactionBankConstructor
TransactionBankConstructor.toString = () => 'Entry.TransactionBank'
TransactionBankConstructor._from = o =>
    Entry.TransactionBank(
        o.account,
        o.amount,
        o.date,
        o.transactionType,
        o.address,
        o.category,
        o.cleared,
        o.memo,
        o.number,
        o.payee,
        o.splits,
    )
TransactionBankConstructor.from = TransactionBankConstructor._from

TransactionBankConstructor._toFirestore = (o, encodeTimestamps) => ({
    account: o.account,
    amount: o.amount,
    date: o.date,
    transactionType: o.transactionType,
    address: o.address,
    category: o.category,
    cleared: o.cleared,
    memo: o.memo,
    number: o.number,
    payee: o.payee,
    splits: o.splits.map(item1 => Split.toFirestore(item1, encodeTimestamps)),
})

TransactionBankConstructor._fromFirestore = (doc, decodeTimestamps) =>
    TransactionBankConstructor._from({
        account: doc.account,
        amount: doc.amount,
        date: doc.date,
        transactionType: doc.transactionType,
        address: doc.address,
        category: doc.category,
        cleared: doc.cleared,
        memo: doc.memo,
        number: doc.number,
        payee: doc.payee,
        splits: doc.splits.map(item1 =>
            Split.fromFirestore ? Split.fromFirestore(item1, decodeTimestamps) : Split.from(item1),
        ),
    })

// Public aliases (can be overridden)
TransactionBankConstructor.toFirestore = TransactionBankConstructor._toFirestore
TransactionBankConstructor.fromFirestore = TransactionBankConstructor._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Variant Entry.TransactionInvestment
//
// -------------------------------------------------------------------------------------------------------------
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
        'Entry.TransactionInvestment(account, date, transactionType, number, address, amount, category, cleared, commission, memo, payee, price, quantity, security)'

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

Entry.TransactionInvestment = TransactionInvestmentConstructor

const TransactionInvestmentPrototype = Object.create(EntryPrototype, {
    '@@tagName': { value: 'TransactionInvestment', enumerable: false },
    '@@typeName': { value: 'Entry', enumerable: false },

    toString: {
        value: function () {
            return `Entry.TransactionInvestment(${R._toString(this.account)}, ${R._toString(this.date)}, ${R._toString(this.transactionType)}, ${R._toString(this.number)}, ${R._toString(this.address)}, ${R._toString(this.amount)}, ${R._toString(this.category)}, ${R._toString(this.cleared)}, ${R._toString(this.commission)}, ${R._toString(this.memo)}, ${R._toString(this.payee)}, ${R._toString(this.price)}, ${R._toString(this.quantity)}, ${R._toString(this.security)})`
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
        value: TransactionInvestmentConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

TransactionInvestmentConstructor.prototype = TransactionInvestmentPrototype
TransactionInvestmentConstructor.is = val => val && val.constructor === TransactionInvestmentConstructor
TransactionInvestmentConstructor.toString = () => 'Entry.TransactionInvestment'
TransactionInvestmentConstructor._from = o =>
    Entry.TransactionInvestment(
        o.account,
        o.date,
        o.transactionType,
        o.number,
        o.address,
        o.amount,
        o.category,
        o.cleared,
        o.commission,
        o.memo,
        o.payee,
        o.price,
        o.quantity,
        o.security,
    )
TransactionInvestmentConstructor.from = TransactionInvestmentConstructor._from

TransactionInvestmentConstructor.toFirestore = o => ({ ...o })
TransactionInvestmentConstructor.fromFirestore = TransactionInvestmentConstructor._from

Entry._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = Entry[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

Entry._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Account') return Entry.Account.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Category') return Entry.Category.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Class') return Entry.Class.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Payee') return Entry.Payee.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Price') return Entry.Price.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Security') return Entry.Security.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Tag') return Entry.Tag.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'TransactionBank') return Entry.TransactionBank.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'TransactionInvestment') return Entry.TransactionInvestment.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized Entry variant: ${tagName}`)
}

// Public aliases (can be overridden)
Entry.toFirestore = Entry._toFirestore
Entry.fromFirestore = Entry._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Entry }
