# Financial Computations: Investments

## Goal

Add investment computations for lot tracking, holdings, and gain/loss calculations. This is the most complex phase and includes schema changes to `cli-qif-to-sqlite`.

## Prerequisites

- Module structure from 00-module-setup.md
- Banking functions from 01-banking.md
- Reporting functions from 02-reporting.md

## Schema Changes (cli-qif-to-sqlite)

### Add closed_by_transaction_id to lots table

```sql
-- In schema.sql, modify lots table:
CREATE TABLE lots (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    security_id TEXT REFERENCES securities(id),
    purchase_date DATE NOT NULL,
    quantity DECIMAL(15,6) NOT NULL,
    cost_basis DECIMAL(15,2) NOT NULL,
    remaining_quantity DECIMAL(15,6) NOT NULL,
    closed_date DATE,
    created_by_transaction_id TEXT REFERENCES transactions(id),
    closed_by_transaction_id TEXT REFERENCES transactions(id),  -- NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (ABS(remaining_quantity) <= ABS(quantity))
);
```

### Modify lots.js in cli-qif-to-sqlite

```javascript
// Update updateLotQuantity signature:
// @sig updateLotQuantity :: (Database, String, Number, String?, String?) -> void
const updateLotQuantity = (db, lotId, remainingQuantity, closedDate = null, closedByTransactionId = null) => {
    const statement = `
        UPDATE lots
        SET remaining_quantity = ?, closed_date = ?, closed_by_transaction_id = ?
        WHERE id = ?
    `
    db.prepare(statement).run(remainingQuantity, closedDate, closedByTransactionId, lotId)
}

// Update processLotReduction to pass transaction.id when closing lots
```

## Functions

### lot-queries.js

```javascript
// ABOUTME: Lot query and filtering functions
// ABOUTME: Works with Lot objects from database/Redux

// Gets open lots for a security in an account (FIFO order)
// @sig openLotsForSecurity :: (String, String, [Lot]) -> [Lot]
const openLotsForSecurity = (accountId, securityId, lots) =>
    lots
        .filter(lot =>
            lot.accountId === accountId &&
            lot.securityId === securityId &&
            lot.closedDate === null &&
            Math.abs(lot.remainingQuantity) > 1e-10
        )
        .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate))

// Gets all lots (open and closed) for a security
// @sig lotsForSecurity :: (String, String, [Lot]) -> [Lot]
const lotsForSecurity = (accountId, securityId, lots) =>
    lots.filter(lot => lot.accountId === accountId && lot.securityId === securityId)
```

### holdings.js

```javascript
// ABOUTME: Holdings aggregation from lots
// ABOUTME: Computes current positions and market values

// Aggregates open lots into holdings
// @sig currentHoldings :: [Lot] -> [Holding]
// Holding = { accountId, securityId, quantity, costBasis, avgCostPerShare }
const currentHoldings = lots => {
    const openLots = lots.filter(lot => lot.closedDate === null && Math.abs(lot.remainingQuantity) > 1e-10)
    const grouped = groupBy(lot => `${lot.accountId}:${lot.securityId}`, openLots)

    return Object.entries(grouped).map(([key, accountLots]) => {
        const [accountId, securityId] = key.split(':')
        const quantity = accountLots.reduce((sum, lot) => sum + lot.remainingQuantity, 0)
        const costBasis = accountLots.reduce((sum, lot) => {
            const proportion = lot.remainingQuantity / lot.quantity
            return sum + (lot.costBasis * proportion)
        }, 0)
        return {
            accountId,
            securityId,
            quantity,
            costBasis,
            avgCostPerShare: quantity !== 0 ? costBasis / quantity : 0,
        }
    })
}

// Adds current market value to holdings
// @sig holdingsWithMarketValue :: ([Holding], (SecurityId -> Price)) -> [HoldingWithValue]
const holdingsWithMarketValue = (holdings, getPrice) =>
    holdings.map(holding => {
        const price = getPrice(holding.securityId) || 0
        const marketValue = holding.quantity * price
        const unrealizedGain = marketValue - holding.costBasis
        return { ...holding, currentPrice: price, marketValue, unrealizedGain }
    })
```

### gains.js

