#!/usr/bin/env node
// ABOUTME: Generates test fixtures for UI regression testing
// ABOUTME: Creates QIF, SQLite, and expected.json files from seeded mock data

import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Import } from '../src/import.js'
import { MockDataGenerator } from '../src/mock-data-generator.js'
import { ParseQifData } from '../src/parse-qif-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = resolve(__dirname, '../test/fixtures')
const SCHEMA_PATH = resolve(__dirname, '../schema.sql')

const T = {
    // Transform bank transaction to import format
    // @sig toBankTxn :: Object -> Object
    toBankTxn: t => ({ ...t, accountName: t.account }),

    // Transform investment transaction to import format
    // @sig toInvestTxn :: Object -> Object
    toInvestTxn: t => ({ ...t, accountName: t.account, securitySignature: t.security || null }),

    // Transform parsed QIF data into import format
    // @sig toImportData :: Object -> Object
    toImportData: parsed => {
        const { accounts, bankTransactions, categories, investmentTransactions, prices, securities, tags } = parsed
        const bankTxns = (bankTransactions || []).map(T.toBankTxn)
        const investTxns = (investmentTransactions || []).map(T.toInvestTxn)
        return {
            accounts,
            categories: categories || [],
            tags: tags || [],
            securities: securities || [],
            transactions: [...bankTxns, ...investTxns],
            prices: prices || [],
        }
    },

    // Query market values for investment accounts (remaining shares * latest price)
    // @sig toMarketValues :: Database -> Object<AccountName, Number>
    toMarketValues: db => {
        const sumAllocated = `SELECT SUM(la.sharesAllocated) FROM lotAllocations la WHERE la.lotId = l.id`
        const latestPrice = `SELECT p.price FROM prices p WHERE p.securityId = l.securityId ORDER BY date DESC LIMIT 1`
        const holdings = db
            .prepare(
                `SELECT a.name as account,
                    SUM((l.quantity - COALESCE((${sumAllocated}), 0)) * (${latestPrice})) as marketValue
                 FROM lots l
                 JOIN accounts a ON l.accountId = a.id
                 WHERE l.quantity > 0
                 GROUP BY l.accountId`,
            )
            .all()
        return Object.fromEntries(holdings.map(h => [h.account, Math.round(h.marketValue * 100) / 100]))
    },

    // Query cash balances (last runningBalance per account)
    // @sig toCashBalances :: Database -> Object<AccountName, Number>
    toCashBalances: db => {
        const lastTxnPerAccount = `SELECT id FROM transactions t2
            WHERE t2.accountId = t.accountId ORDER BY t2.date DESC, t2.id DESC LIMIT 1`
        const rows = db
            .prepare(
                `SELECT a.name, t.runningBalance
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 WHERE t.id IN (${lastTxnPerAccount})`,
            )
            .all()
        return Object.fromEntries(rows.map(r => [r.name, r.runningBalance ?? 0]))
    },

    // Enrich account row with rounded balance and market value
    // @sig toEnrichedAccount :: (Object, Object, Object) -> Object
    toEnrichedAccount: (marketValues, cashBalances, row) => {
        const { balance, name } = row
        const roundedBalance = Math.round(balance * 100) / 100
        const holdingsValue = marketValues[name] || 0
        const cashBalance = cashBalances[name] || 0

        // Investment account market value = holdings + cash (from runningBalance)
        const marketValue = holdingsValue ? Math.round((holdingsValue + cashBalance) * 100) / 100 : null
        return { ...row, balance: roundedBalance, marketValue }
    },

    // Query account stats from database (with market values for investment accounts)
    // @sig toAccountStats :: Database -> [Object]
    toAccountStats: db => {
        const marketValues = T.toMarketValues(db)
        const cashBalances = T.toCashBalances(db)
        return db
            .prepare(
                `SELECT a.name, a.type, COUNT(t.id) as transactionCount, COALESCE(SUM(t.amount), 0) as balance
                 FROM accounts a LEFT JOIN transactions t ON t.accountId = a.id
                 GROUP BY a.id ORDER BY a.name`,
            )
            .all()
            .map(row => T.toEnrichedAccount(marketValues, cashBalances, row))
    },

    // Query totals from database
    // @sig toTotals :: Database -> Object
    toTotals: db => ({
        accounts: db.prepare('SELECT COUNT(*) as c FROM accounts').get().c,
        transactions: db.prepare('SELECT COUNT(*) as c FROM transactions').get().c,
        securities: db.prepare('SELECT COUNT(*) as c FROM securities').get().c,
        prices: db.prepare('SELECT COUNT(*) as c FROM prices').get().c,
        categories: db.prepare('SELECT COUNT(*) as c FROM categories').get().c,
    }),

    // Query spot check transactions from database
    // @sig toSpotChecks :: Database -> [Object]
    toSpotChecks: db =>
        db
            .prepare(
                `SELECT a.name as account, t.date, t.payee, t.amount, t.investmentAction, s.symbol
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 LEFT JOIN securities s ON t.securityId = s.id
                 ORDER BY t.date, t.id LIMIT 10`,
            )
            .all(),

    // Round a category row to expected precision
    // @sig toRoundedCategory :: Object -> Object
    toRoundedCategory: r => {
        const { category, count, total } = r
        return { category, total: Math.round(total * 100) / 100, count }
    },

    // Round a holding row to expected precision
    // @sig toRoundedHolding :: Object -> Object
    toRoundedHolding: r => {
        const { account, marketValue, securityName, shares, symbol } = r
        return {
            account,
            symbol,
            securityName,
            shares: Math.round(shares * 1000) / 1000,
            marketValue: Math.round(marketValue * 100) / 100,
        }
    },

    // Query category totals rolled up to parent categories (for CategoryReportPage verification)
    // @sig toCategoryTotals :: Database -> [Object]
    toCategoryTotals: db => {
        const parentCategory = `CASE WHEN c.name LIKE '%:%'
            THEN SUBSTR(c.name, 1, INSTR(c.name, ':') - 1)
            ELSE COALESCE(c.name, 'Uncategorized') END`
        return db
            .prepare(
                `SELECT ${parentCategory} as category, SUM(t.amount) as total, COUNT(*) as count
                 FROM transactions t
                 LEFT JOIN categories c ON t.categoryId = c.id
                 GROUP BY category
                 ORDER BY category`,
            )
            .all()
            .map(T.toRoundedCategory)
    },

    // Query holdings by account for InvestmentReportPage verification
    // @sig toHoldings :: Database -> [Object]
    toHoldings: db => {
        const sumAllocated = `SELECT COALESCE(SUM(la.sharesAllocated), 0) FROM lotAllocations la WHERE la.lotId = l.id`
        const latestPrice = `SELECT p.price FROM prices p WHERE p.securityId = l.securityId ORDER BY date DESC LIMIT 1`
        return db
            .prepare(
                `SELECT a.name as account, s.symbol, s.name as securityName,
                    SUM(l.quantity - (${sumAllocated})) as shares,
                    SUM((l.quantity - (${sumAllocated})) * (${latestPrice})) as marketValue
                 FROM lots l
                 JOIN accounts a ON l.accountId = a.id
                 JOIN securities s ON l.securityId = s.id
                 WHERE l.quantity > 0
                 GROUP BY a.id, s.id
                 HAVING shares > 0.001
                 ORDER BY a.name, s.symbol`,
            )
            .all()
            .map(T.toRoundedHolding)
    },
}

