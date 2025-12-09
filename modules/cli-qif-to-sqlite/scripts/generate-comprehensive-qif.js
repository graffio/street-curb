/**
 * Comprehensive QIF Generator
 *
 * Generates a realistic QIF file with all entry types supported by Quicken Premier (Windows).
 * Target: ~10,000 transactions (7K bank + 3K investment) over 3 years (2022-2024).
 */

// =============================================================================
// Reference Data Generators
// =============================================================================

/**
 * Generate account definitions
 * @returns {Array<{name: string, type: string, description?: string}>}
 */
// =============================================================================
// Main - Generate QIF file when run directly
// =============================================================================

import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export const generateAccounts = () => [
    { name: 'Primary Checking', type: 'Bank', description: 'Main checking account for daily expenses' },
    { name: 'Emergency Savings', type: 'Bank', description: 'Emergency fund savings' },
    { name: 'Chase Sapphire', type: 'CCard', description: 'Primary credit card' },
    { name: 'Petty Cash', type: 'Cash', description: 'Cash on hand' },
    { name: 'Fidelity Brokerage', type: 'Investment', description: 'Taxable brokerage account' },
    { name: '401k - Employer', type: 'Investment', description: 'Employer 401k retirement account' },
    { name: 'Roth IRA', type: 'Investment', description: 'Roth IRA retirement account' },
]

/**
 * Generate category definitions with hierarchical structure
 * @returns {Array<{name: string, description?: string, isIncomeCategory?: boolean, isTaxRelated?: boolean, budgetAmount?: number, taxSchedule?: string}>}
 */
export const generateCategories = () => [
    // Income categories
    {
        name: 'Income:Salary',
        description: 'Regular employment income',
        isIncomeCategory: true,
        isTaxRelated: true,
        taxSchedule: 'W-2',
    },
    {
        name: 'Income:Bonus',
        description: 'Employment bonuses',
        isIncomeCategory: true,
        isTaxRelated: true,
        taxSchedule: 'W-2',
    },
    {
        name: 'Income:Dividends',
        description: 'Stock dividends',
        isIncomeCategory: true,
        isTaxRelated: true,
        taxSchedule: '1099-DIV',
    },
    {
        name: 'Income:Interest',
        description: 'Bank interest',
        isIncomeCategory: true,
        isTaxRelated: true,
        taxSchedule: '1099-INT',
    },
    {
        name: 'Income:Capital Gains',
        description: 'Investment gains',
        isIncomeCategory: true,
        isTaxRelated: true,
        taxSchedule: '1099-B',
    },
    { name: 'Income:Gifts', description: 'Gifts received', isIncomeCategory: true },
    { name: 'Income:Refunds', description: 'Tax refunds and rebates', isIncomeCategory: true },

    // Housing expenses
    { name: 'Housing:Rent', description: 'Monthly rent payment', budgetAmount: 2000 },
    { name: 'Housing:Mortgage', description: 'Mortgage payment', isTaxRelated: true, taxSchedule: '1098' },
    { name: 'Housing:Insurance', description: 'Home insurance', budgetAmount: 150 },
    { name: 'Housing:Property Tax', description: 'Property taxes', isTaxRelated: true },
    { name: 'Housing:Maintenance', description: 'Home repairs and maintenance', budgetAmount: 200 },

    // Utilities
    { name: 'Utilities:Electric', description: 'Electric bill', budgetAmount: 120 },
    { name: 'Utilities:Gas', description: 'Gas/heating bill', budgetAmount: 80 },
    { name: 'Utilities:Water', description: 'Water and sewer', budgetAmount: 50 },
    { name: 'Utilities:Internet', description: 'Internet service', budgetAmount: 80 },
    { name: 'Utilities:Phone', description: 'Mobile phone', budgetAmount: 100 },
    { name: 'Utilities:Streaming', description: 'Streaming services', budgetAmount: 50 },

    // Food
    { name: 'Food:Groceries', description: 'Grocery shopping', budgetAmount: 600 },
    { name: 'Food:Dining', description: 'Restaurants and takeout', budgetAmount: 300 },
    { name: 'Food:Coffee', description: 'Coffee shops', budgetAmount: 50 },
    { name: 'Food:Alcohol', description: 'Beer, wine, spirits', budgetAmount: 100 },

    // Transportation
    { name: 'Transportation:Gas', description: 'Vehicle fuel', budgetAmount: 200 },
    { name: 'Transportation:Insurance', description: 'Auto insurance', budgetAmount: 150 },
    { name: 'Transportation:Maintenance', description: 'Car repairs and service', budgetAmount: 100 },
    { name: 'Transportation:Parking', description: 'Parking fees', budgetAmount: 50 },
    { name: 'Transportation:Public Transit', description: 'Bus, subway, train', budgetAmount: 100 },
    { name: 'Transportation:Rideshare', description: 'Uber, Lyft', budgetAmount: 100 },

    // Healthcare
    { name: 'Healthcare:Insurance', description: 'Health insurance premiums', isTaxRelated: true },
    { name: 'Healthcare:Doctor', description: 'Doctor visits and copays', isTaxRelated: true },
    { name: 'Healthcare:Dental', description: 'Dental care', isTaxRelated: true },
    { name: 'Healthcare:Vision', description: 'Eye care and glasses', isTaxRelated: true },
    { name: 'Healthcare:Pharmacy', description: 'Prescriptions', isTaxRelated: true },
    { name: 'Healthcare:Gym', description: 'Gym membership', budgetAmount: 50 },

    // Personal
    { name: 'Personal:Clothing', description: 'Clothes and accessories', budgetAmount: 150 },
    { name: 'Personal:Grooming', description: 'Haircuts and personal care', budgetAmount: 50 },
    { name: 'Personal:Education', description: 'Courses and books', budgetAmount: 100 },
    { name: 'Personal:Subscriptions', description: 'Magazines, apps, memberships', budgetAmount: 50 },

    // Entertainment
    { name: 'Entertainment:Movies', description: 'Movies and theater', budgetAmount: 50 },
    { name: 'Entertainment:Games', description: 'Video games', budgetAmount: 50 },
    { name: 'Entertainment:Sports', description: 'Sports events and equipment', budgetAmount: 100 },
    { name: 'Entertainment:Hobbies', description: 'Hobby supplies', budgetAmount: 100 },

    // Travel
    { name: 'Travel:Flights', description: 'Airfare', budgetAmount: 200 },
    { name: 'Travel:Hotels', description: 'Lodging', budgetAmount: 200 },
    { name: 'Travel:Car Rental', description: 'Rental cars', budgetAmount: 100 },
    { name: 'Travel:Vacation', description: 'General vacation expenses', budgetAmount: 300 },

    // Financial
    { name: 'Financial:Bank Fees', description: 'Bank charges', budgetAmount: 20 },
    { name: 'Financial:ATM Fees', description: 'ATM withdrawal fees', budgetAmount: 10 },
    { name: 'Financial:Credit Card Interest', description: 'Credit card interest charges' },
    { name: 'Financial:Investment Fees', description: 'Brokerage fees' },

    // Taxes
    { name: 'Taxes:Federal', description: 'Federal income tax', isTaxRelated: true },
    { name: 'Taxes:State', description: 'State income tax', isTaxRelated: true },
    { name: 'Taxes:FICA', description: 'Social security and Medicare', isTaxRelated: true },

    // Charitable
    {
        name: 'Charitable:Donations',
        description: 'Charitable contributions',
        isTaxRelated: true,
        taxSchedule: 'Schedule A',
    },

    // Transfers (special categories)
    { name: 'Transfer', description: 'Account transfers' },
]

