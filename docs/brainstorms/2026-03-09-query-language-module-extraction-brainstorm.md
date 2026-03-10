# Query Language Module Extraction

**Date:** 2026-03-09
**Status:** Brainstorm

## What We're Building

Extract the query language engine from `quicken-web-app/src/query-language/` into its own `@graffio/query-language` module. The engine is already pure (LookupTables in, tree nodes out) — this makes the boundary explicit and compiler-enforced.

## Why This Matters

The query language is an independent, complicated subsystem. A module boundary is documentation the compiler enforces — a reader sees `@graffio/query-language` and knows: self-contained, read it independently. Today the clean separation exists because the code was written carefully; a module makes it structural.

## Settled Decisions

### Module structure

New module at `modules/query-language/` with package name `@graffio/query-language`. Auto-registered via workspace glob `"modules/*"`. Single dependency: `@graffio/functional`.

### What moves into the module

**Engine (4 files):**
- `run-financial-query.js` — executes IR → result
- `build-filter-predicate.js` — compiles IRFilter → predicate
- `to-financial-query-description.js` — IR → description string
- `merge-chip-filters.js` — merges chip state into IR

**Tree building (1 file):**
- `category-tree.js` (from `src/utils/`)

**Position computations (8 files):**
- `compute-positions.js`, `build-positions-tree.js`, `metric-registry.js`
- `compute-realized-gains.js`, `compute-dividend-income.js`, `compute-irr.js`, `compute-benchmark-return.js`, `compute-total-return.js`

**IR type definitions (6 files, from `type-definitions/ir/`):**
- `ir-financial-query.type.js`, `ir-grouping.type.js`, `ir-filter.type.js`, `ir-date-range.type.js`, `ir-computed-row.type.js`, `ir-pivot-expression.type.js`

**Generated IR types (7 files + index):**
- All `src/query-language/types/` files including `field-types.js`

### Entity types: generate into both modules

The engine uses Tagged type constructors and static methods from quicken-web-app entity types:
- `Transaction.enrichAll(...)`, `EnrichedAccount.POSITION_BALANCE_TYPES`
- `Position(...)` constructor, `Position.matchesSearch(...)`
- `Price.isStale(...)`, `LookupTable(arr, Price, 'date')`

Resolution: use `type-mappings.js` multi-target to generate entity types the engine needs into both `quicken-web-app/src/types/` and `query-language/src/types/`. This is the existing pattern (`field-types.js` already generates to both targets).

Entity types that need dual generation:
- `transaction.type.js`, `position.type.js`, `price.type.js`, `enriched-account.type.js`
- `account.type.js` (used by Transaction.enrichAll and position enrichment)
- `category.type.js` (used by Transaction.enrichAll)
- `security.type.js` (used by compute-positions)
- `lot.type.js`, `lot-allocation.type.js` (used by compute-positions)
- `metric-definition.type.js` (used by metric-registry)

Structural Tagged types — two copies of the same factory produce identical objects.

### Output types move to query module

`CategoryTreeNode`, `CategoryAggregate`, `PositionTreeNode`, `PositionAggregate` are the engine's output contract. Their type definitions move to `query-language/type-definitions/`. Consumers just use the returned objects — they don't import the constructors.

### Test data stays in quicken-web-app (for now)

Fixtures remain at `quicken-web-app/dist/test-fixtures/`. Seed queries remain inline in `report-metadata.js`. Query-language tests reference fixtures via relative path (`../../quicken-web-app/dist/test-fixtures/`). Extracting test data to a shared top-level directory is deferred — no current consumer needs it, and it would add module resolution complexity (non-workspace importing `@graffio/query-language`).

### What stays in quicken-web-app

- `selectors.js` — memoized Redux wrapper, calls `runFinancialQuery()`
- `report-metadata.js` — UI metadata (column layouts, chip configs, seed queries)
- Page components, filter chips, TimeSeriesChart
- All non-engine entity types (View, Action, TabLayout, etc.)

### Module API surface

```
import { runFinancialQuery } from '@graffio/query-language'
import { toFinancialQueryDescription } from '@graffio/query-language'
import { MergeChipFilters } from '@graffio/query-language'
import { buildFilterPredicate } from '@graffio/query-language'
import { IRFinancialQuery, IRFilter, IRGrouping, IRDateRange, ... } from '@graffio/query-language'
```

**In:** `FinancialQuery` IR + LookupTables (accounts, transactions, categories, securities, lots, lotAllocations, prices)
**Out:** `{nodes, columns?, computed?, snapshots?, source}`

### Tests move with the code

Test files in `test/query-language/` move to `modules/query-language/test/`. Tests reference fixtures via `../../quicken-web-app/dist/test-fixtures/`.

## Knowledge Destination

- `architecture:` docs/architecture/financial-query-language.md (update) — document the module boundary and import paths
- `decisions:` append — rationale for module extraction over folder-only separation

## Resolved Questions

1. **Test fixtures** → Top-level `quicken-web-app-test-data/` directory shared by all three modules.
2. **Register-row type** → Not used by engine (confirmed via grep). Stays in quicken-web-app.
3. **field-types.js shared enums** → Keep one file, generate to both. Splitting adds complexity for no real benefit — both modules need most of the same enums.

## Open Questions

None.