const E = {
    // Generate all fixtures for a given seed
    // @sig generateFixtures :: Number -> void
    generateFixtures: seed => {
        const prefix = `seed-${seed}`
        const qifPath = resolve(FIXTURES_DIR, `${prefix}.qif`)
        const sqlitePath = resolve(FIXTURES_DIR, `${prefix}.sqlite`)
        const expectedPath = resolve(FIXTURES_DIR, `${prefix}.expected.json`)

        console.log(`Generating fixtures for seed ${seed}...`)

        // Ensure fixtures directory exists
        if (!existsSync(FIXTURES_DIR)) mkdirSync(FIXTURES_DIR, { recursive: true })

        // Generate mock data and QIF
        console.log('  Generating mock data...')
        const data = MockDataGenerator.generateMockData(seed)
        const qif = MockDataGenerator.serializeToQif(data)
        writeFileSync(qifPath, qif)
        console.log(`  Written: ${qifPath}`)

        // Parse QIF and import to SQLite
        console.log('  Importing to SQLite...')
        if (existsSync(sqlitePath)) unlinkSync(sqlitePath)
        const parsed = ParseQifData.parseQifData(qif)
        const importData = T.toImportData(parsed)
        const db = new Database(sqlitePath)
        db.exec(readFileSync(SCHEMA_PATH, 'utf-8'))
        Import.processImport(db, importData)
        console.log(`  Written: ${sqlitePath}`)

        // Generate expected.json
        console.log('  Generating expected values...')
        const expected = {
            seed,
            generatedAt: new Date().toISOString(),
            totals: T.toTotals(db),
            accounts: T.toAccountStats(db),
            categoryTotals: T.toCategoryTotals(db),
            holdings: T.toHoldings(db),
            spotChecks: T.toSpotChecks(db),
        }
        writeFileSync(expectedPath, JSON.stringify(expected, null, 2))
        console.log(`  Written: ${expectedPath}`)

        db.close()
        console.log('Done!')
    },
}

// Run with default seed or from command line
const seed = parseInt(process.argv[2], 10) || 12345
E.generateFixtures(seed)
