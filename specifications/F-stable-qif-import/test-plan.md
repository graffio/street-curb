# Test Plan

## Existing Tests to Reuse

From `cli-qif-to-sqlite-with-overwrite`:
- `parse-qif-file.tap.js` — QIF parsing (copy or import)
- Type validation patterns from entity tests

## New Test Files

### `stable-identity.tap.js`

```
Given first import
  When importing a security
  Then it gets a stable ID (ssc_XXXXX)
  And the stable ID is persisted in stableIdentities table

Given first import
  When importing a transaction
  Then it gets a stable ID (stx_XXXXX)
  And the stable ID is persisted

Given second import with identical data
  When content-hash matches exactly
  Then stable IDs are preserved (no new assignments)

Given second import with edited memo
  When content-hash differs but signature matches
  Then stable IDs are preserved

Given stable ID lookup
  When entity exists → returns stable ID
  When entity doesn't exist → returns null
```

### `signatures.tap.js`

```
Given security with symbol "AAPL" and name "Apple Inc."
  Then signature includes: { symbol: "AAPL", nameNormalized: "apple inc" }

Given security with no symbol
  Then signature includes: { symbol: null, nameNormalized: "..." }

Given investment transaction
  Then signature includes: accountName, date, action, stableSecurityId, quantity, amount
  And signature excludes: memo, cleared, number

Given bank transaction
  Then signature includes: accountName, date, amount, payeeNormalized
  And signature excludes: memo, cleared, category

Given payee "  WHOLE FOODS MARKET #123  "
  Then normalizedPayee is "whole foods market #123"

Given payee "McDonald's"
  Then normalizedPayee is "mcdonald's" (conservative: punctuation preserved)
```

### `categories-tags.tap.js`

```
Given first import with categories
  When categories imported
  Then each gets stable ID (sca_XXXXX)
  And signature is exact name

Given first import with tags
  When tags imported
  Then each gets stable ID (sta_XXXXX)
  And signature is exact name

Given reimport with same categories
  When names unchanged
  Then stable IDs preserved

Given reimport with renamed category
  When "Groceries" becomes "Food:Groceries"
  Then old category orphaned, new category gets new stable ID

Given reimport with deleted tag
  When tag no longer in QIF
  Then tag marked orphaned
```

### `splits.tap.js`

```
Given transaction with splits
  When imported
  Then each split gets stable ID (ssp_XXXXX)
  And split signature is transactionStableId|categoryId|amount

Given reimport with split memo changed
  When category and amount unchanged
  Then split stable ID preserved

Given two identical splits (same category, same amount)
  When reimported
  Then paired arbitrarily (fungible per D20)

Given split inserted at beginning of list
  When position changes but content unchanged
  Then all splits preserve stable IDs (content-based, not position-based)

Given parent transaction orphaned
  When reimport completes
  Then all child splits also marked orphaned (cascade per D13)

Given parent transaction restored
  When previously orphaned transaction matches again
  Then child splits also restored
```

### `prices.tap.js`

```
Given security with price history
  When prices imported
  Then each price gets stable ID (spr_XXXXX)
  And signature is securityStableId|date

Given reimport with price correction
  When same security+date, different price value
  Then same stable ID (matched by security+date per D14)
  And new price value stored

Given reimport with new price date
  When new date added to history
  Then new stable ID assigned

Given security orphaned
  When reimport completes
  Then prices for that security also orphaned
```

### `daily-sequence.tap.js`

```
Given two identical bank transactions same day
  When same account, date, amount, payee
  Then dailySequence distinguishes them (0, 1)
  And each gets unique stable ID

Given three identical transactions, one deleted
  When reimport has only two
  Then two preserved (by dailySequence), one orphaned

Given identical transactions reordered in QIF
  When Quicken export order changes
  Then fall back to fungible pairing (per D17 assumption)
```

### `stable-id-counters.tap.js`

```
Given fresh database
  When first transaction imported
  Then stableIdCounters.transaction = 2 (after assigning 1)

Given 100 transactions imported
  When counter queried
  Then stableIdCounters.transaction = 101

Given entity deleted from stableIdentities
  When counter queried
  Then counter unchanged (never decrements per D7)

Given concurrent ID generation
  When two entities created simultaneously
  Then no duplicate IDs (atomic increment)
```

### `security-matching.tap.js`

