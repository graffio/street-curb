import { map } from '@graffio/functional'
import { Entry, Transaction } from '../../types/index.js'

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
 * @sig handleBankTransactionImport :: (Database, Entry.TransactionBank, Map<String, Account>) -> Number
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
 * @sig handleInvestmentTransactionImport :: (Database, Entry.TransactionInvestment, Map<String, Account>, Map<String, Security>) -> Number
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
 * @sig insertTransactionSplits :: (Database, Entry.TransactionBank, Number) -> void
 */
const insertTransactionSplits = (db, transactionEntry, transactionId) => {
    const insertTransactionSplit = split => {
        const splitCategoryId = split.category
            ? db.prepare('SELECT id FROM categories WHERE name = ?').get(split.category)?.id || null
            : null

        const statement = `
            INSERT INTO transaction_splits (transaction_id, category_id, amount, memo)
            VALUES (?, ?, ?, ?)
        `

        db.prepare(statement).run(transactionId, splitCategoryId, split.amount, split.memo || null)
    }

    transactionEntry.splits.forEach(insertTransactionSplit)
}

/*
 * Insert bank transaction into database
 * @sig insertBankTransaction :: (Database, Entry.TransactionBank, Account) -> Number
 */
const insertBankTransaction = (db, transactionEntry, account) => {
    if (!Entry.TransactionBank.is(transactionEntry))
        throw new Error(`Expected Entry.TransactionBank; found: ${JSON.stringify(transactionEntry)}`)

    const categoryId = transactionEntry.category
        ? db.prepare('SELECT id FROM categories WHERE name = ?').get(transactionEntry.category)?.id || null
        : null
    const address = getAddressString(transactionEntry.address)
    const dateStr = formatDate(transactionEntry.date)

    const statement = `
        INSERT INTO transactions (account_id, date, amount, transaction_type, payee, memo, number, cleared, category_id, address)
        VALUES (?, ?, ?, 'bank', ?, ?, ?, ?, ?, ?)
    `

    const result = db
        .prepare(statement)
        .run(
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

    const transactionId = result.lastInsertRowid

    if (transactionEntry?.splits?.length) insertTransactionSplits(db, transactionEntry, transactionId)

    return transactionId
}

/*
 * Insert investment transaction into database
 * @sig insertInvestmentTransaction :: (Database, Entry.TransactionInvestment, Account, Security?) -> Number
 */
const insertInvestmentTransaction = (db, transactionEntry, account, security = null) => {
    if (!Entry.TransactionInvestment.is(transactionEntry))
        throw new Error(`Expected Entry.TransactionInvestment; found: ${JSON.stringify(transactionEntry)}`)

    const address = getAddressString(transactionEntry.address)
    const dateStr = formatDate(transactionEntry.date)
    const categoryId = transactionEntry.category
        ? db.prepare('SELECT id FROM categories WHERE name = ?').get(transactionEntry.category)?.id || null
        : null

    const statement = `
        INSERT INTO transactions (account_id, date, amount, transaction_type, payee, memo, cleared,
            category_id, security_id, quantity, price, commission, investment_action, address)
        VALUES (?, ?, ?, 'investment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const result = db
        .prepare(statement)
        .run(
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

    return result.lastInsertRowid
}

/*
 * Import bank transactions into database
 * @sig importBankTransactions :: (Database, [Entry.TransactionBank], [Account]) -> [Number]
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
 * @sig importInvestmentTransactions :: (Database, [Entry.TransactionInvestment], [Account], [Security]) -> [Number]
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
