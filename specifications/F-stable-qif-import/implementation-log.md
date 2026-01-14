# F-stable-qif-import Implementation Log

## Phase 3: Categories, Tags, Splits, Prices

**Status:** Complete

### Commits

| Commit | Description |
|--------|-------------|
| 93fe93f | Add category and tag import with stable identity matching |
| 4cd2af2 | Add split import with stable identity matching and orphan cascading |
| 6eaf5ca | Add price import with stable identity matching - Phase 3 complete |

### Implementation Notes

- Categories use `sca_` prefix, tags use `sta_` prefix (exact name match)
- Splits use `ssp_` prefix with content-based signature per D20: `transactionStableId|categoryStableId|amount`
- Split orphan cascading per D13: when parent transaction orphaned, splits also orphaned
- Prices use `spr_` prefix with signature per D14: `securityStableId|date`
- Security lookup in prices uses `securitySignature()` to handle both symbol and name-matched securities

### Checkpoint Log

| Step | Decision | Outcome | Date |
|------|----------|---------|------|

## Phase 4 Research: Lot Processing

### Investment Actions Handled

The old module categorizes investment actions into these groups:

**Buy Actions** (create new lots or close short positions):
- `Buy` - Standard purchase
- `BuyX` - Buy with transfer from another account
- `CvrShrt` - Cover short position

**Reinvestment Actions** (create new lots):
- `ReinvDiv` - Reinvest dividend
- `ReinvInt` - Reinvest interest
- `ReinvLg` - Reinvest long-term capital gain
- `ReinvSh` - Reinvest short-term capital gain
- `ReinvMd` - Reinvest mid-term capital gain

**Shares In Actions** (treated like buys):
- `ShrsIn` - Shares transferred in

**Sell Actions** (reduce lots via FIFO):
- `Sell` - Standard sale
- `SellX` - Sell with transfer to another account
- `ShtSell` - Short sell

**Shares Out Actions** (treated like sells):
- `ShrsOut` - Shares transferred out

**Split Actions**:
- `StkSplit` - Stock split (adjusts quantities proportionally)

**Option Actions**:
- `Grant` - Stock option grant (no lot created)
- `Vest` - Stock option vest (creates lot with $0 cost basis)
- `Exercise` - Exercise options (closes option lots)

**Cash-Only Actions** (skipped, no lot impact):
- `Div`, `DivX`, `IntInc`, `MiscInc`, `MiscIncX`, `MiscExp`, `MargInt`
- `Cash`, `CGShort`, `CGLong`, `ContribX`, `WithdrwX`, `RtrnCapX`
- `Reminder`, `Expire`

**Transfer Actions** (skipped):
- `XOut`, `XIn`

### FIFO Algorithm

The FIFO (First In, First Out) algorithm is implemented in `processLotReduction()`:

1. **Query open lots** ordered by `purchaseDate ASC, id ASC`
2. **Filter relevant lots** based on sign:
   - For sells: lots with positive `remainingQuantity`
   - For buys covering shorts: lots with negative `remainingQuantity`
3. **Iterate through lots in order**, reducing each:
   - Calculate `sharesToReduce = min(|lot.remainingQuantity|, |remainingShares|)`
   - Calculate `newRemainingQuantity = remainingQuantity - sign(remainingQuantity) * sharesToReduce`
   - If `|newRemainingQuantity| <= EPSILON`, close the lot (set `closedDate`)
   - Create `LotAllocation` record with pro-rata `costBasisAllocated`
   - Update lot in database
   - Reduce `remainingShares` by amount allocated
4. **If shares remain after processing all lots:**
   - For buys: create new long lot
   - For sells: create new short lot (negative quantity)

### Stock Split Handling

Stock splits are handled in `processStockSplitTransaction()`:

1. Query all open lots for the account/security
2. Calculate `splitRatio = transaction.quantity / 10`
   - Note: The divisor of 10 appears to be a QIF convention where quantity represents the new ratio (e.g., 20 for a 2:1 split means multiply by 2.0)
3. For each lot:
   - `newQuantity = quantity * splitRatio`
   - `newRemainingQuantity = remainingQuantity * splitRatio`
   - Cost basis is NOT adjusted (maintains original purchase price)

### Dividend Reinvestment Cost Basis

For `ReinvDiv` and similar actions, cost basis is determined by (in priority order):
1. `transaction.amount` if present and > EPSILON
2. `transaction.price * quantity` if price present and > EPSILON
3. Historical price lookup from `prices` table (most recent price <= transaction date)
4. If no price found, skip with warning

### Edge Cases and Constants

**Constants:**
- `EPSILON = 1e-10` - Threshold for floating-point comparisons

**Edge Cases Handled:**
- **Zero quantity transactions**: Skipped via `isSignificantQuantity()` check
- **Partial lot consumption**: Lot remains open with reduced `remainingQuantity`
- **Full lot consumption**: Lot closed with `closedDate` set
- **Short selling**: Creates lots with negative `remainingQuantity`
- **Covering shorts**: Buys first close short lots, then create new long lots
- **Overselling**: Creates short position (negative quantity lot)
- **Pro-rata cost basis**: When buy partially covers shorts, remaining shares get proportional cost basis
- **Option exercises**: Close option lots FIFO, but don't track the resulting stock lots (appears incomplete)

