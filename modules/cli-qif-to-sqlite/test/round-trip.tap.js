// ABOUTME: Round-trip test to verify parser output matches expected types
// ABOUTME: Exposes where the contract between parser and import breaks

import { test } from 'tap'
import { MockDataGenerator } from '../src/mock-data-generator.js'
import { ParseQifData } from '../src/qif/parse-qif-data.js'
import { QifEntry } from '../src/types/index.js'

const { generateMockData, serializeToQif } = MockDataGenerator

test('round-trip: generateMockData -> serializeToQif -> parseQifData', async t => {
    // Generate typed data (Date objects, arrays, Tagged types)
    const original = generateMockData()

    // Serialize to QIF string format
    const qifString = serializeToQif(original)

    // Parse back - should produce same structure
    const parsed = ParseQifData.parseQifData(qifString)

    t.ok(parsed.bankTransactions.length > 0, 'has bank transactions')
    t.ok(parsed.investmentTransactions.length > 0, 'has investment transactions')
    t.ok(parsed.prices.length > 0, 'has prices')
    t.ok(parsed.accounts.length > 0, 'has accounts')
    t.ok(parsed.securities.length > 0, 'has securities')
})

test('parsed bank transactions have correct types', async t => {
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    const txn = parsed.bankTransactions[0]

    t.ok(txn, 'has at least one bank transaction')
    t.ok(txn.date instanceof Date, `date is Date object, got: ${typeof txn.date} (${txn.date})`)
    t.ok(QifEntry.TransactionBank.is(txn), `is QifEntry.TransactionBank, got: ${txn?.['@@tagName'] || 'plain object'}`)
    t.type(txn.amount, 'number', 'amount is number')
    t.type(txn.account, 'string', 'account is string')
})

test('parsed investment transactions have correct types', async t => {
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    const txn = parsed.investmentTransactions[0]

    t.ok(txn, 'has at least one investment transaction')
    t.ok(txn.date instanceof Date, `date is Date object, got: ${typeof txn.date} (${txn.date})`)
    t.ok(QifEntry.TransactionInvestment.is(txn), `is QifEntry.TransactionInvestment`)
    t.type(txn.account, 'string', 'account is string')
})

test('parsed prices have correct types', async t => {
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    const price = parsed.prices[0]

    t.ok(price, 'has at least one price')
    t.ok(price.date instanceof Date, `date is Date object, got: ${typeof price.date} (${price.date})`)
    t.ok(QifEntry.Price.is(price), `is QifEntry.Price`)
    t.type(price.price, 'number', 'price is number')
    t.type(price.symbol, 'string', 'symbol is string')
})

test('parsed accounts have correct types', async t => {
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    const account = parsed.accounts[0]

    t.ok(account, 'has at least one account')
    t.ok(QifEntry.Account.is(account), `is QifEntry.Account`)
    t.type(account.name, 'string', 'name is string')
    t.type(account.type, 'string', 'type is string')
})

test('bank transaction with address has array type', async t => {
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    // Find a transaction that has an address (if any)
    const txnWithAddress = parsed.bankTransactions.find(tx => tx.address)

    if (txnWithAddress)
        t.ok(Array.isArray(txnWithAddress.address), `address is array, got: ${typeof txnWithAddress.address}`)
    else t.pass('no transactions with address in test data (skip)')
})

test('original generateMockData produces Tagged types', async t => {
    const original = generateMockData()

    const bankTxn = original.bankTransactions[0]
    const investTxn = original.investmentTransactions[0]
    const price = original.prices[0]
    const account = original.accounts[0]

    t.ok(QifEntry.TransactionBank.is(bankTxn), 'original bankTransactions are QifEntry.TransactionBank')
    t.ok(
        QifEntry.TransactionInvestment.is(investTxn),
        'original investmentTransactions are QifEntry.TransactionInvestment',
    )
    t.ok(QifEntry.Price.is(price), 'original prices are QifEntry.Price')
    t.ok(QifEntry.Account.is(account), 'original accounts are QifEntry.Account')

    t.ok(bankTxn.date instanceof Date, 'original bank transaction date is Date')
    t.ok(investTxn.date instanceof Date, 'original investment transaction date is Date')
    t.ok(price.date instanceof Date, 'original price date is Date')
})

test('parsed data has duplicate accounts from QIF format', async t => {
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    // Check for duplicate account names
    const accountNames = parsed.accounts.map(a => a.name)
    const uniqueNames = [...new Set(accountNames)]

    t.comment(`Total accounts: ${accountNames.length}, unique: ${uniqueNames.length}`)
    t.comment(`Account names: ${accountNames.join(', ')}`)

    if (accountNames.length !== uniqueNames.length) t.comment('Duplicates found - QIF format repeats account headers')
})

test('full pipeline: parse -> import -> database', async t => {
    const Database = (await import('better-sqlite3')).default
    const { Import } = await import('../src/import.js')
    const { readFileSync } = await import('fs')
    const { resolve, dirname } = await import('path')
    const { fileURLToPath } = await import('url')

    const __dirname = dirname(fileURLToPath(import.meta.url))
    const schemaPath = resolve(__dirname, '../schema.sql')

    // Generate QIF data and parse it
    const original = generateMockData()
    const qifString = serializeToQif(original)
    const parsed = ParseQifData.parseQifData(qifString)

    // Create in-memory database with schema
    const db = new Database(':memory:')
    db.exec(readFileSync(schemaPath, 'utf-8'))

    // This is where it should break - import expects specific structure
    try {
        Import.processImport(db, parsed)
        t.pass('import succeeded')

        const txnCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c
        t.ok(txnCount > 0, `imported ${txnCount} transactions`)
    } catch (error) {
        t.fail(`import failed: ${error.message}`)
        t.comment(`Stack: ${error.stack}`)
    }

    db.close()
})
