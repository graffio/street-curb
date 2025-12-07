import { map } from '@graffio/functional'
import { DailyPortfolio } from '../../types/index.js'
import { getHoldingsAsOf } from './holdings.js'

/*
 * Count total number of daily portfolios
 *
 * Returns the total count of portfolio snapshots available in the
 * daily_portfolios view. Since this is a computed view, the count
 * represents the number of unique account/date combinations that
 * have transaction activity.
 *
 * @sig countDailyPortfolios :: (Database) -> Number
 */
const countDailyPortfolios = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM daily_portfolios').get()
    return result ? result.count : 0
}

/*
 * All the daily portfolio queries share the same prefix
 */
const _selectDailyPortfolios = suffix => `
        SELECT
            dp.account_id as accountId,
            dp.date,
            dp.cash_balance as cashBalance,
            dp.total_market_value as totalMarketValue,
            dp.total_cost_basis as totalCostBasis,
            dp.unrealized_gain_loss as unrealizedGainLoss,
            a.name as accountName
        FROM daily_portfolios dp
        JOIN accounts a ON dp.account_id = a.id
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
    const statement = _selectDailyPortfolios(`WHERE dp.account_id = ? AND dp.date = ?`)
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
    const statement = _selectDailyPortfolios(`WHERE dp.account_id = ? AND dp.date BETWEEN ? AND ? ORDER BY dp.date`)
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
 * Results are ordered by account_id for consistent output.
 *
 * @sig getDailyPortfoliosByDate :: (Database, String) -> [DailyPortfolio]
 */
const getDailyPortfoliosByDate = (db, date) => {
    const statement = _selectDailyPortfolios(`WHERE dp.date = ? ORDER BY dp.account_id`)
    const records = db.prepare(statement).all(date)
    return map(r => DailyPortfolio.from({ ...r, holdings: getEnrichedHoldingsAsOf(db, r.accountId, date) }), records)
}

/*
 * Get all daily portfolios
 *
 * Retrieves all computed portfolio snapshots from the daily_portfolios view,
 * ordered by date (descending) and then by account_id. This provides a complete
 * historical view of all portfolio data calculated in real-time.
 *
 * The descending date order puts the most recent portfolios first, which is
 * typically what users want when viewing portfolio history.
 *
 * @sig getAllDailyPortfolios :: (Database) -> [DailyPortfolio]
 */
const getAllDailyPortfolios = db => {
    const statement = _selectDailyPortfolios(`ORDER BY dp.date DESC, dp.account_id`)
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
    const statement = _selectDailyPortfolios(`WHERE dp.account_id = ? ORDER BY dp.date`)
    const records = db.prepare(statement).all(accountId)
    return map(r => DailyPortfolio.from({ ...r, holdings: getEnrichedHoldingsAsOf(db, accountId, r.date) }), records)
}

// Helper: get latest price for a security as of a date
const getLatestPriceAsOf = (db, securityId, date) => {
    const row = db
        .prepare(` SELECT price FROM prices WHERE security_id = ? AND date <= ? ORDER BY date DESC LIMIT 1 `)
        .get(securityId, date)
    return row ? row.price : 0
}

// Helper: get enriched holdings for an account as of a date
const getEnrichedHoldingsAsOf = (db, accountId, date) => {
    // Get all holdings as of date
    const allHoldings = getHoldingsAsOf(db, date)

    // Filter for this account
    const holdings = allHoldings.filter(h => h.accountId === accountId)

    // Enrich with security info and market value
    return holdings.map(h => {
        // Get security info
        const security = db.prepare('SELECT name, symbol FROM securities WHERE id = ?').get(h.securityId)

        // Get latest price as of date
        const price = getLatestPriceAsOf(db, h.securityId, date)

        return {
            quantity: h.quantity,
            costBasis: h.costBasis,
            averageCostPerShare: h.avgCostPerShare,
            marketValue: h.quantity * price,
            securityName: security ? security.name : '',
            securitySymbol: security ? security.symbol : '',
        }
    })
}

/*
 * Get current portfolio (most recent daily portfolio data for all accounts)
 * @sig getCurrentPortfolio :: (Database) -> [DailyPortfolio]
 */
const getCurrentPortfolio = db => {
    const statement = `
        SELECT
            a.id as accountId,
            a.name as accountName,
            a.type as accountType,
            'Current' as date,
            COALESCE(ib.investment_balance, 0) AS marketValue,
            COALESCE(cb.total_cost_basis, 0) AS costBasis,
            COALESCE(ib.investment_balance, 0) - COALESCE(cb.total_cost_basis, 0) AS unrealizedGainLoss
        FROM accounts a
        LEFT JOIN (
            SELECT
                l.account_id,
                SUM(l.remaining_quantity * COALESCE(p.price, 0)) as investment_balance
            FROM lots l
            LEFT JOIN (
                SELECT security_id, price,
                       ROW_NUMBER() OVER (PARTITION BY security_id ORDER BY date DESC) as rn
                FROM prices
            ) p ON l.security_id = p.security_id AND p.rn = 1
            WHERE l.closed_date IS NULL
            GROUP BY l.account_id
        ) ib ON a.id = ib.account_id
        LEFT JOIN (
            SELECT
                account_id,
                SUM(cost_basis) as total_cost_basis
            FROM lots
            WHERE closed_date IS NULL
            GROUP BY account_id
        ) cb ON a.id = cb.account_id
        WHERE COALESCE(ib.investment_balance, 0) != 0 OR COALESCE(cb.total_cost_basis, 0) != 0
        ORDER BY a.id
    `

    const records = db.prepare(statement).all()
    return records.map(r => ({
        accountId: r.accountId,
        accountName: r.accountName,
        accountType: r.accountType,
        date: r.date,
        marketValue: r.marketValue,
        costBasis: r.costBasis,
        unrealizedGainLoss: r.unrealizedGainLoss,
    }))
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
