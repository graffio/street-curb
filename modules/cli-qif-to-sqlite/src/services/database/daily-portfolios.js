// ABOUTME: Daily portfolio snapshot operations for investment tracking
// ABOUTME: Computes and stores portfolio valuations at each date with holdings

import { map } from '@graffio/functional'
import { DailyPortfolio } from '../../types/index.js'
import { getHoldingsAsOf } from './holdings.js'

/*
 * Count total number of daily portfolios
 *
 * Returns the total count of portfolio snapshots available in the
 * dailyPortfolios view. Since this is a computed view, the count
 * represents the number of unique account/date combinations that
 * have transaction activity.
 *
 * @sig countDailyPortfolios :: (Database) -> Number
 */
const countDailyPortfolios = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM dailyPortfolios').get()
    return result ? result.count : 0
}

/*
 * All the daily portfolio queries share the same prefix
 * @sig _selectDailyPortfolios :: String -> String
 */
const _selectDailyPortfolios = suffix => `
        SELECT
            dp.accountId,
            dp.date,
            dp.cashBalance,
            dp.totalMarketValue,
            dp.totalCostBasis,
            dp.unrealizedGainLoss,
            a.name as accountName
        FROM dailyPortfolios dp
        JOIN accounts a ON dp.accountId = a.id
        ${suffix}
    `

/*
 * Get daily portfolio for specific account and date
 *
 * Retrieves a computed portfolio snapshot for a specific account and date
 * from the daily_portfolios view. Returns null if no portfolio exists for
 * that account/date combination.
 *
 * The view automatically calculates real-time portfolio data including:
 * - Cash balance from cumulative transactions
 * - Market value from current holdings and historical prices
 * - Cost basis from open lots
 * - Unrealized gain/loss as the difference
 *
 * @sig getDailyPortfolio :: (Database, Number, String) -> DailyPortfolio?
 */
const getDailyPortfolio = (db, accountId, date) => {
    const statement = _selectDailyPortfolios(`WHERE dp.accountId = ? AND dp.date = ?`)
    const record = db.prepare(statement).get(accountId, date)
    if (!record) return null
    const holdings = getEnrichedHoldingsAsOf(db, accountId, date)
    return DailyPortfolio.from({ ...record, holdings })
}

/*
 * Get daily portfolios for an account within a date range
 *
 * Retrieves all computed portfolio snapshots for a specific account within a
 * specified date range. The view provides real-time calculations based on
 * current transaction, lot, and price data.
 *
 * Results are ordered by date to provide a chronological view of portfolio
 * changes over time.
 *
 * @sig getDailyPortfoliosByAccount :: (Database, Number, String, String) -> [DailyPortfolio]
 */
const getDailyPortfoliosByAccount = (db, accountId, startDate, endDate) => {
    const statement = _selectDailyPortfolios(`WHERE dp.accountId = ? AND dp.date BETWEEN ? AND ? ORDER BY dp.date`)
    const records = db.prepare(statement).all(accountId, startDate, endDate)
    return map(r => DailyPortfolio.from({ ...r, holdings: getEnrichedHoldingsAsOf(db, accountId, r.date) }), records)
}

/*
 * Get all daily portfolios for a specific date
 *
 * Retrieves computed portfolio snapshots for all accounts on a specific date.
 * This provides a cross-sectional view of all accounts' positions at the same
 * point in time, calculated in real-time from current data.
 *
 * Results are ordered by accountId for consistent output.
 *
 * @sig getDailyPortfoliosByDate :: (Database, String) -> [DailyPortfolio]
 */
const getDailyPortfoliosByDate = (db, date) => {
    const statement = _selectDailyPortfolios(`WHERE dp.date = ? ORDER BY dp.accountId`)
    const records = db.prepare(statement).all(date)
    return map(r => DailyPortfolio.from({ ...r, holdings: getEnrichedHoldingsAsOf(db, r.accountId, date) }), records)
}

/*
 * Get all daily portfolios
 *
 * Retrieves all computed portfolio snapshots from the dailyPortfolios view,
 * ordered by date (descending) and then by accountId. This provides a complete
 * historical view of all portfolio data calculated in real-time.
 *
 * The descending date order puts the most recent portfolios first, which is
 * typically what users want when viewing portfolio history.
 *
 * @sig getAllDailyPortfolios :: (Database) -> [DailyPortfolio]
 */
const getAllDailyPortfolios = db => {
    const statement = _selectDailyPortfolios(`ORDER BY dp.date DESC, dp.accountId`)
    const records = db.prepare(statement).all()
    return map(r => DailyPortfolio.from({ ...r, holdings: getEnrichedHoldingsAsOf(db, r.accountId, r.date) }), records)
}

