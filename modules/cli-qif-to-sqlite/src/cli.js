// ABOUTME: CLI command implementations for QIF database operations with stable identity
// ABOUTME: Thin wrappers that call services and handle presentation

import Database from 'better-sqlite3'
import { createInterface } from 'readline'
import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { groupBy } from '@graffio/functional'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { ImportHistory } from './import-history.js'
import { Import } from './import.js'
import { ParseQifData } from './parse-qif-data.js'
import { Rollback } from './rollback.js'
import { QifEntry } from './types/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')

const P = {
    // Validate that required arguments are present for command
    // @sig hasRequiredArgs :: Object -> Boolean
    hasRequiredArgs: argv => {
        const { _, database } = argv
        const command = _[0]
        const requiresDb = ['import', 'info', 'schema', 'register', 'history']
        if (command && requiresDb.includes(command) && !database) throw new Error('Database path is required (-d)')
        return true
    },
}

const T = {
    // Convert boolean to integer for SQLite (which can't bind booleans)
    // @sig toBoolInt :: Boolean|null -> Number|null
    toBoolInt: val => (val === true ? 1 : val === false ? 0 : null),

    // Transform a category for SQLite (convert booleans to integers)
    // @sig toImportCategory :: Object -> Object
    toImportCategory: cat => ({
        ...cat,
        isIncomeCategory: T.toBoolInt(cat.isIncomeCategory),
        isTaxRelated: T.toBoolInt(cat.isTaxRelated),
    }),

    // Transform a bank transaction to import format, preserving Tagged type
    // Adds accountName alias for downstream import.js
    // @sig toImportBankTransaction :: QifEntry.TransactionBank -> QifEntry.TransactionBank
    toImportBankTransaction: txn => {
        const { account, transactionType } = txn
        return QifEntry.TransactionBank.from({ ...txn, account, accountName: account, transactionType })
    },

    // Transform an investment transaction to import format, preserving Tagged type
    // Adds accountName and securitySignature aliases for downstream import.js
    // @sig toImportInvestmentTransaction :: QifEntry.TransactionInvestment -> QifEntry.TransactionInvestment
    toImportInvestmentTransaction: txn => {
        const { account, security, transactionType } = txn
        return QifEntry.TransactionInvestment.from({
            ...txn,
            account,
            accountName: account,
            transactionType,
            securitySignature: security || null,
        })
    },

    // Extract price entries from qualifying investment transactions
    // @sig toTransactionPrices :: [Transaction] -> [{symbol, date, price}]
    toTransactionPrices: investTxns => {
        // prettier-ignore
        const qualifying = new Set([
            'Buy', 'BuyX', 'Sell', 'SellX',
            'ReinvDiv', 'ReinvLg', 'ReinvSh', 'ReinvMd',
            'ShrsIn', 'ShrsOut',
        ])
        return investTxns
            .filter(
                ({ transactionType, price, security }) => qualifying.has(transactionType) && price != null && security,
            )
            .map(({ security, date, price }) => ({ symbol: security, date, price }))
    },

    // Normalize date to ISO string for use as dedup key
    // @sig toDateKey :: Date|String -> String
    toDateKey: date => (date instanceof Date ? date.toISOString().slice(0, 10) : String(date)),

    // Merge QIF prices with transaction-derived prices, deduplicating by symbol+date (last wins)
    // @sig toMergedPrices :: ([Price], [Price]) -> [Price]
    toMergedPrices: (qifPrices, txnPrices) => {
        const byKey = new Map()
        ;[...qifPrices, ...txnPrices].forEach(p => byKey.set(`${p.symbol}|${T.toDateKey(p.date)}`, p))
        return [...byKey.values()]
    },

    // Transform parsed QIF data into import format (combine bank and investment transactions)
    // Merges transaction-derived prices into the price array (transaction prices win for same symbol+date)
    // @sig toImportData :: Object -> Object
    toImportData: parsed => {
        const { toImportBankTransaction, toImportCategory, toImportInvestmentTransaction } = T
        const { accounts, bankTransactions, categories, investmentTransactions, prices, securities, tags } = parsed
        const importCategories = (categories || []).map(toImportCategory)
        const bankTxns = (bankTransactions || []).map(toImportBankTransaction)
        const investTxns = (investmentTransactions || []).map(toImportInvestmentTransaction)
        const txnPrices = T.toTransactionPrices(investTxns)
        const mergedPrices = T.toMergedPrices(prices || [], txnPrices)
        return {
            accounts,
            categories: importCategories,
            tags,
            securities,
            transactions: [...bankTxns, ...investTxns],
            prices: mergedPrices,
        }
    },

    // Count entities within a single change type group
    // @sig toEntityCounts :: [Object] -> {String: Number}
    toEntityCounts: items => {
        const byEntity = groupBy(c => c.entityType, items)
        return Object.fromEntries(Object.entries(byEntity).map(([type, arr]) => [type, arr.length]))
    },

    // Group changes by changeType, then by entityType with counts
    // @sig toGroupedChangeSummary :: [Object] -> {String: {String: Number}}
    toGroupedChangeSummary: changes => {
        const byChangeType = groupBy(c => c.changeType, changes)
        return Object.fromEntries(
            Object.entries(byChangeType).map(([changeType, items]) => [changeType, T.toEntityCounts(items)]),
        )
    },

    // Format a SingleAccount issue for display
    // @sig toSingleAccountMessage :: {accounts: [String]} -> String
    toSingleAccountMessage: ({ accounts }) => {
        const name = accounts[0]
        return `WARNING: QIF contains only 1 account ("${name}"). Did you forget to export "All Accounts" from Quicken?`
    },

    // Format a MissingAccounts issue for display
    // @sig toMissingAccountsMessage :: {missing: [String]} -> String
    toMissingAccountsMessage: ({ missing }) => {
        const list = missing.map(n => `  - ${n}`).join('\n')
        return `WARNING: ${missing.length} existing account(s) not found in QIF:\n${list}`
    },

    // Format an ImportIssue for display
    // @sig toIssueMessage :: ImportIssue -> String
    toIssueMessage: issue =>
        issue.match({ SingleAccount: T.toSingleAccountMessage, MissingAccounts: T.toMissingAccountsMessage }),

    // Collect database statistics for info command
    // @sig toStats :: Database -> Object
    toStats: db => ({
        accounts: db.prepare('SELECT COUNT(*) as count FROM accounts').get().count,
        categories: db.prepare('SELECT COUNT(*) as count FROM categories').get().count,
        tags: db.prepare('SELECT COUNT(*) as count FROM tags').get().count,
        securities: db.prepare('SELECT COUNT(*) as count FROM securities').get().count,
        transactions: db.prepare('SELECT COUNT(*) as count FROM transactions').get().count,
        prices: db.prepare('SELECT COUNT(*) as count FROM prices').get().count,
        lots: db.prepare('SELECT COUNT(*) as count FROM lots').get().count,
        stableIdentities: db.prepare('SELECT COUNT(*) as count FROM stableIdentities').get().count,
        orphanedEntities: db
            .prepare('SELECT COUNT(*) as count FROM stableIdentities WHERE orphanedAt IS NOT NULL')
            .get().count,
    }),

    // Collect schema table info for schema command
    // @sig toSchemaInfo :: Database -> [Object]
    toSchemaInfo: db => {
        const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name").all()
        return tables.map(t => ({ name: t.name, sql: t.sql }))
    },

    // Get account register entries for register command
    // @sig toRegisterEntries :: (Database, String) -> [Object]
    toRegisterEntries: (db, accountName) => {
        const account = db.prepare('SELECT id FROM accounts WHERE name = ?').get(accountName)
        if (!account) throw new Error(`Account not found: ${accountName}`)
        return db
            .prepare(
                `SELECT date, payee, memo, amount, categoryId, investmentAction, securityId, quantity, price
                 FROM transactions WHERE accountId = ? ORDER BY date, id`,
            )
            .all(account.id)
    },

    // Get recent import history for history command
    // @sig toImportHistory :: Database -> [Object]
    toImportHistory: db => db.prepare('SELECT * FROM importHistory ORDER BY importedAt DESC LIMIT 10').all(),

    // Format register entry line for output
    // @sig toRegisterLine :: (Object, Number) -> { line, newBalance }
    toRegisterLine: (entry, currentBalance) => {
        const { amount, date, investmentAction, payee } = entry
        const newBalance = currentBalance + (amount || 0)
        const desc = payee || investmentAction || 'Unknown'
        const amountStr = (amount || 0).toFixed(2).padStart(12)
        const balanceStr = newBalance.toFixed(2).padStart(12)
        return { line: `${date}  ${desc.padEnd(30)}  ${amountStr}  ${balanceStr}`, newBalance }
    },

    // Format history entry for output
    // @sig toHistoryLines :: Object -> [String]
    toHistoryLines: entry => {
        const { importId, importedAt, qifFileHash, summary } = entry
        const parsed = JSON.parse(summary || '{}')
        const { created, modified, orphaned, restored } = parsed
        return [
            `\n${importedAt} (${importId.slice(0, 8)}...)`,
            `  File hash: ${qifFileHash}`,
            `  Created: ${created || 0}, Modified: ${modified || 0}`,
            `  Orphaned: ${orphaned || 0}, Restored: ${restored || 0}`,
        ]
    },

    // Open or create database with schema
    // @sig toOpenDatabase :: String -> Database
    toOpenDatabase: path => {
        const db = new Database(path)
        const tableCount = db.prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table'").get().c
        if (!existsSync(path) || tableCount === 0) db.exec(readFileSync(schemaPath, 'utf-8'))
        return db
    },
}