```
Given two imports with same security (symbol: AAPL)
  When symbols match
  Then same stable ID

Given security renamed from "Apple Inc" to "Apple Inc."
  When symbol unchanged
  Then same stable ID (matched by symbol)

Given security with no symbol, name "Private Fund I"
  When reimported with same name
  Then same stable ID (matched by normalized name)

Given two securities with same name, no symbol
  When counts match (2 before, 2 after)
  Then paired arbitrarily (both preserved)

Given two securities with same name, no symbol
  When count increased (2 before, 3 after)
  Then two preserved, one new stable ID

Given security name changed and no symbol
  Then orphaned (no match found)
```

### `transaction-matching.tap.js`

```
Given investment transaction "Buy 10 AAPL @ $150"
  When reimported with edited memo
  Then same stable ID (signature unchanged)

Given two identical transactions same day
  When counts match
  Then both stable IDs preserved (paired arbitrarily)

Given two identical transactions same day
  When one deleted in Quicken
  Then one preserved, one orphaned

Given bank transaction with payee "Whole Foods"
  When reimported with payee "WHOLE FOODS"
  Then same stable ID (normalized match)

Given transaction referencing security
  When security renamed
  Then transaction stable ID preserved (uses stable security ID in signature)
```

### `reimport-scenarios.tap.js`

```
Scenario: Edit transaction memo
  Given: Import with 100 transactions
  When: Reimport with 1 memo changed
  Then: All 100 stable IDs preserved

Scenario: Add old transaction
  Given: Import with 100 transactions
  When: Reimport with 101 (1 backdated addition)
  Then: Original 100 preserved, 1 new stable ID

Scenario: Delete transaction
  Given: Import with 100 transactions
  When: Reimport with 99 (1 deleted)
  Then: 99 preserved, 1 orphaned

Scenario: Rename security
  Given: Import with security "ACME Corp" (symbol: ACME)
  Given: 10 transactions reference ACME
  When: Reimport with "ACME Corporation" (symbol: ACME)
  Then: Security stable ID preserved
  And: All 10 transaction stable IDs preserved

Scenario: Full reimport unchanged
  Given: Import with 1000 transactions, 50 securities
  When: Identical reimport
  Then: Zero new stable IDs, zero orphans
```

### `batch-import.tap.js`

```
Given large import (10,000 transactions)
  When using batch insert
  Then all content-hash IDs are correct
  And all stable IDs assigned

Given large reimport (10,000 transactions)
  When all signatures match
  Then all stable IDs preserved

Given import with duplicate detection
  When 100 identical transactions same day
  Then correctly pairs without error
```

### `error-handling.tap.js`

```
Given malformed QIF file (missing required field)
  When import attempted
  Then import fails with descriptive error
  And original database unchanged

Given QIF with invalid date format
  When import attempted
  Then import fails identifying the bad record
  And original database unchanged

Given QIF with unknown transaction type
  When import attempted
  Then import fails with context (line number, content)
  And original database unchanged

Given import that fails mid-batch
  When 500 of 1000 transactions inserted before error
  Then full rollback occurs
  And original database unchanged
  And error report includes progress ("failed after 500 of 1000")

Given database file is read-only
  When import attempted
  Then import fails with permission error
  And no partial state left behind

Given stableIdentities table is corrupted
  When reimport attempted
  Then fails gracefully with diagnostic info
  And suggests recovery steps
```

### `lots-basic.tap.js`

```
Given Buy transaction for 100 shares
  When lots computed
  Then one lot created with stable ID (slt_XXXXX)
  And lot signature includes openTransactionStableId

Given Buy then Sell (full position)
  When lots computed with FIFO
  Then lot fully consumed (remainingQuantity = 0)
  And lot allocation created (sla_XXXXX)

Given two Buys then partial Sell
  When FIFO applied
  Then oldest lot consumed first
  And newer lot unchanged

Given Sell with quantity > available
  When lots computed
  Then error or negative lot (short sale)
```

### `lots-complex.tap.js`

```
Given stock split 2:1
  When lots recomputed
  Then lot quantities doubled
  And stable IDs preserved

Given short sale (Sell before Buy)
  When lots computed
  Then negative lot created
  And subsequent Buy closes short position

Given option exercise (Grant, Vest, Exercise)
  When lots computed
  Then appropriate lot actions applied

Given transfer out (ShrsOut)
  When lots computed
  Then lot marked as transferred
  And remainingQuantity reduced

Given transfer in (ShrsIn)
  When lots computed
  Then new lot created with transfer as source

Given fractional shares
  When quantity has decimals
  Then epsilon comparison (1e-10) handles rounding
```

