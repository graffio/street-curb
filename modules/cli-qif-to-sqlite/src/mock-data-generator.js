// ABOUTME: Generates realistic mock financial data for testing and demos
// ABOUTME: Creates accounts, transactions, securities, prices with optional QIF serialization

import { QifEntry } from './types/index.js'

// -----------------------------------------------------------------------------------------------------------------
// Sample data definitions
// -----------------------------------------------------------------------------------------------------------------

const BANK_ACCOUNTS = [
    { name: 'Primary Checking', type: 'Bank', description: 'Main checking account' },
    { name: 'Emergency Savings', type: 'Bank', description: 'Emergency fund' },
    { name: 'Chase Sapphire', type: 'Credit Card', description: 'Primary credit card' },
]

const INVESTMENT_ACCOUNTS = [
    { name: 'Fidelity Brokerage', type: 'Investment', description: 'Taxable brokerage' },
    { name: '401k Retirement', type: '401(k)/403(b)', description: 'Employer 401k' },
    { name: 'Roth IRA', type: 'Investment', description: 'Roth IRA' },
]

const SECURITIES = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'Stock' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'ETF' },
    { symbol: 'VFIAX', name: 'Vanguard 500 Index Fund', type: 'Mutual Fund' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Stock' },
    { symbol: 'PG', name: 'Procter & Gamble', type: 'Stock' },
]

const CATEGORIES = [
    { name: 'Income:Salary', isIncomeCategory: true, description: 'Employment income' },
    { name: 'Income:Dividends', isIncomeCategory: true, description: 'Stock dividends' },
    { name: 'Food:Groceries', budgetAmount: 600, description: 'Grocery shopping' },
    { name: 'Food:Dining', budgetAmount: 300, description: 'Restaurants' },
    { name: 'Utilities:Electric', budgetAmount: 150, description: 'Electric bill' },
    { name: 'Housing:Rent', budgetAmount: 2000, description: 'Monthly rent' },
    { name: 'Transportation:Gas', budgetAmount: 200, description: 'Vehicle fuel' },
]

const EXPENSE_PAYEES = [
    { name: 'Whole Foods', category: 'Food:Groceries', min: 40, max: 180 },
    { name: 'Safeway', category: 'Food:Groceries', min: 30, max: 150 },
    { name: 'Chipotle', category: 'Food:Dining', min: 10, max: 25 },
    { name: 'PG&E', category: 'Utilities:Electric', min: 80, max: 180 },
    { name: 'Shell', category: 'Transportation:Gas', min: 35, max: 75 },
]

const BASE_PRICES = { AAPL: 175, MSFT: 380, VTI: 230, SPY: 450, BND: 75, VFIAX: 420, JNJ: 160, PG: 155 }

// -----------------------------------------------------------------------------------------------------------------
// T group: Transformers for price duplication
// -----------------------------------------------------------------------------------------------------------------

const T = {
    // Create duplicate price with slight variation (simulates real QIF exports)
    // @sig toDuplicatePrice :: QifEntry.Price -> QifEntry.Price
    toDuplicatePrice: ({ symbol, price, date }) =>
        QifEntry.Price.from({ symbol, price: price * 1.001, date: new Date(date) }),
}

/*
 * Generate complete mock data set
 * @sig generateMockData :: (Number?) -> MockData
 *     MockData = { accounts, categories, securities, bankTransactions, investmentTransactions, prices }
 */
