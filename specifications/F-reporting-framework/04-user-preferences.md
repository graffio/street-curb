# User Preferences Storage

## The Problem

SQLite database is ephemeral—recreated from QIF each import. But users need to persist:

| Data | Examples |
|------|----------|
| **Custom hierarchies** | Asset class trees, tag hierarchies |
| **Assignments** | Security → asset class, security → strategy |
| **Report configs** | Saved filter settings, column layouts |
| **Budgets** | Category → monthly target |
| **Scheduled transactions** | Recurring bills, paychecks |
| **Goals** | Target amount, date, linked accounts |

This data doesn't come from QIF and must survive reimport.

---

## Options

| Option | How it works | Pros | Cons |
|--------|--------------|------|------|
| **A. Two SQLite files** | `data.sqlite` (from QIF, ephemeral) + `preferences.sqlite` (persists) | Clear separation | Merge/join semantics unclear; two files to manage |
| **B. JSON export/import** | User explicitly saves/loads preferences as JSON file | Transparent, portable | Manual; users forget and lose data |
| **C. IndexedDB** | Browser storage, more robust than localStorage | Survives browser refresh; larger quota | Per-device, no sync; browser-specific |
| **D. Preserve tables on reimport** | Preferences in same SQLite; reimport replaces transaction tables only | Single file | Requires careful migration; reimport is destructive |
| **E. Hybrid: SQLite + IndexedDB** | Preferences in IndexedDB, transactions in SQLite | Each store optimized for its use case | Two storage mechanisms to maintain |

---

## Recommendation

**Option D (Preserve tables on reimport)** with careful implementation:

1. **Schema design**: Separate "imported" tables from "user" tables
   ```
   -- Imported from QIF (replaced on reimport)
   transactions, accounts, categories, securities, prices

   -- User preferences (preserved on reimport)
   asset_class_assignments, strategy_assignments, budgets,
   scheduled_transactions, goals, report_configs, tag_hierarchies
   ```

2. **Reimport process**:
   - Drop and recreate imported tables
   - Keep user tables intact
   - Validate foreign keys (e.g., assignment references deleted security)
   - Surface orphaned references to user for cleanup

3. **Backup before reimport**: Auto-save `.sqlite.bak` before destructive operation

**Why not IndexedDB?**
- Keeps everything in one place
- SQL queries can join preferences with transaction data
- Portable (user can back up single file)

**Risk**: User deletes SQLite file thinking "I'll reimport anyway" and loses preferences. Mitigation: clear documentation, backup prompts.

---

## Schema Sketch

```sql
-- User-defined hierarchies
CREATE TABLE tag_hierarchies (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES tag_hierarchies(id),
  name TEXT NOT NULL
);

-- Security classifications (user overrides reference data)
CREATE TABLE asset_class_assignments (
  security_id TEXT PRIMARY KEY,
  asset_class_id TEXT NOT NULL,
  source TEXT NOT NULL  -- 'reference' | 'user'
);

CREATE TABLE strategy_assignments (
  security_id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL
);

-- Budgets
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  period_type TEXT NOT NULL,  -- 'monthly' | 'quarterly' | 'annual'
  amount REAL NOT NULL,
  rollover BOOLEAN DEFAULT FALSE
);

-- Saved report configurations
CREATE TABLE report_configs (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Goals
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  target_date TEXT,
  linked_account_ids TEXT  -- JSON array
);
```

---

## Open Questions

1. **Reference data for asset classes**: Do we ship a default hierarchy, or start empty?
2. **Conflict resolution**: What if reimported security has different type than user's asset class assignment?
3. **Cross-device sync**: Out of scope for now, but architecture should not preclude it
4. **Export preferences**: Should user be able to export just preferences (for sharing setups)?
