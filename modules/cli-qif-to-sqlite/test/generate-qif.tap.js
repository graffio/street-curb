// ABOUTME: Tests for the mock data generator
// ABOUTME: Verifies generation of accounts, transactions, securities, prices and QIF round-trip

import tap from 'tap'
import { generateMockData, serializeToQif } from '../src/mock-data-generator.js'
import parseQifData from '../src/qif/parse-qif-data.js'

tap.test('Given a QIF generator', async t => {
    const mockData = generateMockData(12345)

    t.test('When generating accounts', t => {
        const { accounts } = mockData

        t.equal(accounts.length, 6, 'Then it produces 6 accounts')

        const types = accounts.map(a => a.type)
        t.ok(types.includes('Bank'), 'Then it includes Bank accounts')
        t.ok(types.includes('Credit Card'), 'Then it includes Credit Card accounts')
        t.ok(types.includes('Investment'), 'Then it includes Investment accounts')

        accounts.forEach(a => {
            const { name, type } = a
            t.ok(name, `Then account "${name}" has a name`)
            t.ok(type, `Then account "${name}" has a type`)
        })

        t.end()
    })

    t.test('When generating categories', t => {
        const { categories } = mockData

        t.ok(categories.length >= 5, `Then it produces at least 5 categories (got ${categories.length})`)

        const names = categories.map(c => c.name)
        t.ok(
            names.some(n => n.includes(':')),
            'Then it includes hierarchical categories with colons',
        )

        t.ok(
            categories.some(c => c.isIncomeCategory),
            'Then it includes income categories',
        )
        t.ok(
            categories.some(c => !c.isIncomeCategory),
            'Then it includes expense categories',
        )

        t.end()
    })

    t.test('When generating securities', t => {
        const { securities } = mockData

        t.ok(securities.length >= 5, `Then it produces at least 5 securities (got ${securities.length})`)

        const types = securities.map(s => s.type)
        t.ok(types.includes('Stock'), 'Then it includes stocks')
        t.ok(types.includes('ETF'), 'Then it includes ETFs')
        t.ok(types.includes('Mutual Fund'), 'Then it includes mutual funds')

        securities.forEach(s => {
            const { name, symbol, type } = s
            t.ok(name, `Then security has a name`)
            t.ok(symbol, `Then security "${name}" has a symbol`)
            t.ok(type, `Then security "${name}" has a type`)
        })

        t.end()
    })

    t.test('When generating bank transactions', t => {
        const { bankTransactions } = mockData

        t.ok(
            bankTransactions.length >= 100,
            `Then it produces at least 100 transactions (got ${bankTransactions.length})`,
        )

        const dates = bankTransactions.map(tx => tx.date)
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
        const yearSpan = maxDate.getFullYear() - minDate.getFullYear()
        t.ok(yearSpan >= 1, `Then transactions span at least 1 year (got ${yearSpan})`)

        const accountNames = [...new Set(bankTransactions.map(tx => tx.account))]
        t.ok(accountNames.length >= 2, `Then transactions span at least 2 accounts (got ${accountNames.length})`)

        const clearedStatuses = [...new Set(bankTransactions.map(tx => tx.cleared).filter(Boolean))]
        t.ok(clearedStatuses.length >= 1, `Then transactions have cleared statuses (got ${clearedStatuses.length})`)

        const { account, amount, date, transactionType } = bankTransactions[0]
        t.ok(account, 'Then transaction has account')
        t.ok(date instanceof Date, 'Then transaction has date')
        t.ok(typeof amount === 'number', 'Then transaction has amount')
        t.ok(transactionType, 'Then transaction has transactionType')

        t.end()
    })

    t.test('When generating investment transactions', t => {
        const { investmentTransactions } = mockData
        const { length } = investmentTransactions

        t.ok(length >= 50, `Then it produces at least 50 transactions (got ${length})`)

        const dates = investmentTransactions.map(tx => tx.date)
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
        const yearSpan = maxDate.getFullYear() - minDate.getFullYear()
        t.ok(yearSpan >= 1, `Then transactions span at least 1 year (got ${yearSpan})`)

        const accountNames = [...new Set(investmentTransactions.map(tx => tx.account))]
        t.ok(accountNames.length >= 1, `Then transactions span at least 1 account (got ${accountNames.length})`)

        const txTypes = [...new Set(investmentTransactions.map(tx => tx.transactionType))]
        t.ok(txTypes.includes('Buy'), 'Then it includes Buy transactions')
        t.ok(txTypes.length >= 3, `Then it has at least 3 different transaction types (got ${txTypes.length})`)

        const { account, date, transactionType } = investmentTransactions[0]
        t.ok(account, 'Then transaction has account')
        t.ok(date instanceof Date, 'Then transaction has date')
        t.ok(transactionType, 'Then transaction has transactionType')

        const withSecurity = investmentTransactions.filter(tx => tx.security)
        t.ok(
            withSecurity.length > length * 0.5,
            `Then most transactions have a security (${withSecurity.length}/${length})`,
        )

        t.end()
    })

    t.test('When generating prices', t => {
        const { prices } = mockData

        t.ok(prices.length >= 500, `Then it produces at least 500 price records (got ${prices.length})`)

        const { date, price, symbol } = prices[0]
        t.ok(symbol, 'Then price has symbol')
        t.ok(typeof price === 'number', 'Then price has numeric price')
        t.ok(date instanceof Date, 'Then price has date')

        t.end()
    })

    t.test('When serializing to QIF and parsing back', t => {
        const qifString = serializeToQif(mockData)

        t.ok(qifString.length > 5000, `Then QIF string is substantial (${qifString.length} chars)`)
        t.ok(qifString.includes('!Account'), 'Then QIF has Account section')
        t.ok(qifString.includes('!Type:Cat'), 'Then QIF has Category section')
        t.ok(qifString.includes('!Type:Security'), 'Then QIF has Security section')
        t.ok(qifString.includes('!Type:Bank') || qifString.includes('!Type:CCard'), 'Then QIF has Bank/CCard section')
        t.ok(qifString.includes('!Type:Invst'), 'Then QIF has Investment section')
        t.ok(qifString.includes('!Type:Prices'), 'Then QIF has Prices section')

        const parsed = parseQifData(qifString)

        t.ok(parsed.accounts.length >= 3, `Then parsed accounts exist (${parsed.accounts.length})`)
        t.ok(parsed.categories.length >= 3, `Then parsed categories exist (${parsed.categories.length})`)
        t.ok(parsed.securities.length >= 3, `Then parsed securities exist (${parsed.securities.length})`)
        t.ok(
            parsed.bankTransactions.length >= 50,
            `Then parsed bank transactions exist (${parsed.bankTransactions.length})`,
        )
        t.ok(
            parsed.investmentTransactions.length >= 30,
            `Then parsed investment transactions exist (${parsed.investmentTransactions.length})`,
        )
        t.ok(parsed.prices.length >= 100, `Then parsed prices exist (${parsed.prices.length})`)

        t.end()
    })
})
