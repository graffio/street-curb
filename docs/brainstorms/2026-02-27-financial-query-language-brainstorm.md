---
date: 2026-02-27
topic: financial-query-language
revised: 2026-03-07
---

# Financial Query Language & Analysis

## What We're Building

A query language for financial data analysis. The execution engine takes FinancialQuery IR, runs it against Redux state,
and produces typed results that drive views directly. Users get analytical power through queries — not through dozens of
specialized report screens.

## Plan Status

```
Plan A (DONE) → Plan C (DONE) → Plan B (DONE)         → Plan D (FUTURE)
  query engine    positions        simplified IR +         investment views
  (old types      + metrics        engine drives views     (charts, capital
   removed)                        (FinancialQuery)         gains, lots)
```

Plans A–C implemented and working. Plan A's old types (Query, IRSource, IRDomain, IRComputation, IROutput) have been
removed — FinancialQuery is the only IR type system. Architecture documented in
`docs/architecture/financial-query-language.md`.

## Plan D: Investment Views — future reports

With page-per-type infrastructure and the engine in place, these are just new seed queries + column definitions:

- Portfolio value over time — SnapshotQuery → TimeSeriesResultPage (chart already built)
- Capital gains report — PositionQuery with tax classification grouping → QueryResultPage (Identity/tree)
- Tax lot detail — PositionQuery with lot-level grouping → QueryResultPage (Identity/tree)
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

### Unit tests needed

- ~~**`_mergeFinancialQueryChipFilters` (selectors.js)**~~ — DONE: Extracted to `merge-chip-filters.js` (variant-agnostic),
  72 unit tests in `merge-chip-filters.tap.js`
- ~~**`to-financial-query-description.js`**~~ — DONE: 22 unit tests in `to-financial-query-description.tap.js`
- **`toPivotColumns` / `toPivotData` (PivotResultPage.jsx)** — pure factory functions that build TanStack column defs
  from pivot result shapes. Untested.

### Integration test gaps

- **Exhaustive chip × variant matrix** — each variant has at least one chip test, but not every chip on every variant.
  Missing combinations include: Category chip on Pivot, GroupBy chip on Pivot, Date chip on AccountQuery (not wired),
  Category chip on RunningBalance (not wired), GroupBy on positions, etc.
- **Combined multi-chip filters** — no test applies multiple chip types simultaneously (e.g., date + account + category)
- ~~**Empty results**~~ — DONE: `filter producing zero rows does not crash` test on TransactionQuery/Identity

### Failing tests

- **4 pre-existing failures in `ir-filter-evaluation.tap.js`** — these predate the FinancialQuery work and have not been
  investigated. They need to be fixed, not ignored.
- **TimeSeriesResultPage date chip interaction** — removed from integration tests because agent-browser couldn't
  reliably click the Date: chip (ambiguous selector matched the DataTable "Date" column header). This is a test
  infrastructure problem to solve, not an acceptable permanent gap. The date filter on TimeSeriesResultPage is arguably
  the most important date filter since it controls which monthly snapshots appear.

## Open Questions

- **Cross-column expressions** — YoY growth per category needs access across column buckets. Post-pivot transform?
  ComputedRow can only reference rows within a single column.
- **Sparse pivot data** — missing category in a month produces NaN. Pre-populate all rows with 0, or treat missing
  RowRef as 0?
- **Parameterization syntax** — how do relative dates, "all dining categories", account groups work?
- **Community sharing mechanism** — git repo? in-app marketplace? URL import?
- **Time series performance** — deferred to profiling. Build it, measure, add SQLite cache only if needed.
