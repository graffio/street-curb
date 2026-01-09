// ABOUTME: Transaction database operations for QIF import
// ABOUTME: Handles bank and investment transaction CRUD with split support

// COMPLEXITY-TODO: lines — Transaction module is large, split deferred (expires 2026-04-01)
// COMPLEXITY-TODO: functions — Many transaction helpers needed (expires 2026-04-01)
// COMPLEXITY-TODO: cohesion-structure — Pre-existing debt, needs cohesion groups (expires 2026-04-01)
// COMPLEXITY-TODO: exports — Module exports many transaction functions (expires 2026-04-01)

import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Entry, Transaction } from '../../types/index.js'

/*
 * Generate transaction ID from key fields, with database-based ordinal suffix for collisions
 * @sig generateTransactionId :: (Database, Object) -> String
 */
const generateTransactionId = (db, fields) => {
    const hash = hashFields(fields)
    const baseId = `txn_${hash}`

    // Check if collision - query DB for next suffix
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(baseId)
    if (!existing) return baseId

    // Find highest existing suffix
    const maxRow = db.prepare(`SELECT id FROM transactions WHERE id LIKE ? ORDER BY id DESC LIMIT 1`).get(`${baseId}-%`)

    const nextSuffix = maxRow ? parseInt(maxRow.id.split('-').pop()) + 1 : 2
    return `${baseId}-${nextSuffix}`
}

/*
 * Convert address array to newline-joined string
 * @sig getAddressString :: [String]? -> String?
 */
const getAddressString = address => (!address ? null : address.join('\n'))

/*
 * Format date object to ISO date string
 * @sig formatDate :: Date -> String
 */
const formatDate = date => date.toISOString().split('T')[0]

/*
 * Create account lookup map for efficient lookups
 * @sig createAccountMap :: [Account] -> Map<String, Account>
 */
const createAccountMap = accounts => {
    const accountMap = new Map()
    accounts.forEach(account => accountMap.set(account.name, account))
    return accountMap
}

/*
 * Find account by name in account map
 * @sig findAccount :: (Map<String, Account>, String) -> Account
 */
const findAccount = (accountMap, accountName) => {
    const account = accountMap.get(accountName)
    if (!account) throw new Error(`Account not found for transaction: ${accountName}`)
    return account
}

/*
 * Get all transactions from database
 * @sig getAllTransactions :: (Database) -> [Transaction]
 */
const getAllTransactions = db => {
    /*
     * Map database record to Bank transaction type
     * @sig mapBankTransactionToRecord :: Object -> Transaction.Bank
     */
    const mapBankTransactionToRecord = record => {
        const { id, accountId, date, address, amount, categoryId, cleared, memo, number, payee, runningBalance } =
            record
        const baseFields = { id, accountId, date, transactionType: 'bank', address, runningBalance }
        return Transaction.Bank.from({ ...baseFields, amount, categoryId, cleared, memo, number, payee })
    }

    /*
     * Map database record to Investment transaction type
     * @sig mapInvestmentTransactionToRecord :: Object -> Transaction.Investment
     */
    const mapInvestmentTransactionToRecord = record => {
        const {
            id,
            accountId,
            date,
            address,
            amount,
            categoryId,
            cleared,
            commission,
            investmentAction,
            memo,
            payee,
            price,
            quantity,
            runningBalance,
            securityId,
        } = record
        const baseFields = { id, accountId, date, transactionType: 'investment', address, runningBalance }
        return Transaction.Investment.from({
            ...baseFields,
            amount,
            categoryId,
            cleared,
            commission,
            investmentAction,
            memo,
            payee,
            price,
            quantity,
            securityId,
        })
    }

    /*
     * Map database record to appropriate transaction type
     * @sig mapTransactionRecord :: Object -> Transaction
     */
    const mapTransactionRecord = record =>
        record.transactionType === 'bank'
            ? mapBankTransactionToRecord(record)
            : mapInvestmentTransactionToRecord(record)

    const statement = `
        SELECT id, accountId, date, amount, transactionType, payee, memo, number, cleared,
               categoryId, securityId, quantity, price, commission, investmentAction, address, runningBalance
        FROM transactions
        ORDER BY date DESC, id DESC
    `

    const records = db.prepare(statement).all()
    return map(mapTransactionRecord, records)
}

/*
 * Insert bank transaction into database
 * @sig insertBankTransaction :: (Database, Entry.TransactionBank, Account) -> String
 */
