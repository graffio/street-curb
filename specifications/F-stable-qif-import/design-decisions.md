# Design Decisions

## D1: Single Stable ID System

**Decision:** Use stable IDs directly in base tables. No intermediate content-hash IDs.

**Rationale:**
- Simpler: one ID system instead of two
- Stable IDs are sequential and zero-padded to 12 digits (`acc_000000000001`)
- 12-digit format matches existing web app regex patterns (`[a-f0-9]{12}`) — no web app changes needed
- External apps reference the same IDs stored in base tables
- Signature matching handles deduplication across imports

**Previous design (rejected):** Two-level system with content-hash IDs (`acc_${hash}`) in base tables mapped to stable IDs (`sac_00001`). This added unnecessary complexity—the hash-based IDs served no purpose that stable IDs don't also serve.

---

## D2: Import Order

**Decision:** Import order is: accounts → categories → tags → securities → transactions (with splits) → prices → lots → lot allocations.

**Rationale:**
- Categories/tags are independent, imported early for transaction references
- Securities before transactions (transaction signatures need stable security IDs)
- Splits imported with their parent transaction (same loop)
- Prices after securities (need stable security IDs)
- Lots/allocations last (computed from transactions, need all stable IDs resolved)

**Implication:** Transaction signatures contain `stableSecurityId`, not security name/symbol.

---

## D3: Symbol is Authoritative for Security Matching

**Decision:** If both old and new security have symbols, match by symbol only. Fall back to name only if either lacks symbol.

