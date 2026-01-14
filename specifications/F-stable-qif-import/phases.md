# Implementation Phases

## Phase 0: Type Consolidation

**Goal:** Consolidate duplicate type definitions into shared source, fix Split type mismatch.

**Context:** Several types are duplicated between `cli-qif-to-sqlite` and `quicken-web-app` with minor differences. The Split type in cli-qif-to-sqlite doesn't match the database schema (missing id, transactionId, categoryId).

**Tasks:**

1. Create `modules/quicken-type-definitions/` folder
2. Move/consolidate these types from cli-qif-to-sqlite:
   - `account.type.js` (add `401(k)/403(b)` from web-app version)
   - `category.type.js`
   - `security.type.js`
   - `tag.type.js`
   - `transaction.type.js`
   - `lot.type.js`
   - `holding.type.js`
   - `price.type.js`
   - `lot-allocation.type.js`
3. Create proper `split.type.js` with database fields (id, transactionId, categoryId, amount, memo)
4. Rename in cli-qif-to-sqlite:
   - `entry.type.js` → `qif-entry.type.js` (update type name to QifEntry)
   - `split.type.js` → `qif-split.type.js` (update type name to QifSplit)
   - Update QifEntry to reference QifSplit instead of Split
5. Update `type-mappings.js`:
   - Add `quickenTypes` source pointing to new folder
   - Map shared types to their targets (cli-qif-to-sqlite, quicken-web-app, financial-computations)
   - Update cli-qif-to-sqlite mappings for renamed types
   - Remove duplicate definitions from quicken-web-app/type-definitions
6. Run `yarn types:generate`
7. Update imports in cli-qif-to-sqlite code:
   - `Entry` → `QifEntry`
   - `Split` → `QifSplit` (for parsed QIF)
   - `Split` (for database) now comes from shared types
8. Run cli-qif-to-sqlite tests to verify everything works
9. Run quicken-web-app tests if they exist
10. Commit

**Done when:**
- Current cli-qif-to-sqlite tests pass
- Types generated from single source to all targets
- Split type correctly represents database entity
- QifEntry/QifSplit correctly represent parsed QIF data

---

## Phase 1: Module Setup

**Goal:** Rename existing module and create new skeleton with stableIdentities schema.

**Tasks:**

1. Rename `cli-qif-to-sqlite` → `cli-qif-to-sqlite-with-overwrite`
2. Update package.json name field
3. Update type-mappings.js for renamed module paths
4. Run `yarn` to update workspace links
5. Run tests for renamed module
6. Commit renamed module
7. Create new `cli-qif-to-sqlite` module skeleton
8. Copy schema.sql, add stableIdentities table
9. Copy QIF parsing files (qif-entry, qif-split, parse-qif-data, line-group-to-entry)
10. Update type-mappings.js to generate types for new module
11. Create minimal src/index.js
12. Create test/schema.tap.js to verify stableIdentities table
13. Run new module tests
14. Commit new module skeleton

**Done when:** Two modules exist, both have tests passing, types generated correctly for both.

---

## Phase 2: Stable Matching (Core Entities) ✅

**Goal:** Implement stable identity assignment, signatures, and matching for accounts, securities, and transactions.

**Status:** Complete (being refactored to simplified ID system)

**What was built:**
- Stable ID generation (`txn_`, `sec_`, `acc_` prefixes with 12-digit zero-padding)
- `stableIdentities` table CRUD with orphan tracking
- Signature functions for matching (security, bank transaction, investment transaction)
- Pre-built lookup maps (no per-row queries)
- Import flow: accounts → securities → transactions → mark orphans
- Tests: stable-identity, signatures, matching, reimport-scenarios

**Refactor in progress:** Simplifying from two-ID system (hash + stable) to single stable ID system. See `refactor-plan.md`.

---

## Phase 3: Supporting Entities

**Goal:** Import categories, tags, transaction splits, and prices with stable identity matching.

**Tasks:**

*Categories & Tags:*
- Add `sca_` prefix for category stable IDs, `sta_` for tags
- Category signature: exact name match (like accounts)
- Tag signature: exact name match
- Add to import flow after accounts, before securities

*Transaction Splits:*
- Add `ssp_` prefix for split stable IDs
- Split signature: `transactionStableId|categoryId|amount` (content-based per D20)
- Duplicate splits (same category + amount) are fungible, paired arbitrarily
- Import splits immediately after their parent transaction
- Handle orphaned splits when parent transaction is orphaned

*Prices:*
- Add `spr_` prefix for price stable IDs
- Price signature: `securityStableId|date`
- Import prices after securities (needs security stable IDs)
- Batch insert to avoid N+1

