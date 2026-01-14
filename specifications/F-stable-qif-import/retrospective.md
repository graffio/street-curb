# F-stable-qif-import Retrospective

## Summary

The cli-qif-to-sqlite module has **never successfully imported a real QIF file**. All tests pass because they use pre-formatted data (strings) that bypasses the actual parser-to-database pipeline. This document captures what we learned through failed implementation attempts.

## Fundamental Problem: Test Data Gap

**Tests use:**
```javascript
{ date: '2024-01-15', amount: 100.00, address: 'Line1\nLine2' }  // strings
```

**Parser produces:**
```javascript
{ date: new Date('2024-01-15'), amount: 100.00, address: ['Line1', 'Line2'] }  // typed objects
```

The tests never exercise the real code path. They pass because they skip the boundary where types must be converted.

## Architectural Issues Discovered

### 1. Wrong Separation of Concerns

**Current (wrong):**
```
Parser → cli.js (transforms types) → import.js (SQLite)
```

**Should be:**
```
Parser → QifEntry Tagged types → import.js (converts at SQLite boundary)
```

cli.js is a CLI handler. It should route commands, not transform data. All type conversions should happen at the database boundary in import.js.

### 2. Tagged Types Violated

QifEntry types declare:
- `date: 'Object'` - expects Date instance
- `address: '[String]?'` - expects array of strings

But cli.js was converting:
- `Date` → `'2024-01-15'` string before calling `.from()`
- `['Line1', 'Line2']` → `'Line1\nLine2'` string before calling `.from()`

This violates the Tagged type validation and breaks `QifEntry.TransactionBank.is()` checks downstream.

### 3. Signature Type Mismatch

Signatures are computed from entity fields:
```javascript
const sig = `${accountName}|${date}|${amount}`
```

When `date` is a Date object, `Date.toString()` produces `"Mon Jan 15 2024 00:00:00 GMT-0700"`. When `date` is a string, it's `"2024-01-15"`. Different signatures = reimport fails to match.

**Solution:** Signature should be a Tagged type with explicit `toString()` that serializes typed fields consistently.

### 4. INSERT OR IGNORE Hides Failures

All 7 entity import statements used `INSERT OR IGNORE`:
```sql
INSERT OR IGNORE INTO transactions (...) VALUES (...)
```

This silently dropped rows that violated constraints. The real QIF file had `transactionType = 'Bank'` but schema CHECK constraint expected `'bank'` (lowercase). Instead of crashing immediately, it silently ignored the row, and the error surfaced later as "FK constraint failed" on splits.

**Lesson:** `INSERT OR IGNORE` is always wrong. It hides problems instead of failing fast.

### 5. Schema/Data Mismatch

Schema defines:
```sql
transactionType TEXT CHECK (transactionType IN ('bank', 'investment'))
```

QIF parser produces:
```javascript
transactionType: 'Bank'  // or 'Credit Card', 'Invoice', 'Cash', etc.
```

Multiple QIF transaction types need mapping to schema's two types. This mapping doesn't exist.

### 6. Missing Type Definition

`ParseQifData.parseQifData()` has no defined return type. The `ParsedQifData` type doesn't exist. Without it, there's no contract between parser and importer.

## What the Specs Got Wrong

| Spec Claim | Reality |
|------------|---------|
| "QIF parsing logic reused from old module" | Yes, but the types don't match import.js expectations |
| "INSERT OR IGNORE for collision checking" | This hides constraint violations |
| "273 tests pass" | Tests use fake data that skips the broken pipeline |
| "Phase 5: Integration complete" | Integration was never tested with real data |
| Stable ID prefixes: `sac_`, `stx_`, etc. | Implemented, but never proven to work |
| "Complete replacement for old module" | Not true - can't import a real QIF file |

## What the Specs Got Right

- Stable identity concept (signatures + reusable IDs)
- Copy-then-replace rollback strategy
- Orphan tracking instead of auto-delete
- Content-based split signatures
- Lot identity via opening transaction
- 12-digit ID format for web app compatibility

## What Needs to Change

### 1. Define ParsedQifData Type

```javascript
// type-definitions/parsed-qif-data.type.js
const ParsedQifData = Tagged('ParsedQifData', {
    accounts: '[Account]',
    bankTransactions: '[QifEntry.TransactionBank]',
    investmentTransactions: '[QifEntry.TransactionInvestment]',
    categories: '[Category]',
    tags: '[Tag]',
    securities: '[Security]',
    prices: '[Price]',
})
```

### 2. Define Signature Tagged Type

```javascript
const Signature = Tagged('Signature', {
    entityType: 'String',
    fields: 'Object',  // typed fields
})

Signature.prototype.toString = function() {
    // Explicit serialization that handles Date, arrays, etc.
    return Object.entries(this.fields)
        .map(([k, v]) => `${k}:${serialize(v)}`)
        .join('|')
}
```

### 3. Simplify cli.js

cli.js should only:
- Parse command line arguments
- Call services
- Format output

It should NOT transform data types.

### 4. Move All Conversions to Import Boundary

import.js should:
- Accept typed data (Date objects, arrays)
- Convert at SQLite binding time only
- Use explicit converters (not implicit coercion)

### 5. Create Integration Tests with Parser Output

```javascript
// test/integration/real-qif.tap.js
const qifContent = readFileSync('fixtures/real-export.qif', 'utf-8')
const parsed = ParseQifData.parseQifData(qifContent)  // actual parser
const result = Import.processImport(db, parsed)  // actual import
// This is the path that's never been tested
```

### 6. Remove INSERT OR IGNORE

Use `INSERT` and let constraint violations crash immediately.

### 7. Map QIF Transaction Types to Schema Types

```javascript
const T = {
    toSchemaTransactionType: qifType => {
        const bankTypes = ['Bank', 'Cash', 'Credit Card', 'Invoice', 'Other Asset', 'Other Liability']
        return bankTypes.includes(qifType) ? 'bank' : 'investment'
    }
}
```

## Questions for Next Attempt

1. Should we fix the existing module or start fresh?
2. Do we need the old `cli-qif-to-sqlite-with-overwrite` module at all?
3. Should specs be rewritten from scratch based on what we learned?
4. Do we have a real QIF file we can use as the canonical test fixture?
5. What's the minimum viable feature set? (Just transactions? No lots?)

## Git Commits That Tell the Story

| Commit | What It Shows |
|--------|---------------|
| 87012b1 | Simplified ID system (worked in tests) |
| 8815d89 | Fix SQLite binding for address arrays (discovered during real import) |
| b1505bb | Fix SQLite binding for price dates (same issue) |
| b219e82 | Fix O(n²) parser performance (real QIF files are large) |
| fb56d55 | Show help when no command (usability) |

## Recommendation

The specs describe a well-designed system, but they were written without validating against real data. The implementation followed the specs faithfully but produced a system that doesn't work.

**Next steps:**
1. Get a real QIF file as the canonical test fixture
2. Write one end-to-end test: `parse → import → query` with that file
3. Make that test pass, fixing whatever breaks
4. Only then update specs to reflect reality

The specs should document what works, not what we hope will work.