/**
 * Generate security definitions
 * @returns {Array<{name: string, symbol: string, type: string, goal?: string}>}
 */
export const generateSecurities = () => [
    // Individual stocks
    { name: 'Apple Inc.', symbol: 'AAPL', type: 'Stock', goal: 'Growth' },
    { name: 'Microsoft Corporation', symbol: 'MSFT', type: 'Stock', goal: 'Growth' },
    { name: 'Alphabet Inc.', symbol: 'GOOGL', type: 'Stock', goal: 'Growth' },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', type: 'Stock', goal: 'Growth' },
    { name: 'NVIDIA Corporation', symbol: 'NVDA', type: 'Stock', goal: 'Growth' },
    { name: 'Johnson & Johnson', symbol: 'JNJ', type: 'Stock', goal: 'Income' },
    { name: 'Procter & Gamble', symbol: 'PG', type: 'Stock', goal: 'Income' },
    { name: 'Coca-Cola Company', symbol: 'KO', type: 'Stock', goal: 'Income' },

    // ETFs
    { name: 'Vanguard Total Stock Market ETF', symbol: 'VTI', type: 'ETF', goal: 'Growth' },
    { name: 'Vanguard Total International Stock ETF', symbol: 'VXUS', type: 'ETF', goal: 'Growth' },
    { name: 'Vanguard Total Bond Market ETF', symbol: 'BND', type: 'ETF', goal: 'Income' },
    { name: 'SPDR S&P 500 ETF', symbol: 'SPY', type: 'ETF', goal: 'Growth' },
    { name: 'iShares Core S&P 500 ETF', symbol: 'IVV', type: 'ETF', goal: 'Growth' },

    // Mutual Funds
    { name: 'Fidelity 500 Index Fund', symbol: 'FXAIX', type: 'Mutual Fund', goal: 'Growth' },
    { name: 'Vanguard Target Retirement 2045', symbol: 'VTIVX', type: 'Mutual Fund', goal: 'Growth' },
    { name: 'Fidelity Total Market Index', symbol: 'FSKAX', type: 'Mutual Fund', goal: 'Growth' },
    { name: 'Vanguard Total Bond Market Index', symbol: 'VBTLX', type: 'Mutual Fund', goal: 'Income' },
    { name: 'Fidelity Government Money Market', symbol: 'SPAXX', type: 'Mutual Fund', goal: 'Income' },

    // Additional dividend stocks
    { name: 'Realty Income Corporation', symbol: 'O', type: 'Stock', goal: 'Income' },
    { name: 'Verizon Communications', symbol: 'VZ', type: 'Stock', goal: 'Income' },
]

/**
 * Generate tag definitions
 * @returns {Array<{name: string, description?: string, color?: string}>}
 */
export const generateTags = () => [
    { name: 'Tax Deductible', description: 'Items that may be tax deductible', color: '#00FF00' },
    { name: 'Reimbursable', description: 'Expenses to be reimbursed', color: '#0000FF' },
    { name: 'Business', description: 'Business-related expenses', color: '#FF0000' },
    { name: 'Medical', description: 'Medical expenses for HSA/FSA', color: '#FF00FF' },
    { name: 'Vacation', description: 'Vacation-related spending', color: '#00FFFF' },
    { name: 'Gift', description: 'Gifts given or received', color: '#FFFF00' },
    { name: 'Recurring', description: 'Regular recurring expenses', color: '#808080' },
    { name: '2022', description: 'Transactions from 2022' },
    { name: '2023', description: 'Transactions from 2023' },
    { name: '2024', description: 'Transactions from 2024' },
]

/**
 * Generate payee definitions
 * @returns {Array<{name: string, address?: string[], defaultCategory?: string, memo?: string}>}
 */
