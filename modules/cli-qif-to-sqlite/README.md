# cli-qif-to-sqlite

Import QIF financial data to SQLite with stable identity matching.

## Usage

```bash
# Import QIF file
node src/cli.js import -d database.db file.qif

# Show import history (last 10 imports with summary counts)
node src/cli.js history -d database.db

# Show database schema
node src/cli.js schema -d database.db

# Show table row counts
node src/cli.js tables -d database.db
```

## Schema

See [schema.puml](schema.puml) for ER diagram. Generate with `plantuml schema.puml`.

### Stable Identity Tracking

| Table                    | Purpose                                                  |
|--------------------------|----------------------------------------------------------|
| `stableIdentities`       | Maps signatures to stable IDs (e.g., `txn_000000000001`) |
| `stableIdCounters`       | Next ID counter per entity type                          |
| `importHistory`          | Last 20 imports with file hash and summary               |
| `entityChanges`          | Per-entity changes per import (stubbed)                  |
| `userPreferences`        | Key-value settings                                       |
| `lotAssignmentOverrides` | User overrides for FIFO lot allocation                   |

### Base Tables (Raw QIF Data)

| Table               | Key Columns                       | Foreign Keys                                                           |
|---------------------|-----------------------------------|------------------------------------------------------------------------|
| `accounts`          | id, name, type                    | -                                                                      |
| `categories`        | id, name, isIncomeCategory        | -                                                                      |
| `tags`              | id, name, color                   | -                                                                      |
| `securities`        | id, name, symbol, type            | -                                                                      |
| `transactions`      | id, date, amount, transactionType | accountId → accounts, categoryId → categories, securityId → securities |
| `transactionSplits` | id, amount, memo                  | transactionId → transactions, categoryId → categories                  |
| `prices`            | id, date, price                   | securityId → securities                                                |

### Derived Tables (Computed)

| Table            | Purpose                        | Foreign Keys                                                                         |
|------------------|--------------------------------|--------------------------------------------------------------------------------------|
| `lots`           | FIFO cost basis tracking       | accountId → accounts, securityId → securities, createdByTransactionId → transactions |
| `lotAllocations` | Records shares taken from lots | lotId → lots, transactionId → transactions                                           |

### Views

| View                        | Purpose                                           |
|-----------------------------|---------------------------------------------------|
| `currentHoldings`           | Open lot positions per account/security           |
| `currentHoldingsWithPrices` | Holdings with latest prices and market values     |
| `transactionDetails`        | Transactions with account/security/category names |
| `dailyPortfolios`           | Historical portfolio values by date               |

## Architecture

### Stable IDs

Every entity gets a stable ID that persists across reimports:

- `acc_000000000001` - Accounts
- `cat_000000000001` - Categories
- `tag_000000000001` - Tags
- `sec_000000000001` - Securities
- `txn_000000000001` - Transactions
- `spl_000000000001` - Transaction splits
- `lot_000000000001` - Investment lots
- `prc_000000000001` - Prices

### Import Flow

1. Parse QIF file into data structures
2. Build lookup maps from existing stable identities
3. Clear base tables (entities are recreated each import)
4. Import accounts, categories, tags, securities
5. Import transactions with splits
6. Import prices
7. Compute running balances (SQL window function)
8. Process lot tracking (FIFO for buys/sells)
9. Mark orphaned entities (deleted from source)
10. Record import in history (retains last 20 imports)

### Import History

The last 20 imports are retained in `importHistory` with:

- QIF file hash (for duplicate detection)
- Summary counts (accounts, transactions, etc.)

Note: Entity-level change tracking (added/modified/orphaned per entity) is stubbed but not yet wired up. See
F-qif-transfer-resolution for planned work.

### Orphan Management

When entities disappear from the QIF file on reimport:

- `stableIdentities.orphanedAt` is set (soft delete)
- Entity can be restored if it reappears in a future import
- Orphaned transactions cascade to orphan their splits

### Key Files

- `cli.js` - CLI entry point
- `import.js` - Import orchestration
- `import-lots.js` - Investment lot tracking (FIFO)
- `import-history.js` - Import history tracking (last 20)
- `stable-identity.js` - Stable ID generation and management
- `signatures.js` - Entity signature computation for matching
- `Matching.js` - Entity matching during reimport
- `orphan-management.js` - Orphan detection and restoration
- `holdings.js` - Historical holdings queries
- `rollback.js` - Rollback support (restore from orphaned state)
