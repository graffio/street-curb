// ABOUTME: Converts QIF line groups into typed Entry objects
// ABOUTME: Handles parsing and normalization of accounts, transactions, securities, etc.

import { append, assoc, update } from '@graffio/functional'
import { QifEntry, QifSplit } from './types/index.js'

// prettier-ignore
const ACCOUNT_TYPES = {
    Bank            : 'Bank',
    Cash            : 'Cash',
    CCard           : 'Credit Card',
    Invst           : 'Investment',
    'Oth A'         : 'Other Asset',
    'Oth L'         : 'Other Liability',
    Mutual          : 'Investment',
    Port            : 'Investment',
    '401(k)/403(b)' : 'Investment',
}

const SALES_TYPES = ['Sell', 'SellX', 'ShtSell']
const OUTFLOW_ACTIONS = ['Buy', 'BuyX', 'CvrShrt', 'MargInt', 'MiscExp', 'WithdrwX', 'XOut']
const ZERO_CASH_ACTIONS = ['ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvSh', 'StkSplit', 'ShrsIn', 'ShrsOut']

const T = {
    // Parses amounts including fractional values like "543 3/4"
    // @sig parseAmount :: String -> Number
    parseAmount: value => {
        const cleaned = value.replace(/,/g, '').trim()
        const fractionMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/)
        if (fractionMatch) {
            const [, whole, numerator, denominator] = fractionMatch
            return parseInt(whole) + parseInt(numerator) / parseInt(denominator)
        }
        return parseFloat(cleaned)
    },

    // Converts date string to UTC Date, handling Quicken's wacky formats like " 3/15'97"
    // @sig standardizeDate :: String -> Date
    standardizeDate: dateString => {
        const to2Digits = s => s.trim().padStart(2, '0')
        if (dateString.match(/\d{2}\/\d{2}\/\d{4}/)) return new Date(dateString)
        const parts = dateString.match(/^([0-9 ][0-9]?).([0-9 ][0-9]?).([0-9 ][0-9]?)$/)
        const [, day, month, year] = parts
        return new Date(`${to2Digits(day)}/${to2Digits(month)}/${to2Digits(year)}`)
    },

    // Reducer for account line groups
    // @sig accountReducer :: ({k:v}, String) -> {k:v}
    accountReducer: (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'L') return assoc('creditLimit', T.parseAmount(value), acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'T') return assoc('type', ACCOUNT_TYPES[value] || value, acc)
        return acc
    },

    // Reducer for category line groups
    // @sig categoryReducer :: ({k:v}, String) -> {k:v}
    categoryReducer: (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'B') return assoc('budgetAmount', T.parseAmount(value), acc)
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'E') return assoc('excluded', true, acc)
        if (key === 'I') return assoc('isIncomeCategory', true, acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'R') return assoc('taxSchedule', value, acc)
        if (key === 'T') return assoc('isTaxRelated', true, acc)
        return acc
    },

    // Reducer for class line groups
    // @sig classReducer :: ({k:v}, String) -> {k:v}
    classReducer: (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'C') return assoc('subclass', value, acc)
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        return acc
    },

    // Reducer for payee line groups
    // @sig payeeReducer :: ({k:v}, String) -> {k:v}
    payeeReducer: (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
        if (key === 'M') return assoc('memo', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'T') return assoc('defaultCategory', value, acc)
        return acc
    },

    // Reducer for security line groups
    // @sig securityReducer :: ({k:v}, String) -> {k:v}
    securityReducer: (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'G') return assoc('goal', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'S') return assoc('symbol', value, acc)
        if (key === 'T') return assoc('type', value, acc)
        return acc
    },

    // Reducer for tag line groups
    // @sig tagReducer :: ({k:v}, String) -> {k:v}
    tagReducer: (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'C') return assoc('color', value, acc)
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        return acc
    },

    // Reducer for investment transaction line groups
    // @sig transactionInvestmentReducer :: ({k:v}, String) -> {k:v}
    transactionInvestmentReducer: (acc, line) => {
        const processQuantity = value => (acc.type === 'StkSplit' ? T.parseAmount(value) / 10 : T.parseAmount(value))
        const [key, value] = [line[0], line.slice(1)]
        if (key === '$') return acc
        if (key === '#') return assoc('number', value, acc)
        if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
        if (key === 'C') return assoc('cleared', value, acc)
        if (key === 'D') return assoc('date', T.standardizeDate(value), acc)
        if (key === 'I') return assoc('price', T.parseAmount(value), acc)
        if (key === 'K') return assoc('transactionType', value, acc)
        if (key === 'L') return assoc('category', value, acc)
        if (key === 'M') return assoc('memo', value, acc)
        if (key === 'N') return assoc('transactionType', value, acc)
        if (key === 'O') return assoc('commission', T.parseAmount(value), acc)
        if (key === 'P') return assoc('payee', value, acc)
        if (key === 'Q') return assoc('quantity', processQuantity(value), acc)
        if (key === 'T') return assoc('amount', T.parseAmount(value), acc)
        if (key === 'U') return assoc('amount', T.parseAmount(value), acc)
        if (key === 'Y') return assoc('security', value, acc)
        return acc
    },

    // Reducer for bank transaction line groups, handles splits
    // @sig transactionBankReducer :: ({k:v}, String) -> {k:v}
    transactionBankReducer: (acc, line) => {
        const assocAt = (index, field, value, a) => update(index, assoc(field, value, a[index]), a)
        const startSplit = value => append({ categoryName: value }, acc.splits || [])
        const addMemoToSplit = value => assocAt(acc.splits.length - 1, 'memo', value, acc.splits)

        const endSplit = value => {
            const index = acc.splits.length - 1
            const { categoryName, memo } = acc.splits[index]
            return update(index, QifSplit(T.parseAmount(value), categoryName, memo), acc.splits)
        }
        const [key, value] = [line[0], line.slice(1)]
        if (key === '$') return assoc('splits', endSplit(value), acc)
        if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
        if (key === 'C') return assoc('cleared', value, acc)
        if (key === 'D') return assoc('date', T.standardizeDate(value), acc)
        if (key === 'E') return assoc('splits', addMemoToSplit(value), acc)
        if (key === 'L') return assoc('category', value, acc)
        if (key === 'M') return assoc('memo', value, acc)
        if (key === 'N') return assoc('number', value, acc)
        if (key === 'P') return assoc('payee', value, acc)
        if (key === 'S') return assoc('splits', startSplit(value), acc)
        if (key === 'T') return assoc('amount', T.parseAmount(value), acc)
        if (key === 'U') return assoc('amount', T.parseAmount(value), acc)
        return acc
    },

    // Calculates amount from price × quantity when not provided
    // @sig calculateAmount :: Object -> Number
    calculateAmount: data => {
        const { commission, price, quantity, transactionType } = data
        const proceeds = price * quantity
        const comm = commission ?? 0
        return SALES_TYPES.includes(transactionType) ? proceeds - comm : proceeds + comm
    },

    // Normalizes amount sign: negative for outflows, null for reinvestments
    // @sig normalizeAmountSign :: Object -> Number|null
    normalizeAmountSign: data => {
        const { amount, transactionType } = data
        if (amount == null) return null
        if (ZERO_CASH_ACTIONS.includes(transactionType)) return null
        return OUTFLOW_ACTIONS.includes(transactionType) ? -Math.abs(amount) : amount
    },
}