**LotAllocation Records:**
- Created for every share reduction to track which lots funded which sales
- Records `sharesAllocated`, `costBasisAllocated` (pro-rata from lot), `date`
- ID generated from hash of `{lotId, transactionId, sharesAllocated}`

**Lot Data Model:**
- `quantity`: Original purchase quantity (mutable for splits)
- `remainingQuantity`: Current unclosed quantity (reduced by sells, adjusted by splits)
- `costBasis`: Total cost basis for original quantity (immutable)
- `closedDate`: Set when `remainingQuantity` reaches zero

### Key Observations for Stable Identity

1. **Lot ID generation**: Currently uses `hashFields({accountId, securityId, purchaseDate, createdByTransactionId})`
   - Stable across imports if transaction IDs are stable
   - For stable identity, we need: `slo_` prefix + content-based signature

2. **LotAllocation ID generation**: Uses `hashFields({lotId, transactionId, sharesAllocated})`
   - Dependent on lot ID stability

3. **Processing order dependency**: Lots must be processed in transaction date order
   - FIFO correctness depends on chronological processing

4. **Idempotency concern**: Current implementation clears all lots/allocations and rebuilds from scratch
   - Stable identity approach needs to handle incremental updates

## Phase 4: FIFO Lot Tracking

**Status:** Complete

### Commits

| Commit | Description |
|--------|-------------|
| f72fd2c | Add FIFO lot tracking with convention-compliant code structure |

### Implementation Notes

- import-lots.js organized into P/T/F/E cohesion groups
- Functions moved to top of containing blocks per conventions
- All @sig annotations have description comments
- Destructuring applied to reduce repeated property access
- forEach callbacks extracted to named E group functions
- Code review outcome: LGTM (mutation patterns acceptable for E group effects)
- Style validator: 0 violations
- Tests: 16 pass (lots-basic.tap.js)

| 3463eab | Fix cohesion structure and naming across cli-qif-to-sqlite |
| b9a23a1 | Integrate lot processing into processImport with reimport support |

- stable-identity.js: getNextId → T.toNextId
- line-group-to-entry.js: export → LineGroupToEntry
- import.js: getEntityId → T.toEntityId, clearBaseTables → E.clearBaseTables
- parse-qif-data.js: lineGroupsToEntries → T.toEntries, export → ParseQifData
- Code review: LGTM

### Phase 4 Completion Notes

- processImport now calls ImportLots.importLots automatically
- Transaction lookup returns `{id, orphanedAt}` objects instead of strings
- Split, price, transaction imports updated to handle reimport with stable IDs
- Tests updated to reflect new integrated workflow
- All 250 tests pass

## Phase 5: CLI Integration, Rollback, Import History

**Status:** Complete

### Commits

| Commit | Description |
|--------|-------------|
| 18ea346 | Add rollback and import history tracking per D16/D18 |
| 6262a97 | Add CLI with import, info, schema, register, history commands |

### Implementation Notes

- rollback.js: copy-then-replace strategy per D16, withRollback wrapper
- import-history.js: recordImport, recordEntityChange, pruneOldHistory per D18
- 20-import retention limit with automatic cleanup
- Error context includes entity, stage, progress for debugging
- cli.js: yargs-based CLI with commands for import, info, schema, register, history
- orphan-management.js: listOrphans and acknowledgeOrphan functions
- Atomicity: full import wrapped in db.transaction(), SQLite pragmas for speed
- Package.json bin field points to cli.js for qif-db command
- index.js exports all public modules for programmatic use

### All Tests Pass

273 tests pass across all test files:
- accounts.tap.js, categories-tags.tap.js, splits.tap.js, prices.tap.js
- lots-basic.tap.js, lots-complex.tap.js, lots-reimport.tap.js
- reimport-scenarios.tap.js, schema.tap.js, signatures.tap.js
- stable-identity.tap.js, matching.tap.js, rollback.tap.js, history-pruning.tap.js

## Migration Guide: cli-qif-to-sqlite-with-overwrite → cli-qif-to-sqlite

### Key Differences

| Aspect | Old Module | New Module |
|--------|------------|------------|
| Identity | Hash-based, changes on reimport | Stable IDs (stx_00001), preserved across reimports |
| Duplicate handling | Last one wins | Fungible pairing (D4) |
| Orphan handling | Deleted | Flagged with orphanedAt, recoverable |
| Rollback | None | Copy-then-replace strategy |
| History | None | 20-import retention with change tracking |
| Lot tracking | Separate pass | Integrated in import flow |

### API Changes

**Parsing:**
- Old: `import parseQifData from './parse-qif-data.js'`
- New: `import { ParseQifData } from './qif/parse-qif-data.js'` then `ParseQifData.parseQifData(content)`

**Import:**
- Old: Direct database manipulation
- New: `Import.processImport(db, data)` with automatic stable ID management

**CLI:**
- Old: None
- New: `qif-db import -d db.sqlite -f data.qif`

### Stable ID Prefixes

| Entity Type | Prefix |
|-------------|--------|
| Account | sac_ |
| Category | sca_ |
| Tag | sta_ |
| Security | sse_ |
| Transaction | stx_ |
| Split | ssp_ |
| Price | spr_ |
| Lot | slt_ |
| LotAllocation | sla_ |
