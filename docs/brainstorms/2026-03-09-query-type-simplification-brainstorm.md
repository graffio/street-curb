# Query Type Simplification

**Date:** 2026-03-09
**Status:** Brainstorm

## What We're Building

Simplify the FinancialQuery / QueryResult type system from 6 query types + 6 result types + 2 dispatch layers to 3 query types producing tree nodes directly. One unified page component renders all results.

**Before:** 6 FinancialQuery variants → QueryResult (6 variants) → QueryResultTree (2 variants) → 5 page components
**After:** 3 FinancialQuery variants → tree nodes directly → 1 page component (with optional chart)

## Why This Matters

- The query→result mapping is nearly 1:1 — QueryResult is ceremony, not abstraction
- AccountQuery/FilteredEntities is a demo with no real use case
- ExpressionQuery/Scalar is hypothetical — no UI, no seed query, Claude can compute ratios in text
- RunningBalanceQuery duplicates what register pages already do (and do better — with transfer nav, search, keyboard shortcuts)
- Pivot is transaction-only and not drillable — but categories are hierarchical, so 2D results should be trees too
- SnapshotQuery producing flat `[{date, total}]` prevents multi-line charts ("spending by category over time")

## Settled Decisions

### Remove 3 query variants and their result types
- **AccountQuery / FilteredEntities** — accounts list is too thin to justify a query type
- **ExpressionQuery / Scalar / IRExpression / resolve-expression.js** — hypothetical, second expression AST, recursive depth tracking, all for something with no UI
- **RunningBalanceQuery / RunningBalance** — register pages handle this outside the query engine

### Remove QueryResult and QueryResultTree TaggedSums
- Query type + config already determines result shape — the intermediate type is boilerplate
- Engine returns tree nodes directly; page components paired via metadata
- No result-to-page dispatch layer

### Unify tree and pivot
- CategoryAggregate gains optional `columns?: {[col]: Number}`
- 1D grouping: each node has `{total, count}` (columns undefined)
- 2D grouping: each node has `{total, count, columns: {'2023': N, '2024': N}}` — same tree, drillable
- Current flat Pivot grid replaced by hierarchical tree with per-column values at every level

### SnapshotQuery produces tree output
- Output changes from flat `[{date, total}]` to CategoryTreeNode tree where columns = date points
- Gains optional `grouping?` field — without it, single-row total; with `IRGrouping('category')`, per-category breakdown
- Enables multi-line charts naturally (one line per tree node)

### TransactionQuery.grouping becomes required
- No grouping = not a valid TransactionQuery (registers exist for ungrouped transaction views)

### One page component
- TreePage renders any tree with any number of value columns
- Expand/collapse always works
- Optional chart when columns represent ordered date points
- Replaces: QueryResultPage, PivotResultPage, TimeSeriesResultPage, RunningBalanceResultPage, FilteredEntitiesResultPage

## Implementation Steps

### Step 1: Delete dead weight
Remove AccountQuery, ExpressionQuery, RunningBalanceQuery and everything they touch:
- Type definitions: FinancialQuery variants, QueryResult.Scalar/FilteredEntities/RunningBalance, IRExpression
- Engine: resolve-expression.js, expression/account/running-balance paths in run-financial-query.js
- Pages: FilteredEntitiesResultPage.jsx, RunningBalanceResultPage.jsx
- Seed queries: bank_accounts, running_balance
- Tests: expression-evaluator.tap.js, related test sections
- Description: remove variant handlers in to-financial-query-description.js
- Chip merge: remove variant handling (if any)

Pure deletion. ~33 files touched, mostly removing imports and dead code.

### Step 2: Remove QueryResult / QueryResultTree indirection
- Engine returns tree nodes directly instead of wrapping in QueryResult.Identity/Pivot/TimeSeries
- Page components consume tree nodes directly
- Delete QueryResult and QueryResultTree type definitions
- Update selectors.js to pass through tree nodes
- Update report-metadata.js page dispatch

Refactoring, no new logic.

### Step 3: Unify tree/pivot
- CategoryAggregate gains `columns?` field
- Engine builds drillable CategoryTreeNode trees for 2D grouping (instead of flat grid)
- category-tree.js builds trees where each Group node aggregates per-column values from children
- PivotResultPage merges into QueryResultPage (which becomes TreePage)
- TreePage renders dynamic value columns based on aggregate shape

This is the big step — new tree-building logic for 2D case.

### Step 4: SnapshotQuery → tree output
- SnapshotQuery gains optional `grouping?` field in type definition
- Engine produces CategoryTreeNode tree with columns = date points
- Without grouping: single root node with per-date-point columns
- With grouping: tree of category nodes, each with per-date-point cumulative values
- TimeSeriesChart adapts to render multiple series from tree nodes
- Chart opt-in signal needed (query type or metadata flag)

## Diagrams

