import { map } from '@graffio/functional'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { getAllAccounts, importAccounts } from './database/accounts.js'

import {
    countDailyPortfolios,
    getAllCurrentHoldings,
    getAllSecurities,
    getCurrentPortfolio,
    getHoldingsCount,
    importBankTransactions,
    importCategories,
    importInvestmentTransactions,
    importLots,
    importSecurities,
} from './database/index.js'
import { importPrices, populatePricesFromTransactions } from './database/prices.js'
import { importTags } from './database/tags.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/*
 * Create database connection
 * @sig createDatabase :: String -> Database
 */
const createDatabase = databasePath => Database(databasePath)

/*
 * Check if database has tables
 * @sig hasTables :: Database -> Boolean
 */
const hasTables = db => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    return tables.length > 0
}

/*
 * Initialize database with schema if needed
 * @sig initializeSchema :: Database -> Database
 */
const initializeSchema = db => {
    if (hasTables(db)) return db

    console.log('Creating new database with schema...')
    const schemaPath = join(__dirname, '../../schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    console.log('Database schema created successfully')
    return db
}

/*
 * Initialize database with schema if it doesn't exist
 * @sig initializeDatabase :: String -> Database
 */
const initializeDatabase = databasePath => initializeSchema(createDatabase(databasePath))

/*
 * Get database connection, creating if necessary
 * @sig getDatabase :: String -> Database
 */
const getDatabase = databasePath => {
    try {
        return initializeDatabase(databasePath)
    } catch (error) {
        throw new Error(`Failed to initialize database: ${error.message}`)
    }
}

/*
 * Get table information for a single table
 * @sig getTableInfo :: (Database, String) -> TableInfo
 * TableInfo = {name: String, columns: [ColumnInfo]}
 * ColumnInfo = {name: String, type: String, nullable: Boolean, primaryKey: Boolean}
 */
const getTableInfo = (db, tableName) => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all()
    const columnInfo = map(
        col => ({ name: col.name, type: col.type, nullable: col.notnull === 0, primaryKey: col.pk === 1 }),
        columns,
    )

    return { name: tableName, columns: columnInfo }
}

/*
 * Get schema information from database
 * @sig getSchemaInfo :: String -> SchemaInfo
 * SchemaInfo = {tables: [TableInfo], views: [ViewInfo], indexes: [IndexInfo]}
 */
const getSchemaInfo = databasePath => {
    if (!databasePath) throw new Error('Database path is required')
    const db = getDatabase(databasePath)

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
    const views = db.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all()
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name").all()

    const tableInfo = map(table => getTableInfo(db, table.name), tables)
    const viewInfo = map(v => ({ name: v.name }), views)
    const indexInfo = map(i => ({ name: i.name }), indexes)

    db.close()

    return { tables: tableInfo, views: viewInfo, indexes: indexInfo }
}

/*
 * Get count for a single table
 * @sig getTableCount :: (Database, String) -> Number
 */
const getTableCount = (db, tableName) => {
    const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get()
    return result.count
}

/*
 * Get database statistics
 * @sig getDatabaseStats :: String -> DatabaseStats
 * DatabaseStats = {accounts: Number, securities: Number, transactions: Number, prices: Number,
 *                  categories: Number, tags: Number, lots: Number, holdings: Number, dailyPortfolios: Number}
 */
const getDatabaseStats = databasePath => {
    if (!databasePath) throw new Error('Database path is required')
    const db = getDatabase(databasePath)

    const stats = {
        accounts: getTableCount(db, 'accounts'),
        securities: getTableCount(db, 'securities'),
        categories: getTableCount(db, 'categories'),
        tags: getTableCount(db, 'tags'),
        transactions: getTableCount(db, 'transactions'),
        prices: getTableCount(db, 'prices'),
        lots: getTableCount(db, 'lots'),
        holdings: getHoldingsCount(db),
        dailyPortfolios: countDailyPortfolios(db),
    }

    db.close()
    return stats
}

/*
 * Clear existing data from all tables
 * @sig clearExistingData :: Database -> void
 */
