# Plan: Comprehensive cli-qif-to-sqlite Refactor

## Goal

Fix architectural issues in cli-qif-to-sqlite: preserve Tagged types through pipeline, use canonical field names, properly track transfers and investment gain markers, fix security lookups, and simplify the ID system.

## Problems Being Solved

1. **Tagged types stripped** - cli.js spreads QifEntry types into plain objects, breaking `QifEntry.TransactionInvestment.is()` checks
2. **Inconsistent field names** - `account` vs `accountName`, `security` vs `securitySignature`, `category` vs `categoryName`
3. **Transfers lost** - `[Checking]` becomes `categoryId = NULL`, indistinguishable from uncategorized
4. **Gain markers lost** - `_RlzdGain|[Account]`, `_UnrlzdGain` dropped with no tracking
5. **Security lookup failures** - transactions reference by name, map keyed by signature
6. **Duplicated logic** - category parsing in 3 places in import.js
7. **Unnecessary ID complexity** - two ID systems (hash-based + stable) when one suffices

## Design Decisions

- **Breaking change** for field names - use canonical QIF names (`account`, `security`, `category`)
- **Resolve transfers at import** - look up account by name, fail if not found
- **Parse gain markers** - store marker type (realizedGain/unrealizedGain) and linked account name
- **Single ID system** - eliminate hash-based IDs, use stable IDs directly in base tables

## ID System Simplification

### Before (two ID systems)

```
stableIdentities: id='sac_00001', entityId='acc_abc123', signature='Checking'
accounts: id='acc_abc123', name='Checking'
```

- Hash-based IDs (`acc_${hash}`) in base tables - change when content changes
- Stable IDs (`sac_00001`) in stableIdentities - never change
- Web app uses hash IDs → breaks on reimport with renames

### After (single ID system)

```
stableIdentities: id='acc_000000000001', signature='Checking'
accounts: id='acc_000000000001', name='Checking'
```

- Stable IDs (`acc_000000000001`) used directly in base tables
- 12-digit zero-padding matches existing web app regex patterns
- No hash-based IDs generated
- Web app uses stable IDs → survives reimport

### ID Format Changes

Use 12-digit zero-padded numbers to match existing web app regex patterns (`[a-f0-9]{12}`).

| Entity | Old stable | Old hash | New (unified) |
|--------|------------|----------|---------------|
| Account | `sac_00001` | `acc_abc123def456` | `acc_000000000001` |
| Category | `sca_00001` | `cat_abc123def456` | `cat_000000000001` |
| Tag | `sta_00001` | `tag_abc123def456` | `tag_000000000001` |
| Security | `ssc_00001` | `sec_abc123def456` | `sec_000000000001` |
| Transaction | `stx_00001` | `txn_abc123def456` | `txn_000000000001` |
| Split | `ssp_00001` | `spl_abc123def456` | `spl_000000000001` |
| Price | `spr_00001` | `prc_abc123def456` | `prc_000000000001` |
| Lot | `slt_00001` | `lot_abc123def456` | `lot_000000000001` |
| LotAllocation | `sla_00001` | `la_abc123def456` | `la_000000000001` |

This ensures compatibility with quicken-web-app's existing type validators (no changes needed there).

### stableIdentities Table Changes

```sql
-- Drop entityId column (no longer needed)
-- The stable ID IS the entity ID now
CREATE TABLE stableIdentities (
    id TEXT PRIMARY KEY,              -- e.g., 'acc_000000000001'
    entityType TEXT NOT NULL,
    signature TEXT NOT NULL,
    orphanedAt TEXT,
    acknowledgedAt TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    lastModifiedAt TEXT
);
```

### Import Flow Simplification

**Before:**
1. Parse "Checking" from QIF
2. Generate hash: `acc_${hash('Checking')}` → `acc_abc123def456`
3. Look up in stableIdentities by signature
4. If found: use stable ID, update entityId mapping
5. Insert into accounts with hash ID

**After:**
1. Parse "Checking" from QIF
2. Look up in stableIdentities by signature
3. If found: use existing `acc_000000000001`. If not: generate `acc_000000000002`
4. Insert/update accounts with stable ID directly

## Schema Changes

```sql
-- stableIdentities: drop entityId column
-- (recreate table without it)

-- Add to transactions table
ALTER TABLE transactions ADD COLUMN transferAccountId TEXT REFERENCES accounts(id);
ALTER TABLE transactions ADD COLUMN gainMarkerType TEXT CHECK (gainMarkerType IN ('realizedGain', 'unrealizedGain'));

-- Add to transactionSplits table
ALTER TABLE transactionSplits ADD COLUMN transferAccountId TEXT REFERENCES accounts(id);
```

## New Module: src/category-resolver.js

Centralize all category/transfer/marker parsing:

```javascript
const P = {
    isTransfer: cat => cat?.startsWith('[') && cat?.endsWith(']'),
    isRealizedGain: cat => cat?.startsWith('_RlzdGain'),
    isUnrealizedGain: cat => cat?.startsWith('_UnrlzdGain'),
    isSplitMarker: cat => cat === '--Split--',
    isSpecialMarker: cat => P.isRealizedGain(cat) || P.isUnrealizedGain(cat) || P.isSplitMarker(cat),
}

const T = {
    toTransferAccountName: cat => P.isTransfer(cat) ? cat.slice(1, -1) : null,
    toGainLinkedAccount: cat => {
        // Parse "_RlzdGain|[Checking]" -> "Checking"
        const match = cat?.match(/^_(?:Rlzd|Unrlzd)Gain\|\[(.+)\]$/)
        return match ? match[1] : null
    },
    toCategoryName: cat => {
        if (!cat || P.isTransfer(cat) || P.isSpecialMarker(cat)) return null
        return cat.split('/')[0] // Strip class suffix
    },
    toClassName: cat => cat?.split('/')[1] || null,
}

const F = {
    // Returns { categoryName, transferAccountName, gainMarkerType, gainLinkedAccount, className }
    resolveCategory: cat => ({
        categoryName: T.toCategoryName(cat),
        transferAccountName: T.toTransferAccountName(cat),
        gainMarkerType: P.isRealizedGain(cat) ? 'realizedGain' : P.isUnrealizedGain(cat) ? 'unrealizedGain' : null,
        gainLinkedAccount: T.toGainLinkedAccount(cat),
        className: T.toClassName(cat),
    }),
}
```

## Files to Modify

### cli-qif-to-sqlite

| File | Changes |
|------|---------|
| `schema.sql` | Drop entityId from stableIdentities, add transfer/gain columns |
| `src/stable-identity.js` | Remove entityId handling, update PREFIXES, use 12-digit padding |
| `src/import.js` | Remove hash ID generation, use stable IDs directly, add CategoryResolver |
| `src/import-lots.js` | Remove hash ID generation for lots/allocations |
| `src/cli.js` | Remove redundant field aliases, preserve Tagged types |
| `src/signatures.js` | Export `normalizePayee` |
| `src/category-resolver.js` | NEW - centralized category parsing |

### quicken-web-app

No changes required. The 12-digit zero-padded IDs (`acc_000000000001`) match existing regex patterns (`[a-f0-9]{12}`).

## Implementation Steps

### Phase 1: ID System Simplification

1. **[CHECKPOINT] Review ID changes** - Confirm unified ID format
2. Update `schema.sql` - drop entityId, update stableIdentities
3. Update `stable-identity.js` - new prefixes, remove entityId handling
4. Update `import.js` - remove hashFields usage, use stable IDs directly
5. Update `import-lots.js` - same changes for lots
6. Run style validator, fix violations
7. Update tests for new ID format
8. Run test suite
9. git add and commit "Simplify to single stable ID system"

### Phase 2: Transfer and Gain Marker Support

10. Update `schema.sql` - add transferAccountId, gainMarkerType columns
11. Create `src/category-resolver.js`
12. Run style validator, fix violations
13. git add and commit "Add category resolver and schema for transfers"

### Phase 3: Import Pipeline Fixes

14. Simplify `cli.js` - remove redundant fields, preserve Tagged types
15. Run style validator, fix violations
16. git add and commit "Simplify cli.js to use canonical field names"
17. Update `import.js` - use CategoryResolver, resolve transfers
18. Fix security lookup (multiple keys)
19. Run style validator, fix violations
20. git add and commit "Refactor import.js for transfers and canonical names"

### Phase 4: Tests and Verification

21. Update test fixtures for new ID format and field names
22. Add tests for transfers and gain markers
23. Run full test suite
24. git add and commit "Update tests for refactored import"
25. **[CHECKPOINT] Manual test** - Import real QIF file with both old and new cli-qif-to-sqlite, verify same behavior in web app

## Verification

1. `yarn tap` - All tests pass in cli-qif-to-sqlite
2. Import actual QIF file with transfers and gain markers
3. Query database: `SELECT id FROM accounts LIMIT 5` - should show `acc_000000000001` format
4. Query database: `SELECT * FROM transactions WHERE transferAccountId IS NOT NULL`
5. Query database: `SELECT * FROM transactions WHERE gainMarkerType IS NOT NULL`
6. Load in quicken-web-app - no errors, investment accounts have balances
7. No "Missing securityId" warnings for securities that exist
8. Reimport after editing QIF - stable IDs preserved
9. Compare old vs new import: both databases load correctly in web app

## Critical Files

### cli-qif-to-sqlite
- `schema.sql`
- `src/stable-identity.js`
- `src/import.js`
- `src/import-lots.js`
- `src/cli.js`
- `src/signatures.js`
- `src/category-resolver.js` (new)

## Sources

- [_RlzdGain Tax Category - Quicken Community](https://community.quicken.com/discussion/7961989/rlzdgain-tax-category)
- [_UnrlzdGain not appearing in reports - Quicken Community](https://community.quicken.com/discussion/7951208/unrlzdgain-not-appearing-in-net-worth-account-balance-reports)
