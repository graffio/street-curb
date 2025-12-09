/*
 * mock-transaction-generator.js - Realistic financial transaction data generator
 *
 * This utility generates realistic bank transaction data for testing and demonstration purposes.
 * It creates believable financial patterns including recurring bills, income, shopping clusters,
 * and seasonal variations that mirror real-world banking behavior.
 *
 * GENERATION STRATEGY:
 * - Uses predefined payee templates with realistic amounts and frequencies
 * - Implements transaction clustering (payday triggers bill payments)
 * - Maintains realistic account balance constraints (-$10K to $25K range)
 * - Creates temporal patterns with gaps and multi-transaction days
 * - Adds natural variation to amounts (±10%) for realism
 *
 * BUSINESS LOGIC:
 * - Prevents unrealistic overdrafts by forcing income when balance is too low
 * - Clusters related transactions (shopping trips, payday bill payments)
 * - Maintains 90% reconciliation rate (realistic for banking apps)
 * - Generates appropriate check numbers for debits
 * - Creates realistic address data for some transactions
 *
 * INTEGRATION WITH OTHER FILES:
 * - Used by TransactionRegister.stories.jsx for Storybook examples
 * - Provides test data for TransactionRegister component performance testing
 * - Supports both large datasets (10,000+ transactions) and small test sets
 * - Returns LookupTable<Transaction> for Redux store
 *
 * FUNCTIONAL PROGRAMMING APPROACH:
 * - Pure functions for all data transformations
 * - Immutable data structures throughout
 * - No side effects or global state mutations
 * - Composable functions for different transaction types
 */

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Transaction } from '../types/transaction.js'

/*
 * Sample payee data with realistic amounts and transaction patterns
 *
 * @sig SAMPLE_PAYEES :: [PayeeTemplate]
 *     PayeeTemplate = {
 *         name: String,
 *         amount: Number,
 *         frequency: 'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly'|'rare',
 *         category: String
 *     }
 */
