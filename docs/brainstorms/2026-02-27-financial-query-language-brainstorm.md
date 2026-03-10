---
date: 2026-02-27
topic: financial-query-language
revised: 2026-03-09
---

# Financial Query Language & Analysis

## What We're Building

A query language for financial data analysis. The execution engine takes FinancialQuery IR, runs it against Redux state,
and produces typed results that drive views directly. Users get analytical power through queries — not through dozens of
specialized report screens.

## Plan Status

```
Plan A (DONE) → Plan C (DONE) → Plan B (DONE) → Simplification (DONE) → Plan D (FUTURE)
  query engine    positions        simplified IR    3 variants, unified     investment views
  (old types      + metrics        + engine drives  tree output, one page   (charts, capital
   removed)                        views                                     gains, lots)
```

Plans A–C and query type simplification implemented. FinancialQuery has 3 variants (TransactionQuery, PositionQuery,
SnapshotQuery). All produce tree nodes directly — no QueryResult/QueryResultTree indirection. One unified
QueryResultPage renders all results. Architecture documented in `docs/architecture/financial-query-language.md`.

## Plan D: Investment Views — future reports

With the unified tree page and engine in place, these are just new seed queries + column definitions:

- Portfolio value over time — SnapshotQuery with chart (already works via metadata.chart)
- Capital gains report — PositionQuery with tax classification grouping → QueryResultPage
- Tax lot detail — PositionQuery with lot-level grouping → QueryResultPage
- Lot-level tree drill-down — same PositionQuery pattern, deeper getChildRows

## Not Planned Yet

- LIFO cost basis method and user-configurable default lot strategy + per-sale overrides
- Tag import and investment tagging (high priority — tags table exists in schema)
- Tax schedule/overview reports
- Charting (independent of investment analysis)
- Strategy entity for multi-leg options and managed position lifecycle
- Claude integration (formulate, summarize, suggest) — three narrow text-in/text-out roles
- Parameterization syntax (relative dates, account groups)
- Community sharing mechanism
- Search (find + highlight matches in place, without filtering rows out) — distinct from the Filter chip which removes non-matching rows

## Test Gaps

### Integration test gaps

- **Exhaustive chip × variant matrix** — each variant has at least one chip test, but not every chip on every variant.
  Missing: GroupBy on positions, combined multi-chip filters (date + account + category simultaneously).
- **4 pre-existing failures in `ir-filter-evaluation.tap.js`** — predate FinancialQuery work. Need to be fixed.
- **Snapshot date chip interaction** — removed from integration tests because agent-browser couldn't reliably click the
  Date: chip (ambiguous selector matched the DataTable "Date" column header). Test infrastructure problem.

## Open Questions

- **Cross-column expressions** — YoY growth per category needs access across column buckets. IRComputedRow can only
  reference rows within a single column currently.
- **Sparse data** — missing category in a column produces NaN. Pre-populate with 0, or treat missing RowRef as 0?
- **Parameterization syntax** — how do relative dates, "all dining categories", account groups work?
- **Community sharing mechanism** — git repo? in-app marketplace? URL import?
- **Multi-series chart rendering** — TimeSeriesChart handles one line; grouped snapshots need N lines (one per tree node)
- **Floating-point accumulation** — JS `reduce` over many `amount` floats drifts by ~1 cent vs SQL SUM. Visible in
  integration tests (Jan/Sep skipped). Rounding to cents is wrong for crypto (8-18 decimals). Needs precision-aware or
  integer-arithmetic approach. Affects: `collectTransactionTotals`, `makeColumnAggregator`, `makeSnapshotAggregator`,
  `collectBalanceSnapshot`.
