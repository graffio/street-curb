# F-stable-qif-import: QIF Import with Stable Identities

## Problem

The existing `cli-qif-to-sqlite` module rebuilds the entire database on each import. This works for the QIF data itself (Quicken only exports complete files), but breaks external data that references transaction/security IDs.

**Example:** An app stores user annotations linked to `txn_000000000001`. After re-import, we need that transaction to keep the same ID even if the user edited its memo in Quicken.

## Solution

Create a new `cli-qif-to-sqlite` module that:
1. Maintains **stable identities** across re-imports
2. Uses **signature matching** to identify entities even when fields change
3. Uses stable IDs directly in base tables (no intermediate hash-based IDs)
4. Is a **complete replacement** for the old module (all entity types, including FIFO lot tracking)

The existing module becomes `cli-qif-to-sqlite-with-overwrite` (internal/low-level use).

## Key Concepts

### Stable IDs

| ID Type | Example | Changes When |
|---------|---------|--------------|
| Stable | `txn_000000000001` | Never (assigned once) |

Stable IDs are sequential, zero-padded to 12 digits, and stored directly in base tables. The 12-digit format ensures compatibility with existing web app regex patterns (`[a-f0-9]{12}`). External apps reference these IDs safely. The `stableIdentities` table tracks signatures for matching across reimports.

### Matching Strategy

On re-import:
1. Generate signature from entity fields
2. Look up signature in `stableIdentities` table
3. If found: reuse existing stable ID
4. If not found: generate new stable ID
5. If old signature not seen: mark as orphaned

### Entity Types and ID Prefixes

| Entity | Prefix | Signature Strategy |
|--------|--------|-------------------|
| Account | `acc_` | Exact name match |
| Category | `cat_` | Exact name match |
| Tag | `tag_` | Exact name match |
| Security | `sec_` | Symbol (authoritative) or normalized name |
| Transaction | `txn_` | Account + date + amount + payee/action/security |
| Split | `spl_` | Parent transaction + category + amount (content-based) |
| Price | `prc_` | Security + date |
| Lot | `lot_` | Security + account + open date + open transaction |
| LotAllocation | `la_` | Lot + consuming transaction |

### Signature Fields

**Accounts/Categories/Tags:**
- Exact name match (case-sensitive)

**Securities:**
- `symbol` (authoritative if both have one)
- `nameNormalized` (fallback)

**Bank Transactions:**
- `accountName`
- `date`
- `amount`
- `payeeNormalized` (lowercase, trimmed)
- `dailySequence` (position among identical transactions on same day)

**Investment Transactions:**
- `accountName`
- `date`
- `action` (Buy, Sell, etc.)
- `stableSecurityId` (resolved first)
- `quantity`
- `amount`

**Transaction Splits:**
- `transactionStableId` (parent)
- `categoryId`
- `amount`
- Note: Content-based, not position-based. Duplicate splits (same category + amount) are fungible.

**Prices:**
- `securityStableId`
- `date`

**Lots:**
- `securityStableId`
- `accountStableId`
- `openDate`
- `openTransactionStableId`
- Note: Lots are computed (not in QIF). Identity is primarily via `openTransactionStableId`.

**Lot Allocations:**
- `lotStableId`
- `consumingTransactionStableId`
- Note: User can override default lot assignments; overrides keyed to sell transaction stable ID.

**Excluded from signatures:** `memo`, `cleared`, `number` (too likely to change)

### Duplicate Handling

Identical transactions (same signature) on same day:
- If count unchanged: pair arbitrarily (they're fungible)
- If count increased: new ones get new stable IDs
- If count decreased: extras marked orphaned

## Duplicate Transaction Tiebreaker (D17)

Bank transactions with identical signatures (same account, date, amount, payee) are distinguished by `dailySequence` — their position among identical transactions on the same day.

**Example:** Two $50 payments to "Whole Foods" on the same day:
- First in QIF: `dailySequence = 0`
- Second in QIF: `dailySequence = 1`

**Assumption:** Quicken maintains consistent export ordering. If this proves false, identical transactions fall back to fungible pairing (any stable ID can map to any matching transaction).

## Error Handling (D16)

Import uses **copy-then-replace** strategy with full rollback on any error:

1. Copy original database file to working copy
2. Perform import on working copy
3. On success: replace original with working copy
4. On any error: discard working copy, preserve original

**Error reporting includes:**
- Which entity was being processed
- What stage of import (parsing, matching, inserting)
- Full stack trace
- Partial progress (e.g., "failed after 500 of 1000 transactions")

This ensures the user's data is never corrupted by a failed import.

## Performance Goals

- Pre-build lookup maps (no per-row DB queries during insert)
- Batch inserts where possible
- `INSERT OR IGNORE` instead of collision checking
- SQLite pragmas for import speed

## Schema Addition

```sql
-- Maps signatures to stable IDs for reimport matching
-- The stable ID is used directly in base tables (no separate entityId)
CREATE TABLE stableIdentities (
    id TEXT PRIMARY KEY,                 -- e.g., 'txn_000000000001', 'sec_000000000001'
    entityType TEXT NOT NULL,            -- 'Transaction', 'Security', 'Account', etc.
    signature TEXT NOT NULL,             -- matching key (name, or composite fields)
    orphanedAt TEXT,                     -- set if no match found on reimport
    acknowledgedAt TEXT,                 -- set when user acknowledges orphan
    createdAt TEXT DEFAULT (datetime('now')),
    lastModifiedAt TEXT                  -- updated when entity is modified
);

CREATE INDEX idx_stableIdentities_entityType_signature ON stableIdentities(entityType, signature);

-- Import history (last 20 imports retained)
CREATE TABLE importHistory (
    importId TEXT PRIMARY KEY,
    importedAt TEXT,
    qifFileHash TEXT,
    summary TEXT                         -- JSON: {created, modified, orphaned, restored}
);

-- Changes per import (pruned with importHistory)
CREATE TABLE entityChanges (
    stableId TEXT,
    importId TEXT,
    changeType TEXT,                     -- 'created', 'modified', 'orphaned', 'restored'
    entityType TEXT,
    PRIMARY KEY (stableId, importId)
);

-- Stable ID generation counters
CREATE TABLE stableIdCounters (
    entityType TEXT PRIMARY KEY,
    nextId INTEGER DEFAULT 1
);

-- User-specified lot assignments (overrides default FIFO/LIFO)
CREATE TABLE lotAssignmentOverrides (
    sellTransactionStableId TEXT,
    openTransactionStableId TEXT,        -- identifies the lot by its opening transaction
    quantity REAL,
    PRIMARY KEY (sellTransactionStableId, openTransactionStableId)
);

-- User preferences
CREATE TABLE userPreferences (
    key TEXT PRIMARY KEY,
    value TEXT
);
-- Example: ('lotStrategy', 'FIFO')
```

## What Gets Reused

From `cli-qif-to-sqlite-with-overwrite`:
- QIF parsing logic (`parse-qif-data.js`, `line-group-to-entry.js`)
- Type definitions
- SQL schema (base tables)
- Entity structures

## What Changes

- Database layer: batch inserts, pre-built lookup maps
- Import order: securities first (resolve stable IDs), then transactions
- New: stable identity tables and matching logic
- New: signature generation and comparison