export const generatePayees = () => [
    // Groceries
    {
        name: 'Whole Foods Market',
        address: ['123 Market St', 'San Francisco, CA 94102'],
        defaultCategory: 'Food:Groceries',
    },
    {
        name: "Trader Joe's",
        address: ['456 Grocery Ave', 'San Francisco, CA 94103'],
        defaultCategory: 'Food:Groceries',
    },
    { name: 'Safeway', defaultCategory: 'Food:Groceries' },
    { name: 'Costco', defaultCategory: 'Food:Groceries' },
    { name: 'Target', defaultCategory: 'Food:Groceries' },

    // Restaurants
    { name: 'Chipotle Mexican Grill', defaultCategory: 'Food:Dining' },
    { name: 'Starbucks', defaultCategory: 'Food:Coffee' },
    { name: "Peet's Coffee", defaultCategory: 'Food:Coffee' },
    { name: 'Thai Basil Restaurant', defaultCategory: 'Food:Dining' },
    { name: 'Pizza Hut', defaultCategory: 'Food:Dining' },
    { name: 'Uber Eats', defaultCategory: 'Food:Dining' },
    { name: 'DoorDash', defaultCategory: 'Food:Dining' },

    // Gas stations
    { name: 'Shell', defaultCategory: 'Transportation:Gas' },
    { name: 'Chevron', defaultCategory: 'Transportation:Gas' },
    { name: '76 Station', defaultCategory: 'Transportation:Gas' },

    // Utilities
    { name: 'PG&E', address: ['PO Box 997300', 'Sacramento, CA 95899'], defaultCategory: 'Utilities:Electric' },
    { name: 'Comcast Xfinity', defaultCategory: 'Utilities:Internet' },
    { name: 'AT&T Wireless', defaultCategory: 'Utilities:Phone' },
    { name: 'Netflix', defaultCategory: 'Utilities:Streaming' },
    { name: 'Spotify', defaultCategory: 'Utilities:Streaming' },
    { name: 'Disney+', defaultCategory: 'Utilities:Streaming' },

    // Housing
    {
        name: 'Bay Area Property Management',
        address: ['789 Property Lane', 'Oakland, CA 94612'],
        defaultCategory: 'Housing:Rent',
    },
    { name: 'State Farm Insurance', defaultCategory: 'Housing:Insurance' },
    { name: 'Home Depot', defaultCategory: 'Housing:Maintenance' },
    { name: "Lowe's", defaultCategory: 'Housing:Maintenance' },

    // Healthcare
    { name: 'Kaiser Permanente', defaultCategory: 'Healthcare:Doctor' },
    { name: 'CVS Pharmacy', defaultCategory: 'Healthcare:Pharmacy' },
    { name: 'Walgreens', defaultCategory: 'Healthcare:Pharmacy' },
    { name: 'Dr. Smith DDS', defaultCategory: 'Healthcare:Dental' },
    { name: '24 Hour Fitness', defaultCategory: 'Healthcare:Gym' },

    // Retail
    { name: 'Amazon', address: ['410 Terry Ave N', 'Seattle, WA 98109'], defaultCategory: 'Personal:Subscriptions' },
    { name: 'Apple Store', defaultCategory: 'Personal:Education' },
    { name: 'Best Buy', defaultCategory: 'Entertainment:Games' },
    { name: 'Nordstrom', defaultCategory: 'Personal:Clothing' },
    { name: 'REI', defaultCategory: 'Entertainment:Sports' },

    // Transportation
    { name: 'BART', defaultCategory: 'Transportation:Public Transit' },
    { name: 'Uber', defaultCategory: 'Transportation:Rideshare' },
    { name: 'Lyft', defaultCategory: 'Transportation:Rideshare' },
    { name: 'AAA', defaultCategory: 'Transportation:Insurance' },
    { name: 'Jiffy Lube', defaultCategory: 'Transportation:Maintenance' },

    // Travel
    { name: 'United Airlines', defaultCategory: 'Travel:Flights' },
    { name: 'Southwest Airlines', defaultCategory: 'Travel:Flights' },
    { name: 'Marriott Hotels', defaultCategory: 'Travel:Hotels' },
    { name: 'Airbnb', defaultCategory: 'Travel:Hotels' },
    { name: 'Hertz', defaultCategory: 'Travel:Car Rental' },

    // Financial
    { name: 'Chase Bank', defaultCategory: 'Financial:Bank Fees' },
    { name: 'Fidelity Investments', defaultCategory: 'Financial:Investment Fees' },

    // Employer
    {
        name: 'Acme Corporation',
        address: ['1000 Corporate Blvd', 'San Jose, CA 95110'],
        defaultCategory: 'Income:Salary',
        memo: 'Employer',
    },
]

/**
 * Generate class definitions
 * @returns {Array<{name: string, description?: string}>}
 */
export const generateClasses = () => [
    { name: 'Personal', description: 'Personal expenses' },
    { name: 'Business', description: 'Business-related expenses' },
    { name: 'Joint', description: 'Joint/shared expenses' },
    { name: 'Reimbursable', description: 'To be reimbursed' },
    { name: 'Tax Deductible', description: 'May be tax deductible' },
]

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Simple seeded random number generator for reproducible output
 */
const createRng = (seed = 12345) => {
    let state = seed
    return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff
        return state / 0x7fffffff
    }
}

/**
 * Pick random item from array using provided random function
 */
const pickRandom = (arr, random) => arr[Math.floor(random() * arr.length)]

/**
 * Generate random amount within range
 */
const randomAmount = (min, max, random) => {
    const amount = min + random() * (max - min)
    return Math.round(amount * 100) / 100
}

/**
 * Add days to date
 */
