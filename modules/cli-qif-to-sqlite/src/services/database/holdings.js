import { map } from '@graffio/functional'
import { Holding } from '../../types/index.js'

/*
 * Get current holdings (computed from open lots)
 *
 * This query aggregates open lots to calculate current holdings per account/security:
 *
 * - Only considers lots where closed_date IS NULL (open lots)
 * - Groups by account_id and security_id to aggregate multiple lots
 * - Sums remaining_quantity and cost_basis across all open lots
 * - Calculates weighted average cost per share: total_cost_basis / total_quantity
 * - Filters out holdings with zero quantity (HAVING quantity != 0)
 * - Uses MAX(created_at) to show when the most recent lot was created
 *
 * The weighted average ensures that larger lots have more influence on the average
 * cost per share, which is important for accurate cost basis calculations.
 * Now supports both long (positive) and short (negative) positions.
 *
 * @sig getCurrentHoldings :: (Database) -> [Holding]
 */
const getCurrentHoldings = db => {
    const statement = `
        WITH open_lots AS (SELECT * FROM lots WHERE closed_date IS NULL AND remaining_quantity != 0)

        SELECT
            l.account_id AS accountId,
            l.security_id AS securityId,
            SUM(l.remaining_quantity) AS quantity,
            SUM(l.cost_basis) AS costBasis,
            SUM(l.cost_basis) / SUM(l.remaining_quantity) AS avgCostPerShare,
            MAX(l.created_at) AS lastUpdated
        FROM open_lots l
        GROUP BY l.account_id, l.security_id
        ORDER BY l.account_id, l.security_id;    `

    const records = db.prepare(statement).all()
    return map(Holding.from, records)
}

/*
 * Get holdings as of a specific date
 *
 * This query calculates holdings at a point in time by considering lot lifecycle:
 * - Only includes lots purchased on or before the target date (purchase_date <= ?)
 * - For each lot, determines if it was still open on the target date:
 *   * If closed_date IS NULL, the lot is still open
 *   * If closed_date > target_date, the lot was still open on target date
 *   * If closed_date <= target_date, the lot was closed before target date
 * - Uses CASE statements to conditionally include quantities and cost basis
 * - Calculates weighted average cost per share only for lots that were open
 * - Groups by account_id and security_id to aggregate across multiple lots
 * - Filters out holdings with zero quantity after date filtering
 * - Now supports both long (positive) and short (negative) positions
 *
 * This approach allows us to see historical holdings at any point in time,
 * accounting for when lots were purchased and when they were sold/closed.
 *
 * @sig getHoldingsAsOf :: (Database, String) -> [Holding]
 */
const getHoldingsAsOf = (db, date) => {
    const statement = `
        WITH open_lots AS (SELECT *
            FROM lots
            WHERE purchase_date <= ?
              AND (closed_date IS NULL OR closed_date > ?)
              AND quantity != 0
        )
        
        SELECT
            l.account_id AS accountId,
            l.security_id AS securityId,
            SUM(l.quantity) AS quantity,
            SUM(l.cost_basis) AS costBasis,
            SUM(l.cost_basis) * 1.0 / SUM(l.quantity) AS avgCostPerShare,
            MAX(l.created_at) AS lastUpdated
        FROM open_lots l
        GROUP BY l.account_id, l.security_id
        ORDER BY l.account_id, l.security_id;    `

    const records = db.prepare(statement).all(date, date)
    return map(Holding.from, records)
}

/*
 * Get holdings for a specific account
 *
 * Similar to getCurrentHoldings but filters by account_id.
 * Aggregates all open lots for a specific account across all securities.
 *
 * The query structure ensures that:
 * - Only open lots (closed_date IS NULL) are considered
 * - Multiple lots of the same security are aggregated together
 * - Weighted average cost per share is calculated correctly
 * - Holdings with zero quantity are excluded
 * - Now supports both long (positive) and short (negative) positions
 *
 * @sig getHoldingsByAccount :: (Database, Number) -> [Holding]
 */
const getHoldingsByAccount = (db, accountId) => {
    const statement = `
        WITH open_lots AS (SELECT * FROM lots WHERE closed_date IS NULL AND remaining_quantity != 0)
        
        SELECT
            l.account_id AS accountId,
            l.security_id AS securityId,
            SUM(l.remaining_quantity) AS quantity,
            SUM(l.cost_basis) AS costBasis,
            SUM(l.cost_basis) / SUM(l.remaining_quantity) AS avgCostPerShare,
            MAX(l.created_at) AS lastUpdated
        FROM open_lots l
        WHERE l.account_id = ?
        GROUP BY l.security_id
        ORDER BY l.security_id;
    `

    const records = db.prepare(statement).all(accountId)
    return map(Holding.from, records)
}