### `lots-reimport.tap.js`

```
Given lots computed on first import
  When identical reimport
  Then all lot stable IDs preserved
  And all lot allocation stable IDs preserved

Given lot consuming transaction modified
  When memo changed but signature unchanged
  Then lot allocations preserve stable IDs

Given new Buy transaction added
  When reimport includes new purchase
  Then existing lots unchanged
  And new lot gets new stable ID

Given Buy transaction deleted
  When reimport missing a purchase
  Then lot orphaned
  And downstream allocations orphaned
```

### `lot-overrides.tap.js`

```
Given sell transaction with no override
  When lots computed
  Then default strategy (FIFO) applied

Given sell transaction with user override
  When reimport occurs
  Then override preserved (keyed to sell transaction stable ID)
  And override applied instead of default strategy

Given override referencing opening transaction
  When opening transaction still exists on reimport
  Then override remains valid

Given override referencing opening transaction
  When opening transaction orphaned on reimport
  Then override becomes invalid (logged as warning)

Given user changes default strategy from FIFO to LIFO
  When lots recomputed
  Then new strategy applied to transactions without overrides
  And overrides still take precedence
```

### `import-history.tap.js`

```
Given first import
  When 100 transactions imported
  Then importHistory has 1 row
  And entityChanges has 100 rows (all 'created')
  And summary shows {created: 100, modified: 0, orphaned: 0, restored: 0}

Given second import with 5 transactions modified
  When reimport completes
  Then importHistory has 2 rows
  And entityChanges for import 2 has 5 rows (all 'modified')
  And stableIdentities.lastModifiedAt updated for those 5

Given second import with 2 transactions deleted
  When reimport completes
  Then entityChanges for import 2 has 2 rows (both 'orphaned')

Given third import restoring a previously orphaned transaction
  When signature matches orphaned entity
  Then entityChanges shows 'restored'
  And stableIdentities.orphanedAt cleared

Given 21 imports
  When 21st import completes
  Then importHistory has 20 rows (oldest pruned)
  And entityChanges for oldest import pruned
  And recent 20 imports' changes preserved

Given import with no changes
  When all signatures match, no content-hash changes
  Then importHistory row created
  And entityChanges has 0 rows for this import
  And summary shows {created: 0, modified: 0, orphaned: 0, restored: 0}
```

### `edge-cases.tap.js`

```
Given empty QIF file
  When import attempted
  Then succeeds with zero entities
  And no orphans created (first import)

Given QIF with only headers, no transactions
  When import attempted
  Then succeeds with account/security entities only

Given transaction with empty payee
  When signature generated
  Then uses empty string (not null) in signature

Given transaction with unicode payee "Café München"
  When normalized
  Then preserves unicode: "café münchen"

Given two concurrent imports (same database)
  When both attempt to run
  Then one fails cleanly (lock error)
  And no data corruption

Given reimport after manual stableIdentities edit
  When user manually changed a signature
  Then matching uses the edited signature
  And no crash or undefined behavior
```

## Test Utilities Needed

```javascript
// Create in-memory test database with schema
const createTestDatabase = () => { ... }

// Generate mock QIF data
const generateTestQif = (options) => { ... }

// Import and return stable IDs
const importAndGetStableIds = (db, qifData) => { ... }

// Reimport and compare stable IDs
const reimportAndCompare = (db, oldStableIds, newQifData) => { ... }
```

## Coverage Goals

| Area | Target |
|------|--------|
| Stable ID CRUD | 100% |
| Stable ID counters (D23) | Atomic increment, never decrement |
| Signature generation | 100% |
| Security matching | All edge cases |
| Transaction matching | All edge cases |
| Daily sequence (D17) | Tiebreaker, fallback to fungible |
| Categories & tags | Import, reimport, orphan |
| Splits (D20) | Content-based, cascade orphan |
| Prices | Security reference, date matching |
| Lots - basic | FIFO consumption, allocation |
| Lots - complex | Splits, shorts, options, transfers |
| Lots - reimport | Stable ID preservation |
| Lot overrides (D19) | Override persistence, strategy switching |
| Reimport scenarios | 5+ scenarios |
| Import history (D18) | All change types, pruning |
| Error handling (D16) | Rollback, all failure modes |
| Edge cases | Unicode, empty, concurrent |