const insertBankTransaction = (db, transactionEntry, account) => {
    /*
     * Generate split ID from key fields
     * @sig generateSplitId :: Object -> String
     */
    const generateSplitId = fields => `spl_${hashFields(fields)}`

    /*
     * Insert transaction splits into database
     * @sig insertTransactionSplits :: String -> void
     */
    const insertTransactionSplits = transactionId => {
        /*
         * Insert a single split record
         * @sig insertSplit :: (Object, Number) -> void
         */
        const insertSplit = (split, index) => {
            const { category, amount: splitAmount, memo: splitMemo } = split
            const splitCategoryId = category
                ? db.prepare('SELECT id FROM categories WHERE name = ?').get(category)?.id || null
                : null

            // Include index to ensure unique IDs for splits with same category/amount
            const splitId = generateSplitId({ transactionId, categoryId: splitCategoryId, amount: splitAmount, index })

            const statement = `
                INSERT INTO transactionSplits (id, transactionId, categoryId, amount, memo)
                VALUES (?, ?, ?, ?, ?)
            `

            db.prepare(statement).run(splitId, transactionId, splitCategoryId, splitAmount, splitMemo || null)
        }

        transactionEntry.splits.forEach(insertSplit)
    }

    if (!Entry.TransactionBank.is(transactionEntry))
        throw new Error(`Expected Entry.TransactionBank; found: ${JSON.stringify(transactionEntry)}`)

    const { address, amount, category, cleared, date, memo, number, payee, splits } = transactionEntry
    const categoryId = category
        ? db.prepare('SELECT id FROM categories WHERE name = ?').get(category)?.id || null
        : null
    const addressStr = getAddressString(address)
    const dateStr = formatDate(date)

    // Generate deterministic ID from key fields (use null for missing payee, not empty string)
    // Uses all distinguishing fields; database lookup handles collision suffixes
    const id = generateTransactionId(db, {
        accountId: account.id,
        date: dateStr,
        amount,
        payee: payee || null,
        memo: memo || null,
        number: number || null,
    })

    const cols = 'id, accountId, date, amount, transactionType, payee, memo, number, cleared, categoryId, address'
    const statement = `INSERT INTO transactions (${cols}) VALUES (?, ?, ?, ?, 'bank', ?, ?, ?, ?, ?, ?)`

    db.prepare(statement).run(
        id,
        account.id,
        dateStr,
        amount,
        payee || null,
        memo || null,
        number || null,
        cleared || null,
        categoryId,
        addressStr,
    )

    if (splits?.length) insertTransactionSplits(id)

    return id
}

/*
 * Insert investment transaction into database
 * @sig insertInvestmentTransaction :: (Database, Entry.TransactionInvestment, Account, Security?) -> String
 */
