# F-qif-transfer-resolution

## Goal
Add transfer account resolution and gain marker tracking to cli-qif-to-sqlite.

## Background
The stable ID import system (F-stable-qif-import) is complete and working with real QIF files. This specification adds:
- Resolution of `[Account Name]` category syntax to actual account IDs
- Tracking of capital gain marker types (CGLong, CGShort, etc.)
- A category resolver module for parsing these patterns

## QIF Category Syntax
QIF uses the category field for multiple purposes:
- Regular category: `Food:Groceries`
- Transfer to account: `[Checking]`
- Transfer with category: `[Checking]/Food:Groceries`
- Gain markers in investment transactions: CGLong, CGShort, CGMid

## Schema Changes
Add to `transactions` table:
- `transferAccountId TEXT` - FK to accounts.id when category is `[Account]`
- `gainMarkerType TEXT` - One of: CGLong, CGShort, CGMid, null

Add to `transactionSplits` table:
- `transferAccountId TEXT` - FK to accounts.id for split transfers

## Implementation Steps

### Schema and Category Resolver
1. Update schema.sql - add transferAccountId and gainMarkerType columns
2. Create src/category-resolver.js with P/T/F cohesion groups:
   - P.isTransferCategory - detects `[...]` syntax
   - P.isGainMarker - detects CGLong, CGShort, CGMid
   - T.toTransferAccountName - extracts account name from `[Account]`
   - T.toCategoryFromTransfer - extracts category from `[Account]/Category`
   - F.createResolvedCategory - returns {categoryId, transferAccountId, gainMarkerType}
3. Run style validator, fix violations
4. Commit: "Add category resolver and schema for transfers"

### Integration
5. Simplify cli.js - remove redundant field aliases (accountName, securitySignature)
6. Run style validator, fix violations
7. Commit: "Simplify cli.js to use canonical field names"

8. Update import.js:
   - Use canonical field names (txn.account, txn.security, txn.category)
   - Integrate CategoryResolver
   - Resolve transfers to accountId
9. Run style validator, fix violations
10. Commit: "Refactor import.js for transfers and canonical names"

### Testing
11. Update test fixtures for new field names
12. Add tests for transfer resolution
13. Add tests for gain marker parsing
14. Run full test suite
15. Commit: "Update tests for refactored import"

### Verification
16. [CHECKPOINT] Manual test with real QIF file containing transfers

## Verification Queries
```sql
-- Transfers resolved
SELECT * FROM transactions WHERE transferAccountId IS NOT NULL;

-- Gain markers tracked
SELECT * FROM transactions WHERE gainMarkerType IS NOT NULL;

-- Split transfers
SELECT * FROM transactionSplits WHERE transferAccountId IS NOT NULL;
```

### Entity Change Tracking
17. Wire up entity-level change tracking in import.js:
    - Track which entities are added (new stableId created)
    - Track which entities are modified (content changed)
    - Track which entities are orphaned (removed from QIF)
18. Pass changes array to ImportHistory.finalizeImportHistory
19. Add tests for entity change tracking
20. Commit: "Wire up entity-level change tracking"

### CLI Display Migration
21. Refactor cli-ui.js from cli-qif-to-sqlite-with-overwrite:
    - Remove 7 COMPLEXITY-TODO comments by restructuring
    - Use cohesion groups (P/T/E)
    - Adapt imports for new module
22. Copy to cli-qif-to-sqlite/src/cli-ui.js
23. Integrate with cli.js for richer output display
24. Commit: "Add CLI display functions"

### Old Module Cleanup
25. Remove cli-qif-to-sqlite-with-overwrite from workspaces
26. Delete modules/cli-qif-to-sqlite-with-overwrite/
27. Verify no broken imports
28. Commit: "Remove old QIF module"

## Dependencies
- F-stable-qif-import must be complete (it is)
- Real QIF file with transfer transactions for testing
