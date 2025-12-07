import { append, assoc, update } from '@graffio/functional'
import { Entry, Split } from './types/index.js'

/*
 * Make sure each row in the lineGroup starts with one of the allowedKeys; returns the lineGroup or throws
 * @sig validateLineGroup :: (String, LineGroup) -> LineGroup
 *  LineGroup = [String]
 */
const validateLineGroup = (allowedKeys, lineGroup) => {
    const validateKey = line => {
        const key = line[0]
        if (!allowedKeys.includes(key)) console.error(`Don't understand key ${key} for ${lineGroup}`)
    }

    allowedKeys = allowedKeys.split('')
    lineGroup.forEach(validateKey)

    return lineGroup
}

/*
 * Split the line into key/value and then update the object to include the value
 * acc holds a POJO, not an Account for performance reasons
 * @sig accountReducer :: ({k:v}, String) -> {k:v}
 */
const accountReducer = (acc, line) => {
    const AccountTypes = {
        Bank: 'Bank',
        Cash: 'Cash',
        CCard: 'Credit Card',
        Invst: 'Investment',
        'Oth A': 'Other Asset',
        'Oth L': 'Other Liability',

        Mutual: 'Investment', // synonym for Invst
        Port: 'Investment', // synonym for Invst
        '401(k)/403(b)': 'Investment', // synonym for Invst
    }

    const [key, value] = [line[0], line.slice(1)]

    if (key === 'D') return assoc('description', value, acc)
    if (key === 'L') return assoc('creditLimit', parseAmount(value), acc)
    if (key === 'N') return assoc('name', value, acc)
    if (key === 'T') return assoc('type', AccountTypes[value] || value, acc)

    return acc
}

/*
 * @see accountReducer
 * @sig categoryReducer :: ({k:v}, String) -> {k:v}
 */
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

/*
 * @see accountReducer
 * @sig categoryReducer :: ({k:v}, String) -> {k:v}
 */
const classReducer = (acc, line) => {
    const [key, value] = [line[0], line.slice(1)]

    if (key === 'C') return assoc('subclass', value, acc)
    if (key === 'D') return assoc('description', value, acc)
    if (key === 'N') return assoc('name', value, acc)

    return acc
}

const payeeReducer = (acc, line) => {
    const [key, value] = [line[0], line.slice(1)]

    if (key === 'A') return assoc('address', [...(acc.address || []), value], acc)
    if (key === 'M') return assoc('memo', value, acc)
    if (key === 'N') return assoc('name', value, acc)
    if (key === 'T') return assoc('defaultCategory', value, acc)

    return acc
}

/*
 * @see accountReducer
 * @sig securityReducer :: ({k:v}, String) -> {k:v}
 */
const securityReducer = (acc, line) => {
    const [key, value] = [line[0], line.slice(1)]

    if (key === 'G') return assoc('goal', value, acc)
    if (key === 'N') return assoc('name', value, acc)
    if (key === 'S') return assoc('symbol', value, acc)
    if (key === 'T') return assoc('type', value, acc)

    return acc
}

/*
 * @see accountReducer
 * @sig tagReducer :: ({k:v}, String) -> {k:v}
 */
const tagReducer = (acc, line) => {
    const [key, value] = [line[0], line.slice(1)]

    if (key === 'C') return assoc('color', value, acc)
    if (key === 'D') return assoc('description', value, acc)
    if (key === 'N') return assoc('name', value, acc)

    return acc
}

/*
 * @see accountReducer
 * @sig transactionInvestmentReducer :: ({k:v}, String, String) -> {k:v}
 */