const clearExistingData = db => {
    const deleteStatements = [
        'DELETE FROM transaction_splits',
        'DELETE FROM lots',
        'DELETE FROM transactions',
        'DELETE FROM prices',
        'DELETE FROM tags',
        'DELETE FROM categories',
        'DELETE FROM securities',
        'DELETE FROM accounts',
    ]

    map(stmt => db.exec(stmt), deleteStatements)
}

/*
 * Group transactions by date
 * @sig groupTransactionsByDate :: [Transaction] -> Object
 */
const groupTransactionsByDate = transactions => {
    const transactionsByDate = {}
    transactions.forEach(transaction => {
        const date = transaction.date
        if (!transactionsByDate[date]) transactionsByDate[date] = []
        transactionsByDate[date].push(transaction)
    })
    return transactionsByDate
}

/*
 * Get transaction priority for sorting
 * @sig getTransactionPriority :: Transaction -> Number
 */
const getTransactionPriority = transaction => {
    if (transaction.amount > 0) return 1 // Cash inflows first
    if (transaction.amount < 0) return 2 // Cash outflows second
    return 3 // Zero amounts last
}

/*
 * Sort transactions by type within each day to ensure cash flows happen before purchases
 * @sig sortTransactionsByType :: [Transaction] -> [Transaction]
 */
const sortTransactionsByType = transactions => {
    const byPriority = (a, b) => {
        const priorityA = getTransactionPriority(a)
        const priorityB = getTransactionPriority(b)
        return priorityA !== priorityB ? priorityA - priorityB : 0
    }

    const sortDayTransactions = dayTransactions => {
        dayTransactions.sort(byPriority)
        return dayTransactions
    }

    const transactionsByDate = groupTransactionsByDate(transactions)
    const sortedTransactions = []

    Object.keys(transactionsByDate)
        .sort()
        .forEach(date => {
            const dayTransactions = sortDayTransactions(transactionsByDate[date])
            sortedTransactions.push(...dayTransactions)
        })

    return sortedTransactions
}

/*
 * Import all QIF data into database
 * @sig importQifData :: (String, QifData) -> void
 * QifData = {accounts: [Account], securities: [Security], categories: [Category], tags: [Tag],
 *           bankTransactions: [BankTransaction], investmentTransactions: [InvestmentTransaction], prices: [Price]}
 */
const importQifData = (databasePath, qifData) => {
    if (!databasePath) throw new Error('Database path is required')

    const db = getDatabase(databasePath)

    const importData = () => {
        console.log('Importing accounts')
        importAccounts(db, qifData.accounts)
        const accounts = getAllAccounts(db)

        console.log('Importing securities')
        importSecurities(db, qifData.securities)
        const securities = getAllSecurities(db)

        console.log('Importing categories')
        importCategories(db, qifData.categories)

        console.log('Importing tags')
        importTags(db, qifData.tags)

        console.log('Importing prices')
        importPrices(db, qifData.prices, securities)

        console.log('Sorting transactions by type within each day')
        const sortedBankTransactions = sortTransactionsByType(qifData.bankTransactions)
        const sortedInvestmentTransactions = sortTransactionsByType(qifData.investmentTransactions)

        console.log('Importing bank transactions')
        importBankTransactions(db, sortedBankTransactions, accounts)

        console.log('Importing investment transactions')
        importInvestmentTransactions(db, sortedInvestmentTransactions, accounts, securities)

        console.log('Populating prices from transaction data')
        populatePricesFromTransactions(db)

        console.log('Importing investment lots')
        importLots(db)
    }

    try {
        db.exec('BEGIN TRANSACTION')
        clearExistingData(db)
        importData()
        db.exec('COMMIT')
    } catch (error) {
        db.exec('ROLLBACK')
        console.error(error)
        throw new Error(`Import failed: ${error.message}`)
    } finally {
        db.close()
    }
}

export {
    getDatabase,
    getSchemaInfo,
    getDatabaseStats,
    importQifData,
    initializeSchema,
    getCurrentPortfolio,
    getAllSecurities,
    getAllAccounts,
    getAllCurrentHoldings,
}
