# Future Work

Items not yet planned. Each may become a brainstorm or get folded into one.

## Query Engine Enhancements

- **Cross-column expressions** — YoY growth per category needs access across column buckets. IRComputedRow can only
  reference rows within a single column currently.
- **Sparse data handling** — missing category in a column produces NaN. Decide: pre-populate with 0, or treat missing
  RowRef as 0?
- **Parameterization syntax** — relative dates, "all dining categories", account groups. No design yet.
- **Search (find + highlight)** — distinct from Filter chip which removes rows. Search finds and highlights matches in
  place.

## Investment Views (Plan D)

With the unified tree page and engine in place, these are new seed queries + column definitions:

- **Portfolio value over time** — SnapshotQuery with chart (partially works via metadata.chart)
- **Capital gains report** — PositionQuery with tax classification grouping
- **Tax lot detail** — PositionQuery with lot-level grouping
- **Lot-level tree drill-down** — same PositionQuery pattern, deeper getChildRows
- **LIFO cost basis** — user-configurable default lot strategy + per-sale overrides

## Data Management

- **Tag import and investment tagging** — tags table exists in schema but isn't used. High priority.
- **Pre-import snapshots** — retain SQLite backups before each import for recovery.
  See [deferred brainstorm](deferred-2026-02-13-import-snapshots-brainstorm.md).

## UI Polish

- **Keyboard date input refactor** — state machine extraction from tangled React rendering.
  See [deferred brainstorm](deferred-2026-02-19-keyboard-date-input-brainstorm.md).
- **Drawer-hover highlight** — hovering a shortcut row highlights the target UI element.
  See [deferred brainstorm](deferred-2026-02-27-drawer-hover-highlight-brainstorm.md).
- **ARIA compliance** — eslint-plugin-jsx-a11y + fixes for interactive element gaps.
  See [deferred brainstorm](deferred-2026-02-27-aria-compliance-brainstorm.md).

## Platform

- **Claude integration** — formulate, summarize, suggest. Three narrow text-in/text-out roles.
- **Community sharing** — git repo? in-app marketplace? URL import? No design yet.
- **Charting infrastructure** — TimeSeriesChart handles one line; grouped snapshots need N lines (one per tree node).
  Independent of investment analysis.
- **Strategy entity** — multi-leg options and managed position lifecycle.
- **Tax schedule/overview reports**

## Test Gaps

- **Chip x variant matrix** — GroupBy on PositionQuery (goal/securityType) and SnapshotQuery with CategoryFilterChip not
  covered in merge-chip-filters tests.
- **Snapshot date chip interaction** — removed from integration tests due to ambiguous selector (Date chip vs DataTable
  Date column header). Test infrastructure problem, not engine problem.
