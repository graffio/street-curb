// ABOUTME: Holdings database operations for investment portfolio tracking
// ABOUTME: Computes current and historical holdings from lot data

// Find current holdings (computed from open lots)
// Returns holdings per account/security with quantity, costBasis, avgCostPerShare
// @sig findCurrentHoldings :: Database -> [HoldingRecord]
const findCurrentHoldings = db => {
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
        ORDER BY l.accountId, l.securityId`

    return db.prepare(statement).all()
}

// Find holdings as of a specific date
// Calculates holdings at a point in time by considering lot lifecycle
// @sig findHoldingsAsOf :: (Database, String) -> [HoldingRecord]
const findHoldingsAsOf = (db, date) => {
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
        ORDER BY l.accountId, l.securityId`

    return db.prepare(statement).all(date, date)
}

// Find holdings for a specific account
// @sig findHoldingsByAccount :: (Database, String) -> [HoldingRecord]
const findHoldingsByAccount = (db, accountId) => {
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
        ORDER BY l.securityId`

    return db.prepare(statement).all(accountId)
}

// Find holdings for a specific security across all accounts
// @sig findHoldingsBySecurity :: (Database, String) -> [HoldingRecord]
const findHoldingsBySecurity = (db, securityId) => {
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
        ORDER BY l.securityId`

    return db.prepare(statement).all(securityId)
}

// Find specific holding by account and security
// @sig findHoldingByAccountAndSecurity :: (Database, String, String) -> HoldingRecord|null
const findHoldingByAccountAndSecurity = (db, accountId, securityId) => {
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
        GROUP BY l.accountId, l.securityId`

    return db.prepare(statement).get(accountId, securityId) || null
}

// Count total holdings positions
// @sig countHoldings :: Database -> Number
const countHoldings = db => {
    const statement = `
        WITH open_lot_pairs AS (
            SELECT accountId, securityId
            FROM lots
            WHERE closedDate IS NULL AND remainingQuantity != 0
            GROUP BY accountId, securityId
        )

        SELECT COUNT(*) AS count
        FROM open_lot_pairs`

    const result = db.prepare(statement).get()
    return result ? result.count : 0
}

// Find all current holdings with account and security info
// @sig findAllCurrentHoldings :: Database -> [{accountId, securityId, quantity}]
const findAllCurrentHoldings = db => {
    const statement = `
        SELECT l.accountId, l.securityId, SUM(l.remainingQuantity) AS quantity
        FROM lots l
        WHERE l.closedDate IS NULL
        GROUP BY l.accountId, l.securityId
        HAVING SUM(l.remainingQuantity) != 0
        ORDER BY l.accountId, l.securityId`
    return db.prepare(statement).all()
}

// Find lots as of a specific date with accurate remaining quantity
// Computes remainingQuantityAsOf by subtracting lot allocations up to target date
// @sig findLotsAsOf :: (Database, String) -> [LotAsOfRecord]
const findLotsAsOf = (db, date) => {
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
        ORDER BY l.accountId, l.securityId, l.purchaseDate`
    return db.prepare(statement).all(date, date, date)
}

// Find accurate holdings as of a specific date using lot allocations
// Unlike findHoldingsAsOf, this computes quantity by subtracting allocations
// @sig findAccurateHoldingsAsOf :: (Database, String) -> [HoldingRecord]
const findAccurateHoldingsAsOf = (db, date) => {
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
        ORDER BY accountId, securityId`
    return db.prepare(statement).all(date, date, date, date)
}

const Holdings = {
    countHoldings,
    findAccurateHoldingsAsOf,
    findAllCurrentHoldings,
    findCurrentHoldings,
    findHoldingByAccountAndSecurity,
    findHoldingsAsOf,
    findHoldingsByAccount,
    findHoldingsBySecurity,
    findLotsAsOf,
}

export { Holdings }