const transactionInvestmentReducer = (acc, line) => {
    // stock splits are multiplied by 10
    const processQuantity = value => (acc.type === 'StkSplit' ? parseAmount(value) / 10 : parseAmount(value))

    const [key, value] = [line[0], line.slice(1)]

    if (key === '$') return acc // duplicates amount from T or U
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

// assoc for a[index]
const assocAt = (index, field, value, a) => update(index, assoc(field, value, a[index]), a)

/*
 * @see accountReducer
 * @sig transactionBankReducer :: ({k:v}, String, String) -> {k:v}
 *
 * Assuming splits are well-behaved, which is to say, always repeating in the order category, memo, amount (or SE$)
 * and that nothing else comes between them (though memo is optional)
 */
const transactionBankReducer = (acc, line) => {
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

// ---------------------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Helper function to convert a date to UTC (all dates and program in UTC!)
 * Because we ALWAYS run this app in the UTC timezone, any dates we create will also be in UTC
 * String -> Date in UTC timezone
 */
const standardizeDate = dateString => {
    if (dateString.match(/\d{2}\/\d{2}\/\d{4}/)) return new Date(dateString) // 01/03/2023

    const to2Digits = s => s.trim().padStart(2, '0')

    // Quicken produces wacky date strings like " 3/15'97" so we standardize this to dd/mm/yy first
    const parts = dateString.match(/^([0-9 ][0-9]?).([0-9 ][0-9]?).([0-9 ][0-9]?)$/)
    const [, day, month, year] = parts
    dateString = `${to2Digits(day)}/${to2Digits(month)}/${to2Digits(year)}`

    return new Date(dateString)
}

// weirdly, fractional amounts are plausible...
const parseAmount = value => {
    const handleFraction = () => {
        const [, whole, numerator, denominator] = fractionMatch
        return parseInt(whole) + parseInt(numerator) / parseInt(denominator)
    }

    value = value.replace(/,/g, '').trim() // Remove commas and trim whitespace

    // Check for fraction notation (e.g., "543 3/4")
    const fractionMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/)
    return fractionMatch ? handleFraction() : parseFloat(value)
}

/*
 * Convert a LineGroup pulled from a QIF file to an Entry. QIF is tricky, so the code is too.
 *
 * @sig lineGroupToEntry :: (Context, Entry.Account, LineGroup) -> Entry
 *  Context = Account|Bank|Cash|Category|CreditCard|Investment|Invoice|Memorized|OtherAsset|OtherLiability|Prices|Security|Tag
 *  LineGroup = [String]
 */
const lineGroupToEntry = (currentContext, currentAccount, lineGroup) => {
    const toAccount = () => validateLineGroup('DLNT', lineGroup).reduce(accountReducer, {})
    const toCategory = () => validateLineGroup('BCDEINRT', lineGroup).reduce(categoryReducer, {})
    const toClass = () => validateLineGroup('CDN', lineGroup).reduce(classReducer, {})
    const toPayee = () => validateLineGroup('AMNT', lineGroup).reduce(payeeReducer, {})
    const toTag = () => validateLineGroup('CDN', lineGroup).reduce(tagReducer, {})
    const toSecurity = () => validateLineGroup('GNST', lineGroup).reduce(securityReducer, {})

    const toTransactionBank = transactionType => {
        const account = currentAccount?.name
        if (!account) throw new Error('No current account')
        return validateLineGroup('$ACDELMNPSTU', lineGroup).reduce(transactionBankReducer, { account, transactionType })
    }

    const toPrices = () => {
        const toPrice = line => {
            const [symbol, priceValue, date] = line.split(',').map(v => v.trim().replace(/"/g, ''))
            return (
                priceValue && Entry.Price.from({ symbol, price: parseAmount(priceValue), date: standardizeDate(date) })
            )
        }

        // Multiple prices *might* appear in one lineGroup, though they don't seem to ever do so:
        //
        //  !Type:Prices
        //  "ATOM/USD",35.57," 9/16'21"
        //  ^
        const prices = lineGroup.map(toPrice)
        return prices.filter(p => p.price) // some "prices" have no price!
    }

    const toTransactionInvestment = () => {
        const calculateAmount = data => {
            const proceeds = data.price * data.quantity
            const commission = data.commission ?? 0
            const salesTypes = ['Sell', 'SellX', 'ShtSell']
            return salesTypes.includes(data.transactionType) ? proceeds - commission : proceeds + commission
        }

        const account = currentAccount?.name
        if (!account) throw new Error('No current account')

        const data = validateLineGroup('#$ACDIKLMNOPQTUY', lineGroup).reduce(transactionInvestmentReducer, { account })

        if (data.amount === undefined && data.price && data.quantity) data.amount = calculateAmount(data)

        return data
    }

    if (currentContext === 'Account') return Entry.Account.from(toAccount())
    if (currentContext === 'Bank') return Entry.TransactionBank.from(toTransactionBank('Bank'))
    if (currentContext === 'Cash') return Entry.TransactionBank.from(toTransactionBank('Cash'))
    if (currentContext === 'Category') return Entry.Category.from(toCategory())
    if (currentContext === 'Class') return Entry.Class.from(toClass())
    if (currentContext === 'Credit Card') return Entry.TransactionBank.from(toTransactionBank('Credit Card'))
    if (currentContext === 'Investment') return Entry.TransactionInvestment.from(toTransactionInvestment())
    if (currentContext === 'Invoice') return Entry.TransactionBank.from(toTransactionBank('Invoice'))
    if (currentContext === 'Memorized') return // skipping for now
    if (currentContext === 'Other Asset') return Entry.TransactionBank.from(toTransactionBank('Other Asset'))
    if (currentContext === 'Other Liability') return Entry.TransactionBank.from(toTransactionBank('Other Liability'))
    if (currentContext === 'Payees') return Entry.Payee.from(toPayee())
    if (currentContext === 'Prices') return toPrices()
    if (currentContext === 'Security') return Entry.Security.from(toSecurity())
    if (currentContext === 'Tag') return Entry.Tag.from(toTag())
}

export { lineGroupToEntry }
