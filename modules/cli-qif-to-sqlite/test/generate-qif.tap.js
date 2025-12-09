import tap from 'tap'
import {
    generateAccounts,
    generateCategories,
    generateSecurities,
    generateTags,
    generatePayees,
    generateClasses,
    generateBankTransactions,
    generateInvestmentTransactions,
    generatePrices,
    serializeToQif,
} from '../scripts/generate-comprehensive-qif.js'
import parseQifData from '../src/qif/parse-qif-data.js'

tap.test('Given a QIF generator', async t => {
    t.test('When generating accounts', t => {
        const accounts = generateAccounts()

        t.equal(accounts.length, 7, 'Then it produces 7 accounts')

        // Verify account types are diverse
        const types = accounts.map(a => a.type)
        t.ok(types.includes('Bank'), 'Then it includes Bank accounts')
        t.ok(types.includes('CCard'), 'Then it includes Credit Card accounts')
        t.ok(types.includes('Investment'), 'Then it includes Investment accounts')
        t.ok(types.includes('Cash'), 'Then it includes Cash accounts')

        // Verify each account has required fields
        accounts.forEach(account => {
            t.ok(account.name, `Then account "${account.name}" has a name`)
            t.ok(account.type, `Then account "${account.name}" has a type`)
        })

        t.end()
    })

    t.test('When generating categories', t => {
        const categories = generateCategories()

        t.ok(categories.length >= 30, `Then it produces at least 30 categories (got ${categories.length})`)

        // Verify hierarchical categories exist
        const names = categories.map(c => c.name)
        t.ok(
            names.some(n => n.includes(':')),
            'Then it includes hierarchical categories with colons',
        )

        // Verify income and expense categories
        t.ok(
            categories.some(c => c.isIncomeCategory),
            'Then it includes income categories',
        )
        t.ok(
            categories.some(c => !c.isIncomeCategory),
            'Then it includes expense categories',
        )

        // Verify tax-related categories exist
        t.ok(
            categories.some(c => c.isTaxRelated),
            'Then it includes tax-related categories',
        )

        t.end()
    })

    t.test('When generating securities', t => {
        const securities = generateSecurities()

        t.ok(securities.length >= 15, `Then it produces at least 15 securities (got ${securities.length})`)

        // Verify diversity of security types
        const types = securities.map(s => s.type)
        t.ok(types.includes('Stock'), 'Then it includes stocks')
        t.ok(types.includes('Mutual Fund'), 'Then it includes mutual funds')
        t.ok(types.includes('ETF'), 'Then it includes ETFs')

        // Verify each security has required fields
        securities.forEach(security => {
            t.ok(security.name, `Then security has a name`)
            t.ok(security.symbol, `Then security "${security.name}" has a symbol`)
            t.ok(security.type, `Then security "${security.name}" has a type`)
        })

        t.end()
    })

    t.test('When generating tags', t => {
        const tags = generateTags()

        t.ok(tags.length >= 5, `Then it produces at least 5 tags (got ${tags.length})`)

        tags.forEach(tag => t.ok(tag.name, `Then tag has a name`))

        t.end()
    })

    t.test('When generating payees', t => {
        const payees = generatePayees()

        t.ok(payees.length >= 30, `Then it produces at least 30 payees (got ${payees.length})`)

        // Verify some payees have addresses
        t.ok(
            payees.some(p => p.address && p.address.length > 0),
            'Then some payees have addresses',
        )

        t.end()
    })

    t.test('When generating classes', t => {
        const classes = generateClasses()

        t.ok(classes.length >= 3, `Then it produces at least 3 classes (got ${classes.length})`)

        classes.forEach(cls => t.ok(cls.name, `Then class has a name`))

        t.end()
    })

    t.test('When generating bank transactions', t => {
        const accounts = generateAccounts()
        const categories = generateCategories()
        const payees = generatePayees()
        const transactions = generateBankTransactions(accounts, categories, payees)

        // Check total count (realistic banking activity over 3 years)
        t.ok(
            transactions.length >= 2000 && transactions.length <= 5000,
            `Then it produces between 2000-5000 transactions (got ${transactions.length})`,
        )

        // Verify transactions span 3 years
        const dates = transactions.map(tx => tx.date)
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
        t.ok(minDate.getFullYear() <= 2022, `Then transactions start in 2022 or earlier (got ${minDate.toISOString()})`)
        t.ok(maxDate.getFullYear() >= 2024, `Then transactions end in 2024 or later (got ${maxDate.toISOString()})`)

        // Verify multiple account types
        const accountNames = [...new Set(transactions.map(tx => tx.account))]
        t.ok(accountNames.length >= 3, `Then transactions span at least 3 accounts (got ${accountNames.length})`)

        // Verify cleared status variety
        const clearedStatuses = [...new Set(transactions.map(tx => tx.cleared).filter(Boolean))]
        t.ok(
            clearedStatuses.length >= 2,
            `Then transactions have varied cleared statuses (got ${clearedStatuses.length})`,
        )

        // Verify some transactions have check numbers
        t.ok(
            transactions.some(tx => tx.number),
            'Then some transactions have check numbers',
        )

        // Verify split transactions exist
        t.ok(
            transactions.some(tx => tx.splits && tx.splits.length > 0),
            'Then some transactions have splits',
        )

        // Verify transfers exist (category contains brackets)
        t.ok(
            transactions.some(tx => tx.category && tx.category.startsWith('[')),
            'Then some transactions are transfers',
        )

        // Verify each transaction has required fields
        const sampleTx = transactions[0]
        t.ok(sampleTx.account, 'Then transaction has account')
        t.ok(sampleTx.date instanceof Date, 'Then transaction has date')
        t.ok(typeof sampleTx.amount === 'number', 'Then transaction has amount')
        t.ok(sampleTx.transactionType, 'Then transaction has transactionType')

        t.end()
    })

    t.test('When generating investment transactions', t => {
        const accounts = generateAccounts()
        const securities = generateSecurities()
        const transactions = generateInvestmentTransactions(accounts, securities)

        // Check total count (realistic investment activity over 3 years)
        t.ok(
            transactions.length >= 200 && transactions.length <= 1000,
            `Then it produces between 200-1000 transactions (got ${transactions.length})`,
        )

        // Verify transactions span 3 years
        const dates = transactions.map(tx => tx.date)
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
        t.ok(minDate.getFullYear() <= 2022, `Then transactions start in 2022 or earlier (got ${minDate.toISOString()})`)
        t.ok(maxDate.getFullYear() >= 2024, `Then transactions end in 2024 or later (got ${maxDate.toISOString()})`)

        // Verify multiple investment accounts
        const accountNames = [...new Set(transactions.map(tx => tx.account))]
        t.ok(accountNames.length >= 2, `Then transactions span at least 2 accounts (got ${accountNames.length})`)

        // Verify diverse transaction types
        const txTypes = [...new Set(transactions.map(tx => tx.transactionType))]
        t.ok(txTypes.includes('Buy'), 'Then it includes Buy transactions')
        t.ok(
            txTypes.some(t => t.includes('Div') || t.includes('Reinv')),
            'Then it includes dividend/reinvestment transactions',
        )
        t.ok(
            txTypes.length >= 5,
            `Then it has at least 5 different transaction types (got ${txTypes.length}: ${txTypes.join(', ')})`,
        )

        // Verify each transaction has required fields
        const sampleTx = transactions[0]
        t.ok(sampleTx.account, 'Then transaction has account')
        t.ok(sampleTx.date instanceof Date, 'Then transaction has date')
        t.ok(sampleTx.transactionType, 'Then transaction has transactionType')

        // Most should have security
        const withSecurity = transactions.filter(tx => tx.security)
        t.ok(
            withSecurity.length > transactions.length * 0.8,
            `Then most transactions have a security (${withSecurity.length}/${transactions.length})`,
        )

        t.end()
    })

    t.test('When generating prices', t => {
        const securities = generateSecurities()
        const prices = generatePrices(securities)

        // Check we have prices for multiple securities over time
        t.ok(prices.length >= 1000, `Then it produces at least 1000 price records (got ${prices.length})`)

        // Verify price structure
        const samplePrice = prices[0]
        t.ok(samplePrice.symbol, 'Then price has symbol')
        t.ok(typeof samplePrice.price === 'number', 'Then price has numeric price')
        t.ok(samplePrice.date instanceof Date, 'Then price has date')

        t.end()
    })

    t.test('When serializing to QIF and parsing back', t => {
        const accounts = generateAccounts()
        const categories = generateCategories()
        const securities = generateSecurities()
        const tags = generateTags()
        const payees = generatePayees()
        const classes = generateClasses()
        const bankTransactions = generateBankTransactions(accounts, categories, payees)
        const investmentTransactions = generateInvestmentTransactions(accounts, securities)
        const prices = generatePrices(securities)

        const qifString = serializeToQif({
            accounts,
            categories,
            securities,
            tags,
            payees,
            classes,
            bankTransactions,
            investmentTransactions,
            prices,
        })

        // Verify QIF string is non-empty and has expected sections
        t.ok(qifString.length > 10000, `Then QIF string is substantial (${qifString.length} chars)`)
        t.ok(qifString.includes('!Account'), 'Then QIF has Account section')
        t.ok(qifString.includes('!Type:Cat'), 'Then QIF has Category section')
        t.ok(qifString.includes('!Type:Security'), 'Then QIF has Security section')
        t.ok(qifString.includes('!Type:Tag'), 'Then QIF has Tag section')
        t.ok(qifString.includes('!Type:Bank'), 'Then QIF has Bank transaction section')
        t.ok(qifString.includes('!Type:Invst'), 'Then QIF has Investment transaction section')
        t.ok(qifString.includes('!Type:Prices'), 'Then QIF has Prices section')

        // Parse the generated QIF
        const parsed = parseQifData(qifString)

        // Verify parsed data matches original counts (approximately)
        t.ok(parsed.accounts.length >= accounts.length - 1, `Then parsed accounts match (${parsed.accounts.length})`)
        t.ok(parsed.categories.length >= 10, `Then parsed categories exist (${parsed.categories.length})`)
        t.ok(
            parsed.securities.length >= securities.length - 1,
            `Then parsed securities match (${parsed.securities.length})`,
        )
        t.ok(
            parsed.bankTransactions.length >= 100,
            `Then parsed bank transactions exist (${parsed.bankTransactions.length})`,
        )
        t.ok(
            parsed.investmentTransactions.length >= 100,
            `Then parsed investment transactions exist (${parsed.investmentTransactions.length})`,
        )
        t.ok(parsed.prices.length >= 100, `Then parsed prices exist (${parsed.prices.length})`)

        t.end()
    })
})
