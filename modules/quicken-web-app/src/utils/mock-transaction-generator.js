// ABOUTME: Generates realistic financial transaction data for testing and demos
// ABOUTME: Creates believable patterns including recurring bills, income, and seasonal variations

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

import { createIdGenerator } from '@graffio/functional/src/generate-entity-id.js'
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
 * Create a random transaction date within the given range
 *
 * @sig createRandomDate :: (Date, Number) -> Date
 */
const createRandomDate = (startDate, totalDays) => {
    const randomDayOffset = Math.floor(Math.random() * totalDays)
    const transactionDate = new Date(startDate)
    transactionDate.setDate(transactionDate.getDate() + randomDayOffset)

    // Add time variation (70% business hours, 30% any time)
    const randomHour = Math.random() < 0.7 ? Math.floor(Math.random() * 12) + 8 : Math.floor(Math.random() * 24)
    transactionDate.setHours(randomHour, Math.floor(Math.random() * 60), 0, 0)

    return transactionDate
}

/*
 * Generate realistic transaction dates from the past only
 *
 * @sig generateTransactionDates :: Number -> [Date]
 */
const generateTransactionDates = count => {
    const today = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2)
    startDate.setMonth(0, 1)

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() - 3)

    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))

    return Array.from({ length: count }, () => createRandomDate(startDate, totalDays)).sort((a, b) => a - b)
}

/*
 * Add a date to the appropriate date-string bucket in the map
 *
 * @sig addDateToBucket :: (Map String [Date], Date) -> Map String [Date]
 */
const addDateToBucket = (map, date) => {
    const dateStr = date.toISOString().split('T')[0]
    if (!map.has(dateStr)) map.set(dateStr, [])
    map.get(dateStr).push(date)
    return map
}

/*
 * Group transaction dates by date string for processing
 *
 * @sig groupTransactionsByDate :: [Date] -> Map String [Date]
 */
const groupTransactionsByDate = dates => dates.reduce(addDateToBucket, new Map())

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
 * @sig createTransaction :: (IdGenerator, PayeeTemplate, String, Number) -> Transaction.Bank
 */
const createTransaction = (generateId, payeeData, dateStr, amount) => {
    const fields = {
        accountId: 'acc_000000000001',
        amount,
        date: dateStr,
        payee: payeeData.name,
        transactionType: 'bank',
    }
    return Transaction.Bank.from({
        ...fields,
        id: generateId(fields),
        address: Math.random() > 0.8 ? `${Math.floor(Math.random() * 9999) + 1} Main St` : null,
        categoryId: 'cat_000000000001',
        cleared: Math.random() > 0.1 ? 'R' : '',
        memo: 'Auto-generated transaction',
        number: amount < 0 && Math.random() > 0.7 ? String(Math.floor(Math.random() * 9000) + 1000) : null,
    })
}

/*
 * Create a follow-up Transaction.Bank from cluster data
 *
 * @sig createFollowUpTransaction :: (IdGenerator, FollowUpTransaction, String, Number) -> Transaction.Bank
 */
const createFollowUpTransaction = (generateId, followUp, dateStr, amount) => {
    const fields = {
        accountId: 'acc_000000000001',
        amount,
        date: dateStr,
        payee: followUp.name,
        transactionType: 'bank',
    }
    return Transaction.Bank.from({
        ...fields,
        id: generateId(fields),
        address: Math.random() > 0.8 ? `${Math.floor(Math.random() * 9999) + 1} Main St` : null,
        categoryId: 'cat_000000000001',
        cleared: Math.random() > 0.1 ? 'R' : '',
        memo: 'Auto-generated cluster transaction',
        number: amount < 0 && Math.random() > 0.7 ? String(Math.floor(Math.random() * 9000) + 1000) : null,
    })
}

/*
 * Create a transaction for a single time slot, handling overdraft prevention
 *
 * @sig createTransactionForSlot :: (IdGenerator, String, Number, PayeeTemplate) -> TransactionSlotResult
 *     TransactionSlotResult = { transaction: Transaction, balanceChange: Number }
 */