const generateMockData = (seed = 12345) => {
    // Add days to a date
    // @sig addDays :: (Date, Number) -> Date
    const addDays = (date, days) => {
        const result = new Date(date)
        result.setDate(result.getDate() + days)
        return result
    }

    // Generate array of dates between start and end
    // @sig generateDateRange :: (Date, Date) -> [Date]
    const generateDateRange = (start, end) => {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        return Array.from({ length: days }, (_, i) => addDays(start, i))
    }

    // Create seeded random number generator
    // @sig createRng :: Number -> (() -> Number)
    const createRng = s => {
        let state = s
        return () => {
            state = (state * 1103515245 + 12345) & 0x7fffffff
            return state / 0x7fffffff
        }
    }

    // Generate account list with duplicates (simulates real QIF exports)
    // @sig generateAccounts :: () -> [QifEntry.Account]
    const generateAccounts = () => {
        const accounts = [...BANK_ACCOUNTS, ...INVESTMENT_ACCOUNTS].map(a => QifEntry.Account.from(a))
        return [...accounts, ...accounts.slice(0, 3)]
    }

    // Generate category list from sample data
    // @sig generateCategories :: () -> [QifEntry.Category]
    const generateCategories = () => CATEGORIES.map(c => QifEntry.Category.from(c))

    // Generate security list from sample data
    // @sig generateSecurities :: () -> [QifEntry.Security]
    const generateSecurities = () => SECURITIES.map(s => QifEntry.Security.from(s))

    /*
     * Generate price history for all securities with duplicates (simulates real QIF exports)
     * @sig generatePrices :: () -> [QifEntry.Price]
     */
    const generatePrices = () => {
        // Create price record for a security on a given day
        // @sig createPriceForDay :: (Security, Date) -> QifEntry.Price
        const createPriceForDay = (sec, day) => {
            const { symbol } = sec
            const drift = 1 + (random() - 0.48) * 0.02
            currentPrices[symbol] = Math.round(currentPrices[symbol] * drift * 100) / 100
            return QifEntry.Price.from({ symbol, price: currentPrices[symbol], date: new Date(day) })
        }

        const currentPrices = { ...BASE_PRICES }
        const tradingDays = generateDateRange(startDate, endDate).filter(d => d.getDay() !== 0 && d.getDay() !== 6)
        const prices = SECURITIES.flatMap(sec => tradingDays.map(day => createPriceForDay(sec, day)))
        return [...prices, ...prices.slice(0, 50).map(T.toDuplicatePrice)]
    }

    /*
     * Generate bank transactions including paychecks and expenses
     * @sig generateBankTransactions :: () -> [QifEntry.TransactionBank]
     */
    const generateBankTransactions = () => {
        // Create paycheck transaction for a date
        // @sig createPaycheck :: Date -> QifEntry.TransactionBank
        const createPaycheck = date =>
            QifEntry.TransactionBank.from({
                account: checking,
                amount: 4500,
                date,
                transactionType: 'Bank',
                payee: 'Acme Corp',
                category: 'Income:Salary',
                memo: 'Bi-weekly paycheck',
                cleared: 'R',
            })

        // Generate bi-weekly paychecks
        // @sig generatePaychecks :: () -> [QifEntry.TransactionBank]
        const generatePaychecks = () => {
            const paydays = generateDateRange(startDate, endDate).filter((_, i) => i % 14 === 0)
            return paydays.map(createPaycheck)
        }

        // Maybe generate expense transaction for a day and payee
        // @sig generateExpenseForDay :: (Date, Payee) -> QifEntry.TransactionBank?
        const generateExpenseForDay = (date, payee) => {
            if (random() >= 0.15) return null
            const { name, category, min, max } = payee
            const amount = -(min + random() * (max - min))
            const useCard = random() > 0.3
            return QifEntry.TransactionBank.from({
                account: useCard ? creditCard : checking,
                amount: Math.round(amount * 100) / 100,
                date: new Date(date),
                transactionType: useCard ? 'Credit Card' : 'Bank',
                payee: name,
                category,
                cleared: random() > 0.1 ? 'R' : '',
            })
        }

        // Generate daily expense transactions
        // @sig generateDailyExpenses :: () -> [QifEntry.TransactionBank]
        const generateDailyExpenses = () => {
            const days = generateDateRange(startDate, endDate)
            return days.flatMap(d => EXPENSE_PAYEES.map(p => generateExpenseForDay(d, p)).filter(Boolean))
        }

        const checking = 'Primary Checking'
        const creditCard = 'Chase Sapphire'

        return [...generatePaychecks(), ...generateDailyExpenses()].sort((a, b) => a.date - b.date)
    }

    /*
     * Generate investment transactions with correct amount signs
     * @sig generateInvestmentTransactions :: () -> [QifEntry.TransactionInvestment]
     */
    const generateInvestmentTransactions = () => {
        // Round to 2 decimal places
        // @sig round2 :: Number -> Number
        const round2 = n => Math.round(n * 100) / 100

        // Round to 4 decimal places
        // @sig round4 :: Number -> Number
        const round4 = n => Math.round(n * 10000) / 10000

        // Round price based on security type (mutual funds use 4 decimals)
        // @sig roundPrice :: (String, Number) -> Number
        const roundPrice = (symbol, price) => {
            const security = SECURITIES.find(s => s.symbol === symbol)
            return security?.type === 'Mutual Fund' ? round4(price) : round2(price)
        }

        // Maybe generate commission (10% chance)
        // @sig maybeCommission :: () -> Number?
        const maybeCommission = () => (random() < 0.1 ? round2(4.95 + random() * 10) : undefined)

        // Maybe generate buy transaction for a date
        // @sig maybeGenerateBuy :: Date -> void
        const maybeGenerateBuy = date => {
            if (random() >= 0.3) return
            const { symbol } = SECURITIES[Math.floor(random() * SECURITIES.length)]
            const price = roundPrice(symbol, BASE_PRICES[symbol] * (0.9 + random() * 0.2))
            const quantity = Math.ceil(random() * 20)
            const commission = maybeCommission()
            const amount = round2(-(quantity * price) - (commission ?? 0))

            positions.set(symbol, (positions.get(symbol) ?? 0) + quantity)
            transactions.push(
                QifEntry.TransactionInvestment.from({
                    account: brokerage,
                    date: new Date(date),
                    transactionType: 'Buy',
                    security: symbol,
                    price,
                    quantity,
                    amount,
                    commission,
                    cleared: 'R',
                }),
            )
        }

        // Maybe generate sell transaction for a date
        // @sig maybeGenerateSell :: Date -> void
        const maybeGenerateSell = date => {
            if (random() >= 0.1) return

            const ownedSymbols = [...positions.entries()].filter(([, qty]) => qty > 0)
            if (ownedSymbols.length === 0) return
            const [symbol, ownedQty] = ownedSymbols[Math.floor(random() * ownedSymbols.length)]
            const price = roundPrice(symbol, BASE_PRICES[symbol] * (0.9 + random() * 0.2))

            const quantity = Math.min(Math.ceil(random() * 10), ownedQty)
            const commission = maybeCommission()
            const amount = round2(quantity * price - (commission ?? 0))
            positions.set(symbol, ownedQty - quantity)
            transactions.push(
                QifEntry.TransactionInvestment.from({
                    account: brokerage,
                    date: new Date(date),
                    transactionType: 'Sell',
                    security: symbol,
                    price,
                    quantity,
                    amount,
                    commission,
                    cleared: 'R',
                }),
            )
        }

        // Maybe generate short sale for a date
        // @sig maybeGenerateShortSale :: Date -> void
        const maybeGenerateShortSale = date => {
            if (random() >= 0.05) return
            const { symbol } = SECURITIES[Math.floor(random() * 4)]
            const price = roundPrice(symbol, BASE_PRICES[symbol] * (0.9 + random() * 0.2))
            const quantity = Math.ceil(random() * 5) + 1
            const commission = maybeCommission()
            const amount = round2(quantity * price - (commission ?? 0))
            openShorts.set(symbol, (openShorts.get(symbol) ?? 0) + quantity)
            transactions.push(
                QifEntry.TransactionInvestment.from({
                    account: brokerage,
                    date: new Date(date),
                    transactionType: 'ShtSell',
                    security: symbol,
                    price,
                    quantity,
                    amount,
                    commission,
                    memo: 'Short sale',
                    cleared: 'R',
                }),
            )
        }

        // Maybe cover short position for a date
        // @sig maybeGenerateCoverShort :: Date -> void
        const maybeGenerateCoverShort = date => {
            if (openShorts.size === 0 || random() >= 0.3) return
            const symbols = [...openShorts.keys()]
            const symbol = symbols[Math.floor(random() * symbols.length)]
            const shortQty = openShorts.get(symbol)
            const quantity = Math.min(shortQty, Math.ceil(random() * 3) + 1)
            const price = roundPrice(symbol, BASE_PRICES[symbol] * (0.9 + random() * 0.2))
            const commission = maybeCommission()
            const amount = round2(-(quantity * price) - (commission ?? 0))
            if (quantity >= shortQty) openShorts.delete(symbol)
            else openShorts.set(symbol, shortQty - quantity)
            transactions.push(
                QifEntry.TransactionInvestment.from({
                    account: brokerage,
                    date: new Date(date),
                    transactionType: 'CvrShrt',
                    security: symbol,
                    price,
                    quantity,
                    amount,
                    commission,
                    memo: 'Cover short position',
                    cleared: 'R',
                }),
            )
        }

        // Maybe generate dividend for a date and symbol
        // @sig maybeGenerateDividend :: (Date, String) -> void
        const maybeGenerateDividend = (date, symbol) => {
            const divAmount = 20 + random() * 60
            if (random() < 0.5) {
                transactions.push(
                    QifEntry.TransactionInvestment.from({
                        account: brokerage,
                        date: new Date(date),
                        transactionType: 'Div',
                        security: symbol,
                        amount: round2(divAmount),
                        memo: 'Quarterly dividend',
                    }),
                )
            } else {
                const price = roundPrice(symbol, BASE_PRICES[symbol] * (0.9 + random() * 0.2))
                transactions.push(
                    QifEntry.TransactionInvestment.from({
                        account: brokerage,
                        date: new Date(date),
                        transactionType: 'ReinvDiv',
                        security: symbol,
                        price,
                        quantity: Math.round((divAmount / price) * 1000) / 1000,
                        amount: null,
                        memo: 'Dividend reinvested',
                    }),
                )
            }
        }

        // Maybe generate 401k contribution for a date
        // @sig maybeGenerate401k :: Date -> void
        const maybeGenerate401k = date => {
            if (date.getDay() !== 5 || random() >= 0.5) return
            const price = roundPrice('VFIAX', BASE_PRICES.VFIAX * (0.95 + random() * 0.1))
            const contribution = 750
            const quantity = Math.round((contribution / price) * 1000) / 1000

            transactions.push(
                QifEntry.TransactionInvestment.from({
                    account: k401,
                    date: new Date(date),
                    transactionType: 'BuyX',
                    security: 'VFIAX',
                    price,
                    quantity,
                    amount: -(quantity * price),
                    memo: '401k contribution',
                    category: '[Primary Checking]',
                }),
            )
        }

        // Update running cash balance
        // @sig updateCashBalance :: Number -> void
        const updateCashBalance = amount => {
            if (amount != null) cashBalance += amount
        }

        // Maybe add deposit when cash is low
        // @sig maybeAddDeposit :: Date -> void
        const maybeAddDeposit = date => {
            if (cashBalance >= 25000) return
            const depositAmount = 50000
            transactions.push(
                QifEntry.TransactionInvestment.from({
                    account: brokerage,
                    date: new Date(date),
                    transactionType: 'XIn',
                    amount: depositAmount,
                    memo: 'Cash transfer in',
                    category: '[Primary Checking]',
                }),
            )
        }

        /*
         * Process each trading day for potential transactions
         * @sig processTradingDay :: Date -> void
         */
        const processTradingDay = date => {
            const beforeCount = transactions.length
            maybeAddDeposit(date)
            maybeGenerateBuy(date)
            maybeGenerateSell(date)
            maybeGenerateShortSale(date)
            maybeGenerateCoverShort(date)
            if (date.getMonth() % 3 === 0 && date.getDate() === 15) {
                maybeGenerateDividend(date, 'JNJ')
                maybeGenerateDividend(date, 'PG')
            }
            maybeGenerate401k(date)
            transactions.slice(beforeCount).forEach(tx => updateCashBalance(tx.amount))
        }

        const brokerage = 'Fidelity Brokerage'
        const k401 = '401k Retirement'
        const transactions = []
        const positions = new Map()
        const openShorts = new Map()
        let cashBalance = 50000

        transactions.push(
            QifEntry.TransactionInvestment.from({
                account: brokerage,
                date: startDate,
                transactionType: 'XIn',
                amount: 50000,
                memo: 'Initial deposit',
                category: '[Primary Checking]',
            }),
        )

        const tradingDays = generateDateRange(addDays(startDate, 7), endDate)
        tradingDays.forEach(processTradingDay)

        return transactions.sort((a, b) => a.date - b.date)
    }

    const random = createRng(seed)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 3)
    const startDate = new Date(endDate)
    startDate.setFullYear(startDate.getFullYear() - 2)

    return {
        accounts: generateAccounts(),
        categories: generateCategories(),
        securities: generateSecurities(),
        bankTransactions: generateBankTransactions(),
        investmentTransactions: generateInvestmentTransactions(),
        prices: generatePrices(),
    }
}