const SAMPLE_PAYEES = [
    // Recurring monthly bills
    { name: 'Pacific Gas & Electric', amount: -120.5, frequency: 'monthly', category: 'Utilities:Electric' },
    { name: 'Comcast', amount: -89.99, frequency: 'monthly', category: 'Utilities:Internet' },
    { name: 'AT&T Wireless', amount: -125.0, frequency: 'monthly', category: 'Utilities:Phone' },
    { name: 'State Farm Insurance', amount: -210.0, frequency: 'monthly', category: 'Insurance:Auto' },
    { name: 'Wells Fargo Mortgage', amount: -1850.0, frequency: 'monthly', category: 'Housing:Mortgage' },
    { name: 'Chase Credit Card', amount: -450.0, frequency: 'monthly', category: 'Credit Card Payment' },
    { name: 'Netflix', amount: -15.99, frequency: 'monthly', category: 'Entertainment:Streaming' },
    { name: 'Spotify', amount: -9.99, frequency: 'monthly', category: 'Entertainment:Music' },
    { name: 'Planet Fitness', amount: -24.99, frequency: 'monthly', category: 'Health:Gym' },

    // Bi-weekly/weekly recurring
    { name: 'Direct Deposit - Acme Corp', amount: 2850.0, frequency: 'biweekly', category: 'Income:Salary' },
    { name: 'Safeway', amount: -85.0, frequency: 'weekly', category: 'Food:Groceries' },
    { name: 'Shell Gas Station', amount: -45.0, frequency: 'weekly', category: 'Transportation:Gas' },
    { name: 'Starbucks', amount: -12.5, frequency: 'weekly', category: 'Food:Coffee' },

    // Semi-regular transactions
    { name: 'Target', amount: -120.0, frequency: 'biweekly', category: 'Shopping:General' },
    { name: 'Home Depot', amount: -75.0, frequency: 'monthly', category: 'Home:Improvement' },
    { name: 'Costco', amount: -180.0, frequency: 'monthly', category: 'Shopping:Wholesale' },
    { name: 'Amazon', amount: -65.0, frequency: 'biweekly', category: 'Shopping:Online' },
    { name: 'Chevron', amount: -50.0, frequency: 'weekly', category: 'Transportation:Gas' },
    { name: 'Whole Foods', amount: -45.0, frequency: 'weekly', category: 'Food:Groceries' },

    // Healthcare
    { name: 'Kaiser Permanente', amount: -35.0, frequency: 'quarterly', category: 'Health:Medical' },
    { name: 'CVS Pharmacy', amount: -25.0, frequency: 'monthly', category: 'Health:Pharmacy' },
    { name: 'Dr. Smith Office', amount: -150.0, frequency: 'quarterly', category: 'Health:Doctor' },

    // Dining & Entertainment
    { name: 'Chipotle', amount: -12.5, frequency: 'weekly', category: 'Food:Fast Food' },
    { name: 'Olive Garden', amount: -55.0, frequency: 'monthly', category: 'Food:Dining' },
    { name: 'AMC Theaters', amount: -35.0, frequency: 'monthly', category: 'Entertainment:Movies' },
    { name: 'Local Pizza Place', amount: -28.0, frequency: 'biweekly', category: 'Food:Takeout' },

    // Irregular but common
    { name: 'IRS Tax Refund', amount: 1850.0, frequency: 'yearly', category: 'Income:Tax Refund' },
    { name: 'Bonus Payment', amount: 1200.0, frequency: 'yearly', category: 'Income:Bonus' },
    { name: 'Car Registration', amount: -185.0, frequency: 'yearly', category: 'Transportation:Registration' },
    { name: 'Property Tax', amount: -2200.0, frequency: 'yearly', category: 'Tax:Property' },

    // ATM and bank fees
    { name: 'ATM Withdrawal', amount: -100.0, frequency: 'weekly', category: 'Banking:ATM' },
    { name: 'Bank Fee', amount: -12.0, frequency: 'monthly', category: 'Banking:Fees' },
    { name: 'Overdraft Fee', amount: -35.0, frequency: 'rare', category: 'Banking:Fees' },
]

/*
 * Transaction clustering patterns that commonly occur together
 *
 * @sig TRANSACTION_CLUSTERS :: [TransactionCluster]
 *     TransactionCluster = { trigger: String, followUps: [FollowUpTransaction] }
 *     FollowUpTransaction = { name: String, amount: Number, category: String }
 */
const TRANSACTION_CLUSTERS = [
    // Payday clusters
    {
        trigger: 'Direct Deposit - Acme Corp',
        followUps: [
            { name: 'Wells Fargo Mortgage', amount: -1850.0, category: 'Housing:Mortgage' },
            { name: 'Chase Credit Card', amount: -450.0, category: 'Credit Card Payment' },
            { name: 'State Farm Insurance', amount: -210.0, category: 'Insurance:Auto' },
        ],
    },
    // Shopping clusters
    {
        trigger: 'Target',
        followUps: [
            { name: 'Starbucks', amount: -12.5, category: 'Food:Coffee' },
            { name: 'Shell Gas Station', amount: -45.0, category: 'Transportation:Gas' },
        ],
    },
    // Weekend clusters
    {
        trigger: 'Safeway',
        followUps: [
            { name: 'CVS Pharmacy', amount: -25.0, category: 'Health:Pharmacy' },
            { name: 'Local Pizza Place', amount: -28.0, category: 'Food:Takeout' },
        ],
    },
]

/*
 * Get random item from array
 *
 * @sig getRandomItem :: [a] -> a
 */
const getRandomItem = array => array[Math.floor(Math.random() * array.length)]

/*
 * Add realistic variation to transaction amounts (±10%)
 *
 * @sig addVariation :: Number -> Number
 */
const addVariation = amount => {
    const variation = amount * 0.1 * (Math.random() - 0.5) * 2
    return Math.round((amount + variation) * 100) / 100
}

