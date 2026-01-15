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

| Table               | Key Columns                            | Foreign Keys                                                                       |
|---------------------|----------------------------------------|------------------------------------------------------------------------------------|
| `accounts`          | id, name, type, orphanedAt             | -                                                                                  |
| `categories`        | id, name, isIncomeCategory, orphanedAt | -                                                                                  |
| `tags`              | id, name, color, orphanedAt            | -                                                                                  |
| `securities`        | id, name, symbol, type, orphanedAt     | -                                                                                  |
| `transactions`      | id, date, amount, gainMarkerType       | accountId, transferAccountId → accounts, categoryId → categories, securityId      |
| `transactionSplits` | id, amount, memo, orphanedAt           | transactionId → transactions, categoryId → categories, transferAccountId          |
| `prices`            | id, date, price, orphanedAt            | securityId → securities                                                            |

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
3. Clear derived tables (lots are recomputed each import)
4. Import accounts, categories, tags, securities (INSERT or UPDATE)
5. Import transactions with splits, resolving transfers and gain markers
6. Import prices
7. Compute running balances (SQL window function, excludes orphaned)
8. Process lot tracking (FIFO for buys/sells, excludes orphaned)
9. Mark orphaned entities (deleted from source) in both stableIdentities and data tables
10. Record import in history (retains last 20 imports)

### Import History

The last 20 imports are retained in `importHistory` with:

- QIF file hash (for duplicate detection)
- Summary counts (accounts, transactions, etc.)

Entity-level change tracking reports created/modified/orphaned/restored counts after each import.

### Transfer Resolution

Transfers between accounts (e.g., `[Checking]` in category field) are resolved:

- `transferAccountId` links to the destination account
- Works for both transactions and splits
- `gainMarkerType` captures CGLong/CGShort/CGMid for capital gains

### Orphan Management

When entities disappear from the QIF file on reimport:

- `orphanedAt` is set in both `stableIdentities` AND the data table (soft delete)
- Running balances and lots exclude orphaned transactions
- Entity can be restored if it reappears in a future import
- Orphaned transactions cascade to orphan their splits

### Key Files

- `cli.js` - CLI entry point with change reporting
- `import.js` - Import orchestration with change tracking
- `import-lots.js` - Investment lot tracking (FIFO)
- `import-history.js` - Import history tracking (last 20)
- `stable-identity.js` - Stable ID generation and management
- `signatures.js` - Entity signature computation for matching
- `Matching.js` - Entity matching during reimport
- `category-resolver.js` - Transfer and gain marker resolution
- `holdings.js` - Historical holdings queries