const F = {
    // Creates account object from line group
    // @sig createAccount :: LineGroup -> Object
    createAccount: lineGroup => V.validateLineGroup('DLNT', lineGroup).reduce(T.accountReducer, {}),

    // Creates category object from line group
    // @sig createCategory :: LineGroup -> Object
    createCategory: lineGroup => V.validateLineGroup('BCDEINRT', lineGroup).reduce(T.categoryReducer, {}),

    // Creates class object from line group
    // @sig createClass :: LineGroup -> Object
    createClass: lineGroup => V.validateLineGroup('CDN', lineGroup).reduce(T.classReducer, {}),

    // Creates payee object from line group
    // @sig createPayee :: LineGroup -> Object
    createPayee: lineGroup => V.validateLineGroup('AMNT', lineGroup).reduce(T.payeeReducer, {}),

    // Creates tag object from line group
    // @sig createTag :: LineGroup -> Object
    createTag: lineGroup => V.validateLineGroup('CDN', lineGroup).reduce(T.tagReducer, {}),

    // Creates security object from line group
    // @sig createSecurity :: LineGroup -> Object
    createSecurity: lineGroup => V.validateLineGroup('GNST', lineGroup).reduce(T.securityReducer, {}),

    // Creates bank transaction with account context
    // @sig createTransactionBank :: (LineGroup, Account, String) -> Object
    createTransactionBank: (lineGroup, currentAccount, transactionType) => {
        const account = currentAccount?.name
        if (!account) throw new Error('No current account')
        const initial = { account, transactionType }
        return V.validateLineGroup('$ACDELMNPSTU', lineGroup).reduce(T.transactionBankReducer, initial)
    },

    // Parses price quotes from CSV-formatted line group
    // @sig createPrices :: LineGroup -> [QifEntry.Price]
    createPrices: lineGroup => {
        const toPrice = line => {
            const [symbol, priceValue, date] = line.split(',').map(v => v.trim().replace(/"/g, ''))
            if (!priceValue) return null
            return QifEntry.Price.from({ symbol, price: T.parseAmount(priceValue), date: T.standardizeDate(date) })
        }
        return lineGroup.map(toPrice).filter(p => p?.price)
    },

    // Creates investment transaction, normalizing amount signs
    // @sig createTransactionInvestment :: (LineGroup, Account) -> Object
    createTransactionInvestment: (lineGroup, currentAccount) => {
        const account = currentAccount?.name
        if (!account) throw new Error('No current account')
        const data = V.validateLineGroup('#$ACDIKLMNOPQTUY', lineGroup).reduce(T.transactionInvestmentReducer, {
            account,
        })
        const { amount, price, quantity } = data
        if (amount === undefined && price && quantity) data.amount = T.calculateAmount(data)
        data.amount = T.normalizeAmountSign(data)
        return data
    },
}

const V = {
    // Validates that each row in the lineGroup starts with an allowed key
    // @sig validateLineGroup :: (String, LineGroup) -> LineGroup
    validateLineGroup: (allowedKeys, lineGroup) => {
        const warnOnUnknownKey = line => {
            const key = line[0]
            if (!allowedKeys.includes(key)) console.error(`Don't understand key ${key} for ${lineGroup}`)
        }
        lineGroup.forEach(warnOnUnknownKey)
        return lineGroup
    },
}

/*
 * Convert a LineGroup pulled from a QIF file to an Entry. QIF is tricky, so the code is too.
 *
 * Context = Account | Bank | Cash | Category | CreditCard | Investment | Invoice
 *         | Memorized | OtherAsset | OtherLiability | Prices | Security | Tag
 * LineGroup = [String]
 * @sig lineGroupToEntry :: (Context, Entry.Account, LineGroup) -> Entry
 */
// prettier-ignore
const lineGroupToEntry = (currentContext, currentAccount, lineGroup) => {
    const bankTx = type => QifEntry.TransactionBank.from(F.createTransactionBank(lineGroup, currentAccount, type))
    const { Account, Category, Class, Payee, Security, Tag, TransactionInvestment: TxI } = QifEntry

    if (currentContext === 'Account')         return Account.from(F.createAccount(lineGroup))
    if (currentContext === 'Bank')            return bankTx('Bank')
    if (currentContext === 'Cash')            return bankTx('Cash')
    if (currentContext === 'Category')        return Category.from(F.createCategory(lineGroup))
    if (currentContext === 'Class')           return Class.from(F.createClass(lineGroup))
    if (currentContext === 'Credit Card')     return bankTx('Credit Card')
    if (currentContext === 'Investment')      return TxI.from(F.createTransactionInvestment(lineGroup, currentAccount))
    if (currentContext === 'Invoice')         return bankTx('Invoice')
    if (currentContext === 'Memorized')       return
    if (currentContext === 'Other Asset')     return bankTx('Other Asset')
    if (currentContext === 'Other Liability') return bankTx('Other Liability')
    if (currentContext === 'Payees')          return Payee.from(F.createPayee(lineGroup))
    if (currentContext === 'Prices')          return F.createPrices(lineGroup)
    if (currentContext === 'Security')        return Security.from(F.createSecurity(lineGroup))
    if (currentContext === 'Tag')             return Tag.from(F.createTag(lineGroup))
}

const LineGroupToEntry = { lineGroupToEntry }
export { LineGroupToEntry }