const addDays = (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

/**
 * Check if date is a weekday
 */
const isWeekday = date => {
    const day = date.getDay()
    return day !== 0 && day !== 6
}

/**
 * Get next weekday from date
 */
const nextWeekday = date => {
    let result = new Date(date)
    while (!isWeekday(result)) result = addDays(result, 1)

    return result
}

// =============================================================================
// Bank Transaction Generator
// =============================================================================

/**
 * Generate bank transactions across all non-investment accounts
 * @param {Array} accounts - Account definitions
 * @param {Array} categories - Category definitions
 * @param {Array} payees - Payee definitions
 * @returns {Array} Bank transactions
 */
export const generateBankTransactions = (accounts, categories, payees) => {
    const random = createRng(42)
    const transactions = []
    let checkNumber = 1001

    // Get specific accounts for transaction generation
    const checkingAccount = accounts.find(a => a.name === 'Primary Checking')
    const savingsAccount = accounts.find(a => a.name === 'Emergency Savings')
    const creditCard = accounts.find(a => a.name === 'Chase Sapphire')
    const cashAccount = accounts.find(a => a.name === 'Petty Cash')

    // Map payees by category for easy lookup
    const payeesByCategory = {}
    payees.forEach(p => {
        if (p.defaultCategory) {
            if (!payeesByCategory[p.defaultCategory]) payeesByCategory[p.defaultCategory] = []
            payeesByCategory[p.defaultCategory].push(p)
        }
    })

    // Date range: 2022-01-01 to 2024-12-31
    const startDate = new Date('2022-01-01')
    const endDate = new Date('2024-12-31')

    // Helper to create a transaction
    const createTransaction = (account, date, amount, payee, category, opts = {}) => ({
        account: account.name,
        transactionType: account.type === 'CCard' ? 'Credit Card' : account.type,
        date: new Date(date),
        amount,
        payee: payee?.name || payee,
        category,
        memo: opts.memo,
        number: opts.number,
        cleared: opts.cleared || (random() > 0.1 ? 'R' : random() > 0.5 ? 'c' : undefined),
        splits: opts.splits,
        address: payee?.address,
    })

    // Generate bi-weekly paydays
    let payday = nextWeekday(new Date('2022-01-14')) // First payday
    const employer = payees.find(p => p.name === 'Acme Corporation')
    while (payday <= endDate) {
        // Gross salary deposit
        transactions.push(
            createTransaction(checkingAccount, payday, 4500, employer, 'Income:Salary', {
                memo: 'Bi-weekly paycheck',
                cleared: 'R',
            }),
        )
        payday = addDays(payday, 14)
        payday = nextWeekday(payday)
    }

    // Generate annual bonuses (March each year)
    for (let year = 2022; year <= 2024; year++) {
        const bonusDate = new Date(`${year}-03-15`)
        transactions.push(
            createTransaction(checkingAccount, bonusDate, randomAmount(5000, 15000, random), employer, 'Income:Bonus', {
                memo: `${year} Annual bonus`,
                cleared: 'R',
            }),
        )
    }

    // Generate monthly rent
    let rentDate = new Date('2022-01-01')
    const landlord = payees.find(p => p.name === 'Bay Area Property Management')
    while (rentDate <= endDate) {
        transactions.push(
            createTransaction(checkingAccount, rentDate, -2200, landlord, 'Housing:Rent', {
                memo: `Rent for ${rentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                number: String(checkNumber++),
                cleared: 'R',
            }),
        )
        rentDate = addDays(rentDate, 30)
        rentDate.setDate(1) // First of month
        rentDate = new Date(rentDate.getFullYear(), rentDate.getMonth() + 1, 1)
    }

    // Generate monthly utility bills
    const monthlyBills = [
        { payee: 'PG&E', category: 'Utilities:Electric', min: 80, max: 180 },
        { payee: 'Comcast Xfinity', category: 'Utilities:Internet', min: 79, max: 85 },
        { payee: 'AT&T Wireless', category: 'Utilities:Phone', min: 95, max: 105 },
        { payee: 'State Farm Insurance', category: 'Housing:Insurance', min: 140, max: 160 },
    ]

    let billDate = new Date('2022-01-15')
    while (billDate <= endDate) {
        for (const bill of monthlyBills) {
            const billPayee = payees.find(p => p.name === bill.payee)
            transactions.push(
                createTransaction(
                    checkingAccount,
                    addDays(billDate, Math.floor(random() * 10)),
                    -randomAmount(bill.min, bill.max, random),
                    billPayee,
                    bill.category,
                    { cleared: 'R' },
                ),
            )
        }
        billDate = new Date(billDate.getFullYear(), billDate.getMonth() + 1, 15)
    }

    // Generate streaming subscriptions (credit card)
    const subscriptions = [
        { payee: 'Netflix', amount: 15.99 },
        { payee: 'Spotify', amount: 10.99 },
        { payee: 'Disney+', amount: 7.99 },
        { payee: 'Amazon', amount: 14.99 },
    ]

    let subDate = new Date('2022-01-05')
    while (subDate <= endDate) {
        for (const sub of subscriptions) {
            const subPayee = payees.find(p => p.name === sub.payee)
            transactions.push(
                createTransaction(
                    creditCard,
                    addDays(subDate, Math.floor(random() * 5)),
                    -sub.amount,
                    subPayee,
                    subPayee?.defaultCategory || 'Utilities:Streaming',
                    { cleared: 'R' },
                ),
            )
        }
        subDate = new Date(subDate.getFullYear(), subDate.getMonth() + 1, 5)
    }

    // Generate daily expenses (groceries, dining, gas, etc.)
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
        // Grocery shopping (2-3 times per week)
        if (random() < 0.4) {
            const groceryPayees = payeesByCategory['Food:Groceries'] || []
            const groceryPayee = pickRandom(groceryPayees, random)
            const account = random() > 0.3 ? creditCard : checkingAccount
            transactions.push(
                createTransaction(account, currentDate, -randomAmount(40, 180, random), groceryPayee, 'Food:Groceries'),
            )
        }

        // Dining out (3-4 times per week)
        if (random() < 0.5) {
            const diningPayees = payeesByCategory['Food:Dining'] || []
            const diningPayee = pickRandom(diningPayees, random)
            transactions.push(
                createTransaction(creditCard, currentDate, -randomAmount(12, 75, random), diningPayee, 'Food:Dining'),
            )
        }

        // Coffee (most weekdays)
        if (isWeekday(currentDate) && random() < 0.6) {
            const coffeePayees = payeesByCategory['Food:Coffee'] || []
            const coffeePayee = pickRandom(coffeePayees, random)
            transactions.push(
                createTransaction(creditCard, currentDate, -randomAmount(4, 8, random), coffeePayee, 'Food:Coffee'),
            )
        }

        // Gas (once a week)
        if (random() < 0.15) {
            const gasPayees = payeesByCategory['Transportation:Gas'] || []
            const gasPayee = pickRandom(gasPayees, random)
            transactions.push(
                createTransaction(
                    creditCard,
                    currentDate,
                    -randomAmount(35, 75, random),
                    gasPayee,
                    'Transportation:Gas',
                ),
            )
        }

        // Rideshare (weekends)
        if (!isWeekday(currentDate) && random() < 0.3) {
            const ridePayees = payeesByCategory['Transportation:Rideshare'] || []
            const ridePayee = pickRandom(ridePayees, random)
            transactions.push(
                createTransaction(
                    creditCard,
                    currentDate,
                    -randomAmount(15, 45, random),
                    ridePayee,
                    'Transportation:Rideshare',
                ),
            )
        }

        // Random shopping (few times a month)
        if (random() < 0.08) {
            const shoppingCategories = [
                'Personal:Clothing',
                'Entertainment:Games',
                'Entertainment:Sports',
                'Personal:Education',
            ]
            const category = pickRandom(shoppingCategories, random)
            const shopPayees = payeesByCategory[category] || [{ name: 'General Store' }]
            const shopPayee = pickRandom(shopPayees, random)
            transactions.push(
                createTransaction(creditCard, currentDate, -randomAmount(25, 200, random), shopPayee, category),
            )
        }

        currentDate = addDays(currentDate, 1)
    }

    // Generate split transactions (monthly credit card payments with categorized items)
    let splitDate = new Date('2022-01-20')
    while (splitDate <= endDate) {
        if (random() < 0.3) {
            // Create a split grocery transaction
            const groceryPayee = pickRandom(payeesByCategory['Food:Groceries'] || [], random)
            const totalAmount = randomAmount(80, 200, random)
            const groceryPortion = Math.round(totalAmount * 0.7 * 100) / 100
            const householdPortion = Math.round((totalAmount - groceryPortion) * 100) / 100

            transactions.push(
                createTransaction(creditCard, splitDate, -totalAmount, groceryPayee, null, {
                    memo: 'Split purchase - groceries and household',
                    splits: [
                        { category: 'Food:Groceries', amount: -groceryPortion },
                        { category: 'Housing:Maintenance', amount: -householdPortion },
                    ],
                }),
            )
        }
        splitDate = addDays(splitDate, Math.floor(random() * 14) + 7)
    }

    // Generate transfers between accounts
    let transferDate = new Date('2022-01-25')
    while (transferDate <= endDate) {
        // Monthly savings transfer
        const savingsAmount = randomAmount(500, 1500, random)
        transactions.push(
            createTransaction(
                checkingAccount,
                transferDate,
                -savingsAmount,
                'Transfer to Savings',
                `[${savingsAccount.name}]`,
                { memo: 'Monthly savings contribution', cleared: 'R' },
            ),
        )
        transactions.push(
            createTransaction(
                savingsAccount,
                transferDate,
                savingsAmount,
                'Transfer from Checking',
                `[${checkingAccount.name}]`,
                { memo: 'Monthly savings contribution', cleared: 'R' },
            ),
        )
        transferDate = new Date(transferDate.getFullYear(), transferDate.getMonth() + 1, 25)
    }

    // Credit card payments (monthly)
    let ccPayDate = new Date('2022-01-28')
    while (ccPayDate <= endDate) {
        const paymentAmount = randomAmount(1500, 3500, random)
        transactions.push(
            createTransaction(checkingAccount, ccPayDate, -paymentAmount, 'Chase Bank', `[${creditCard.name}]`, {
                memo: 'Credit card payment',
                number: String(checkNumber++),
                cleared: 'R',
            }),
        )
        transactions.push(
            createTransaction(
                creditCard,
                ccPayDate,
                paymentAmount,
                'Payment from Checking',
                `[${checkingAccount.name}]`,
                { memo: 'Payment received', cleared: 'R' },
            ),
        )
        ccPayDate = new Date(ccPayDate.getFullYear(), ccPayDate.getMonth() + 1, 28)
    }

    // ATM withdrawals to cash (occasional)
    let atmDate = new Date('2022-01-10')
    while (atmDate <= endDate) {
        if (random() < 0.4) {
            const atmAmount = pickRandom([40, 60, 80, 100, 200], random)
            transactions.push(
                createTransaction(checkingAccount, atmDate, -atmAmount, 'ATM Withdrawal', `[${cashAccount.name}]`, {
                    memo: 'Cash withdrawal',
                }),
            )
            transactions.push(
                createTransaction(cashAccount, atmDate, atmAmount, 'ATM Deposit', `[${checkingAccount.name}]`, {
                    memo: 'Cash from ATM',
                }),
            )
        }
        atmDate = addDays(atmDate, Math.floor(random() * 20) + 10)
    }

    // Healthcare expenses (occasional)
    let healthDate = new Date('2022-02-15')
    while (healthDate <= endDate) {
        if (random() < 0.3) {
            const healthPayees = [
                ...(payeesByCategory['Healthcare:Doctor'] || []),
                ...(payeesByCategory['Healthcare:Pharmacy'] || []),
            ]
            const healthPayee = pickRandom(healthPayees, random)
            const category = healthPayee?.defaultCategory || 'Healthcare:Doctor'
            transactions.push(
                createTransaction(creditCard, healthDate, -randomAmount(20, 150, random), healthPayee, category, {
                    memo: 'Medical expense',
                }),
            )
        }
        healthDate = addDays(healthDate, Math.floor(random() * 30) + 15)
    }

    // Travel expenses (few times per year)
    for (let year = 2022; year <= 2024; year++) {
        // Summer vacation
        const summerStart = new Date(`${year}-07-${10 + Math.floor(random() * 10)}`)
        const airline = pickRandom(
            [payees.find(p => p.name === 'United Airlines'), payees.find(p => p.name === 'Southwest Airlines')],
            random,
        )
        const hotel = pickRandom(
            [payees.find(p => p.name === 'Marriott Hotels'), payees.find(p => p.name === 'Airbnb')],
            random,
        )

        transactions.push(
            createTransaction(creditCard, summerStart, -randomAmount(300, 800, random), airline, 'Travel:Flights', {
                memo: 'Summer vacation flights',
            }),
        )
        transactions.push(
            createTransaction(
                creditCard,
                addDays(summerStart, 1),
                -randomAmount(500, 1500, random),
                hotel,
                'Travel:Hotels',
                { memo: 'Summer vacation lodging' },
            ),
        )

        // Holiday travel
        const holidayDate = new Date(`${year}-12-20`)
        transactions.push(
            createTransaction(creditCard, holidayDate, -randomAmount(250, 600, random), airline, 'Travel:Flights', {
                memo: 'Holiday travel',
            }),
        )
    }

    // Bank interest (quarterly)
    let interestDate = new Date('2022-03-31')
    while (interestDate <= endDate) {
        transactions.push(
            createTransaction(
                savingsAccount,
                interestDate,
                randomAmount(5, 25, random),
                'Interest Payment',
                'Income:Interest',
                { memo: 'Quarterly interest', cleared: 'R' },
            ),
        )
        interestDate = new Date(interestDate.getFullYear(), interestDate.getMonth() + 3, 0) // Last day of quarter
        interestDate = new Date(interestDate.getFullYear(), interestDate.getMonth() + 4, 0)
    }

    // Sort by date
    transactions.sort((a, b) => a.date - b.date)

    return transactions
}

// =============================================================================
// Investment Transaction Generator
// =============================================================================

/**
 * Generate investment transactions across all investment accounts
 * @param {Array} accounts - Account definitions
 * @param {Array} securities - Security definitions
 * @returns {Array} Investment transactions
 */
export const generateInvestmentTransactions = (accounts, securities) => {
    const random = createRng(123)
    const transactions = []

    // Get specific investment accounts
    const brokerage = accounts.find(a => a.name === 'Fidelity Brokerage')
    const k401 = accounts.find(a => a.name === '401k - Employer')
    const ira = accounts.find(a => a.name === 'Roth IRA')

    // Categorize securities
    const stocks = securities.filter(s => s.type === 'Stock')
    const etfs = securities.filter(s => s.type === 'ETF')
    const mutualFunds = securities.filter(s => s.type === 'Mutual Fund')
    const dividendStocks = securities.filter(s => s.goal === 'Income')

    // Date range
    const startDate = new Date('2022-01-01')
    const endDate = new Date('2024-12-31')

    // Helper to create an investment transaction
    const createInvestTx = (account, date, type, opts = {}) => ({
        account: account.name,
        transactionType: type,
        date: new Date(date),
        security: opts.security,
        price: opts.price,
        quantity: opts.quantity,
        amount: opts.amount,
        commission: opts.commission,
        memo: opts.memo,
        category: opts.category,
        cleared: opts.cleared || 'R',
    })

    // Simulated price data for securities (approximate historical prices)
    const basePrices = {
        AAPL: 150,
        MSFT: 280,
        GOOGL: 2500,
        AMZN: 3200,
        NVDA: 200,
        JNJ: 165,
        PG: 150,
        KO: 60,
        VTI: 220,
        VXUS: 55,
        BND: 82,
        SPY: 450,
        IVV: 450,
        FXAIX: 170,
        VTIVX: 45,
        FSKAX: 130,
        VBTLX: 11,
        SPAXX: 1,
        O: 70,
        VZ: 50,
    }

    // Function to get simulated price for a date
    const getPrice = (symbol, date) => {
        const base = basePrices[symbol] || 100
        const daysSinceStart = (date - startDate) / (1000 * 60 * 60 * 24)
        // Add some trend and volatility
        const trend = 1 + (daysSinceStart / 1095) * 0.3 * (random() - 0.3) // up to 30% growth over 3 years
        const volatility = 1 + (random() - 0.5) * 0.1 // +/- 5% daily variation
        return Math.round(base * trend * volatility * 100) / 100
    }

    // 401k contributions (bi-weekly, matching paydays)
    let k401Date = nextWeekday(new Date('2022-01-14'))
    const k401Fund = mutualFunds.find(s => s.symbol === 'VTIVX') || mutualFunds[0]
    while (k401Date <= endDate) {
        const contributionAmount = 750 // Employee contribution
        const matchAmount = 375 // 50% employer match up to 6%
        const price = getPrice(k401Fund.symbol, k401Date)
        const shares = Math.round((contributionAmount / price) * 10000) / 10000

        // Employee contribution
        transactions.push(
            createInvestTx(k401, k401Date, 'ContribX', {
                security: k401Fund.symbol,
                price,
                quantity: shares,
                amount: contributionAmount,
                memo: '401k employee contribution',
                category: '[Primary Checking]',
            }),
        )

        // Employer match
        const matchShares = Math.round((matchAmount / price) * 10000) / 10000
        transactions.push(
            createInvestTx(k401, k401Date, 'ContribX', {
                security: k401Fund.symbol,
                price,
                quantity: matchShares,
                amount: matchAmount,
                memo: '401k employer match',
            }),
        )

        k401Date = addDays(k401Date, 14)
        k401Date = nextWeekday(k401Date)
    }

    // IRA contributions (annual)
    for (let year = 2022; year <= 2024; year++) {
        const iraDate = new Date(`${year}-04-01`) // Around tax time
        const iraFund = mutualFunds.find(s => s.symbol === 'FXAIX') || mutualFunds[0]
        const contributionAmount = 6500 // IRA limit
        const price = getPrice(iraFund.symbol, iraDate)
        const shares = Math.round((contributionAmount / price) * 10000) / 10000

        transactions.push(
            createInvestTx(ira, iraDate, 'ContribX', {
                security: iraFund.symbol,
                price,
                quantity: shares,
                amount: contributionAmount,
                memo: `${year} Roth IRA contribution`,
                category: '[Primary Checking]',
            }),
        )
    }

    // Brokerage - initial purchases at start
    const initialStocks = [stocks[0], stocks[1], etfs[0], etfs[2]] // AAPL, MSFT, VTI, SPY
    for (const stock of initialStocks) {
        const buyDate = addDays(startDate, Math.floor(random() * 30))
        const price = getPrice(stock.symbol, buyDate)
        const investAmount = randomAmount(5000, 15000, random)
        const shares = Math.round((investAmount / price) * 10000) / 10000
        const commission = 0 // Commission-free trading

        transactions.push(
            createInvestTx(brokerage, buyDate, 'Buy', {
                security: stock.symbol,
                price,
                quantity: shares,
                amount: investAmount,
                commission,
                memo: `Initial purchase of ${stock.name}`,
                category: '[Primary Checking]',
            }),
        )
    }

    // Quarterly dividends for dividend stocks
    for (let year = 2022; year <= 2024; year++)
        for (const quarter of [1, 4, 7, 10]) {
            // Dividend months
            const divDate = new Date(year, quarter - 1, 15)
            if (divDate > endDate) continue

            for (const stock of dividendStocks.slice(0, 4)) {
                // JNJ, PG, KO, O
                const divAmount = randomAmount(15, 80, random)
                const price = getPrice(stock.symbol, divDate)

                // Regular dividend
                transactions.push(
                    createInvestTx(brokerage, divDate, 'Div', {
                        security: stock.symbol,
                        amount: divAmount,
                        memo: `Q${Math.ceil(quarter / 3)} ${year} dividend`,
                    }),
                )

                // Some dividends get reinvested
                if (random() < 0.5) {
                    const reinvestShares = Math.round((divAmount / price) * 10000) / 10000
                    transactions.push(
                        createInvestTx(brokerage, addDays(divDate, 1), 'ReinvDiv', {
                            security: stock.symbol,
                            price,
                            quantity: reinvestShares,
                            amount: divAmount,
                            memo: 'Dividend reinvestment',
                        }),
                    )
                }
            }
        }

    // ETF distributions (quarterly)
    for (let year = 2022; year <= 2024; year++)
        for (const quarter of [3, 6, 9, 12]) {
            const distDate = new Date(year, quarter - 1, 20)
            if (distDate > endDate) continue

            const vti = etfs.find(s => s.symbol === 'VTI')
            if (vti) {
                // Dividend distribution
                transactions.push(
                    createInvestTx(brokerage, distDate, 'Div', {
                        security: vti.symbol,
                        amount: randomAmount(50, 150, random),
                        memo: `Q${quarter / 3} ${year} VTI distribution`,
                    }),
                )

                // Year-end capital gains distribution
                if (quarter === 12)
                    transactions.push(
                        createInvestTx(brokerage, addDays(distDate, 5), 'CGLong', {
                            security: vti.symbol,
                            amount: randomAmount(100, 300, random),
                            memo: `${year} long-term capital gains distribution`,
                        }),
                    )
            }
        }

    // Occasional brokerage trades (buys and sells)
    let tradeDate = addDays(startDate, 60)
    while (tradeDate <= endDate) {
        if (random() < 0.3) {
            const stock = pickRandom([...stocks, ...etfs], random)
            const price = getPrice(stock.symbol, tradeDate)

            if (random() < 0.7) {
                // Buy
                const investAmount = randomAmount(1000, 5000, random)
                const shares = Math.round((investAmount / price) * 10000) / 10000
                transactions.push(
                    createInvestTx(brokerage, tradeDate, 'Buy', {
                        security: stock.symbol,
                        price,
                        quantity: shares,
                        amount: investAmount,
                        memo: `Purchase ${stock.symbol}`,
                        category: '[Primary Checking]',
                    }),
                )
            } else {
                // Sell
                const shares = randomAmount(5, 20, random)
                const saleAmount = Math.round(shares * price * 100) / 100
                transactions.push(
                    createInvestTx(brokerage, tradeDate, 'Sell', {
                        security: stock.symbol,
                        price,
                        quantity: shares,
                        amount: saleAmount,
                        memo: `Sell ${stock.symbol}`,
                        category: '[Primary Checking]',
                    }),
                )
            }
        }
        tradeDate = addDays(tradeDate, Math.floor(random() * 14) + 7)
    }

    // Annual rebalancing (December each year)
    for (let year = 2022; year <= 2024; year++) {
        const rebalDate = new Date(`${year}-12-10`)

        // Sell overweight positions
        const sellStock = pickRandom(stocks, random)
        const sellPrice = getPrice(sellStock.symbol, rebalDate)
        const sellShares = randomAmount(10, 30, random)
        const sellAmount = Math.round(sellShares * sellPrice * 100) / 100

        transactions.push(
            createInvestTx(brokerage, rebalDate, 'Sell', {
                security: sellStock.symbol,
                price: sellPrice,
                quantity: sellShares,
                amount: sellAmount,
                memo: `${year} rebalancing - reduce ${sellStock.symbol}`,
            }),
        )

        // Buy underweight positions
        const buyStock = pickRandom(etfs, random)
        const buyPrice = getPrice(buyStock.symbol, addDays(rebalDate, 1))
        const buyShares = Math.round((sellAmount / buyPrice) * 10000) / 10000

        transactions.push(
            createInvestTx(brokerage, addDays(rebalDate, 1), 'Buy', {
                security: buyStock.symbol,
                price: buyPrice,
                quantity: buyShares,
                amount: sellAmount,
                memo: `${year} rebalancing - increase ${buyStock.symbol}`,
            }),
        )
    }

    // IRA reinvestments (similar pattern to brokerage)
    let iraTradeDate = addDays(startDate, 120)
    while (iraTradeDate <= endDate) {
        if (random() < 0.2) {
            const fund = pickRandom(mutualFunds, random)
            const price = getPrice(fund.symbol, iraTradeDate)
            const investAmount = randomAmount(500, 2000, random)
            const shares = Math.round((investAmount / price) * 10000) / 10000

            transactions.push(
                createInvestTx(ira, iraTradeDate, 'Buy', {
                    security: fund.symbol,
                    price,
                    quantity: shares,
                    amount: investAmount,
                    memo: `IRA purchase ${fund.symbol}`,
                }),
            )
        }
        iraTradeDate = addDays(iraTradeDate, Math.floor(random() * 30) + 20)
    }

    // Money market interest in brokerage (monthly)
    let mmDate = new Date('2022-01-31')
    const mmFund = mutualFunds.find(s => s.symbol === 'SPAXX')
    while (mmDate <= endDate) {
        transactions.push(
            createInvestTx(brokerage, mmDate, 'IntInc', {
                security: mmFund?.symbol,
                amount: randomAmount(2, 15, random),
                memo: 'Money market interest',
            }),
        )
        mmDate = new Date(mmDate.getFullYear(), mmDate.getMonth() + 1, 0)
        mmDate = new Date(mmDate.getFullYear(), mmDate.getMonth() + 2, 0)
    }

    // Transfer shares between accounts (IRA to brokerage - rare)
    const xferDate = new Date('2023-06-15')
    const xferStock = stocks[0]
    const xferPrice = getPrice(xferStock.symbol, xferDate)
    const xferShares = 10

    transactions.push(
        createInvestTx(ira, xferDate, 'ShrsOut', {
            security: xferStock.symbol,
            price: xferPrice,
            quantity: xferShares,
            amount: xferShares * xferPrice,
            memo: 'Transfer to brokerage',
        }),
    )
    transactions.push(
        createInvestTx(brokerage, xferDate, 'ShrsIn', {
            security: xferStock.symbol,
            price: xferPrice,
            quantity: xferShares,
            amount: xferShares * xferPrice,
            memo: 'Transfer from IRA',
        }),
    )

    // Sort by date
    transactions.sort((a, b) => a.date - b.date)

    return transactions
}

// =============================================================================
// Price Generator
// =============================================================================

/**
 * Generate historical price data for securities
 * @param {Array} securities - Security definitions
 * @returns {Array} Price records
 */
export const generatePrices = securities => {
    const random = createRng(456)
    const prices = []

    // Base prices for securities
    const basePrices = {
        AAPL: 150,
        MSFT: 280,
        GOOGL: 2500,
        AMZN: 3200,
        NVDA: 200,
        JNJ: 165,
        PG: 150,
        KO: 60,
        VTI: 220,
        VXUS: 55,
        BND: 82,
        SPY: 450,
        IVV: 450,
        FXAIX: 170,
        VTIVX: 45,
        FSKAX: 130,
        VBTLX: 11,
        SPAXX: 1,
        O: 70,
        VZ: 50,
    }

    const startDate = new Date('2022-01-01')
    const endDate = new Date('2024-12-31')

    // Generate weekly prices for each security
    for (const security of securities) {
        const basePrice = basePrices[security.symbol] || 100
        let currentPrice = basePrice
        let currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            // Random walk with slight upward bias
            const change = (random() - 0.48) * 0.03 // -1.5% to +1.5% weekly, slight upward bias
            currentPrice = Math.max(1, currentPrice * (1 + change))
            currentPrice = Math.round(currentPrice * 100) / 100

            prices.push({ symbol: security.symbol, price: currentPrice, date: new Date(currentDate) })

            // Weekly prices
            currentDate = addDays(currentDate, 7)
        }
    }

    // Sort by date
    prices.sort((a, b) => a.date - b.date)

    return prices
}

// =============================================================================
// QIF Serialization
// =============================================================================

/**
 * Format date as MM/DD/YYYY for QIF
 */
const formatQifDate = date => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
}

/**
 * Format amount for QIF (no currency symbol, comma separators optional)
 */
const formatQifAmount = amount => {
    if (amount === undefined || amount === null) return undefined
    return amount.toFixed(2)
}

/**
 * Serialize accounts to QIF format
 */
const serializeAccounts = accounts => {
    let output = ''
    for (const account of accounts) {
        output += '!Account\n'
        output += `N${account.name}\n`
        output += `T${account.type === 'Investment' ? 'Invst' : account.type}\n`
        if (account.description) output += `D${account.description}\n`
        output += '^\n'
    }
    return output
}

/**
 * Serialize categories to QIF format
 */
const serializeCategories = categories => {
    let output = '!Type:Cat\n'
    for (const category of categories) {
        output += `N${category.name}\n`
        if (category.description) output += `D${category.description}\n`
        if (category.isTaxRelated) output += 'T\n'
        if (category.isIncomeCategory) output += 'I\n'
        if (category.budgetAmount) output += `B${category.budgetAmount}\n`
        if (category.taxSchedule) output += `R${category.taxSchedule}\n`
        output += '^\n'
    }
    return output
}

/**
 * Serialize securities to QIF format
 */
const serializeSecurities = securities => {
    let output = ''
    for (const security of securities) {
        output += '!Type:Security\n'
        output += `N${security.symbol}\n`
        output += `S${security.name}\n`
        output += `T${security.type}\n`
        if (security.goal) output += `G${security.goal}\n`
        output += '^\n'
    }
    return output
}

/**
 * Serialize tags to QIF format
 */
const serializeTags = tags => {
    let output = ''
    for (const tag of tags) {
        output += '!Type:Tag\n'
        output += `N${tag.name}\n`
        if (tag.description) output += `D${tag.description}\n`
        if (tag.color) output += `C${tag.color}\n`
        output += '^\n'
    }
    return output
}

/**
 * Serialize classes to QIF format
 */
const serializeClasses = classes => {
    let output = ''
    for (const cls of classes) {
        output += '!Type:Class\n'
        output += `N${cls.name}\n`
        if (cls.description) output += `D${cls.description}\n`
        output += '^\n'
    }
    return output
}

/**
 * Serialize bank transactions to QIF format, grouped by account
 */
const serializeBankTransactions = (transactions, accounts) => {
    let output = ''

    // Group transactions by account
    const byAccount = {}
    for (const tx of transactions) {
        if (!byAccount[tx.account]) byAccount[tx.account] = []
        byAccount[tx.account].push(tx)
    }

    // Output each account's transactions
    for (const [accountName, txs] of Object.entries(byAccount)) {
        const account = accounts.find(a => a.name === accountName)
        if (!account || account.type === 'Investment') continue

        // Account header
        output += '!Account\n'
        output += `N${accountName}\n`
        output += `T${account.type}\n`
        output += '^\n'

        // Type header based on account type
        const typeMap = { Bank: 'Bank', CCard: 'CCard', Cash: 'Cash', 'Credit Card': 'CCard' }
        output += `!Type:${typeMap[account.type] || 'Bank'}\n`

        // Transactions
        for (const tx of txs) {
            output += `D${formatQifDate(tx.date)}\n`
            if (tx.amount !== undefined) output += `T${formatQifAmount(tx.amount)}\n`
            if (tx.payee) output += `P${tx.payee}\n`
            if (tx.number) output += `N${tx.number}\n`
            if (tx.memo) output += `M${tx.memo}\n`
            if (tx.category) output += `L${tx.category}\n`
            if (tx.cleared) output += `C${tx.cleared}\n`
            if (tx.address) for (const line of tx.address) output += `A${line}\n`

            if (tx.splits)
                for (const split of tx.splits) {
                    output += `S${split.category}\n`
                    if (split.memo) output += `E${split.memo}\n`
                    output += `$${formatQifAmount(split.amount)}\n`
                }

            output += '^\n'
        }
    }

    return output
}

/**
 * Serialize investment transactions to QIF format, grouped by account
 */
const serializeInvestmentTransactions = (transactions, accounts) => {
    let output = ''

    // Group transactions by account
    const byAccount = {}
    for (const tx of transactions) {
        if (!byAccount[tx.account]) byAccount[tx.account] = []
        byAccount[tx.account].push(tx)
    }

    // Output each account's transactions
    for (const [accountName, txs] of Object.entries(byAccount)) {
        const account = accounts.find(a => a.name === accountName)
        if (!account || account.type !== 'Investment') continue

        // Account header
        output += '!Account\n'
        output += `N${accountName}\n`
        output += 'TInvst\n'
        output += '^\n'

        // Type header
        output += '!Type:Invst\n'

        // Transactions
        for (const tx of txs) {
            output += `D${formatQifDate(tx.date)}\n`
            output += `N${tx.transactionType}\n`
            if (tx.security) output += `Y${tx.security}\n`
            if (tx.price !== undefined) output += `I${formatQifAmount(tx.price)}\n`
            if (tx.quantity !== undefined) output += `Q${tx.quantity}\n`
            if (tx.amount !== undefined) output += `T${formatQifAmount(tx.amount)}\n`
            if (tx.commission !== undefined) output += `O${formatQifAmount(tx.commission)}\n`
            if (tx.memo) output += `M${tx.memo}\n`
            if (tx.category) output += `L${tx.category}\n`
            if (tx.cleared) output += `C${tx.cleared}\n`
            output += '^\n'
        }
    }

    return output
}

/**
 * Serialize prices to QIF format
 */
const serializePrices = prices => {
    let output = '!Type:Prices\n'
    // Format: "SYMBOL",price,"MM/DD/YYYY"
    for (const price of prices)
        output += `"${price.symbol}",${formatQifAmount(price.price)},"${formatQifDate(price.date)}"\n`

    output += '^\n'
    return output
}

/**
 * Serialize all data to complete QIF string
 * @param {Object} data - All generated data
 * @returns {string} Complete QIF file content
 */
export const serializeToQif = data => {
    let output = ''

    // QIF options
    output += '!Option:AutoSwitch\n'
    output += '!Clear:AutoSwitch\n'

    // Reference data
    output += serializeAccounts(data.accounts)
    output += serializeCategories(data.categories)
    output += serializeSecurities(data.securities)
    output += serializeTags(data.tags)
    output += serializeClasses(data.classes)

    // Transactions
    output += serializeBankTransactions(data.bankTransactions, data.accounts)
    output += serializeInvestmentTransactions(data.investmentTransactions, data.accounts)

    // Prices
    output += serializePrices(data.prices)

    return output
}

const __dirname = dirname(fileURLToPath(import.meta.url))

const main = () => {
    console.log('Generating comprehensive QIF file...')

    const accounts = generateAccounts()
    const categories = generateCategories()
    const securities = generateSecurities()
    const tags = generateTags()
    const payees = generatePayees()
    const classes = generateClasses()

    console.log(`  Accounts: ${accounts.length}`)
    console.log(`  Categories: ${categories.length}`)
    console.log(`  Securities: ${securities.length}`)
    console.log(`  Tags: ${tags.length}`)
    console.log(`  Payees: ${payees.length}`)
    console.log(`  Classes: ${classes.length}`)

    console.log('\nGenerating transactions...')
    const bankTransactions = generateBankTransactions(accounts, categories, payees)
    console.log(`  Bank transactions: ${bankTransactions.length}`)

    const investmentTransactions = generateInvestmentTransactions(accounts, securities)
    console.log(`  Investment transactions: ${investmentTransactions.length}`)

    console.log('\nGenerating prices...')
    const prices = generatePrices(securities)
    console.log(`  Price records: ${prices.length}`)

    console.log('\nSerializing to QIF...')
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
    console.log(`  QIF size: ${qifString.length} characters`)

    const outputPath = resolve(__dirname, '../test/test-data/comprehensive.qif')
    writeFileSync(outputPath, qifString)
    console.log(`\nWritten to: ${outputPath}`)

    console.log('\nSummary:')
    console.log(`  Total transactions: ${bankTransactions.length + investmentTransactions.length}`)
    console.log(`  Date range: 2022-01-01 to 2024-12-31`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) main()