/*
 * Serialize all mock data to QIF format
 * @sig serializeToQif :: MockData -> String
 */
const serializeToQif = data => {
    // Format date as QIF date string (MM/DD/YYYY)
    // @sig formatQifDate :: Date -> String
    const formatQifDate = date => {
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${month}/${day}/${date.getFullYear()}`
    }

    /*
     * Serialize accounts to QIF format
     * @sig serializeAccounts :: () -> String
     */
    const serializeAccounts = () => {
        // Convert account to QIF string
        // @sig accountToQif :: QifEntry.Account -> String
        const accountToQif = a => {
            const { name, type, description } = a
            const lines = ['!Account', `N${name}`, `T${typeMap[type] || type}`]
            if (description) lines.push(`D${description}`)
            return lines.join('\n') + '\n^\n'
        }

        const typeMap = { Investment: 'Invst', 'Credit Card': 'CCard', '401(k)/403(b)': 'Invst' }
        return accounts.map(accountToQif).join('')
    }

    /*
     * Serialize categories to QIF format
     * @sig serializeCategories :: () -> String
     */
    const serializeCategories = () => {
        // Convert category to QIF lines
        // @sig categoryToLines :: QifEntry.Category -> [String]
        const categoryToLines = c => {
            const { name, description, isIncomeCategory, budgetAmount } = c
            const lines = [`N${name}`]
            if (description) lines.push(`D${description}`)
            if (isIncomeCategory) lines.push('I')
            if (budgetAmount) lines.push(`B${budgetAmount}`)
            lines.push('^')
            return lines
        }

        return '!Type:Cat\n' + categories.flatMap(categoryToLines).join('\n') + '\n'
    }

    /*
     * Serialize securities to QIF format
     * @sig serializeSecurities :: () -> String
     */
    const serializeSecurities = () => {
        // Convert security to QIF string
        // @sig securityToQif :: QifEntry.Security -> String
        const securityToQif = s => {
            const { name, symbol, type } = s
            return `!Type:Security\nN${name}\nS${symbol}\nT${type}\n^\n`
        }

        return securities.map(securityToQif).join('')
    }

    /*
     * Serialize bank transactions to QIF format
     * @sig serializeBankTransactions :: () -> String
     */
    const serializeBankTransactions = () => {
        // Add transaction to account group
        // @sig addTxToGroup :: (Object, Transaction) -> Object
        const addTxToGroup = (acc, t) => {
            const { account } = t
            if (!acc[account]) acc[account] = []
            acc[account].push(t)
            return acc
        }

        // Group transactions by account
        // @sig groupByAccount :: [Transaction] -> Object
        const groupByAccount = txs => txs.reduce(addTxToGroup, {})

        // Convert transaction to QIF string
        // @sig txToQif :: QifEntry.TransactionBank -> String
        const txToQif = t => {
            const { date, amount, payee, category, memo, cleared, number } = t
            const lines = [`D${formatQifDate(date)}`, `T${amount.toFixed(2)}`]
            if (payee) lines.push(`P${payee}`)
            if (category) lines.push(`L${category}`)
            if (memo) lines.push(`M${memo}`)
            if (cleared) lines.push(`C${cleared}`)
            if (number) lines.push(`N${number}`)
            return lines.join('\n') + '\n^'
        }

        /*
         * Serialize one account's transactions
         * @sig accountToQif :: [String, [Transaction]] -> String
         */
        const accountToQif = ([accountName, txs]) => {
            const account = accounts.find(a => a.name === accountName)
            const { type } = account || {}
            if (!account || type === 'Investment' || type === '401(k)/403(b)') return ''
            const qifType = typeMap[type] || 'Bank'
            const header = `!Account\nN${accountName}\nT${qifType}\n^\n!Type:${qifType}\n`
            return header + txs.map(txToQif).join('\n') + '\n'
        }

        const typeMap = { Bank: 'Bank', 'Credit Card': 'CCard', Cash: 'Cash' }

        return Object.entries(groupByAccount(bankTransactions)).map(accountToQif).join('')
    }

    /*
     * Serialize investment transactions to QIF format
     * @sig serializeInvestmentTransactions :: () -> String
     */
    const serializeInvestmentTransactions = () => {
        // Add transaction to account group
        // @sig addTxToGroup :: (Object, Transaction) -> Object
        const addTxToGroup = (acc, t) => {
            const { account } = t
            if (!acc[account]) acc[account] = []
            acc[account].push(t)
            return acc
        }

        // Group transactions by account
        // @sig groupByAccount :: [Transaction] -> Object
        const groupByAccount = txs => txs.reduce(addTxToGroup, {})

        // Convert transaction to QIF string
        // @sig txToQif :: QifEntry.TransactionInvestment -> String
        const txToQif = t => {
            const { date, transactionType, security, price, quantity, amount, commission, memo, category, cleared } = t
            const lines = [`D${formatQifDate(date)}`, `N${transactionType}`]
            if (security) lines.push(`Y${security}`)
            if (price != null) lines.push(`I${price}`)
            if (quantity != null) lines.push(`Q${quantity}`)
            if (amount != null) lines.push(`T${Math.abs(amount).toFixed(2)}`)
            if (commission != null) lines.push(`O${commission.toFixed(2)}`)
            if (memo) lines.push(`M${memo}`)
            if (category) lines.push(`L${category}`)
            if (cleared) lines.push(`C${cleared}`)
            return lines.join('\n') + '\n^'
        }

        /*
         * Serialize one account's transactions
         * @sig accountToQif :: [String, [Transaction]] -> String
         */
        const accountToQif = ([accountName, txs]) => {
            const account = accounts.find(a => a.name === accountName)
            const { type } = account || {}
            if (!account || (type !== 'Investment' && type !== '401(k)/403(b)')) return ''
            const header = `!Account\nN${accountName}\nTInvst\n^\n!Type:Invst\n`
            return header + txs.map(txToQif).join('\n') + '\n'
        }

        return Object.entries(groupByAccount(investmentTransactions)).map(accountToQif).join('')
    }

    /*
     * Serialize prices to QIF format
     * @sig serializePrices :: () -> String
     */
    const serializePrices = () => {
        // Convert price to QIF string
        // @sig priceToQif :: QifEntry.Price -> String
        const priceToQif = p => {
            const { symbol, price, date } = p
            return `"${symbol}",${price.toFixed(2)},"${formatQifDate(date)}"`
        }

        return '!Type:Prices\n' + prices.map(priceToQif).join('\n') + '\n^\n'
    }

    const { accounts, categories, securities, bankTransactions, investmentTransactions, prices } = data

    return [
        '!Option:AutoSwitch\n!Clear:AutoSwitch\n',
        serializeAccounts(),
        serializeCategories(),
        serializeSecurities(),
        serializeBankTransactions(),
        serializeInvestmentTransactions(),
        serializePrices(),
    ].join('')
}

const MockDataGenerator = { generateMockData, serializeToQif }
export { MockDataGenerator }