**Rationale:**
- Symbols are more stable than names (AAPL doesn't change)
- Names have formatting variations ("Apple Inc." vs "Apple Inc")
- Private investments without symbols need name-based matching

**Edge case:** Symbol changes are treated as different securities (rare, usually stock splits don't change symbol).

---

## D4: Duplicate Transactions Paired Arbitrarily

**Decision:** If N transactions have identical signatures and N stable IDs expect them, pair them 1:1 without caring which maps to which.

**Rationale:**
- Truly identical transactions are fungible
- User annotations on one could apply to any of them
- Trying to preserve "order" is fragile (Quicken export order isn't guaranteed)

**When counts differ:**
- More new than old → extras get new stable IDs
- More old than new → extras marked orphaned

---

## D5: Memo, Cleared, Number Excluded from Signatures

**Decision:** Transaction signatures don't include `memo`, `cleared`, or `number`.

**Rationale:**
- `memo` — Users edit this freely
- `cleared` — Changes over time (uncleared → cleared)
- `number` — Check numbers might be added later

**Included:** `account`, `date`, `amount`, `action`, `security`, `quantity`, `payee`

---

## D6: Normalized Payee Matching (Conservative)

**Decision:** Bank transaction payees normalized conservatively before matching.

**Normalization (what we do):**
- Lowercase
- Strip leading/trailing whitespace
- Collapse internal whitespace

**Not normalized (preserved as-is):**
- Punctuation (`McDonald's` → `mcdonald's`, not `mcdonalds`)
- Numbers (`Whole Foods #123` → `whole foods #123`, not `whole foods`)

**Rationale:**
- Conservative is safer — an orphan is recoverable, a wrong match is silent data corruption
- `Whole Foods #123` vs `Whole Foods #456` remain distinct (different stores)
- If users see orphans for "same merchant, different location," that's a feature request to relax matching, not a bug

**Alternative rejected:** Aggressive normalization (strip punctuation, numbers) — risks matching different transactions silently.

---

## D7: Stable IDs Never Reused

**Decision:** Once a stable ID is assigned, it's never reassigned to a different entity, even if orphaned.

**Rationale:**
- External data might still reference orphaned stable IDs
- Reusing could create confusing data integrity issues
- Stable IDs are cheap (just incrementing counter)

**Cleanup:** Orphaned stable IDs can be purged after explicit user action, not automatically.

---

## D8: Import is Always Full Replace (for QIF data)

**Decision:** Each import still wipes QIF-derived tables and reimports everything.

**Rationale:**
- Quicken only exports complete files
- Trying to merge/diff is complex and error-prone
- Stable identity layer handles "what changed" separately

**What persists:** `stableIdentities` table survives across imports.

---

## D9: Separate Module, Not Wrapper

**Decision:** New module is standalone, not a wrapper around the old one.

**Rationale:**
- Different performance characteristics (batch vs row-by-row)
- Different schema (adds `stableIdentities`)
- Cleaner to copy/adapt than to shim around existing behavior
- Old module preserved for comparison/fallback

---

## D10: Orphan Handling is Reporting, Not Auto-Delete

**Decision:** Orphaned stable IDs are flagged (`orphanedAt` timestamp), not deleted.

**Rationale:**
- User might want to manually reconcile
- External data still references them
- Auto-delete could cause data loss

**API:** `listOrphanedStableIds()`, `acknowledgeOrphan(stableId)`, `purgeAcknowledgedOrphans()`

---

## D11: Complete Replacement Scope

**Decision:** New module is a complete replacement for the old one, including all entity types.

**Entity types with stable IDs:**
- Account (`acc_`)
- Category (`cat_`)
- Tag (`tag_`)
- Security (`sec_`)
- Transaction (`txn_`)
- Split (`spl_`)
- Price (`prc_`)
- Lot (`lot_`)
- LotAllocation (`la_`)

**Rationale:** A partial replacement would require maintaining two codebases and deciding which to use. Better to build once correctly.

---

## D12: Single Import Orchestrator File

**Decision:** Keep all entity import handlers in `import.js` rather than decomposing by entity type.

**Rationale:**
- Patterns visible side-by-side (categories/tags/accounts all use exact name match)
- Linear flow — read top-to-bottom, no jumping between files
- No abstraction overhead

**Exception:** FIFO lot tracking is extracted to `import-lots.js` because it's algorithmically distinct (stateful computation vs simple insert-or-match).

---

## D13: Split Orphan Cascading

**Decision:** When a parent transaction is orphaned, its splits are also marked orphaned.

**Rationale:**
- Splits have no meaning without their parent transaction
- External data referencing a split implicitly references the transaction
- Cascading prevents dangling split references

**Implementation:** After marking transaction orphaned, query splits by `transactionStableId` and mark those orphaned too.

---

## D14: Price Signature is Security + Date

**Decision:** Prices are matched by `securityStableId|date`, not by price value.

**Rationale:**
- Same security on same date should have same price
- If price value changed in QIF, it's a correction, not a new price
- Matching by value would create duplicates for corrections

---

## D15: Lot Signature Includes Open Transaction

**Decision:** Lot signature is `securityStableId|accountStableId|openDate|openTransactionStableId`.

**Rationale:**
- Multiple lots can be opened on the same date (multiple buys)
- Including the opening transaction disambiguates them
- Stable transaction ID is resolved before lots are computed

**Note:** Lots are computed, not imported from QIF. The signature ensures the same computation produces the same stable ID.

---

## D16: Error Handling and Rollback

**Decision:** Import uses copy-then-replace strategy with full rollback on any error.

**Implementation:**
1. Copy the original database file before import begins
2. Perform import on the working copy
3. On success: replace original with working copy
4. On any error: discard working copy, preserve original, report error with full context

**Error reporting includes:**
- Which entity was being processed
- What stage of import (parsing, matching, inserting)
- Full stack trace
- Partial progress (e.g., "failed after 500 of 1000 transactions")

**Rationale:**
- Partial imports with unknown state are worse than failed imports
- User can retry after fixing the issue
- Original data is never corrupted

---

## D17: Daily Sequence Tiebreaker (DEFERRED)

**Status:** Deferred. Using fungible pairing (D4) instead.

**Original decision:** Bank transaction signatures include position-in-daily-sequence as a tiebreaker.

**Why deferred:** Fungible pairing works adequately for duplicate transactions. Adding daily sequence adds complexity without proven benefit. Can revisit if users report issues with duplicate transaction identity.

**Current behavior:** Duplicate transactions (same account+date+amount+payee) are paired arbitrarily per D4.

---

## D18: Import History Tracking

**Decision:** Track changes across the last 20 imports for history visibility.

**Schema:**
```sql
CREATE TABLE importHistory (
    importId TEXT PRIMARY KEY,
    importedAt TEXT,
    qifFileHash TEXT,
    summary TEXT  -- JSON: {created: 5, modified: 12, orphaned: 2, restored: 1}
);

CREATE TABLE entityChanges (
    stableId TEXT,
    importId TEXT,
    changeType TEXT,  -- 'created', 'modified', 'orphaned', 'restored'
    entityType TEXT,
    PRIMARY KEY (stableId, importId)
);

-- Add to stableIdentities
ALTER TABLE stableIdentities ADD COLUMN lastModifiedAt TEXT;
```

**Change types:**
- `created` — new entity, new stable ID
- `modified` — same stable ID, different content-hash
- `orphaned` — existed before, no match found
- `restored` — was orphaned, now matches again

**Retention:** Last 20 imports. Older entries pruned automatically on each import.

**What's NOT tracked:**
- "Unchanged" entities (no row in entityChanges)
- Field-level diffs ("memo changed from X to Y")

**Rationale:**
- Users want "what changed in latest update" at minimum
- 20 imports provides useful history without unbounded growth
- Only storing changes keeps storage O(changes) not O(entities × imports)

---

## D19: Lot Identity via Opening Transaction

**Decision:** Lots are identified by their opening transaction, not by a separate stable ID. User overrides for lot assignment are stored and survive reimports.

**Background:** QIF does not export lot information. When a user sells shares in Quicken and chooses specific lots (for tax optimization), that choice is lost in the QIF export. We must compute lots from buy/sell transactions.

**Risk analysis:**
- Most sells = "sell all shares" → lot assignment strategy irrelevant
- Partial sells with default strategy (FIFO/LIFO) → usually correct
- Partial sells with specific lot selection → rare, only for tax loss harvesting

**Approach:**

1. **Default strategy:** User-configurable (FIFO or LIFO), applied automatically to all sells
2. **Lot identity:** A lot is identified by its `openTransactionStableId`, not a separate `slt_` stable ID
3. **User overrides:** For rare cases where user needs specific lot assignment, store overrides keyed to sell transaction

**Schema:**
```sql
-- User-specified lot assignments (overrides default strategy)
CREATE TABLE lotAssignmentOverrides (
    sellTransactionStableId TEXT,
    openTransactionStableId TEXT,
    quantity REAL,
    PRIMARY KEY (sellTransactionStableId, openTransactionStableId)
);

-- User's preferred default strategy
CREATE TABLE userPreferences (
    key TEXT PRIMARY KEY,
    value TEXT
);
-- Example: ('lotStrategy', 'FIFO')
```

**Why opening transaction, not lot stable ID:**
- Opening transaction has a real stable ID (survives reimport)
- Lot stable ID would be computed, fragile if algorithm changes
- Override says: "This sell consumed X shares from the lot opened by transaction Y"
- If opening transaction matches on reimport, override still valid

**Lot table changes:**
- `lots` table still exists (computed)
- `slt_` prefix still assigned for external references
- But lot identity for overrides uses `openTransactionStableId`

**Rationale:**
- Accepts that we can't perfectly replicate Quicken's lot choices
- Default strategy handles 95%+ of cases correctly
- User can fix the rare specific-lot cases
- Overrides are durable across reimports

---

## D20: Split Signature Strategy (Content-Based)

**Decision:** Split signatures are content-based, not position-based. Duplicate splits are paired arbitrarily.

**Problem:** Position-based signatures (`transactionStableId|position|amount`) break when splits are inserted — all subsequent splits shift positions and become orphaned.

**Split signature:** `transactionStableId|categoryStableId|amount`

**Duplicate handling:** If two splits have identical signatures (same category, same amount), they are fungible and paired arbitrarily — same as duplicate transactions (D4).

**Rationale:**
- Content-based signatures are stable under insertion/deletion
- Mirrors transaction duplicate handling
- Allows external references to specific splits via stable ID

---

## D21: Timestamp Format (Separate Conventions)

**Decision:** Our metadata uses datetime; Quicken data uses date-only. No mixing in the same column.

**Our metadata columns** (datetime with time):
- `createdAt` — `2024-01-15T14:30:00Z`
- `lastModifiedAt` — `2024-01-15T14:30:00Z`
- `orphanedAt` — `2024-01-15T14:30:00Z`
- `importedAt` — `2024-01-15T14:30:00Z`

**Quicken data columns** (date only):
- Transaction `date` — `2024-01-15`
- Price `date` — `2024-01-15`
- Lot `openDate` — `2024-01-15`

**Rationale:**
- We control our timestamps; multiple imports can happen per day, order matters
- Quicken only provides dates; adding artificial time would imply false precision
- These live in different tables, no need to mix in ORDER BY

**Future consideration:** If we ever need to sort Quicken dates alongside our datetimes, use a consistent convention (e.g., market close in New York: `16:00 ET` / `21:00 UTC`).

---

## D22: Signature Storage as JSON

**Decision:** Store `matchSignature` as a JSON blob, not decomposed columns.

**Format:** `{"accountName":"Checking","date":"2024-01-15","amount":100.00,...}`

**Rationale:**
- Schema-flexible (different entity types have different signature fields)
- Simple to store/retrieve
- Easy to add new signature fields without schema migration

**Why not decomposed columns:**
- Would require sparse columns (most NULL for any given entity type)
- Schema changes when signature fields change
- More complex insert logic

**Key insight:** During import, we load all signatures into memory and match there. We don't query signatures via SQL. The only SQL queries on stableIdentities are:
1. Lookup by stableId (indexed)
2. Lookup by currentEntityId (indexed)
3. List orphans (filter on orphanedAt)

None of these need indexed access to signature fields.

---

## D23: Stable ID Generation via Counter Table

**Decision:** Generate stable IDs using a dedicated counter table.

**Schema:**
```sql
CREATE TABLE stableIdCounters (
    entityType TEXT PRIMARY KEY,
    nextId INTEGER DEFAULT 1
);
```

**Usage:**
```sql
UPDATE stableIdCounters
SET nextId = nextId + 1
WHERE entityType = 'Transaction'
RETURNING nextId - 1 as currentId;
-- Returns the ID to use, e.g., 42 → generates 'txn_000000000042'
```

**ID format:** `{prefix}_{12-digit zero-padded number}` (e.g., `txn_000000000042`, `acc_000000000001`)

The 12-digit format matches existing web app regex patterns (`[a-f0-9]{12}`), ensuring compatibility without web app changes. These IDs are used directly in base tables—there is no separate "entity ID" layer.

**Rationale:**
- Explicit counter per entity type
- Survives deletions (counter never decrements, per D7)
- No string parsing needed
- Human-readable, predictable IDs
- Easy to debug ("transaction 42" vs "transaction a1b2c3d4")
- Simplifies architecture: one ID system instead of two

**Alternatives rejected:**
- Query MAX and parse: fragile, requires string parsing
- UUID-based: not human-readable, harder to debug
- Hash-based content IDs: adds unnecessary complexity, changes on content edits

