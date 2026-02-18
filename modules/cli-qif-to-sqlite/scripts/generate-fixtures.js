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

// SQL fragment: roll subcategories (e.g., "Food:Groceries") up to parent category ("Food")
const PARENT_CATEGORY_SQL = `CASE WHEN c.name LIKE '%:%'
    THEN SUBSTR(c.name, 1, INSTR(c.name, ':') - 1)
    ELSE COALESCE(c.name, 'Uncategorized') END`

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
    toCategoryTotals: db =>
        db
            .prepare(
                `SELECT ${PARENT_CATEGORY_SQL} as category, SUM(t.amount) as total, COUNT(*) as count
                 FROM transactions t
                 LEFT JOIN categories c ON t.categoryId = c.id
                 GROUP BY category
                 ORDER BY category`,
            )
            .all()
            .map(T.toRoundedCategory),

    // Query per-account transaction counts for a date range
    // @sig toDateFilteredAccountCounts :: (Database, String, String) -> [Object]
    toDateFilteredAccountCounts: (db, startDate, endDate) =>
        db
            .prepare(
                `SELECT a.name as account, COUNT(*) as count
                 FROM transactions t JOIN accounts a ON t.accountId = a.id
                 WHERE t.date BETWEEN ? AND ?
                 GROUP BY a.name ORDER BY a.name`,
            )
            .all(startDate, endDate),

    // Query category totals for a date range (rolled up to parent categories)
    // @sig toDateFilteredCategoryTotals :: (Database, String, String) -> [Object]
    toDateFilteredCategoryTotals: (db, startDate, endDate) =>
        db
            .prepare(
                `SELECT ${PARENT_CATEGORY_SQL} as category, SUM(t.amount) as total, COUNT(*) as count
                 FROM transactions t
                 LEFT JOIN categories c ON t.categoryId = c.id
                 WHERE t.date BETWEEN ? AND ?
                 GROUP BY category
                 ORDER BY category`,
            )
            .all(startDate, endDate)
            .map(T.toRoundedCategory),

    // Query category totals for a single account (rolled up to parent categories)
    // @sig toCategoryTotalsByAccount :: (Database, String) -> [Object]
    toCategoryTotalsByAccount: (db, accountName) =>
        db
            .prepare(
                `SELECT ${PARENT_CATEGORY_SQL} as category, SUM(t.amount) as total, COUNT(*) as count
                 FROM transactions t
                 LEFT JOIN categories c ON t.categoryId = c.id
                 JOIN accounts a ON t.accountId = a.id
                 WHERE a.name = ?
                 GROUP BY category
                 ORDER BY category`,
            )
            .all(accountName)
            .map(T.toRoundedCategory),

    // Query payees and count for transactions matching a category on an account
    // @sig toCategoryFilteredPayees :: (Database, String, String) -> { count: Number, payees: [String] }
    toCategoryFilteredPayees: (db, accountName, categoryName) => {
        const rows = db
            .prepare(
                `SELECT t.payee, COUNT(*) as count
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 JOIN categories c ON t.categoryId = c.id
                 WHERE a.name = ? AND c.name LIKE ? || '%'
                 GROUP BY t.payee ORDER BY t.payee`,
            )
            .all(accountName, categoryName)
        return { count: rows.reduce((sum, r) => sum + r.count, 0), payees: rows.map(r => r.payee) }
    },

    // Query symbols and count for transactions matching an action on an account
    // @sig toActionFilteredSymbols :: (Database, String, String) -> { count: Number, symbols: [String] }
    toActionFilteredSymbols: (db, accountName, action) => {
        const rows = db
            .prepare(
                `SELECT s.symbol, COUNT(*) as count
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 LEFT JOIN securities s ON t.securityId = s.id
                 WHERE a.name = ? AND t.investmentAction = ?
                 GROUP BY s.symbol ORDER BY s.symbol`,
            )
            .all(accountName, action)
        return { count: rows.reduce((sum, r) => sum + r.count, 0), symbols: rows.map(r => r.symbol).filter(Boolean) }
    },

    // Query a single payee that does NOT match a category on an account
    // @sig toNonCategoryPayee :: (Database, String, String) -> String
    toNonCategoryPayee: (db, accountName, categoryName) => {
        const row = db
            .prepare(
                `SELECT DISTINCT t.payee
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 LEFT JOIN categories c ON t.categoryId = c.id
                 WHERE a.name = ? AND (c.name IS NULL OR c.name NOT LIKE ? || '%') AND t.payee IS NOT NULL
                 ORDER BY t.payee LIMIT 1`,
            )
            .get(accountName, categoryName)
        if (!row) throw new Error(`No non-${categoryName} payee found on ${accountName}`)
        return row.payee
    },

    // Query count for date + category intersection on an account
    // @sig toDateCategoryIntersection :: (Database, String, String, String, String) -> { count: Number }
    toDateCategoryIntersection: (db, accountName, categoryName, startDate, endDate) => {
        const count = db
            .prepare(
                `SELECT COUNT(*) as c
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 JOIN categories c ON t.categoryId = c.id
                 WHERE a.name = ? AND c.name LIKE ? || '%' AND t.date BETWEEN ? AND ?`,
            )
            .get(accountName, categoryName, startDate, endDate).c
        return { count }
    },

    // Query count for security + action intersection on an account
    // @sig toSecurityActionIntersection :: (Database, String, String, String) -> { count: Number }
    toSecurityActionIntersection: (db, accountName, symbol, action) => {
        const count = db
            .prepare(
                `SELECT COUNT(*) as c
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 JOIN securities s ON t.securityId = s.id
                 WHERE a.name = ? AND s.symbol = ? AND t.investmentAction = ?`,
            )
            .get(accountName, symbol, action).c
        return { count }
    },

    // Query transaction count per security for an account
    // @sig toPerSecurityCounts :: (Database, String) -> Object<Symbol, Number>
    toPerSecurityCounts: (db, accountName) => {
        const rows = db
            .prepare(
                `SELECT s.symbol, COUNT(*) as count
                 FROM transactions t
                 JOIN accounts a ON t.accountId = a.id
                 JOIN securities s ON t.securityId = s.id
                 WHERE a.name = ?
                 GROUP BY s.symbol ORDER BY s.symbol`,
            )
            .all(accountName)
        return Object.fromEntries(rows.map(r => [r.symbol, r.count]))
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

    // Query cash balances at a historical date (last runningBalance per account on or before asOfDate)
    // @sig toCashBalancesAsOf :: (Database, String) -> Object<AccountName, Number>
    toCashBalancesAsOf: (db, asOfDate) => {
        const rows = db
            .prepare(
                `SELECT a.name,
                    (SELECT t.runningBalance FROM transactions t
                     WHERE t.accountId = a.id AND t.date <= $asOfDate
                     ORDER BY t.date DESC, t.id DESC LIMIT 1) as runningBalance
                 FROM accounts a
                 WHERE a.type IN ('Investment', '401(k)/403(b)')`,
            )
            .all({ asOfDate })
        return Object.fromEntries(rows.filter(r => r.runningBalance != null).map(r => [r.name, r.runningBalance]))
    },

    // Query holdings by account and security at a historical date
    // @sig toHoldingsAsOf :: (Database, String) -> [Object]
    toHoldingsAsOf: (db, asOfDate) => {
        const sumAllocated = `SELECT COALESCE(SUM(la.sharesAllocated), 0)
            FROM lotAllocations la WHERE la.lotId = l.id AND la.date <= $asOfDate`
        const priceAsOf = `SELECT p.price FROM prices p
            WHERE p.securityId = l.securityId AND p.date <= $asOfDate ORDER BY p.date DESC LIMIT 1`
        return db
            .prepare(
                `SELECT a.name as account, s.symbol, s.name as securityName,
                    SUM(l.quantity - (${sumAllocated})) as shares,
                    SUM((l.quantity - (${sumAllocated})) * (${priceAsOf})) as marketValue
                 FROM lots l
                 JOIN accounts a ON l.accountId = a.id
                 JOIN securities s ON l.securityId = s.id
                 WHERE l.purchaseDate <= $asOfDate
                   AND (l.closedDate IS NULL OR l.closedDate > $asOfDate)
                 GROUP BY a.id, s.id
                 HAVING shares > 0.001
                 ORDER BY a.name, s.symbol`,
            )
            .all({ asOfDate })
            .map(T.toRoundedHolding)
    },

    // Query account totals at a historical date (holdings market value + cash)
    // @sig toMarketValuesAsOf :: (Database, String) -> Object<AccountName, Number>
    toMarketValuesAsOf: (db, asOfDate) => {
        const holdings = T.toHoldingsAsOf(db, asOfDate)
        const cashBalances = T.toCashBalancesAsOf(db, asOfDate)
        const holdingsByAccount = holdings.reduce(
            (acc, { account, marketValue }) => ({ ...acc, [account]: (acc[account] || 0) + marketValue }),
            {},
        )
        const accounts = [...new Set([...Object.keys(holdingsByAccount), ...Object.keys(cashBalances)])].sort()
        return Object.fromEntries(
            accounts.map(name => {
                const total = (holdingsByAccount[name] || 0) + (cashBalances[name] || 0)
                return [name, Math.round(total * 100) / 100]
            }),
        )
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
            holdingsAsOf: {
                date: '2024-07-15',
                holdings: T.toHoldingsAsOf(db, '2024-07-15'),
                accountTotals: T.toMarketValuesAsOf(db, '2024-07-15'),
            },
            spotChecks: T.toSpotChecks(db),
            dateFiltered: {
                startDate: '2024-02-01',
                endDate: '2024-02-28',
                accountCounts: T.toDateFilteredAccountCounts(db, '2024-02-01', '2024-02-28'),
                categoryTotals: T.toDateFilteredCategoryTotals(db, '2024-02-01', '2024-02-28'),
            },
            perSecurityCounts: T.toPerSecurityCounts(db, 'Fidelity Brokerage'),
            categoryFiltered: {
                Food: T.toCategoryFilteredPayees(db, 'Primary Checking', 'Food'),
                nonFoodPayee: T.toNonCategoryPayee(db, 'Primary Checking', 'Food'),
            },
            categoryTotalsByAccount: { PrimaryChecking: T.toCategoryTotalsByAccount(db, 'Primary Checking') },
            actionFiltered: { Buy: T.toActionFilteredSymbols(db, 'Fidelity Brokerage', 'Buy') },
            dateCategoryIntersection: T.toDateCategoryIntersection(
                db,
                'Primary Checking',
                'Food',
                '2024-02-01',
                '2024-02-28',
            ),
            securityActionIntersection: T.toSecurityActionIntersection(db, 'Fidelity Brokerage', 'VTI', 'Buy'),
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
