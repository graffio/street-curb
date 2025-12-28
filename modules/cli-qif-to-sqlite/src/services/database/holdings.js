// ABOUTME: Holdings database operations for investment portfolio tracking
// ABOUTME: Computes current and historical holdings from lot data

import { map } from '@graffio/functional'
import { Holding } from '../../types/index.js'

/*
 * Get current holdings (computed from open lots)
 *
 * This query aggregates open lots to calculate current holdings per account/security:
 *
 * - Only considers lots where closedDate IS NULL (open lots)
 * - Groups by accountId and securityId to aggregate multiple lots
 * - Sums remainingQuantity and costBasis across all open lots
 * - Calculates weighted average cost per share: total costBasis / total quantity
 * - Filters out holdings with zero quantity (HAVING quantity != 0)
 * - Uses MAX(createdAt) to show when the most recent lot was created
 *
 * The weighted average ensures that larger lots have more influence on the average
 * cost per share, which is important for accurate cost basis calculations.
 * Now supports both long (positive) and short (negative) positions.
 *
 * @sig getCurrentHoldings :: (Database) -> [Holding]
 */
const getCurrentHoldings = db => {
    const statement = `
        WITH open_lots AS (SELECT * FROM lots WHERE closedDate IS NULL AND remainingQuantity != 0)

        SELECT
            l.accountId,
            l.securityId,
            SUM(l.remainingQuantity) AS quantity,
            SUM(l.costBasis) AS costBasis,
            SUM(l.costBasis) / SUM(l.remainingQuantity) AS avgCostPerShare,
            MAX(l.createdAt) AS lastUpdated
        FROM open_lots l
        GROUP BY l.accountId, l.securityId
        ORDER BY l.accountId, l.securityId;    `

    const records = db.prepare(statement).all()
    return map(Holding.from, records)
}

/*
 * Get holdings as of a specific date
 *
 * This query calculates holdings at a point in time by considering lot lifecycle:
 * - Only includes lots purchased on or before the target date (purchaseDate <= ?)
 * - For each lot, determines if it was still open on the target date:
 *   * If closedDate IS NULL, the lot is still open
 *   * If closedDate > target_date, the lot was still open on target date
 *   * If closedDate <= target_date, the lot was closed before target date
 * - Uses CASE statements to conditionally include quantities and cost basis
 * - Calculates weighted average cost per share only for lots that were open
 * - Groups by accountId and securityId to aggregate across multiple lots
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
            WHERE purchaseDate <= ?
              AND (closedDate IS NULL OR closedDate > ?)
              AND quantity != 0
        )

        SELECT
            l.accountId,
            l.securityId,
            SUM(l.quantity) AS quantity,
            SUM(l.costBasis) AS costBasis,
            SUM(l.costBasis) * 1.0 / SUM(l.quantity) AS avgCostPerShare,
            MAX(l.createdAt) AS lastUpdated
        FROM open_lots l
        GROUP BY l.accountId, l.securityId
        ORDER BY l.accountId, l.securityId;    `

    const records = db.prepare(statement).all(date, date)
    return map(Holding.from, records)
}

/*
 * Get holdings for a specific account
 *
 * Similar to getCurrentHoldings but filters by accountId.
 * Aggregates all open lots for a specific account across all securities.
 *
 * The query structure ensures that:
 * - Only open lots (closedDate IS NULL) are considered
 * - Multiple lots of the same security are aggregated together
 * - Weighted average cost per share is calculated correctly
 * - Holdings with zero quantity are excluded
 * - Now supports both long (positive) and short (negative) positions
 *
 * @sig getHoldingsByAccount :: (Database, Number) -> [Holding]
 */