```javascript
// ABOUTME: Gain/loss calculations for investments
// ABOUTME: Handles short-term vs long-term classification

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

// Determines if holding period qualifies for long-term treatment
// @sig isLongTermHolding :: (String, String) -> Boolean
const isLongTermHolding = (purchaseDate, saleDate) => {
    const purchase = new Date(purchaseDate)
    const sale = new Date(saleDate)
    return (sale - purchase) > ONE_YEAR_MS
}

// Calculates holding period in days
// @sig holdingPeriodDays :: (String, String) -> Number
const holdingPeriodDays = (purchaseDate, saleDate) => {
    const purchase = new Date(purchaseDate)
    const sale = new Date(saleDate)
    return Math.floor((sale - purchase) / (24 * 60 * 60 * 1000))
}

// Calculates realized gain from a closed lot
// Requires the lot and the sale transaction that closed it
// @sig realizedGainFromLot :: (Lot, Transaction) -> RealizedGain
// RealizedGain = { lotId, proceeds, costBasis, gain, gainPercent, isLongTerm, holdingDays }
const realizedGainFromLot = (lot, saleTransaction) => {
    // Cost basis proportional to shares sold
    const sharesSold = lot.quantity - lot.remainingQuantity
    const proportion = sharesSold / lot.quantity
    const costBasis = lot.costBasis * proportion

    // Proceeds from sale (need to calculate from transaction)
    // This is simplified - actual calculation depends on how proceeds are recorded
    const proceeds = Math.abs(saleTransaction.amount) * proportion

    const gain = proceeds - costBasis
    const gainPercent = costBasis !== 0 ? (gain / costBasis) * 100 : 0
    const isLongTerm = isLongTermHolding(lot.purchaseDate, lot.closedDate)
    const holdingDays = holdingPeriodDays(lot.purchaseDate, lot.closedDate)

    return { lotId: lot.id, proceeds, costBasis, gain, gainPercent, isLongTerm, holdingDays }
}

// Calculates unrealized gain for a holding
// @sig unrealizedGain :: (Holding, Number) -> UnrealizedGain
const unrealizedGain = (holding, currentPrice) => {
    const marketValue = holding.quantity * currentPrice
    const gain = marketValue - holding.costBasis
    const gainPercent = holding.costBasis !== 0 ? (gain / holding.costBasis) * 100 : 0
    return { ...holding, currentPrice, marketValue, gain, gainPercent }
}
```

### price-lookup.js

```javascript
// ABOUTME: Price lookup utilities for securities
// ABOUTME: Finds most recent price on or before a given date

// Gets most recent price for a security on or before date
// @sig priceAsOf :: (String, String, [Price]) -> Number | null
const priceAsOf = (securityId, isoDate, prices) => {
    const relevantPrices = prices
        .filter(p => p.securityId === securityId && p.date <= isoDate)
        .sort((a, b) => b.date.localeCompare(a.date)) // Most recent first
    return relevantPrices.length > 0 ? relevantPrices[0].price : null
}

// Creates a price lookup function for a specific date
// @sig createPriceLookup :: (String, [Price]) -> (SecurityId -> Number | null)
const createPriceLookup = (isoDate, prices) => securityId => priceAsOf(securityId, isoDate, prices)

// Gets latest price for each security
// @sig latestPrices :: [Price] -> { [securityId]: Number }
const latestPrices = prices => {
    const result = {}
    const sorted = [...prices].sort((a, b) => b.date.localeCompare(a.date))
    sorted.forEach(p => {
        if (!result[p.securityId]) result[p.securityId] = p.price
    })
    return result
}
```

## Implementation Steps

### Schema Changes (cli-qif-to-sqlite)

1. Add `closed_by_transaction_id` column to `schema.sql`
2. Update `Lot` type definition in `type-definitions/`
3. Modify `updateLotQuantity()` in `lots.js`
4. Modify `processLotReduction()` to pass transaction ID
5. Update `mapLotRecord()` to include new field
6. Write migration script or re-import instruction
7. git add and commit: "Add closed_by_transaction_id to lots table"

### Computation Functions (financial-computations)

8. Create `src/investments/lot-queries.js`
9. Create `src/investments/holdings.js`
10. Create `src/investments/gains.js`
11. Create `src/investments/price-lookup.js`
12. Create `src/investments/index.js`
13. Update `src/index.js` to re-export investments
14. Write tests for all investment functions
15. git add and commit: "Add investment computation functions"

### Integration (quicken-web-app)

16. Update sqlite-service.js to load new lot field
17. Add investment selectors if needed
18. git add and commit: "Integrate investment computations"

## Complexity Notes

- **Lot-to-sale linking**: With `closed_by_transaction_id`, we can directly find the sale that closed a lot
- **Partial sales**: One Sell can close multiple lots; track via multiple lots with same `closed_by_transaction_id`
- **Proceeds allocation**: Need to allocate sale proceeds across lots proportionally
- **Price lookup performance**: For many securities × many dates, consider caching strategies

## Open Questions

1. **Proceeds allocation**: How to split sale proceeds across multiple lots closed by one transaction?
2. **Wash sale handling**: Should we track wash sales for tax purposes?
3. **Cost basis methods**: FIFO only, or support LIFO/specific identification?

## Verification

- [ ] Schema migration applied successfully
- [ ] Lot closing records the transaction ID
- [ ] Holdings aggregate correctly from lots
- [ ] Gains classified as short/long term accurately
- [ ] Price lookup finds correct as-of-date prices