const F = {
    // Create import function that captures parsed data and records history
    // Uses real change tracking from Import.processImport
    // @sig createImportFn :: (Object, String) -> (Database, Object) -> Object
    createImportFn: (data, qifContent) => (db, progress) => {
        progress.stage = 'importing'
        const txnCount = (data.bankTransactions?.length || 0) + (data.investmentTransactions?.length || 0)
        progress.total = txnCount
        const { changeCounts, changes } = Import.processImport(db, data, msg => console.log(`  ${msg}`))
        ImportHistory.finalizeImportHistory(db, qifContent, changeCounts, changes)
        return { success: true, changeCounts, changes }
    },
}

const E = {
    // Output stats to console
    // @sig emitStats :: Object -> void
    emitStats: stats => {
        const { accounts, categories, lots, orphanedEntities, prices } = stats
        const { securities, stableIdentities, tags, transactions } = stats
        console.log('\n=== Database Statistics ===')
        console.log(`Accounts: ${accounts}`)
        console.log(`Categories: ${categories}`)
        console.log(`Tags: ${tags}`)
        console.log(`Securities: ${securities}`)
        console.log(`Transactions: ${transactions}`)
        console.log(`Prices: ${prices}`)
        console.log(`Lots: ${lots}`)
        console.log(`Stable Identities: ${stableIdentities}`)
        console.log(`Orphaned Entities: ${orphanedEntities}`)
    },

    // Output a single schema table to console
    // @sig emitTable :: Object -> void
    emitTable: table => console.log(`\n--- ${table.name} ---\n${table.sql}`),

    // Output schema info to console
    // @sig emitSchemaInfo :: [Object] -> void
    emitSchemaInfo: tables => {
        console.log('\n=== Database Schema ===')
        tables.forEach(E.emitTable)
    },

    // Output single register line and return updated balance
    // @sig emitRegisterLine :: (Number, Object) -> Number
    emitRegisterLine: (balance, entry) => {
        const result = T.toRegisterLine(entry, balance)
        console.log(result.line)
        return result.newBalance
    },

    // Output register entries to console
    // @sig emitRegister :: (String, [Object]) -> void
    emitRegister: (accountName, entries) => {
        console.log(`\n=== Register: ${accountName} ===`)
        entries.reduce(E.emitRegisterLine, 0)
    },

    // Output a single history entry to console
    // @sig emitHistoryEntry :: Object -> void
    emitHistoryEntry: entry => T.toHistoryLines(entry).forEach(line => console.log(line)),

    // Output import history to console
    // @sig emitHistory :: [Object] -> void
    emitHistory: history => {
        console.log('\n=== Recent Import History ===')
        if (history.length === 0) return console.log('No import history found.')
        history.forEach(E.emitHistoryEntry)
    },

    // Output entity type breakdown indented under a status line
    // @sig emitEntityBreakdown :: Object -> void
    emitEntityBreakdown: entityCounts => {
        const maxLen = Math.max(...Object.values(entityCounts).map(n => String(n).length))
        Object.entries(entityCounts)
            .sort(([, a], [, b]) => b - a)
            .forEach(([type, count]) => console.log(`  ${type + ':'}  ${String(count).padStart(maxLen)}`))
    },

    // Output a single summary section (e.g. "Created: 42" with entity breakdown)
    // @sig emitSummarySection :: (Object, Object, String) -> void
    emitSummarySection: (changeCounts, grouped, type) => {
        if (changeCounts[type] === 0) return
        const label = type[0].toUpperCase() + type.slice(1)
        console.log(`${label + ':'}  ${changeCounts[type]}`)
        E.emitEntityBreakdown(grouped[type])
    },

    // Output change summary to console after import with per-type breakdown
    // @sig emitChangeSummary :: (Object, [Object]) -> void
    emitChangeSummary: (changeCounts, changes) => {
        const grouped = T.toGroupedChangeSummary(changes)
        console.log('\n=== Import Summary ===')
        ;['created', 'modified', 'orphaned', 'restored'].forEach(type =>
            E.emitSummarySection(changeCounts, grouped, type),
        )
    },

    // Output import error to console with full context
    // @sig emitImportError :: Object -> void
    emitImportError: error => {
        const { entity, entityType, message, processed, stack, stage, total } = error
        console.error('\n=== Import Failed ===')
        console.error(`Error: ${message}`)
        console.error(`Stage: ${stage}`)
        if (entityType) console.error(`Entity type: ${entityType}`)
        if (entity) console.error(`Entity: ${JSON.stringify(entity, null, 2)}`)
        if (total > 0) console.error(`Progress: ${processed}/${total}`)
        if (stack) {
            console.error('\nStack trace:')
            console.error(stack)
        }
    },

    // Prompt user for y/n confirmation, resolves to boolean
    // @sig promptConfirm :: String -> Promise Boolean
    promptConfirm: question => {
        const rl = createInterface({ input: process.stdin, output: process.stdout })
        return new Promise(resolve =>
            rl.question(`${question} (y/n) `, answer => {
                rl.close()
                resolve(answer.trim().toLowerCase() === 'y')
            }),
        )
    },

    // Display validation issues and prompt for confirmation. Opens/closes its own DB.
    // @sig validateAndConfirm :: (String, Object) -> Promise Boolean
    validateAndConfirm: async (database, data) => {
        if (!existsSync(database)) return true
        const db = new Database(database)
        const issues = Import.validateImport(db, data)
        db.close()
        if (issues.length === 0) return true
        console.log('\n=== Import Validation ===')
        issues.forEach(issue => console.log(T.toIssueMessage(issue)))
        return E.promptConfirm('\nProceed with import?')
    },

    // Handle import command with rollback protection
    // @sig handleImport :: Object -> Promise void
    handleImport: async argv => {
        const { database, file } = argv
        if (!file) throw new Error('Import command requires a file path')
        if (!existsSync(file)) throw new Error(`File not found: ${file}`)

        console.log(`Parsing QIF file: ${file}`)
        const qifContent = readFileSync(file, 'utf-8')
        const parsed = ParseQifData.parseQifData(qifContent)
        const data = T.toImportData(parsed)

        console.log(`\nParsed: ${data.accounts.length} accounts, ${data.transactions.length} transactions`)
        console.log(`        ${data.securities.length} securities, ${data.prices.length} prices`)

        const confirmed = await E.validateAndConfirm(database, data)
        if (!confirmed) {
            console.log('Import aborted.')
            return
        }

        const importFn = F.createImportFn(data, qifContent)
        const { success, result, error } = Rollback.withRollback(database, T.toOpenDatabase, importFn)

        if (success) {
            E.emitChangeSummary(result.changeCounts, result.changes)
            console.log('\nImport completed successfully!')
            console.log(`Database: ${database}`)
        } else {
            E.emitImportError(error)
            process.exit(1)
        }
    },

    // Handle info command
    // @sig handleInfo :: Object -> void
    handleInfo: argv => {
        const { database } = argv
        const db = new Database(database)
        E.emitStats(T.toStats(db))
        console.log(`\nDatabase: ${database}`)
        db.close()
    },

    // Handle schema command
    // @sig handleSchema :: Object -> void
    handleSchema: argv => {
        const { database } = argv
        const db = new Database(database)
        E.emitSchemaInfo(T.toSchemaInfo(db))
        console.log(`\nDatabase: ${database}`)
        db.close()
    },

    // Handle register command
    // @sig handleRegister :: Object -> void
    handleRegister: argv => {
        const { account, database } = argv
        if (!account) throw new Error('Register command requires an account name (-a)')
        const db = new Database(database)
        E.emitRegister(account, T.toRegisterEntries(db, account))
        console.log(`\nDatabase: ${database}`)
        db.close()
    },

    // Handle history command
    // @sig handleHistory :: Object -> void
    handleHistory: argv => {
        const { database } = argv
        const db = new Database(database)
        E.emitHistory(T.toImportHistory(db))
        console.log(`\nDatabase: ${database}`)
        db.close()
    },

    // Dispatch command to appropriate handler
    // @sig dispatchCommand :: Object -> Promise void
    dispatchCommand: async argv => {
        const { _ } = argv
        const [command] = _

        if (command === 'import') return E.handleImport(argv)
        if (command === 'info') return E.handleInfo(argv)
        if (command === 'schema') return E.handleSchema(argv)
        if (command === 'register') return E.handleRegister(argv)
        if (command === 'history') return E.handleHistory(argv)

        throw new Error(`Unknown command: ${command}`)
    },

    // Main CLI entry point
    // @sig main :: () -> Promise void
    main: async () => {
        try {
            const argv = yargs(hideBin(process.argv))
                .usage('Usage: qif-db <command> [options]')
                .command('import <file>', 'Import QIF file into database')
                .command('info', 'Show database statistics')
                .command('schema', 'Show database schema')
                .command('register', 'Show account register with running balances')
                .command('history', 'Show recent import history')
                .option('database', { alias: 'd', type: 'string', description: 'Database file path' })
                .option('account', { alias: 'a', type: 'string', description: 'Account name (for register)' })
                .help()
                .alias('help', 'h')
                .version()
                .alias('version', 'v')
                .demandCommand(1, 'Please specify a command')
                .check(P.hasRequiredArgs)
                .parse()

            await E.dispatchCommand(argv)
        } catch (error) {
            console.error(`Error: ${error.message}`)
            process.exit(1)
        }
    },
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.js')) E.main()

// CLI entry point for programmatic use
// @sig cli :: () -> void
const cli = () => E.main()

export { cli }