const createTransactionForSlot = (generateId, dateStr, balance, payeeData) => {
    const amount = addVariation(payeeData.amount)

    // Prevent unrealistic overdrafts by forcing income
    if (balance + amount < -10000) {
        const incomePayee = getRandomItem(SAMPLE_PAYEES.filter(p => p.amount > 0))
        const incomeAmount = addVariation(incomePayee.amount)
        return {
            transaction: createTransaction(generateId, incomePayee, dateStr, incomeAmount),
            balanceChange: incomeAmount,
        }
    }

    return { transaction: createTransaction(generateId, payeeData, dateStr, amount), balanceChange: amount }
}

/*
 * Process a single date-time slot and accumulate result
 *
 * @sig processSlot :: (IdGenerator, String) -> (Accumulator, Date) -> Accumulator
 *     Accumulator = { transactions: [Transaction], balance: Number }
 */
const processSlot = (generateId, dateStr) => (acc, _dateTime) => {
    const { balance, transactions } = acc
    const payeeOptions = filterPayeesByBalance(SAMPLE_PAYEES, balance)
    const payeeData = getRandomItem(payeeOptions)
    const { transaction, balanceChange } = createTransactionForSlot(generateId, dateStr, balance, payeeData)
    return { transactions: [...transactions, transaction], balance: balance + balanceChange }
}

/*
 * Add cluster follow-up transactions if applicable
 *
 * @sig addClusterTransactions :: (IdGenerator, String, [Transaction], Number) -> TransactionResult
 *     TransactionResult = { transactionsForDate: [Transaction], balance: Number }
 */
const addClusterTransactions = (generateId, dateStr, transactions, balance) => {
    if (transactions.length <= 1) return { transactionsForDate: transactions, balance }

    const cluster = TRANSACTION_CLUSTERS.find(c => c.trigger === transactions[0].payee)
    if (!cluster || Math.random() >= 0.6) return { transactionsForDate: transactions, balance }

    const followUp = getRandomItem(cluster.followUps)
    const followUpAmount = addVariation(followUp.amount)
    if (balance + followUpAmount <= -10000) return { transactionsForDate: transactions, balance }

    const clusterTxn = createFollowUpTransaction(generateId, followUp, dateStr, followUpAmount)
    return { transactionsForDate: [...transactions, clusterTxn], balance: balance + followUpAmount }
}

/*
 * Generate transactions for a single date with balance management
 *
 * @sig generateTransactionsForDate :: (IdGenerator, String, [Date], Number) -> TransactionResult
 *     TransactionResult = { transactions: [Transaction], newBalance: Number }
 */
const generateTransactionsForDate = (generateId, dateStr, dateTimes, currentBalance) => {
    const initial = { transactions: [], balance: currentBalance }
    const { transactions, balance } = dateTimes.reduce(processSlot(generateId, dateStr), initial)
    const result = addClusterTransactions(generateId, dateStr, transactions, balance)
    return { transactions: result.transactionsForDate, newBalance: result.balance }
}

/*
 * Process a date entry and accumulate transactions
 *
 * @sig processDateEntryWithId :: (IdGenerator, Accumulator, [String, [Date]]) -> Accumulator
 *     Accumulator = { transactions: [Transaction], balance: Number }
 */
const processDateEntryWithId = (generateId, acc, [dateStr, dateTimes]) => {
    const result = generateTransactionsForDate(generateId, dateStr, dateTimes, acc.balance)
    return { transactions: [...acc.transactions, ...result.transactions], balance: result.newBalance }
}

/*
 * Generate realistic financial transactions with clustering and balance management
 *
 * @sig generateRealisticTransactions :: Number -> LookupTable<Transaction>
 */
const generateRealisticTransactions = (count = 10000) => {
    const generateId = createIdGenerator('txn')
    const dates = generateTransactionDates(count)
    const transactionsByDate = groupTransactionsByDate(dates)

    const initial = { transactions: [], balance: 5000.0 }
    const { transactions } = [...transactionsByDate].reduce(
        (acc, entry) => processDateEntryWithId(generateId, acc, entry),
        initial,
    )

    return LookupTable(transactions.slice(0, count), Transaction, 'id')
}

export { generateRealisticTransactions }
