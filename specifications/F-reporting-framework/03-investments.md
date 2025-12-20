# Investment Computations

Status: Future work

## Goal

Add investment computations for lot tracking, holdings, and gain/loss calculations.

## Prerequisites

- Banking functions implemented
- Schema changes to `cli-qif-to-sqlite` (add closed_by_transaction_id to lots)

---

## Schema Changes (cli-qif-to-sqlite)

```sql
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

---

## Functions

### lot-queries.js

```javascript
// @sig openLotsForSecurity :: (String, String, [Lot]) -> [Lot]
const openLotsForSecurity = (accountId, securityId, lots) => ...

// @sig lotsForSecurity :: (String, String, [Lot]) -> [Lot]
const lotsForSecurity = (accountId, securityId, lots) => ...
```

### holdings.js

```javascript
// @sig currentHoldings :: [Lot] -> [Holding]
// Holding = { accountId, securityId, quantity, costBasis, avgCostPerShare }
const currentHoldings = lots => ...

// @sig holdingsWithMarketValue :: ([Holding], (SecurityId -> Price)) -> [HoldingWithValue]
const holdingsWithMarketValue = (holdings, getPrice) => ...
```

### gains.js

```javascript
// @sig isLongTermHolding :: (String, String) -> Boolean
const isLongTermHolding = (purchaseDate, saleDate) => ...

// @sig realizedGainFromLot :: (Lot, Transaction) -> RealizedGain
const realizedGainFromLot = (lot, saleTransaction) => ...

// @sig unrealizedGain :: (Holding, Number) -> UnrealizedGain
const unrealizedGain = (holding, currentPrice) => ...
```

### price-lookup.js

```javascript
// @sig priceAsOf :: (String, String, [Price]) -> Number | null
const priceAsOf = (securityId, isoDate, prices) => ...

// @sig createPriceLookup :: (String, [Price]) -> (SecurityId -> Number | null)
const createPriceLookup = (isoDate, prices) => ...

// @sig latestPrices :: [Price] -> { [securityId]: Number }
const latestPrices = prices => ...
```

---

## Open Questions

1. **Proceeds allocation**: How to split sale proceeds across multiple lots closed by one transaction?
2. **Wash sale handling**: Should we track wash sales for tax purposes?
3. **Cost basis methods**: FIFO only, or support LIFO/specific identification?
