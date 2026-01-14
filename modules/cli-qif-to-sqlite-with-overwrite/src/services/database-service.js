// ABOUTME: Main database service for QIF import operations
// ABOUTME: Handles database initialization, schema creation, and QIF data import

// COMPLEXITY-TODO: lines — 154 lines, 4 over budget, linter expands arrays (expires 2026-04-01)

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
    updateRunningBalances,
} from './database/index.js'
import { importPrices, populatePricesFromTransactions } from './database/prices.js'
import { importTags } from './database/tags.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const P = {
    /* Check if database has any tables
     * @sig hasTables :: Database -> Boolean
     */
    hasTables: db => db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().length > 0,
}

const T = {
    /* Convert database path to schema information
     * @sig toSchemaInfo :: String -> {tables, views, indexes}
     */
    toSchemaInfo: databasePath => {
        /* Convert column pragma row to ColumnInfo
         * @sig toColumnInfo :: Object -> ColumnInfo
         */
        const toColumnInfo = col => {
            const { name, notnull, pk, type } = col
            return { name, type, nullable: notnull === 0, primaryKey: pk === 1 }
        }

        /* Get table info including columns
         * @sig toTableInfo :: (Database, String) -> TableInfo
         */
        const toTableInfo = (db, name) => ({
            name,
            columns: db.prepare(`PRAGMA table_info(${name})`).all().map(toColumnInfo),
        })

        if (!databasePath) throw new Error('Database path is required')
        const db = F.createDatabase(databasePath)
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
        const views = db.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all()
        const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name").all()

        const result = {
            tables: tables.map(t => toTableInfo(db, t.name)),
            views: views.map(v => ({ name: v.name })),
            indexes: indexes.map(i => ({ name: i.name })),
        }
        db.close()
        return result
    },
}

const F = {
    /* Create and initialize database connection with schema
     * @sig createDatabase :: String -> Database
     */
    createDatabase: databasePath => {
        /* Initialize database schema if empty
         * @sig initSchema :: Database -> Database
         */
        const initSchema = db => {
            if (P.hasTables(db)) return db
            console.log('Creating new database with schema...')
            db.exec(readFileSync(join(__dirname, '../../schema.sql'), 'utf8'))
            console.log('Database schema created successfully')
            return db
        }

        try {
            return initSchema(Database(databasePath))
        } catch (error) {
            throw new Error(`Failed to initialize database: ${error.message}`)
        }
    },
}

const A = {
    /* Collect row counts from all database tables
     * @sig collectDatabaseStats :: String -> DatabaseStats
     */
    collectDatabaseStats: databasePath => {
        /* Get row count for a table
         * @sig count :: String -> Number
         */
        const count = table => db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count

        if (!databasePath) throw new Error('Database path is required')
        const db = F.createDatabase(databasePath)

        const stats = {
            accounts: count('accounts'),
            securities: count('securities'),
            categories: count('categories'),
            tags: count('tags'),
            transactions: count('transactions'),
            prices: count('prices'),
            lots: count('lots'),
            holdings: getHoldingsCount(db),
            dailyPortfolios: countDailyPortfolios(db),
        }
        db.close()
        return stats
    },
}

const E = {
    /* Import all QIF data into database
     * @sig importQifData :: (String, QifData) -> void
     */
    importQifData: (databasePath, qifData) => {
        /* Delete all data from tables in dependency order
         * @sig clearData :: () -> void
         */
        const clearData = () => {
            const tables = [
                'transactionSplits',
                'lotAllocations',
                'lots',
                'transactions',
                'prices',
                'tags',
                'categories',
                'securities',
                'accounts',
            ]
            map(t => db.exec(`DELETE FROM ${t}`), tables)
        }

        /* Import all QIF entities into database tables
         * @sig importData :: () -> void
         */
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
            console.log('Importing bank transactions')
            importBankTransactions(db, bankTransactions, accts)
            console.log('Importing investment transactions')
            importInvestmentTransactions(db, investmentTransactions, accts, secs)
            console.log('Computing running balances')
            updateRunningBalances(db)
            console.log('Populating prices from transaction data')
            populatePricesFromTransactions(db)
            console.log('Importing investment lots')
            importLots(db)
        }

        if (!databasePath) throw new Error('Database path is required')
        const db = F.createDatabase(databasePath)

        try {
            db.exec('BEGIN TRANSACTION')
            clearData()
            importData()
            db.exec('COMMIT')
        } catch (error) {
            db.exec('ROLLBACK')
            console.error(error)
            throw new Error(`Import failed: ${error.message}`)
        } finally {
            db.close()
        }
    },
}

const DatabaseService = {
    createDatabase: F.createDatabase,
    toSchemaInfo: T.toSchemaInfo,
    collectDatabaseStats: A.collectDatabaseStats,
    importQifData: E.importQifData,
    getCurrentPortfolio,
    getAllSecurities,
    getAllAccounts,
    getAllCurrentHoldings,
}

export { DatabaseService }
