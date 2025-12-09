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
 * Generate split ID from key fields
 * @sig generateSplitId :: Object -> String
 */
const generateSplitId = fields => `spl_${hashFields(fields)}`

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
 * Create security lookup map for efficient lookups
 * @sig createSecurityMap :: [Security] -> Map<String, Security>
 */
const createSecurityMap = securities => {
    const securityMap = new Map()
    securities.forEach(security => {
        if (security.symbol) securityMap.set(security.symbol, security)
        securityMap.set(security.name, security)
    })
    return securityMap
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
 * Find security by name in security map
 * @sig findSecurity :: (Map<String, Security>, String?) -> Security?
 */
const findSecurity = (securityMap, securityName) => {
    if (!securityName) return null
    const security = securityMap.get(securityName)
    if (!security) throw new Error(`Security not found for transaction: ${securityName}`)
    return security
}

/*
 * Handle bank transaction import with error handling
 * @sig handleBankTransactionImport :: (Database, Entry.TransactionBank, Map<String, Account>) -> String
 */
const handleBankTransactionImport = (db, transaction, accountMap) => {
    try {
        const account = findAccount(accountMap, transaction.account)
        return insertBankTransaction(db, transaction, account)
    } catch (error) {
        throw new Error(`Failed to import bank transaction: ${error.message}`)
    }
}

/*
 * Handle investment transaction import with error handling
 * @sig handleInvestmentTransactionImport :: (Database, Entry.TransactionInvestment, Map<String, Account>, Map<String, Security>) -> String
 */
const handleInvestmentTransactionImport = (db, transaction, accountMap, securityMap) => {
    try {
        const account = findAccount(accountMap, transaction.account)
        const security = findSecurity(securityMap, transaction.security)
        return insertInvestmentTransaction(db, transaction, account, security)
    } catch (error) {
        console.error(`Failed to import investment transaction: ${transaction.toString()}`)
        throw new Error(`Failed to import investment transaction: ${error.message}`)
    }
}

/*
 * Map database record to Bank transaction type
 * @sig mapBankTransactionToRecord :: Object -> Transaction.Bank
 */
const mapBankTransactionToRecord = record => {
    const baseFields = {
        id: record.id,
        accountId: record.account_id,
        date: record.date,
        transactionType: 'bank', // Bank transactions are always 'bank' type
        address: record.address,
    }

    return Transaction.Bank.from({
        ...baseFields,
        amount: record.amount,
        categoryId: record.category_id,
        cleared: record.cleared,
        memo: record.memo,
        number: record.number,
        payee: record.payee,
    })
}

/*
 * Map database record to Investment transaction type
 * @sig mapInvestmentTransactionToRecord :: Object -> Transaction.Investment
 */
const mapInvestmentTransactionToRecord = record => {
    const baseFields = {
        id: record.id,
        accountId: record.account_id,
        date: record.date,
        transactionType: 'investment', // Investment transactions are always 'investment' type
        address: record.address,
    }

    return Transaction.Investment.from({
        ...baseFields,
        amount: record.amount,
        categoryId: record.category_id,
        cleared: record.cleared,
        commission: record.commission,
        investmentAction: record.investment_action,
        memo: record.memo,
        payee: record.payee,
        price: record.price,
        quantity: record.quantity,
        securityId: record.security_id,
    })
}

/*
 * Map database record to appropriate transaction type
 * @sig mapTransactionRecord :: Object -> Transaction
 */
const mapTransactionRecord = record =>
    record.transaction_type === 'bank' ? mapBankTransactionToRecord(record) : mapInvestmentTransactionToRecord(record)

/*
 * Insert transaction splits into database
 * @sig insertTransactionSplits :: (Database, Entry.TransactionBank, String) -> void
 */
const insertTransactionSplits = (db, transactionEntry, transactionId) =>
    transactionEntry.splits.forEach((split, index) => {
        const splitCategoryId = split.category
            ? db.prepare('SELECT id FROM categories WHERE name = ?').get(split.category)?.id || null
            : null

        // Include index to ensure unique IDs for splits with same category/amount
        const splitId = generateSplitId({ transactionId, categoryId: splitCategoryId, amount: split.amount, index })

        const statement = `
            INSERT INTO transaction_splits (id, transaction_id, category_id, amount, memo)
            VALUES (?, ?, ?, ?, ?)
        `

        db.prepare(statement).run(splitId, transactionId, splitCategoryId, split.amount, split.memo || null)
    })

/*
 * Insert bank transaction into database
 * @sig insertBankTransaction :: (Database, Entry.TransactionBank, Account) -> String
 */
const insertBankTransaction = (db, transactionEntry, account) => {
    if (!Entry.TransactionBank.is(transactionEntry))
        throw new Error(`Expected Entry.TransactionBank; found: ${JSON.stringify(transactionEntry)}`)

    const categoryId = transactionEntry.category
        ? db.prepare('SELECT id FROM categories WHERE name = ?').get(transactionEntry.category)?.id || null
        : null
    const address = getAddressString(transactionEntry.address)
    const dateStr = formatDate(transactionEntry.date)

    // Generate deterministic ID from key fields (use null for missing payee, not empty string)
    // Uses all distinguishing fields; database lookup handles collision suffixes
    const id = generateTransactionId(db, {
        accountId: account.id,
        date: dateStr,
        amount: transactionEntry.amount,
        payee: transactionEntry.payee || null,
        memo: transactionEntry.memo || null,
        number: transactionEntry.number || null,
    })

    const statement = `
        INSERT INTO transactions (id, account_id, date, amount, transaction_type, payee, memo, number, cleared, category_id, address)
        VALUES (?, ?, ?, ?, 'bank', ?, ?, ?, ?, ?, ?)
    `

    db.prepare(statement).run(
        id,
        account.id,
        dateStr,
        transactionEntry.amount,
        transactionEntry.payee || null,
        transactionEntry.memo || null,
        transactionEntry.number || null,
        transactionEntry.cleared || null,
        categoryId,
        address,
    )

    if (transactionEntry?.splits?.length) insertTransactionSplits(db, transactionEntry, id)

    return id
}

/*
 * Insert investment transaction into database
 * @sig insertInvestmentTransaction :: (Database, Entry.TransactionInvestment, Account, Security?) -> String
 */
const insertInvestmentTransaction = (db, transactionEntry, account, security = null) => {
    if (!Entry.TransactionInvestment.is(transactionEntry))
        throw new Error(`Expected Entry.TransactionInvestment; found: ${JSON.stringify(transactionEntry)}`)

    const address = getAddressString(transactionEntry.address)
    const dateStr = formatDate(transactionEntry.date)
    const categoryId = transactionEntry.category
        ? db.prepare('SELECT id FROM categories WHERE name = ?').get(transactionEntry.category)?.id || null
        : null

    // Generate deterministic ID from key fields (use null for missing fields, not empty string)
    // Uses all distinguishing fields; database lookup handles collision suffixes
    const id = generateTransactionId(db, {
        accountId: account.id,
        date: dateStr,
        amount: transactionEntry.amount || null,
        securityId: security?.id || null,
        investmentAction: transactionEntry.transactionType || null,
        quantity: transactionEntry.quantity || null,
        price: transactionEntry.price || null,
        memo: transactionEntry.memo || null,
    })

    const statement = `
        INSERT INTO transactions (id, account_id, date, amount, transaction_type, payee, memo, cleared,
            category_id, security_id, quantity, price, commission, investment_action, address)
        VALUES (?, ?, ?, ?, 'investment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.prepare(statement).run(
        id,
        account.id,
        dateStr,
        transactionEntry.amount || null,
        transactionEntry.payee || null,
        transactionEntry.memo || null,
        transactionEntry.cleared || null,
        categoryId,
        security?.id || null,
        transactionEntry.quantity || null,
        transactionEntry.price || null,
        transactionEntry.commission || null,
        transactionEntry.transactionType || null,
        address,
    )

    return id
}

/*
 * Import bank transactions into database
 * @sig importBankTransactions :: (Database, [Entry.TransactionBank], [Account]) -> [String]
 */
const importBankTransactions = (db, transactions, accounts) => {
    const accountMap = createAccountMap(accounts)
    const results = []
    transactions.forEach(transaction => {
        const result = handleBankTransactionImport(db, transaction, accountMap)
        results.push(result)
    })
    return results
}

/*
 * Import investment transactions into database
 * @sig importInvestmentTransactions :: (Database, [Entry.TransactionInvestment], [Account], [Security]) -> [String]
 */
const importInvestmentTransactions = (db, transactions, accounts, securities) => {
    const accountMap = createAccountMap(accounts)
    const securityMap = createSecurityMap(securities)
    const results = []
    transactions.forEach(transaction => {
        const result = handleInvestmentTransactionImport(db, transaction, accountMap, securityMap)
        results.push(result)
    })
    return results
}

/*
 * Get all transactions from database
 * @sig getAllTransactions :: (Database) -> [Transaction]
 */
const getAllTransactions = db => {
    const statement = `
        SELECT id, account_id, date, amount, transaction_type, payee, memo, number, cleared,
               category_id, security_id, quantity, price, commission, investment_action, address
        FROM transactions
        ORDER BY date DESC, id DESC
    `

    const records = db.prepare(statement).all()
    return map(mapTransactionRecord, records)
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
    db.prepare('DELETE FROM transaction_splits').run()
    db.prepare('DELETE FROM transactions').run()
}

export {
    insertBankTransaction,
    insertInvestmentTransaction,
    importBankTransactions,
    importInvestmentTransactions,
    getAllTransactions,
    getTransactionCount,
    clearTransactions,
}