/*
 * Get holdings for a specific security across all accounts
 *
 * Aggregates all open lots for a specific security across all accounts.
 * Useful for seeing total ownership of a security across the entire portfolio.
 *
 * The query groups by account_id to show holdings per account for the given security,
 * allowing analysis of how a security is distributed across different accounts.
 * Now supports both long (positive) and short (negative) positions.
 *
 * @sig getHoldingsBySecurity :: (Database, Number) -> [Holding]
 */
const getHoldingsBySecurity = (db, securityId) => {
    const statement = `
        WITH open_lots AS (SELECT *FROM lots WHERE closed_date IS NULL AND remaining_quantity != 0)

        SELECT
            l.account_id AS accountId,
            l.security_id AS securityId,
            SUM(l.remaining_quantity) AS quantity,
            SUM(l.cost_basis) AS costBasis,
            SUM(l.cost_basis) / SUM(l.remaining_quantity) AS avgCostPerShare,
            MAX(l.created_at) AS lastUpdated
        FROM open_lots l
        WHERE l.security_id = ?
        GROUP BY l.account_id, l.security_id
        ORDER BY l.security_id;    `

    const records = db.prepare(statement).all(securityId)
    return map(Holding.from, records)
}

/*
 * Get specific holding by account and security
 *
 * Returns a single holding for a specific account/security combination.
 * Aggregates all open lots for that specific account and security.
 *
 * This is useful for getting detailed information about a specific position,
 * such as checking if an account holds a particular security and what the
 * current position size and cost basis are.
 * Now supports both long (positive) and short (negative) positions.
 *
 * @sig getHoldingByAccountAndSecurity :: (Database, Number, Number) -> Holding?
 */
const getHoldingByAccountAndSecurity = (db, accountId, securityId) => {
    const statement = `
        WITH open_lots AS (
            SELECT *
            FROM lots
            WHERE closed_date IS NULL
              AND account_id = ?
              AND security_id = ?
              AND remaining_quantity != 0
        )

        SELECT
            l.account_id AS accountId,
            l.security_id AS securityId,
            SUM(l.remaining_quantity) AS quantity,
            SUM(l.cost_basis) AS costBasis,
            SUM(l.cost_basis) / SUM(l.remaining_quantity) AS avgCostPerShare,
            MAX(l.created_at) AS lastUpdated
        FROM open_lots l
        GROUP BY l.account_id, l.security_id;
    `

    const record = db.prepare(statement).get(accountId, securityId)
    return record ? Holding.from(record) : null
}

/*
 * Get holdings count
 *
 * Counts the total number of unique account/security combinations that have
 * open positions (non-zero remaining quantity).
 *
 * Uses a subquery to first identify all account/security combinations with
 * non-zero holdings, then counts the distinct combinations. This gives us
 * the total number of positions across all accounts and securities.
 * Now supports both long (positive) and short (negative) positions.
 *
 * @sig getHoldingsCount :: (Database) -> Number
 */
const getHoldingsCount = db => {
    const statement = `
        WITH open_lot_pairs AS (
            SELECT account_id, security_id
            FROM lots
            WHERE closed_date IS NULL AND remaining_quantity != 0
            GROUP BY account_id, security_id
        )
        
        SELECT COUNT(*) AS count
        FROM open_lot_pairs;    `

    const result = db.prepare(statement).get()
    return result ? result.count : 0
}

/*
 * Get all current holdings with account and security info
 * @sig getAllCurrentHoldings :: (Database) -> [Holding]
 */
const getAllCurrentHoldings = db => {
    const statement = `
        SELECT l.account_id AS accountId, l.security_id AS securityId, SUM(l.remaining_quantity) AS quantity
        FROM lots l
        WHERE l.closed_date IS NULL
        GROUP BY l.account_id, l.security_id
        HAVING SUM(l.remaining_quantity) != 0
        ORDER BY l.account_id, l.security_id
    `
    return db.prepare(statement).all()
}

export {
    getCurrentHoldings,
    getHoldingsAsOf,
    getHoldingsByAccount,
    getHoldingsBySecurity,
    getHoldingByAccountAndSecurity,
    getHoldingsCount,
    getAllCurrentHoldings,
}
