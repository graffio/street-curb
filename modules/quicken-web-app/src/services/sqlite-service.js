// ABOUTME: Service for loading SQLite databases in the browser
// ABOUTME: Uses sql.js (WebAssembly SQLite) to read .sqlite files and extract all entities

/* global FileReader */

import LookupTable from '@graffio/functional/src/lookup-table.js'
import initSqlJs from 'sql.js'
import { Account } from '../types/account.js'
import { Category } from '../types/category.js'
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
 * Read a File object as ArrayBuffer
 * @sig readFileAsArrayBuffer :: File -> Promise<ArrayBuffer>
 */
const readFileAsArrayBuffer = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
        reader.readAsArrayBuffer(file)
    })

/*
 * Initialize sql.js and load database from ArrayBuffer
 * @sig loadDatabase :: ArrayBuffer -> Promise<Database>
 */
const loadDatabase = async buffer => {
    const SQL = await initSqlJs({
        // Load WASM from CDN (sql.js bundles it but Vite needs explicit path)
        locateFile: file => `https://sql.js.org/dist/${file}`,
    })
    return new SQL.Database(new Uint8Array(buffer))
}

/*
 * Convert sql.js result rows to objects
 * @sig rowsToObjects :: { columns: [String], values: [[Any]] } -> [Object]
 */
const rowsToObjects = result => {
    if (!result || result.length === 0) return []
    const { columns, values } = result[0]
    return values.map(row => {
        const obj = {}
        columns.forEach((col, i) => (obj[col] = row[i]))
        return obj
    })
}

/*
 * Query all accounts from database
 * @sig queryAccounts :: Database -> LookupTable<Account>
 */
const queryAccounts = db => {
    const results = db.exec('SELECT id, name, type, description, credit_limit FROM accounts')
    const rows = rowsToObjects(results)
    const accounts = rows.map(row =>
        Account.from({
            id: row.id,
            name: row.name,
            type: row.type,
            description: row.description || null,
            creditLimit: row.credit_limit || null,
        }),
    )
    return LookupTable(accounts, Account, 'id')
}

/*
 * Query all categories from database
 * @sig queryCategories :: Database -> LookupTable<Category>
 */
const queryCategories = db => {
    const results = db.exec(
        'SELECT id, name, description, budget_amount, is_income_category, is_tax_related, tax_schedule FROM categories',
    )
    const rows = rowsToObjects(results)
    const categories = rows.map(row =>
        Category.from({
            id: row.id,
            name: row.name,
            description: row.description || null,
            budgetAmount: row.budget_amount || null,
            isIncomeCategory: row.is_income_category === 1 ? true : row.is_income_category === 0 ? false : null,
            isTaxRelated: row.is_tax_related === 1 ? true : row.is_tax_related === 0 ? false : null,
            taxSchedule: row.tax_schedule || null,
        }),
    )
    return LookupTable(categories, Category, 'id')
}

/*
 * Query all securities from database
 * @sig querySecurities :: Database -> LookupTable<Security>
 */
const querySecurities = db => {
    const results = db.exec('SELECT id, name, symbol, type, goal FROM securities')
    const rows = rowsToObjects(results)
    const securities = rows.map(row =>
        Security.from({
            id: row.id,
            name: row.name,
            symbol: row.symbol || null,
            type: row.type || null,
            goal: row.goal || null,
        }),
    )
    return LookupTable(securities, Security, 'id')
}

/*
 * Query all tags from database
 * @sig queryTags :: Database -> LookupTable<Tag>
 */
const queryTags = db => {
    const results = db.exec('SELECT id, name, color, description FROM tags')
    const rows = rowsToObjects(results)
    const tags = rows.map(row =>
        Tag.from({ id: row.id, name: row.name, color: row.color || null, description: row.description || null }),
    )
    return LookupTable(tags, Tag, 'id')
}

/*
 * Query all transaction splits from database
 * @sig querySplits :: Database -> LookupTable<Split>
 */
const querySplits = db => {
    const results = db.exec('SELECT id, transaction_id, category_id, amount, memo FROM transaction_splits')
    const rows = rowsToObjects(results)
    const splits = rows.map(row =>
        Split.from({
            id: row.id,
            transactionId: row.transaction_id,
            categoryId: row.category_id || null,
            amount: row.amount,
            memo: row.memo || null,
        }),
    )
    return LookupTable(splits, Split, 'id')
}

/*
 * Map database row to Transaction.Bank
 * @sig mapBankRow :: Object -> Transaction.Bank
 */
const mapBankRow = row =>
    Transaction.Bank.from({
        accountId: row.account_id,
        amount: row.amount,
        date: row.date,
        id: row.id,
        transactionType: 'bank',
        address: row.address || null,
        categoryId: row.category_id || null,
        cleared: row.cleared || null,
        memo: row.memo || null,
        number: row.number || null,
        payee: row.payee || null,
    })

/*
 * Map database row to Transaction.Investment
 * @sig mapInvestmentRow :: Object -> Transaction.Investment
 */
const mapInvestmentRow = row =>
    Transaction.Investment.from({
        accountId: row.account_id,
        date: row.date,
        id: row.id,
        transactionType: 'investment',
        address: row.address || null,
        amount: row.amount || null,
        categoryId: row.category_id || null,
        cleared: row.cleared || null,
        commission: row.commission || null,
        investmentAction: row.investment_action,
        memo: row.memo || null,
        payee: row.payee || null,
        price: row.price || null,
        quantity: row.quantity || null,
        securityId: row.security_id || null,
    })

/*
 * Query all transactions from database
 * @sig queryTransactions :: Database -> LookupTable<Transaction>
 */
const queryTransactions = db => {
    const sql = `
        SELECT id, account_id, date, amount, transaction_type, payee, memo, number, cleared,
               category_id, security_id, quantity, price, commission, investment_action, address
        FROM transactions
        ORDER BY date DESC, id DESC
    `

    const results = db.exec(sql)
    const rows = rowsToObjects(results)
    const transactions = rows.map(row => (row.transaction_type === 'bank' ? mapBankRow(row) : mapInvestmentRow(row)))
    return LookupTable(transactions, Transaction, 'id')
}

/*
 * Load a SQLite file and extract all entities as LookupTables
 * @sig loadEntitiesFromFile :: File -> Promise<{ accounts, categories, securities, tags, splits, transactions }>
 */
const loadEntitiesFromFile = async file => {
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
        }
    } finally {
        db.close()
    }
}

export { loadEntitiesFromFile, isSqliteFile }