*Tests:*
- `categories-tags.tap.js` — import, reimport, orphan scenarios
- `splits.tap.js` — parent-child relationship, orphan cascading
- `prices.tap.js` — security reference, date matching, reimport

**Done when:** All supporting entities import with stable IDs, reimport preserves identity, orphans tracked.

---

## Phase 4: FIFO Lot Tracking

**Goal:** Compute lots and lot allocations from investment transactions using FIFO algorithm.

**Context:** Lots are NOT in QIF files—they're computed from investment transactions (Buy creates lots, Sell consumes lots FIFO). This is the most complex phase.

**Tasks:**

*Lot computation:*
- Add `slt_` prefix for lot stable IDs, `sla_` for lot allocations
- Lot identity via opening transaction (per D19) — `openTransactionStableId` is the stable reference
- Lot signature: `securityStableId|accountStableId|openDate|openTransactionStableId`
- Default strategy: FIFO (user-configurable via `userPreferences` table)
- Support user overrides via `lotAssignmentOverrides` table (keyed to sell transaction)
- Process investment transactions in date order per account/security
- Handle all investment actions: Buy, Sell, BuyX, SellX, ShrsIn, ShrsOut, ReinvDiv, ReinvLg, ReinvSh, etc.
- Track remainingQuantity, closedDate on lots
- Lot allocation signature: `lotStableId|transactionStableId`

*Edge cases (copy logic from old module):*
- Stock splits (adjust lot quantities)
- Short sales (negative lots)
- Option exercises (Grant, Vest, Exercise)
- Transfers between accounts (ShrsIn/ShrsOut pairing)
- Fractional shares and rounding (epsilon: 1e-10)

*SQL consolidation:*
- Batch lot inserts
- Batch lot allocation inserts
- Pre-cache account/security lookups (fix N+1 from old module)

*Tests:*
- `lots-basic.tap.js` — Buy creates lot, Sell consumes FIFO
- `lots-complex.tap.js` — splits, short sales, options
- `lots-reimport.tap.js` — stable IDs preserved, lot allocations stable

**Done when:** All investment actions handled, FIFO correct, reimport preserves lot stable IDs.

---

## Phase 5: Integration

**Goal:** Wire up CLI, finalize API, implement infrastructure from design decisions.

**Tasks:**

*Schema additions (D18, D19, D23):*
- Add `stableIdCounters` table for stable ID generation (D23)
- Add `importHistory` and `entityChanges` tables for history tracking (D18)
- Add `lotAssignmentOverrides` and `userPreferences` tables (D19)
- Initialize counters for each entity type

*Error handling (D16):*
- Implement copy-then-replace strategy for imports
- On import start: copy database file to working copy
- On success: replace original with working copy
- On any error: discard working copy, preserve original
- Error reporting: entity being processed, stage, stack trace, progress

*Import history tracking (D18):*
- Record each import in `importHistory` (importId, timestamp, qifFileHash, summary)
- Track changes in `entityChanges` (created, modified, orphaned, restored)
- Update `stableIdentities.lastModifiedAt` when content-hash changes
- Prune history older than 20 imports automatically

*CLI:*
- `import` — parse QIF, run full import pipeline with rollback
- `info` — database statistics (counts for all entity types)
- `schema` — display schema info
- `register` — display account register with running balances
- `history` — show recent import history and changes

*Performance:*
- Wrap full import in `db.transaction()` for atomicity
- Add pragmas for import speed (`synchronous=OFF`, `journal_mode=WAL`)
- Test with large files (1000+ transactions)

*Orphan management:*
- `listOrphans(entityType)` — query orphaned entities
- `acknowledgeOrphan(stableId)` — mark as intentionally deleted
- Progress reporting during import

*Documentation:*
- Public API for consuming apps
- Migration guide from old module

*Tests:*
- `rollback.tap.js` — error handling, database preservation
- `history-pruning.tap.js` — 20-import retention, automatic cleanup

**Done when:** Module is a complete drop-in replacement for cli-qif-to-sqlite-with-overwrite.

---

## Dependencies

```
Phase 0 (type consolidation) ✅
    ↓
Phase 1 (module setup) ✅
    ↓
Phase 2 (stable matching - core) ✅
    ↓
Phase 3 (supporting entities) ← you are here
    ↓
Phase 4 (FIFO lot tracking) ← most complex
    ↓
Phase 5 (integration)
```

## Scope

| Phase | Size   | Notes                                           |
|-------|--------|-------------------------------------------------|
| 0     | Medium | Type refactoring, affects multiple modules ✅   |
| 1     | Small  | Mostly file operations ✅                       |
| 2     | Large  | Core stable identity matching ✅                |
| 3     | Medium | Categories, tags, splits, prices                |
| 4     | Large  | FIFO lot computation, complex investment logic  |
| 5     | Small  | CLI wiring and polish                           |