/*
 * Generate realistic transaction dates from the past only
 *
 * @sig generateTransactionDates :: Number -> [Date]
 */
const generateTransactionDates = count => {
    const createDateSequence = () => {
        const dates = []
        const today = new Date()
        const startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 2) // Start 2 years ago
        startDate.setMonth(0, 1) // January 1st, 2 years ago

        // End a few days before today to ensure all dates are in the past
        const endDate = new Date(today)
        endDate.setDate(endDate.getDate() - 3) // 3 days ago

        // Calculate total days available for distribution (all in the past)
        const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))

        // Generate random dates within the past period only
        for (let i = 0; i < count; i++) {
            const randomDayOffset = Math.floor(Math.random() * totalDays)
            const transactionDate = new Date(startDate)
            transactionDate.setDate(transactionDate.getDate() + randomDayOffset)

            // Add some time variation within the day (business hours weighted)
            const randomHour =
                Math.random() < 0.7
                    ? Math.floor(Math.random() * 12) + 8 // 70% during business hours (8am-8pm)
                    : Math.floor(Math.random() * 24) // 30% any time of day
            const randomMinute = Math.floor(Math.random() * 60)
            transactionDate.setHours(randomHour, randomMinute, 0, 0)

            dates.push(transactionDate)
        }

        return dates
    }

    return createDateSequence().sort((a, b) => a - b) // Sort ascending (oldest first)
}

/*
 * Group transaction dates by date string for processing
 *
 * @sig groupTransactionsByDate :: [Date] -> Map String [Date]
 */
const groupTransactionsByDate = dates => {
    const transactionsByDate = new Map()

    dates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0]
        if (!transactionsByDate.has(dateStr)) transactionsByDate.set(dateStr, [])
        transactionsByDate.get(dateStr).push(date)
    })

    return transactionsByDate
}

/*
 * Filter payees based on current account balance to maintain realism
 *
 * @sig filterPayeesByBalance :: ([PayeeTemplate], Number) -> [PayeeTemplate]
 */
const filterPayeesByBalance = (payees, currentBalance) => {
    if (currentBalance < 1000) return payees.filter(p => p.amount > 0) // Favor income
    if (currentBalance > 25000) return payees.filter(p => p.amount < 0) // Favor expenses
    return payees
}

/*
 * Create a single Transaction.Bank from payee template and context
 *
 * @sig createTransaction :: (PayeeTemplate, String, Number, Number, Number) -> Transaction.Bank
 */
const createTransaction = (payeeData, dateStr, transactionId, amount, transactionNumber) =>
    Transaction.Bank.from({
        accountId: 1, // accountId
        amount,
        date: dateStr,
        id: transactionId,
        transactionType: 'bank',
        address: Math.random() > 0.8 ? `${Math.floor(Math.random() * 9999) + 1} Main St` : null,
        categoryId: 1,
        cleared: Math.random() > 0.1 ? 'R' : '', // (90% reconciled)
        memo: 'Auto-generated transaction', //
        number: amount < 0 && Math.random() > 0.7 ? String(Math.floor(Math.random() * 9000) + 1000) : null,
        payee: payeeData.name,
    })

/*
 * Create a follow-up Transaction.Bank from cluster data
 *
 * @sig createFollowUpTransaction :: (FollowUpTransaction, String, Number, Number, Number) -> Transaction.Bank
 */
const createFollowUpTransaction = (followUp, dateStr, transactionId, amount, transactionNumber) =>
    Transaction.Bank.from({
        accountId: 1, //
        amount,
        date: dateStr,
        id: transactionId,
        transactionType: 'bank',
        addresss: Math.random() > 0.8 ? `${Math.floor(Math.random() * 9999) + 1} Main St` : null,
        categoryId: followUp.category.id,
        cleared: Math.random() > 0.1 ? 'R' : '',
        memo: 'Auto-generated cluster transaction',
        number: amount < 0 && Math.random() > 0.7 ? String(Math.floor(Math.random() * 9000) + 1000) : null,
        payee: followUp.name,
    })

