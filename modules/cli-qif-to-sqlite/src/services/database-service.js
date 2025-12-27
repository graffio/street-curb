// ABOUTME: Main database service for QIF import operations
// ABOUTME: Handles database initialization, schema creation, and QIF data import

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
 * Initialize database with schema if needed
 * @sig initializeSchema :: Database -> Database
 */
const initializeSchema = db => {
    // @sig hasTables :: Database -> Boolean
    const hasTables = d => {
        const tables = d.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
        return tables.length > 0
    }

    if (hasTables(db)) return db

    console.log('Creating new database with schema...')
    const schemaPath = join(__dirname, '../../schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    console.log('Database schema created successfully')
    return db
}

/*
 * Get database connection, creating if necessary
 * @sig getDatabase :: String -> Database
 */
const getDatabase = databasePath => {
    const createAndInitialize = path => initializeSchema(Database(path))

    try {
        return createAndInitialize(databasePath)
    } catch (error) {
        throw new Error(`Failed to initialize database: ${error.message}`)
    }
}

/*
 * Get schema information from database
 * TableInfo = {name: String, columns: [ColumnInfo]}
 * ColumnInfo = {name: String, type: String, nullable: Boolean, primaryKey: Boolean}
 * SchemaInfo = {tables: [TableInfo], views: [ViewInfo], indexes: [IndexInfo]}
 * @sig getSchemaInfo :: String -> SchemaInfo
 */
const getSchemaInfo = databasePath => {
    // @sig getTableInfo :: (Database, String) -> TableInfo
    const getTableInfo = (db, tableName) => {
        const toColumnInfo = col => {
            const { name, notnull, pk, type } = col
            return { name, type, nullable: notnull === 0, primaryKey: pk === 1 }
        }

        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all()
        return { name: tableName, columns: map(toColumnInfo, columns) }
    }

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
 * Get database statistics
 * DatabaseStats = {accounts: Number, securities: Number, transactions: Number, prices: Number,
 *                  categories: Number, tags: Number, lots: Number, holdings: Number, dailyPortfolios: Number}
 * @sig getDatabaseStats :: String -> DatabaseStats
 */
const getDatabaseStats = databasePath => {
    // @sig getTableCount :: (Database, String) -> Number
    const getTableCount = (db, tableName) => {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get()
        return result.count
    }

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
 * Import all QIF data into database
 * QifData = {accounts: [Account], securities: [Security], categories: [Category], tags: [Tag],
 *           bankTransactions: [BankTransaction], investmentTransactions: [InvestmentTransaction], prices: [Price]}
 * @sig importQifData :: (String, QifData) -> void
 */
const importQifData = (databasePath, qifData) => {
    // @sig clearExistingData :: Database -> void
    const clearExistingData = db => {
        const deleteStatements = [
            'DELETE FROM transactionSplits',
            'DELETE FROM lotAllocations',
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

    // @sig sortTransactionsByType :: [Transaction] -> [Transaction]
    const sortTransactionsByType = transactions => {
        // @sig getTransactionPriority :: Transaction -> Number
        const getTransactionPriority = transaction => {
            if (transaction.amount > 0) return 1
            if (transaction.amount < 0) return 2
            return 3
        }

        // @sig groupTransactionsByDate :: [Transaction] -> Object
        const groupTransactionsByDate = txns => {
            const addToDate = (byDate, txn) => {
                const { date } = txn
                if (!byDate[date]) byDate[date] = []
                byDate[date].push(txn)
            }

            const byDate = {}
            txns.forEach(txn => addToDate(byDate, txn))
            return byDate
        }

        const byPriority = (a, b) => getTransactionPriority(a) - getTransactionPriority(b)
        const sortDay = dayTxns => dayTxns.sort(byPriority)
        const byDate = groupTransactionsByDate(transactions)
        const sorted = []

        Object.keys(byDate)
            .sort()
            .forEach(date => sorted.push(...sortDay(byDate[date])))

        return sorted
    }

    // @sig importData :: () -> void
    const importData = () => {
        const { accounts, bankTransactions, categories, investmentTransactions, prices, securities, tags } = qifData

        console.log('Importing accounts')
        importAccounts(db, accounts)
        const accts = getAllAccounts(db)

        console.log('Importing securities')
        importSecurities(db, securities)
        const secs = getAllSecurities(db)

        console.log('Importing categories')
        importCategories(db, categories)

        console.log('Importing tags')
        importTags(db, tags)

        console.log('Importing prices')
        importPrices(db, prices, secs)

        console.log('Sorting transactions by type within each day')
        const sortedBank = sortTransactionsByType(bankTransactions)
        const sortedInv = sortTransactionsByType(investmentTransactions)

        console.log('Importing bank transactions')
        importBankTransactions(db, sortedBank, accts)

        console.log('Importing investment transactions')
        importInvestmentTransactions(db, sortedInv, accts, secs)

        console.log('Populating prices from transaction data')
        populatePricesFromTransactions(db)

        console.log('Importing investment lots')
        importLots(db)
    }

    if (!databasePath) throw new Error('Database path is required')
    const db = getDatabase(databasePath)

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