/*
 * Get all daily portfolios for an account
 *
 * Retrieves all computed portfolio snapshots for a specific account.
 * This provides a complete historical view of the account's portfolio
 * performance over time, calculated in real-time from current data.
 *
 * Results are ordered by date to provide a chronological view of portfolio
 * changes over time.
 *
 * @sig getAllDailyPortfoliosForAccount :: (Database, Number) -> [DailyPortfolio]
 */
const getAllDailyPortfoliosForAccount = (db, accountId) => {
    const statement = _selectDailyPortfolios(`WHERE dp.accountId = ? ORDER BY dp.date`)
    const records = db.prepare(statement).all(accountId)
    return map(r => DailyPortfolio.from({ ...r, holdings: getEnrichedHoldingsAsOf(db, accountId, r.date) }), records)
}

/*
 * Get enriched holdings for an account as of a date
 * @sig getEnrichedHoldingsAsOf :: (Database, String, String) -> [Object]
 */
const getEnrichedHoldingsAsOf = (db, accountId, date) => {
    /*
     * Get latest price for a security as of date
     * @sig getLatestPriceAsOf :: String -> Number
     */
    const getLatestPriceAsOf = securityId => {
        const row = db
            .prepare('SELECT price FROM prices WHERE securityId = ? AND date <= ? ORDER BY date DESC LIMIT 1')
            .get(securityId, date)
        return row ? row.price : 0
    }

    /*
     * Enrich a single holding with security info and market value
     * @sig enrichHolding :: Holding -> Object
     */
    const enrichHolding = h => {
        const { quantity, costBasis, avgCostPerShare, securityId } = h
        const security = db.prepare('SELECT name, symbol FROM securities WHERE id = ?').get(securityId)
        const price = getLatestPriceAsOf(securityId)

        return {
            quantity,
            costBasis,
            averageCostPerShare: avgCostPerShare,
            marketValue: quantity * price,
            securityName: security ? security.name : '',
            securitySymbol: security ? security.symbol : '',
        }
    }

    const allHoldings = getHoldingsAsOf(db, date)
    const holdings = allHoldings.filter(h => h.accountId === accountId)
    return holdings.map(enrichHolding)
}

/*
 * Get current portfolio (most recent daily portfolio data for all accounts)
 * @sig getCurrentPortfolio :: (Database) -> [DailyPortfolio]
 */
const getCurrentPortfolio = db => {
    const toPortfolioRecord = r => {
        const { accountId, accountName, accountType, date, marketValue, costBasis, unrealizedGainLoss } = r
        return { accountId, accountName, accountType, date, marketValue, costBasis, unrealizedGainLoss }
    }

    const statement = `
        SELECT
            a.id as accountId,
            a.name as accountName,
            a.type as accountType,
            'Current' as date,
            COALESCE(ib.investmentBalance, 0) AS marketValue,
            COALESCE(cb.totalCostBasis, 0) AS costBasis,
            COALESCE(ib.investmentBalance, 0) - COALESCE(cb.totalCostBasis, 0) AS unrealizedGainLoss
        FROM accounts a
        LEFT JOIN (
            SELECT
                l.accountId,
                SUM(l.remainingQuantity * COALESCE(p.price, 0)) as investmentBalance
            FROM lots l
            LEFT JOIN (
                SELECT securityId, price,
                       ROW_NUMBER() OVER (PARTITION BY securityId ORDER BY date DESC) as rn
                FROM prices
            ) p ON l.securityId = p.securityId AND p.rn = 1
            WHERE l.closedDate IS NULL
            GROUP BY l.accountId
        ) ib ON a.id = ib.accountId
        LEFT JOIN (
            SELECT
                accountId,
                SUM(costBasis) as totalCostBasis
            FROM lots
            WHERE closedDate IS NULL
            GROUP BY accountId
        ) cb ON a.id = cb.accountId
        WHERE COALESCE(ib.investmentBalance, 0) != 0 OR COALESCE(cb.totalCostBasis, 0) != 0
        ORDER BY a.id
    `

    const records = db.prepare(statement).all()
    return records.map(toPortfolioRecord)
}

export {
    countDailyPortfolios,
    getAllDailyPortfolios,
    getAllDailyPortfoliosForAccount,
    getCurrentPortfolio,
    getDailyPortfolio,
    getDailyPortfoliosByAccount,
    getDailyPortfoliosByDate,
}