const insertInvestmentTransaction = (db, transactionEntry, account, security = null) => {
    if (!Entry.TransactionInvestment.is(transactionEntry))
        throw new Error(`Expected Entry.TransactionInvestment; found: ${JSON.stringify(transactionEntry)}`)

    const {
        address,
        amount,
        category,
        cleared,
        date,
        memo,
        payee,
        price,
        quantity,
        commission,
        transactionType: investmentAction,
    } = transactionEntry
    const addressStr = getAddressString(address)
    const dateStr = formatDate(date)
    const categoryId = category
        ? db.prepare('SELECT id FROM categories WHERE name = ?').get(category)?.id || null
        : null

    // Generate deterministic ID from key fields (use null for missing fields, not empty string)
    // Uses all distinguishing fields; database lookup handles collision suffixes
    const id = generateTransactionId(db, {
        accountId: account.id,
        date: dateStr,
        amount: amount || null,
        securityId: security?.id || null,
        investmentAction: investmentAction || null,
        quantity: quantity || null,
        price: price || null,
        memo: memo || null,
    })

    const statement = `
        INSERT INTO transactions (id, accountId, date, amount, transactionType, payee, memo, cleared,
            categoryId, securityId, quantity, price, commission, investmentAction, address)
        VALUES (?, ?, ?, ?, 'investment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.prepare(statement).run(
        id,
        account.id,
        dateStr,
        amount || null,
        payee || null,
        memo || null,
        cleared || null,
        categoryId,
        security?.id || null,
        quantity || null,
        price || null,
        commission || null,
        investmentAction || null,
        addressStr,
    )

    return id
}

/*
 * Import bank transactions into database
 * @sig importBankTransactions :: (Database, [Entry.TransactionBank], [Account]) -> [String]
 */
const importBankTransactions = (db, transactions, accounts) => {
    /*
     * Handle bank transaction import with error handling
     * @sig handleBankTransactionImport :: Entry.TransactionBank -> String
     */
    const handleBankTransactionImport = transaction => {
        try {
            const account = findAccount(accountMap, transaction.account)
            return insertBankTransaction(db, transaction, account)
        } catch (error) {
            throw new Error(`Failed to import bank transaction: ${error.message}`)
        }
    }

    const accountMap = createAccountMap(accounts)
    return map(handleBankTransactionImport, transactions)
}

/*
 * Import investment transactions into database
 * @sig importInvestmentTransactions :: (Database, [Entry.TransactionInvestment], [Account], [Security]) -> [String]
 */
const importInvestmentTransactions = (db, transactions, accounts, securities) => {
    /*
     * Create security lookup map for efficient lookups
     * @sig createSecurityMap :: [Security] -> Map<String, Security>
     */
    const createSecurityMap = secs => {
        const addSecurity = (m, sec) => {
            const { name, symbol } = sec
            if (symbol) m.set(symbol, sec)
            m.set(name, sec)
        }

        const securityMap = new Map()
        secs.forEach(s => addSecurity(securityMap, s))
        return securityMap
    }

    /*
     * Find security by name in security map
     * @sig findSecurity :: String? -> Security?
     */
    const findSecurity = securityName => {
        if (!securityName) return null
        const security = securityMap.get(securityName)
        if (!security) throw new Error(`Security not found for transaction: ${securityName}`)
        return security
    }

    /*
     * Handle investment transaction import with error handling
     * @sig handleInvestmentTransactionImport :: Entry.TransactionInvestment -> String
     */
    const handleInvestmentTransactionImport = transaction => {
        try {
            const account = findAccount(accountMap, transaction.account)
            const security = findSecurity(transaction.security)
            return insertInvestmentTransaction(db, transaction, account, security)
        } catch (error) {
            console.error(`Failed to import investment transaction: ${transaction.toString()}`)
            throw new Error(`Failed to import investment transaction: ${error.message}`)
        }
    }

    const accountMap = createAccountMap(accounts)
    const securityMap = createSecurityMap(securities)
    return map(handleInvestmentTransactionImport, transactions)
}

/*
 * Get transaction count
 * @sig getTransactionCount :: (Database) -> Number
 */
const getTransactionCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM transactions').get()
    return result.count
}

/*
 * Clear all transactions from database
 * @sig clearTransactions :: (Database) -> void
 */
const clearTransactions = db => {
    db.prepare('DELETE FROM transactionSplits').run()
    db.prepare('DELETE FROM transactions').run()
}

// Investment actions that affect cash balance (amount is already signed correctly)
const CASH_IMPACT_ACTIONS = new Set([
    'Buy',
    'Cash',
    'CGLong',
    'CGShort',
    'ContribX',
    'CvrShrt',
    'Div',
    'IntInc',
    'MargInt',
    'MiscExp',
    'MiscInc',
    'Sell',
    'ShtSell',
    'WithdrwX',
    'XIn',
    'XOut',
])

/*
 * Update running balances for all transactions using SQL window function
 * Must be called after all transactions are imported
 * Order: date then rowid (preserves QIF import order within each day)
 * @sig updateRunningBalances :: Database -> void
 */
const updateRunningBalances = db => {
    const cashImpactActions = Array.from(CASH_IMPACT_ACTIONS)
        .map(a => `'${a}'`)
        .join(', ')

    const statement = `
        WITH balances AS (
            SELECT
                id,
                SUM(
                    CASE
                        WHEN transactionType = 'bank' THEN amount
                        WHEN transactionType = 'investment' AND investmentAction IN (${cashImpactActions})
                            THEN COALESCE(amount, 0)
                        ELSE 0
                    END
                ) OVER (
                    PARTITION BY accountId
                    ORDER BY date, rowid
                ) as runningBalance
            FROM transactions
        )
        UPDATE transactions
        SET runningBalance = balances.runningBalance
        FROM balances
        WHERE transactions.id = balances.id
    `

    db.prepare(statement).run()
}

export {
    insertBankTransaction,
    insertInvestmentTransaction,
    importBankTransactions,
    importInvestmentTransactions,
    updateRunningBalances,
    getAllTransactions,
    getTransactionCount,
    clearTransactions,
}
