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

// Set up FileReader to read file and resolve/reject promise
// @sig setupFileReader :: (File, Function, Function) -> void
const setupFileReader = (file, resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsArrayBuffer(file)
}

// Read a File object as ArrayBuffer
// @sig readFileAsArrayBuffer :: File -> Promise<ArrayBuffer>
const readFileAsArrayBuffer = file => new Promise((resolve, reject) => setupFileReader(file, resolve, reject))

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

// Convert a single row array to object using column names
// @sig rowToObject :: ([String], [Any]) -> Object
const rowToObject = (columns, row) => Object.fromEntries(columns.map((col, i) => [col, row[i]]))

// Convert sql.js result rows to objects
// @sig rowsToObjects :: { columns: [String], values: [[Any]] } -> [Object]
const rowsToObjects = result => {
    if (!result || result.length === 0) return []
    const { columns, values } = result[0]
    return values.map(row => rowToObject(columns, row))
}

// Map database row to Account
// @sig mapAccountRow :: Object -> Account
const mapAccountRow = row => {
    const { credit_limit: creditLimit, description, id, name, type } = row
    return Account.from({ id, name, type, description: description || null, creditLimit: creditLimit || null })
}

// Query all accounts from database
// @sig queryAccounts :: Database -> LookupTable<Account>
const queryAccounts = db => {
    const results = db.exec('SELECT id, name, type, description, credit_limit FROM accounts')
    const rows = rowsToObjects(results)
    return LookupTable(rows.map(mapAccountRow), Account, 'id')
}

// Convert SQLite integer to boolean (1=true, 0=false, null=null)
// @sig sqliteBool :: Number? -> Boolean?
const sqliteBool = val => (val === 1 ? true : val === 0 ? false : null)

// Map database row to Category
// @sig mapCategoryRow :: Object -> Category
const mapCategoryRow = row => {
    const {
        budget_amount: budgetAmount,
        description,
        id,
        is_income_category: isIncome,
        is_tax_related: isTax,
        name,
        tax_schedule: taxSchedule,
    } = row
    return Category.from({
        id,
        name,
        description: description || null,
        budgetAmount: budgetAmount || null,
        isIncomeCategory: sqliteBool(isIncome),
        isTaxRelated: sqliteBool(isTax),
        taxSchedule: taxSchedule || null,
    })
}

// Query all categories from database
// @sig queryCategories :: Database -> LookupTable<Category>
const queryCategories = db => {
    const results = db.exec(
        'SELECT id, name, description, budget_amount, is_income_category, is_tax_related, tax_schedule FROM categories',
    )
    const rows = rowsToObjects(results)
    return LookupTable(rows.map(mapCategoryRow), Category, 'id')
}

// Map database row to Security
// @sig mapSecurityRow :: Object -> Security
const mapSecurityRow = row => {
    const { goal, id, name, symbol, type } = row
    return Security.from({ id, name, symbol: symbol || null, type: type || null, goal: goal || null })
}

// Query all securities from database
// @sig querySecurities :: Database -> LookupTable<Security>
const querySecurities = db => {
    const results = db.exec('SELECT id, name, symbol, type, goal FROM securities')
    const rows = rowsToObjects(results)
    return LookupTable(rows.map(mapSecurityRow), Security, 'id')
}

// Map database row to Tag
// @sig mapTagRow :: Object -> Tag
const mapTagRow = row => {
    const { color, description, id, name } = row
    return Tag.from({ id, name, color: color || null, description: description || null })
}

// Query all tags from database
// @sig queryTags :: Database -> LookupTable<Tag>
const queryTags = db => {
    const results = db.exec('SELECT id, name, color, description FROM tags')
    const rows = rowsToObjects(results)
    return LookupTable(rows.map(mapTagRow), Tag, 'id')
}

// Map database row to Split
// @sig mapSplitRow :: Object -> Split
const mapSplitRow = row => {
    const { amount, category_id: categoryId, id, memo, transaction_id: transactionId } = row
    return Split.from({ id, transactionId, categoryId: categoryId || null, amount, memo: memo || null })
}

// Query all transaction splits from database
// @sig querySplits :: Database -> LookupTable<Split>
const querySplits = db => {
    const results = db.exec('SELECT id, transaction_id, category_id, amount, memo FROM transaction_splits')
    const rows = rowsToObjects(results)
    return LookupTable(rows.map(mapSplitRow), Split, 'id')
}

// Map database row to Transaction.Bank
// @sig mapBankRow :: Object -> Transaction.Bank
const mapBankRow = row => {
    const {
        account_id: accountId,
        address,
        amount,
        category_id: categoryId,
        cleared,
        date,
        id,
        memo,
        number,
        payee,
    } = row
    return Transaction.Bank.from({
        accountId,
        amount,
        date,
        id,
        transactionType: 'bank',
        address: address || null,
        categoryId: categoryId || null,
        cleared: cleared || null,
        memo: memo || null,
        number: number || null,
        payee: payee || null,
    })
}

// Map database row to Transaction.Investment
// @sig mapInvestmentRow :: Object -> Transaction.Investment
const mapInvestmentRow = row => {
    const {
        account_id: accountId,
        address,
        amount,
        category_id: categoryId,
        cleared,
        commission,
        date,
        id,
        investment_action: investmentAction,
        memo,
        payee,
        price,
        quantity,
        security_id: securityId,
    } = row
    return Transaction.Investment.from({
        accountId,
        date,
        id,
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
