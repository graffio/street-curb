// ABOUTME: SQLite database loader for the browser
// ABOUTME: Uses sql.js (WebAssembly SQLite) to read .sqlite files and extract all entities

/* global FileReader */

import LookupTable from '@graffio/functional/src/lookup-table.js'
import initSqlJs from 'sql.js'

import { Account } from '../../types/account.js'
import { Category } from '../../types/category.js'
import { LotAllocation } from '../../types/lot-allocation.js'
import { Lot } from '../../types/lot.js'
import { Price } from '../../types/price.js'
import { Security } from '../../types/security.js'
import { Split } from '../../types/split.js'
import { Tag } from '../../types/tag.js'
import { Transaction } from '../../types/transaction.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Lazily initializes sql.js WASM module (cached across calls)
    // @sig findSqlModule :: () -> Promise<SqlJsModule>
    findSqlModule: () => {
        if (!sqlModulePromise) sqlModulePromise = initSqlJs({ locateFile: f => `https://sql.js.org/dist/${f}` })
        return sqlModulePromise
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// SQLite file magic bytes: "SQLite format 3\0"
const SQLITE_MAGIC = new Uint8Array([
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
])

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let sqlModulePromise

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Loads a SQLite file and extracts all entities into LookupTables
// @sig loadEntitiesFromFile :: (File, Function?) -> Promise<Entities>
//     Entities = { accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices }
const loadEntitiesFromFile = async (file, onProgress) => {
    // Validates file has SQLite magic bytes at start
    // @sig isSqliteFile :: ArrayBuffer -> Boolean
    const isSqliteFile = buffer => {
        const header = new Uint8Array(buffer, 0, 16)
        return SQLITE_MAGIC.every((byte, i) => header[i] === byte)
    }

    // Converts SQL result set to array of plain objects
    // @sig rowsToObjects :: { columns: [String], values: [[Any]] } -> [Object]
    const rowsToObjects = result => {
        const rowToObject = (columns, row) => Object.fromEntries(columns.map((col, i) => [col, row[i]]))
        if (!result || result.length === 0) return []
        const { columns, values } = result[0]
        return values.map(row => rowToObject(columns, row))
    }

    // Reads a File as an ArrayBuffer using FileReader API
    // @sig readFileAsArrayBuffer :: File -> Promise<ArrayBuffer>
    const readFileAsArrayBuffer = f => {
        // Wires FileReader events to Promise resolve/reject
        // @sig setupFileReader :: (File, Function, Function) -> void
        const setupFileReader = (fileToRead, resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(new Error(`Failed to read file: ${fileToRead.name}`))
            reader.readAsArrayBuffer(fileToRead)
        }

        return new Promise((resolve, reject) => setupFileReader(f, resolve, reject))
    }

    // Opens a SQLite database from an ArrayBuffer via sql.js
    // @sig loadDatabase :: ArrayBuffer -> Promise<Database>
    const loadDatabase = async buffer => {
        const SQL = await A.findSqlModule()
        return new SQL.Database(new Uint8Array(buffer))
    }

    // Loads all accounts from the database
    // @sig queryAccounts :: Database -> LookupTable<Account>
    const queryAccounts = db => {
        const results = db.exec(
            'SELECT id, name, type, description, creditLimit FROM accounts WHERE orphanedAt IS NULL',
        )
        return LookupTable(rowsToObjects(results).map(Account.from), Account, 'id')
    }

    // Loads all categories from the database
    // @sig queryCategories :: Database -> LookupTable<Category>
    const queryCategories = db => {
        // Converts SQLite integer to boolean (1=true, 0=false, else undefined)
        // @sig sqliteBool :: Number? -> Boolean?
        const sqliteBool = val => (val === 1 ? true : val === 0 ? false : undefined)

        // Maps a raw category row to a Category tagged type
        // @sig mapRow :: Object -> Category
        const mapRow = row => {
            const { budgetAmount, description, id, isIncomeCategory, isTaxRelated, name, taxSchedule } = row
            return Category.from({
                id,
                name,
                description,
                budgetAmount,
                isIncomeCategory: sqliteBool(isIncomeCategory),
                isTaxRelated: sqliteBool(isTaxRelated),
                taxSchedule,
            })
        }

        const categoryCols = 'id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule'
        const results = db.exec(`SELECT ${categoryCols} FROM categories WHERE orphanedAt IS NULL`)
        return LookupTable(rowsToObjects(results).map(mapRow), Category, 'id')
    }

    // Loads all securities from the database
    // @sig querySecurities :: Database -> LookupTable<Security>
    const querySecurities = db => {
        // DB schema has name/symbol swapped - compensate when reading
        // Maps a raw security row to a Security tagged type
        // @sig mapRow :: Object -> Security
        const mapRow = row => {
            const { goal, id, name, symbol, type } = row
            return Security.from({
                id,
                name: name || symbol, // default to symbol if there's no name
                symbol: symbol || name, // default to the name if there's no symbol
                type,
                goal,
            })
        }

        const results = db.exec('SELECT id, name, symbol, type, goal FROM securities WHERE orphanedAt IS NULL')
        return LookupTable(rowsToObjects(results).map(mapRow), Security, 'id')
    }

    // Loads all tags from the database
    // @sig queryTags :: Database -> LookupTable<Tag>
    const queryTags = db => {
        const results = db.exec('SELECT id, name, color, description FROM tags WHERE orphanedAt IS NULL')
        return LookupTable(rowsToObjects(results).map(Tag.from), Tag, 'id')
    }

    // Loads all transaction splits from the database
    // @sig querySplits :: Database -> LookupTable<Split>
    const querySplits = db => {
        const results = db.exec(
            `SELECT id, transactionId, categoryId, amount, memo, transferAccountId
            FROM transactionSplits WHERE orphanedAt IS NULL`,
        )
        return LookupTable(rowsToObjects(results).map(Split.from), Split, 'id')
    }

    // Loads all transactions from the database, mapping to Bank or Investment variants
    // @sig queryTransactions :: Database -> LookupTable<Transaction>
    const queryTransactions = db => {
        // Maps a raw row to a Transaction.Bank tagged type
        // @sig mapBankRow :: Object -> Transaction.Bank
        const mapBankRow = row => Transaction.Bank.from({ ...row, transactionType: 'bank' })

        // Maps a raw row to a Transaction.Investment tagged type
        // @sig mapInvestmentRow :: Object -> Transaction.Investment
        const mapInvestmentRow = row => Transaction.Investment.from({ ...row, transactionType: 'investment' })

        const sql = `
            SELECT id, accountId, date, amount, transactionType, transferAccountId, payee, memo, number,
                   cleared, categoryId, securityId, quantity, price, commission, investmentAction, address,
                   runningBalance
            FROM transactions
            WHERE orphanedAt IS NULL
            ORDER BY date, rowid
        `
        const results = db.exec(sql)
        const rows = rowsToObjects(results)
        const transactions = rows.map(row => (row.transactionType === 'bank' ? mapBankRow(row) : mapInvestmentRow(row)))
        return LookupTable(transactions, Transaction, 'id')
    }

    // Loads all security prices from the database
    // @sig queryPrices :: Database -> LookupTable<Price>
    const queryPrices = db => {
        const results = db.exec(
            'SELECT id, securityId, date, price FROM prices WHERE orphanedAt IS NULL ORDER BY securityId, date DESC',
        )
        return LookupTable(rowsToObjects(results).map(Price.from), Price, 'id')
    }

    // Loads all investment lots from the database
    // @sig queryLots :: Database -> LookupTable<Lot>
    const queryLots = db => {
        const sql = `
            SELECT id, accountId, securityId, purchaseDate, quantity, costBasis,
                   remainingQuantity, closedDate, createdByTransactionId, createdAt
            FROM lots
            ORDER BY accountId, securityId, purchaseDate
        `
        const results = db.exec(sql)
        return LookupTable(rowsToObjects(results).map(Lot.from), Lot, 'id')
    }

    // Loads all lot allocations from the database
    // @sig queryLotAllocations :: Database -> LookupTable<LotAllocation>
    const queryLotAllocations = db => {
        const sql = `
            SELECT id, lotId, transactionId, sharesAllocated, costBasisAllocated, date
            FROM lotAllocations
            ORDER BY lotId, date
        `
        const results = db.exec(sql)
        return LookupTable(rowsToObjects(results).map(LotAllocation.from), LotAllocation, 'id')
    }

    // Yields to event loop so browser can repaint progress updates
    // @sig yieldToUI :: () -> Promise<void>
    const yieldToUI = () => new Promise(resolve => setTimeout(resolve, 0))

    // Reports progress and yields to allow UI repaint
    // @sig reportProgress :: String -> Promise<void>
    const reportProgress = async message => {
        if (onProgress) {
            onProgress(message)
            await yieldToUI()
        }
    }

    const buffer = await readFileAsArrayBuffer(file)
    if (!isSqliteFile(buffer)) throw new Error(`Not a valid SQLite file: ${file.name}`)
    await reportProgress('Opening database...')
    const db = await loadDatabase(buffer)

    try {
        await reportProgress('Loading accounts...')
        const accounts = queryAccounts(db)
        await reportProgress('Loading categories...')
        const categories = queryCategories(db)
        await reportProgress('Loading securities...')
        const securities = querySecurities(db)
        await reportProgress('Loading tags...')
        const tags = queryTags(db)
        await reportProgress('Loading splits...')
        const splits = querySplits(db)
        await reportProgress('Loading transactions...')
        const transactions = queryTransactions(db)
        await reportProgress('Loading lots...')
        const lots = queryLots(db)
        await reportProgress('Loading lot allocations...')
        const lotAllocations = queryLotAllocations(db)
        await reportProgress('Loading prices...')
        const prices = queryPrices(db)

        return { accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices }
    } finally {
        db.close()
    }
}

export { loadEntitiesFromFile }