const getHoldingsByAccount = (db, accountId) => {
    const statement = `
        WITH open_lots AS (SELECT * FROM lots WHERE closedDate IS NULL AND remainingQuantity != 0)

        SELECT
            l.accountId,
            l.securityId,
            SUM(l.remainingQuantity) AS quantity,
            SUM(l.costBasis) AS costBasis,
            SUM(l.costBasis) / SUM(l.remainingQuantity) AS avgCostPerShare,
            MAX(l.createdAt) AS lastUpdated
        FROM open_lots l
        WHERE l.accountId = ?
        GROUP BY l.securityId
        ORDER BY l.securityId;
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
 * The query groups by accountId to show holdings per account for the given security,
 * allowing analysis of how a security is distributed across different accounts.
 * Now supports both long (positive) and short (negative) positions.
 *
 * @sig getHoldingsBySecurity :: (Database, Number) -> [Holding]
 */
const getHoldingsBySecurity = (db, securityId) => {
    const statement = `
        WITH open_lots AS (SELECT * FROM lots WHERE closedDate IS NULL AND remainingQuantity != 0)

        SELECT
            l.accountId,
            l.securityId,
            SUM(l.remainingQuantity) AS quantity,
            SUM(l.costBasis) AS costBasis,
            SUM(l.costBasis) / SUM(l.remainingQuantity) AS avgCostPerShare,
            MAX(l.createdAt) AS lastUpdated
        FROM open_lots l
        WHERE l.securityId = ?
        GROUP BY l.accountId, l.securityId
        ORDER BY l.securityId;    `

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
            WHERE closedDate IS NULL
              AND accountId = ?
              AND securityId = ?
              AND remainingQuantity != 0
        )

        SELECT
            l.accountId,
            l.securityId,
            SUM(l.remainingQuantity) AS quantity,
            SUM(l.costBasis) AS costBasis,
            SUM(l.costBasis) / SUM(l.remainingQuantity) AS avgCostPerShare,
            MAX(l.createdAt) AS lastUpdated
        FROM open_lots l
        GROUP BY l.accountId, l.securityId;
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
            SELECT accountId, securityId
            FROM lots
            WHERE closedDate IS NULL AND remainingQuantity != 0
            GROUP BY accountId, securityId
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
        SELECT l.accountId, l.securityId, SUM(l.remainingQuantity) AS quantity
        FROM lots l
        WHERE l.closedDate IS NULL
        GROUP BY l.accountId, l.securityId
        HAVING SUM(l.remainingQuantity) != 0
        ORDER BY l.accountId, l.securityId
    `
    return db.prepare(statement).all()
}

/*
 * Get lots as of a specific date with accurate remaining quantity
 *
 * Computes remainingQuantityAsOf by subtracting lot allocations that occurred
 * on or before the target date. This gives accurate historical lot state.
 *
 * Returns lots that were open on the target date (purchased before date,
 * not yet closed or closed after date) with their computed remaining quantity.
 *
 * LotAsOf = {id, accountId, securityId, purchaseDate, quantity, costBasis, remainingQuantityAsOf}
 * @sig getLotsAsOf :: (Database, String) -> [LotAsOf]
 */
const getLotsAsOf = (db, date) => {
    const statement = `
        SELECT
            l.id,
            l.accountId,
            l.securityId,
            l.purchaseDate,
            l.quantity,
            l.costBasis,
            l.quantity - COALESCE(
                (SELECT SUM(la.sharesAllocated)
                 FROM lotAllocations la
                 WHERE la.lotId = l.id AND la.date <= ?),
                0
            ) AS remainingQuantityAsOf
        FROM lots l
        WHERE l.purchaseDate <= ?
          AND (l.closedDate IS NULL OR l.closedDate > ?)
        ORDER BY l.accountId, l.securityId, l.purchaseDate
    `
    return db.prepare(statement).all(date, date, date)
}

/*
 * Get accurate holdings as of a specific date
 *
 * Uses lot allocations to compute accurate historical holdings.
 * Unlike getHoldingsAsOf which uses remainingQuantity (current state),
 * this computes quantity by subtracting allocations up to the target date.
 *
 * @sig getAccurateHoldingsAsOf :: (Database, String) -> [Holding]
 */
const getAccurateHoldingsAsOf = (db, date) => {
    const statement = `
        WITH lots_as_of AS (
            SELECT
                l.accountId,
                l.securityId,
                l.quantity,
                l.costBasis,
                l.quantity - COALESCE(
                    (SELECT SUM(la.sharesAllocated)
                     FROM lotAllocations la
                     WHERE la.lotId = l.id AND la.date <= ?),
                    0
                ) AS remainingQuantityAsOf,
                l.costBasis - COALESCE(
                    (SELECT SUM(la.costBasisAllocated)
                     FROM lotAllocations la
                     WHERE la.lotId = l.id AND la.date <= ?),
                    0
                ) AS costBasisAsOf
            FROM lots l
            WHERE l.purchaseDate <= ?
              AND (l.closedDate IS NULL OR l.closedDate > ?)
        )
        SELECT
            accountId,
            securityId,
            SUM(remainingQuantityAsOf) AS quantity,
            SUM(costBasisAsOf) AS costBasis,
            CASE
                WHEN SUM(remainingQuantityAsOf) != 0
                THEN SUM(costBasisAsOf) * 1.0 / SUM(remainingQuantityAsOf)
                ELSE 0
            END AS avgCostPerShare
        FROM lots_as_of
        WHERE remainingQuantityAsOf > 0
        GROUP BY accountId, securityId
        ORDER BY accountId, securityId
    `
    return db.prepare(statement).all(date, date, date, date)
}

export {
    getAccurateHoldingsAsOf,
    getAllCurrentHoldings,
    getCurrentHoldings,
    getHoldingByAccountAndSecurity,
    getHoldingsAsOf,
    getHoldingsByAccount,
    getHoldingsBySecurity,
    getHoldingsCount,
    getLotsAsOf,
}
