# cli-qif-to-sqlite

Import QIF financial data to SQLite with stable identity matching.

## Usage

```bash
# Import QIF file
node src/cli.js import -d database.db file.qif

# Show schema
node src/cli.js schema -d database.db

# Show import history
node src/cli.js history -d database.db

# Show tables
node src/cli.js tables -d database.db
```

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

### Key Files

- `cli.js` - CLI entry point
- `import.js` - Import orchestration
- `import-lots.js` - Investment lot tracking (FIFO)
- `stable-identity.js` - Stable ID generation and management
- `Matching.js` - Entity matching during reimport
- `holdings.js` - Historical holdings queries
