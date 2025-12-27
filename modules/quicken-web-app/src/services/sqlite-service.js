// ABOUTME: Service for loading SQLite databases in the browser
// ABOUTME: Uses sql.js (WebAssembly SQLite) to read .sqlite files and extract all entities

/* global FileReader */

import LookupTable from '@graffio/functional/src/lookup-table.js'
import initSqlJs from 'sql.js'
import { Account } from '../types/account.js'
import { Category } from '../types/category.js'
import { Lot } from '../types/lot.js'
import { LotAllocation } from '../types/lot-allocation.js'
import { Price } from '../types/price.js'
import { Security } from '../types/security.js'
import { Split } from '../types/split.js'
import { Tag } from '../types/tag.js'
import { Transaction } from '../types/transaction.js'

// SQLite file magic bytes: "SQLite format 3\0"
const SQLITE_MAGIC = new Uint8Array([
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00,
])

/*
 * Validate file has SQLite magic bytes at start
 * @sig isSqliteFile :: ArrayBuffer -> Boolean
 */
const isSqliteFile = buffer => {
    const header = new Uint8Array(buffer, 0, 16)
    return SQLITE_MAGIC.every((byte, i) => header[i] === byte)
}

/*
 * Load a SQLite file and extract all entities
 * @sig loadEntitiesFromFile :: File -> Promise<Entities>
 *     Entities = { accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices }
 */