See PlantUML diagrams in this directory:
- `query-simplification-types.puml` — type relationships
- `query-simplification-flow.puml` — data flow

## Deferred (out of scope, flagged for future)

- **ComputedRow on trees** — PivotExpression currently evaluates against flat grid; needs rethinking for tree nodes
- **Multi-series chart rendering** — TimeSeriesChart handles one line; needs N lines for grouped snapshots
- **Chart opt-in signal** — how TreePage knows columns are dates vs categories (query type? metadata flag?)
- **Running balance display** — could be a toggle on register reports grouped by date

## Knowledge Destination

- `architecture:` docs/architecture/financial-query-language.md (update) — the architecture fundamentally changes
- `decisions:` append — removal rationale for AccountQuery, ExpressionQuery, RunningBalanceQuery

## Open Questions

1. **Step 3 tree-building for 2D**: When building a CategoryTreeNode tree with columns, how do subcategory aggregates roll up? E.g., Food:Groceries has `columns: {'2023': -1800}` — does Food's aggregate sum children per column? (Probably yes, same as how `total` rolls up today.)
2. **SnapshotQuery without grouping**: Is a single-row tree the right shape, or should this be a special case? A tree with one node feels awkward.
3. **Naming**: Do we rename QueryResultPage to TreePage, or keep the existing name? What about the file name?

## Blast Radius

| Category | Files |
|---|---|
| Type definitions | 11 |
| Engine implementation | 5 |
| Page components | 7 |
| Seed queries / metadata | 2 |
| Store / selectors | 1 |
| Tests | 7 |
| **Total** | **~33** |

## Spike Findings (1)

**Goal:** Validate that CategoryTreeNode trees can carry per-column values and replace flat Pivot grids.

**Result:** Validated. The approach works cleanly with minimal changes.

### What was built
1. **CategoryAggregate** gained optional `columns: Object?` field — `{total, count, columns: {'2024': -175, '2025': -250}}`
2. **`build2DTransactionTree(rowDim, colDim, transactions)`** in category-tree.js builds hierarchical trees with per-column aggregation
3. **`makeColumnAggregator(getColumnKey)`** factory produces an aggregation function that tracks per-column values and rolls up from children — same pattern as `collectTransactionTotals` but with column bucketing
4. **Engine wiring:** `collectTransactionQueryResult` routes `grouping.columns` to `build2DTransactionTree` instead of `collectPivotResult`

### What works
- Tree hierarchy preserved — `Food` parent has `Food:Groceries` and `Food:Restaurants` children
- Per-column values at every node — leaf and parent both carry `columns`
- Parent rollup correct — `Food.columns['2024']` = sum of children's 2024 values
- `<Others>` synthetic grouping still works for mixed direct+child transactions
- Existing 1D tree tests unaffected (585 passing)
- Column key extractors: `year`, `quarter`, `month` — reuses existing `toMonthKey`

### What breaks (expected)
- **11 pivot tests fail** — they assert `QueryResult.Pivot` shape (columns array, rows array, cells grid, rowTotals, computed)
- **ComputedRow evaluation** — `evaluatePivotExpression` works against flat grid `cells[row][col]`, not against tree node aggregates. Deferred per brainstorm.

### Key design observations
- **Zero new types needed.** `CategoryAggregate` + optional field was sufficient — no new "2DAggregate" or "PivotNode" type.
- **`aggregateTree` is the right seam.** The `@graffio/functional` `aggregateTree` function accepts any aggregation fn, so swapping in `makeColumnAggregator` was a one-line change to the tree pipeline.
- **Column dimension is flat.** `columnKeyExtractors` don't need `getParent` — columns are always flat (years, quarters, months). This is a fundamental asymmetry: rows can be hierarchical, columns never are.
- **`toGroupNode` required no changes.** It calls `toCategoryAggregate(aggregate)` which just passes through — adding `agg.columns` to the CategoryAggregate constructor was the only touch point.
- **`collectPivotResult` becomes dead code** after this change. It can be deleted along with `QueryResult.Pivot` and `PivotResultPage`.

### Open questions answered
1. **Q: How do subcategory aggregates roll up per-column?** A: Same as `total` — `makeColumnAggregator` sums children's column values key-by-key. Confirmed in tests.
2. **Q: Should `collectPivotResult` be kept as fallback?** A: No. The 2D tree is strictly more capable (hierarchical + drillable). Delete it in Step 3 of the real implementation.

### Risks for real implementation
- **ComputedRow needs rethinking.** Current `PivotExpression.RowRef('Food')` references flat row names. In a tree, "Food" is a node with children — `RowRef` needs to target `node.aggregate.columns[col]` instead of `grid['Food'][col]`. This is a design problem, not a code problem.
- **PivotResultPage renders flat grid.** Replacing it with a tree-aware table is the real UI work — not covered by this spike.
