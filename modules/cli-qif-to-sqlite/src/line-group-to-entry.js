// ABOUTME: Converts QIF line groups into typed Entry objects
// ABOUTME: Handles parsing and normalization of accounts, transactions, securities, etc.

import { append, assoc, update } from '@graffio/functional'
import { Entry, Split } from './types/index.js'

/*
 * Convert a LineGroup pulled from a QIF file to an Entry. QIF is tricky, so the code is too.
 *
 * Context = Account | Bank | Cash | Category | CreditCard | Investment | Invoice
 *         | Memorized | OtherAsset | OtherLiability | Prices | Security | Tag
 * LineGroup = [String]
 * @sig lineGroupToEntry :: (Context, Entry.Account, LineGroup) -> Entry
 */
const lineGroupToEntry = (currentContext, currentAccount, lineGroup) => {
    // Validates that each row in the lineGroup starts with an allowed key
    // @sig validateLineGroup :: (String, LineGroup) -> LineGroup
    const validateLineGroup = (allowedKeys, lg) => {
        const warnOnUnknownKey = line => {
            const key = line[0]
            if (!allowedKeys.includes(key)) console.error(`Don't understand key ${key} for ${lg}`)
        }
        lg.forEach(warnOnUnknownKey)
        return lg
    }

    // Parses fractional amounts like "543 3/4"
    // @sig parseAmount :: String -> Number
    const parseAmount = value => {
        const cleaned = value.replace(/,/g, '').trim()
        const fractionMatch = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/)
        if (fractionMatch) {
            const [, whole, numerator, denominator] = fractionMatch
            return parseInt(whole) + parseInt(numerator) / parseInt(denominator)
        }
        return parseFloat(cleaned)
    }

    // Converts date string to UTC Date, handling Quicken's wacky formats like " 3/15'97"
    // @sig standardizeDate :: String -> Date
    const standardizeDate = dateString => {
        const to2Digits = s => s.trim().padStart(2, '0')
        if (dateString.match(/\d{2}\/\d{2}\/\d{4}/)) return new Date(dateString)
        const parts = dateString.match(/^([0-9 ][0-9]?).([0-9 ][0-9]?).([0-9 ][0-9]?)$/)
        const [, day, month, year] = parts
        return new Date(`${to2Digits(day)}/${to2Digits(month)}/${to2Digits(year)}`)
    }

    // Reducer for account line groups
    // @sig accountReducer :: ({k:v}, String) -> {k:v}
    const accountReducer = (acc, line) => {
        const AccountTypes = {
            Bank: 'Bank',
            Cash: 'Cash',
            CCard: 'Credit Card',
            Invst: 'Investment',
            'Oth A': 'Other Asset',
            'Oth L': 'Other Liability',
            Mutual: 'Investment',
            Port: 'Investment',
            '401(k)/403(b)': 'Investment',
        }
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'L') return assoc('creditLimit', parseAmount(value), acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'T') return assoc('type', AccountTypes[value] || value, acc)
        return acc
    }

    // Reducer for category line groups
    // @sig categoryReducer :: ({k:v}, String) -> {k:v}
    const categoryReducer = (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'B') return assoc('budgetAmount', parseAmount(value), acc)
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'E') return assoc('excluded', true, acc)
        if (key === 'I') return assoc('isIncomeCategory', true, acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'R') return assoc('taxSchedule', value, acc)
        if (key === 'T') return assoc('isTaxRelated', true, acc)
        return acc
    }

    // Reducer for class line groups
    // @sig classReducer :: ({k:v}, String) -> {k:v}
    const classReducer = (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'C') return assoc('subclass', value, acc)
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        return acc
    }

    // Reducer for payee line groups
    // @sig payeeReducer :: ({k:v}, String) -> {k:v}
    const payeeReducer = (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
        if (key === 'M') return assoc('memo', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'T') return assoc('defaultCategory', value, acc)
        return acc
    }

    // Reducer for security line groups
    // @sig securityReducer :: ({k:v}, String) -> {k:v}
    const securityReducer = (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'G') return assoc('goal', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        if (key === 'S') return assoc('symbol', value, acc)
        if (key === 'T') return assoc('type', value, acc)
        return acc
    }

    // Reducer for tag line groups
    // @sig tagReducer :: ({k:v}, String) -> {k:v}
    const tagReducer = (acc, line) => {
        const [key, value] = [line[0], line.slice(1)]
        if (key === 'C') return assoc('color', value, acc)
        if (key === 'D') return assoc('description', value, acc)
        if (key === 'N') return assoc('name', value, acc)
        return acc
    }

    // Reducer for investment transaction line groups
    // @sig transactionInvestmentReducer :: ({k:v}, String) -> {k:v}
    const transactionInvestmentReducer = (acc, line) => {
        const processQuantity = value => (acc.type === 'StkSplit' ? parseAmount(value) / 10 : parseAmount(value))
        const [key, value] = [line[0], line.slice(1)]
        if (key === '$') return acc
        if (key === '#') return assoc('number', value, acc)
        if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
        if (key === 'C') return assoc('cleared', value, acc)
        if (key === 'D') return assoc('date', standardizeDate(value), acc)
        if (key === 'I') return assoc('price', parseAmount(value), acc)
        if (key === 'K') return assoc('transactionType', value, acc)
        if (key === 'L') return assoc('category', value, acc)
        if (key === 'M') return assoc('memo', value, acc)
        if (key === 'N') return assoc('transactionType', value, acc)
        if (key === 'O') return assoc('commission', parseAmount(value), acc)
        if (key === 'P') return assoc('payee', value, acc)
        if (key === 'Q') return assoc('quantity', processQuantity(value), acc)
        if (key === 'T') return assoc('amount', parseAmount(value), acc)
        if (key === 'U') return assoc('amount', parseAmount(value), acc)
        if (key === 'Y') return assoc('security', value, acc)
        return acc
    }

    // Reducer for bank transaction line groups, handles splits
    // @sig transactionBankReducer :: ({k:v}, String) -> {k:v}
    const transactionBankReducer = (acc, line) => {
        const assocAt = (index, field, value, a) => update(index, assoc(field, value, a[index]), a)
        const startSplit = value => append({ category: value }, acc.splits || [])
        const addMemoToSplit = value => assocAt(acc.splits.length - 1, 'memo', value, acc.splits)

        const endSplit = value => {
            const index = acc.splits.length - 1
            const { category, memo } = acc.splits[index]
            return update(index, Split(parseAmount(value), category, memo), acc.splits)
        }
        const [key, value] = [line[0], line.slice(1)]
        if (key === '$') return assoc('splits', endSplit(value), acc)
        if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
        if (key === 'C') return assoc('cleared', value, acc)
        if (key === 'D') return assoc('date', standardizeDate(value), acc)
        if (key === 'E') return assoc('splits', addMemoToSplit(value), acc)
        if (key === 'L') return assoc('category', value, acc)
        if (key === 'M') return assoc('memo', value, acc)
        if (key === 'N') return assoc('number', value, acc)
        if (key === 'P') return assoc('payee', value, acc)
        if (key === 'S') return assoc('splits', startSplit(value), acc)
        if (key === 'T') return assoc('amount', parseAmount(value), acc)
        if (key === 'U') return assoc('amount', parseAmount(value), acc)
        return acc
    }

    const toAccount = () => validateLineGroup('DLNT', lineGroup).reduce(accountReducer, {})
    const toCategory = () => validateLineGroup('BCDEINRT', lineGroup).reduce(categoryReducer, {})
    const toClass = () => validateLineGroup('CDN', lineGroup).reduce(classReducer, {})
    const toPayee = () => validateLineGroup('AMNT', lineGroup).reduce(payeeReducer, {})
    const toTag = () => validateLineGroup('CDN', lineGroup).reduce(tagReducer, {})
    const toSecurity = () => validateLineGroup('GNST', lineGroup).reduce(securityReducer, {})

    // Transforms line group to bank transaction with account context
    // @sig toTransactionBank :: String -> Object
    const toTransactionBank = transactionType => {
        const account = currentAccount?.name
        if (!account) throw new Error('No current account')
        const initial = { account, transactionType }
        return validateLineGroup('$ACDELMNPSTU', lineGroup).reduce(transactionBankReducer, initial)
    }

    // Parses price quotes from CSV-formatted line group
    // @sig toPrices :: () -> [Entry.Price]
    const toPrices = () => {
        const toPrice = line => {
            const [symbol, priceValue, date] = line.split(',').map(v => v.trim().replace(/"/g, ''))
            if (!priceValue) return null
            return Entry.Price.from({ symbol, price: parseAmount(priceValue), date: standardizeDate(date) })
        }
        return lineGroup.map(toPrice).filter(p => p?.price)
    }

    // Transforms line group to investment transaction, normalizing amount signs
    // @sig toTransactionInvestment :: () -> Object
    const toTransactionInvestment = () => {
        // Calculate amount from price × quantity when not provided
        // @sig calculateAmount :: Object -> Number
        const calculateAmount = d => {
            const { commission, price, quantity, transactionType } = d
            const proceeds = price * quantity
            const comm = commission ?? 0
            const salesTypes = ['Sell', 'SellX', 'ShtSell']
            return salesTypes.includes(transactionType) ? proceeds - comm : proceeds + comm
        }

        // Normalize amount sign: QIF stores positive values, we want negative for outflows
        // Reinv* actions are net-zero cash (dividend received and immediately reinvested)
        // @sig normalizeAmountSign :: Object -> Number
        const normalizeAmountSign = d => {
            const { amount, transactionType } = d
            if (amount == null) return null

            const outflowActions = ['Buy', 'BuyX', 'MiscExp', 'MargInt']
            const zeroCashActions = ['ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvSh', 'StkSplit', 'ShrsIn', 'ShrsOut']

            if (zeroCashActions.includes(transactionType)) return null
            const absAmount = Math.abs(amount)
            return outflowActions.includes(transactionType) ? -absAmount : absAmount
        }

        const account = currentAccount?.name
        if (!account) throw new Error('No current account')

        const data = validateLineGroup('#$ACDIKLMNOPQTUY', lineGroup).reduce(transactionInvestmentReducer, { account })
        const { amount, price, quantity } = data

        if (amount === undefined && price && quantity) data.amount = calculateAmount(data)
        data.amount = normalizeAmountSign(data)

        return data
    }

    const { Account, Category, Class, Payee, Security, Tag, TransactionBank, TransactionInvestment } = Entry

    if (currentContext === 'Account') return Account.from(toAccount())
    if (currentContext === 'Bank') return TransactionBank.from(toTransactionBank('Bank'))
    if (currentContext === 'Cash') return TransactionBank.from(toTransactionBank('Cash'))
    if (currentContext === 'Category') return Category.from(toCategory())
    if (currentContext === 'Class') return Class.from(toClass())
    if (currentContext === 'Credit Card') return TransactionBank.from(toTransactionBank('Credit Card'))
    if (currentContext === 'Investment') return TransactionInvestment.from(toTransactionInvestment())
    if (currentContext === 'Invoice') return TransactionBank.from(toTransactionBank('Invoice'))
    if (currentContext === 'Memorized') return
    if (currentContext === 'Other Asset') return TransactionBank.from(toTransactionBank('Other Asset'))
    if (currentContext === 'Other Liability') return TransactionBank.from(toTransactionBank('Other Liability'))
    if (currentContext === 'Payees') return Payee.from(toPayee())
    if (currentContext === 'Prices') return toPrices()
    if (currentContext === 'Security') return Security.from(toSecurity())
    if (currentContext === 'Tag') return Tag.from(toTag())
}

export { lineGroupToEntry }