const loadEntitiesFromFile = async file => {
    // @sig rowsToObjects :: { columns: [String], values: [[Any]] } -> [Object]
    const rowsToObjects = result => {
        const rowToObject = (columns, row) => Object.fromEntries(columns.map((col, i) => [col, row[i]]))
        if (!result || result.length === 0) return []
        const { columns, values } = result[0]
        return values.map(row => rowToObject(columns, row))
    }

    // @sig readFileAsArrayBuffer :: File -> Promise<ArrayBuffer>
    const readFileAsArrayBuffer = f => {
        // @sig setupFileReader :: (File, Function, Function) -> void
        const setupFileReader = (fileToRead, resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(new Error(`Failed to read file: ${fileToRead.name}`))
            reader.readAsArrayBuffer(fileToRead)
        }

        return new Promise((resolve, reject) => setupFileReader(f, resolve, reject))
    }

    // @sig loadDatabase :: ArrayBuffer -> Promise<Database>
    const loadDatabase = async buffer => {
        const SQL = await initSqlJs({ locateFile: f => `https://sql.js.org/dist/${f}` })
        return new SQL.Database(new Uint8Array(buffer))
    }

    // @sig queryAccounts :: Database -> LookupTable<Account>
    const queryAccounts = db => {
        const mapRow = row =>
            Account.from({ ...row, description: row.description || null, creditLimit: row.creditLimit || null })
        const results = db.exec('SELECT id, name, type, description, creditLimit FROM accounts')
        return LookupTable(rowsToObjects(results).map(mapRow), Account, 'id')
    }

    // @sig queryCategories :: Database -> LookupTable<Category>
    const queryCategories = db => {
        const sqliteBool = val => (val === 1 ? true : val === 0 ? false : null)

        // @sig mapRow :: Object -> Category
        const mapRow = row => {
            const { budgetAmount, description, id, isIncomeCategory, isTaxRelated, name, taxSchedule } = row
            return Category.from({
                id,
                name,
                description: description || null,
                budgetAmount: budgetAmount || null,
                isIncomeCategory: sqliteBool(isIncomeCategory),
                isTaxRelated: sqliteBool(isTaxRelated),
                taxSchedule: taxSchedule || null,
            })
        }

        const categoryCols = 'id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule'
        const results = db.exec(`SELECT ${categoryCols} FROM categories`)
        return LookupTable(rowsToObjects(results).map(mapRow), Category, 'id')
    }

    // @sig querySecurities :: Database -> LookupTable<Security>
    const querySecurities = db => {
        // Note: DB schema has name/symbol swapped - name contains ticker, symbol contains full name
        // @sig mapRow :: Object -> Security
        const mapRow = row => {
            const { goal, id, name: ticker, symbol: fullName, type } = row
            return Security.from({
                id,
                name: fullName || null,
                symbol: ticker || null,
                type: type || null,
                goal: goal || null,
            })
        }

        const results = db.exec('SELECT id, name, symbol, type, goal FROM securities')
        return LookupTable(rowsToObjects(results).map(mapRow), Security, 'id')
    }

    // @sig queryTags :: Database -> LookupTable<Tag>
    const queryTags = db => {
        const mapRow = row => {
            const { color, description, id, name } = row
            return Tag.from({ id, name, color: color || null, description: description || null })
        }
        const results = db.exec('SELECT id, name, color, description FROM tags')
        return LookupTable(rowsToObjects(results).map(mapRow), Tag, 'id')
    }

    // @sig querySplits :: Database -> LookupTable<Split>
    const querySplits = db => {
        const mapRow = row => {
            const { amount, categoryId, id, memo, transactionId } = row
            return Split.from({ id, transactionId, categoryId: categoryId || null, amount, memo: memo || null })
        }
        const results = db.exec('SELECT id, transactionId, categoryId, amount, memo FROM transactionSplits')
        return LookupTable(rowsToObjects(results).map(mapRow), Split, 'id')
    }

    // @sig queryTransactions :: Database -> LookupTable<Transaction>
    const queryTransactions = db => {
        // @sig mapBankRow :: Object -> Transaction.Bank
        const mapBankRow = row => {
            const { accountId, address, amount, categoryId, cleared, date, id, memo, number, payee } = row
            return Transaction.Bank.from({
                id,
                accountId,
                date,
                amount,
                transactionType: 'bank',
                address: address || null,
                categoryId: categoryId || null,
                cleared: cleared || null,
                memo: memo || null,
                number: number || null,
                payee: payee || null,
            })
        }

        // @sig mapInvestmentRow :: Object -> Transaction.Investment
        const mapInvestmentRow = row => {
            const { accountId, address, amount, categoryId, cleared, commission, date, id } = row
            const { investmentAction, memo, payee, price, quantity, securityId } = row
            return Transaction.Investment.from({
                id,
                accountId,
                date,
                transactionType: 'investment',
                address: address || null,
                amount: amount || null,
                categoryId: categoryId || null,
                cleared: cleared || null,
                commission: commission || null,
                investmentAction,
                memo: memo || null,
                payee: payee || null,
                price: price || null,
                quantity: quantity || null,
                securityId: securityId || null,
            })
        }

        const sql = `
            SELECT id, accountId, date, amount, transactionType, payee, memo, number, cleared,
                   categoryId, securityId, quantity, price, commission, investmentAction, address
            FROM transactions
            ORDER BY date DESC, id DESC
        `
        const results = db.exec(sql)
        const rows = rowsToObjects(results)
        const transactions = rows.map(row => (row.transactionType === 'bank' ? mapBankRow(row) : mapInvestmentRow(row)))
        return LookupTable(transactions, Transaction, 'id')
    }

    // @sig queryPrices :: Database -> LookupTable<Price>
    const queryPrices = db => {
        const results = db.exec('SELECT id, securityId, date, price FROM prices ORDER BY securityId, date DESC')
        return LookupTable(rowsToObjects(results).map(Price.from), Price, 'id')
    }

    // @sig queryLots :: Database -> LookupTable<Lot>
    const queryLots = db => {
        const mapRow = row => Lot.from({ ...row, closedDate: row.closedDate || null })
        const sql = `
            SELECT id, accountId, securityId, purchaseDate, quantity, costBasis,
                   remainingQuantity, closedDate, createdByTransactionId, createdAt
            FROM lots
            ORDER BY accountId, securityId, purchaseDate
        `
        const results = db.exec(sql)
        return LookupTable(rowsToObjects(results).map(mapRow), Lot, 'id')
    }

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

    const buffer = await readFileAsArrayBuffer(file)
    if (!isSqliteFile(buffer)) throw new Error(`Not a valid SQLite file: ${file.name}`)
    const db = await loadDatabase(buffer)

    try {
        return {
            accounts: queryAccounts(db),
            categories: queryCategories(db),
            securities: querySecurities(db),
            tags: queryTags(db),
            splits: querySplits(db),
            transactions: queryTransactions(db),
            lots: queryLots(db),
            lotAllocations: queryLotAllocations(db),
            prices: queryPrices(db),
        }
    } finally {
        db.close()
    }
}

export { loadEntitiesFromFile, isSqliteFile }