/*
 * Generate transactions for a single date with balance management
 *
 * @sig generateTransactionsForDate :: (String, [Date], Number, Number, Number) -> TransactionResult
 *     TransactionResult = {
 *         transactions: [Transaction],
 *         newBalance: Number,
 *         newTransactionId: Number,
 *         newTransactionNumber: Number
 *     }
 */
const generateTransactionsForDate = (dateStr, dateTimes, currentBalance, transactionId, transactionNumber) => {
    const processDateTransactions = () => {
        const transactionsForDate = []
        let balance = currentBalance
        let id = transactionId
        let txnNumber = transactionNumber

        for (let i = 0; i < dateTimes.length; i++) {
            const payeeOptions = filterPayeesByBalance(SAMPLE_PAYEES, balance)
            const payeeData = getRandomItem(payeeOptions)
            const amount = addVariation(payeeData.amount)

            // Prevent unrealistic overdrafts
            if (balance + amount < -10000) {
                const incomePayee = getRandomItem(SAMPLE_PAYEES.filter(p => p.amount > 0))
                const incomeAmount = addVariation(incomePayee.amount)
                balance += incomeAmount
                transactionsForDate.push(createTransaction(incomePayee, dateStr, id++, incomeAmount, txnNumber++))
            } else {
                balance += amount
                transactionsForDate.push(createTransaction(payeeData, dateStr, id++, amount, txnNumber++))
            }
        }

        return { transactionsForDate, balance, id, txnNumber }
    }

    const processTransactionClusters = (transactionsForDate, balance, id, txnNumber) => {
        if (transactionsForDate.length <= 1) return { transactionsForDate, balance, id, txnNumber }

        const mainTransaction = transactionsForDate[0]
        const cluster = TRANSACTION_CLUSTERS.find(c => c.trigger === mainTransaction.payee)

        if (!cluster || Math.random() >= 0.6) return { transactionsForDate, balance, id, txnNumber }

        const followUp = getRandomItem(cluster.followUps)
        const followUpAmount = addVariation(followUp.amount)

        if (balance + followUpAmount <= -10000) return { transactionsForDate, balance, id, txnNumber }

        const newBalance = balance + followUpAmount
        const clusterTransaction = createFollowUpTransaction(followUp, dateStr, id++, followUpAmount, txnNumber++)

        return { transactionsForDate: [...transactionsForDate, clusterTransaction], balance: newBalance, id, txnNumber }
    }

    const { transactionsForDate, balance, id, txnNumber } = processDateTransactions()
    const result = processTransactionClusters(transactionsForDate, balance, id, txnNumber)

    return {
        transactions: result.transactionsForDate,
        newBalance: result.balance,
        newTransactionId: result.id,
        newTransactionNumber: result.txnNumber,
    }
}

/*
 * Generate realistic financial transactions with clustering and balance management
 *
 * @sig generateRealisticTransactions :: Number -> LookupTable<Transaction>
 */
const generateRealisticTransactions = (count = 10000) => {
    const dates = generateTransactionDates(count)
    const transactionsByDate = groupTransactionsByDate(dates)

    let currentBalance = 5000.0 // Starting balance
    let transactionId = 1
    let transactionNumber = 1 // Stable sequential identifier
    const allTransactions = []

    for (const [dateStr, dateTimes] of transactionsByDate) {
        const result = generateTransactionsForDate(dateStr, dateTimes, currentBalance, transactionId, transactionNumber)

        allTransactions.push(...result.transactions)
        currentBalance = result.newBalance
        transactionId = result.newTransactionId
        transactionNumber = result.newTransactionNumber
    }

    return LookupTable(allTransactions.slice(0, count), Transaction, 'id')
}

export { generateRealisticTransactions }
