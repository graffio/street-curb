// ABOUTME: Service for loading SQLite databases in the browser
// ABOUTME: Uses sql.js (WebAssembly SQLite) to read .sqlite files and extract transactions

/* global FileReader */

import LookupTable from '@graffio/functional/src/lookup-table.js'
import initSqlJs from 'sql.js'
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
 * Map database row to Transaction.Bank
 * @sig mapBankRow :: Object -> Transaction.Bank
 */
const mapBankRow = row =>
    Transaction.Bank(
        row.account_id,
        row.amount,
        row.date,
        row.id,
        'bank',
        row.address || null,
        row.category_id || null,
        row.cleared || null,
        row.memo || null,
        row.number || null,
        row.payee || null,
    )

/*
 * Map database row to Transaction.Investment
 * @sig mapInvestmentRow :: Object -> Transaction.Investment
 */
const mapInvestmentRow = row =>
    Transaction.Investment(
        row.account_id,
        row.date,
        row.id,
        'investment',
        row.address || null,
        row.amount || null,
        row.category_id || null,
        row.cleared || null,
        row.commission || null,
        row.investment_action,
        row.memo || null,
        row.payee || null,
        row.price || null,
        row.quantity || null,
        row.security_id || null,
    )

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
    if (results.length === 0) return LookupTable([], Transaction, 'id')

    const columns = results[0].columns
    const rows = results[0].values

    // Convert array rows to Transaction objects
    const transactions = rows.map(row => {
        const obj = {}
        columns.forEach((col, i) => (obj[col] = row[i]))
        return obj.transaction_type === 'bank' ? mapBankRow(obj) : mapInvestmentRow(obj)
    })

    // Build LookupTable keyed by transaction id
    return LookupTable(transactions, Transaction, 'id')
}

/*
 * Load a SQLite file and extract transactions as LookupTable
 * @sig loadTransactionsFromFile :: File -> Promise<LookupTable<Transaction>>
 */
const loadTransactionsFromFile = async file => {
    const buffer = await readFileAsArrayBuffer(file)

    if (!isSqliteFile(buffer)) throw new Error(`Not a valid SQLite file: ${file.name}`)

    const db = await loadDatabase(buffer)

    try {
        return queryTransactions(db)
    } finally {
        db.close()
    }
}

export { loadTransactionsFromFile, isSqliteFile }
