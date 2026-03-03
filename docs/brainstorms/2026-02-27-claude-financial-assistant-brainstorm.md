---
date: 2026-02-27
topic: claude-financial-assistant
see-also: 2026-03-03-investment-analysis-brainstorm.md
---

# Financial Query Language & Claude Assistant

## What We're Building

A query language for financial data analysis, with a mechanical parser and execution engine that runs against the app's
Redux state. The query language is the core artifact — human-readable, machine-parseable, saveable, shareable.

Instead of building dozens of specialized report screens, we build one generic results view and a query language that
drives it. Users get the full analytical power of the app through queries rather than through complex pre-built UIs.

The query language (not Claude) is the center of gravity. Claude is one producer of queries. Power users can write them
directly. Communities can share them.

## Architecture

```
                         ┌─────────────────────┐
  Natural Language ────→ │   Claude: Formulate  │──→╮
                         └─────────────────────┘   │
                                                    ↓
  Power User ──────────────────────────────→  Surface Syntax
                                                    ↓
  Saved Query File ────────────────────────→  Surface Syntax
                                                    ↓
                                              ┌──────────┐
                                              │  Parser   │
                                              └────┬─────┘
                                                   ↓
                                                  IR
                                                   ↓
                                          ┌─────────────────┐
                                          │ Execution Engine │
                                          └────────┬────────┘
                                                   ↓
                                           Selectors / Redux
                                                   ↓
                                          Tree / Table Results
                                                   ↓
                                    ┌──────────────────────────┐
                                    │  Claude: Summarize       │
                                    │  Claude: Suggest queries  │
                                    └──────────────────────────┘
                                                   ↓
                                              Back to user
```

## Plan A: Query Engine — COMPLETE

Parser + validator + expression evaluator + execution engine + pipeline. 13 Tagged/TaggedSum types, 604 tests.

See `docs/architecture/financial-query-language.md` for full architecture documentation.

## Result Viewing (Plan B scope)

The goal is not a new page alongside existing reports — it's a **generic QueryResultPage that replaces them**.
CategoryReportPage and InvestmentReportPage become saved queries rendered by the same generic component. This means the
result view layer must be a superset of what existing report pages provide.

**What must be replicated from existing reports:**

- **DataTable with tree drill-down** — exists for transactions and holdings. A generic page must produce the same tree
  structures from IR metadata.
- **Interactive filter refinement** — existing filter chips (date, category, account, groupBy, search) modify Redux
  state and re-run selectors live. Query results must have the same interactivity, not just static output. The IR
  specifies which filters are available.
- **Column definitions + cell renderers** — current report columns have inline renderers dispatching on domain-specific
  TaggedSum types (CategoryTreeNode vs HoldingsTreeNode). Generalizing this is the hardest open question.
- **UI state** — column sizing, column order, tree expansion, highlighted row. Must scope per-query via viewId, same as
  existing reports.

**New view types needed:**

- **Scalar displays** — some queries produce a single number ("savings rate: 82.2%"), not a table.
- **Comparison views** — side-by-side or diff-style display for "this quarter vs last."
- **Graphing/charting** — time series, bar charts, pie charts. Deferred to a separate spike but the IR metadata design
  must accommodate them.

The IR's computation type determines which view renders. Architecture stays clean: presentation-only components,
selectors, mutations via `post(Action.X(...))`.

## Spike 5 Findings (Plan B reference)

**Commit:** `019671da` (branch `worktree-spike-query-result-view`)

### What the spike proved

- **Generic cell renderers work.** The `leafAccessor`/`groupAccessor` pair replaces all TaggedSum-specific cell dispatch
  logic. Investment report: 9/9 columns fully expressible. Category report: 6/7 columns fully expressible (action
  column needs custom `cell` override for ACTION_LABELS — the escape hatch handles it).
- **Five metadata primitives suffice for both domains:**
    - `showAggregate.onlyWhenGroupBy` — restricts group-row values to a specific groupBy dimension
    - `firstChildFallback` — peeks at first child leaf for group rows sharing a property
    - `staleFn` — extracts stale-price indicator per row
    - `truncatePath` — strips parent path for category display
    - `emptyForLeaf`/`emptyForGroup` — conditional visibility per row type
- **Filter chips are registry-driven.** `FILTER_COMPONENTS` maps filter IDs to React components. Metadata specifies
  `filters: ['date', 'category', 'account', 'groupBy', 'search']` — the page renders exactly those chips.
- **View type dispatch is trivial.** `VIEW_COMPONENTS` registry maps viewType → component. Adding new view types (e.g.,
  chart) requires one new component + one registry entry.
- **UI state scoping works unchanged.** Tree expansion, column sizing, column order, highlighted row — all driven by
  `viewId`-scoped Redux state via existing `S.UI.*` selectors and `Action.SetViewUiState`. No new infrastructure
  needed.

### What the spike didn't prove

- **No rendering test.** Components are prototyped but not mounted in the app or tested against real data.
- **Execution engine integration.** Scalar and comparison values are hardcoded placeholders.
- **Routing.** How queries navigate to QueryResultPage is not explored.
- **Column sorting.** Generic columns use `accessorKey: 'id'` as a placeholder.
- **GroupBy switching.** Runtime behavior (re-running selector, toggling column visibility) wasn't tested end-to-end.

### IR metadata shape (emerged)

```
{
  viewType: 'tree' | 'scalar' | 'comparison',
  domain: 'transactions' | 'holdings',
  selector: (state, viewId) -> treeData,
  isLeaf: node -> Boolean,
  filters: ['date', 'category', 'account', 'groupBy', 'search', 'asOfDate'],
  groupByItems: [{ id, label }],
  defaultGroupBy: String,
  hiddenColumnsByGroup: { [groupBy]: { [columnId]: Boolean } },
  columns: [{
    id, header, type, size, minSize,
    leafAccessor: node -> value,
    groupAccessor: node -> value,
    emptyForLeaf, emptyForGroup, truncatePath, resizable,
    staleFn: row -> Boolean,
    showAggregate: { onlyWhenGroupBy: String },
    firstChildFallback: leafNode -> value,
    cell: Component  // escape hatch for fully custom renderers
  }]
}
```

### Spike 5 design decisions

| Decision                               | Rationale                                                                |
|----------------------------------------|--------------------------------------------------------------------------|
| Accessor functions, not path strings   | Functions handle nested access, TaggedSum extraction, computed values.   |
| `cell` escape hatch per column         | 1 of 16 columns needs fully custom rendering. Avoids over-generalizing.  |
| Renderer factory pattern               | `(colMeta, isLeaf) -> CellComponent`. Factories close over metadata.     |
| Filter registry, not inline config     | Filter components are complex. Registry maps IDs to existing components. |
| Hardcoded domain knowledge in metadata | Metadata is domain-specific; the page and column builder are generic.    |

### Production considerations

1. **Metadata generation from IR.** Production path: IR execution engine produces metadata + data.
2. **Sorting.** Generic columns need sort comparators using accessor functions.
3. **Existing report pages.** CategoryReportPage and InvestmentReportPage become thin wrappers or disappear.
4. **Chart view type.** `VIEW_COMPONENTS` registry makes adding charts straightforward.

## Claude Integration (deferred)

Three roles, each with a clean text-in/text-out interface:

- **Formulate** — user describes intent → Claude produces query text. Requires Claude to know the schema and computation
  catalog. Spike 2 proved Haiku can produce valid queries from ~180 lines of schema + syntax reference + 4 examples.
- **Summarize** — query results → Claude produces natural language interpretation.
- **Suggest** — query results → Claude suggests 2-3 follow-up queries in the query language.

The chat interface is **deferred**. Users can formulate queries in a separate Claude session and paste them into the
app.

## Open Questions

- **Parameterization syntax** — how do relative dates, "all dining categories", account groups work in the surface
  syntax?
- **Community sharing mechanism** — git repo? in-app marketplace? URL import?
- **Alternative surface syntax** — the current DSL is structurally close to the IR. Worth exploring a more distinct
  format for different audiences?

## Plan Sequence

Four plans, sequenced by dependency. Plan A is complete.

```
Plan A (DONE) → Plan C → Plan B → Plan D
  query engine    positions     result views    investment views
                  + metrics     (generic)       (time series,
                                                 capital gains)
```

### Plan A: Query Engine — COMPLETE

Parser + execution engine + validation + expression evaluator. Fully typed with 13 Tagged/TaggedSum types.

See `docs/architecture/financial-query-language.md`.

### Plan C: Position entity + metric computations (no UI changes)

Defined in `docs/brainstorms/2026-03-03-investment-analysis-brainstorm.md`. Rename Holding → Position, add enrichment
(realized gains, dividends, performance metrics), metric registry, query language extensions (`from positions`,
`order by`, `limit`, `metrics`, `time series`).

**Why C before B:** C renames Holding → Position throughout. B builds generic views referencing those types. Doing C
first means B builds against the final names — no rename churn.

### Plan B: Generic result views (replaces report pages)

**Scope:**

- Metadata-driven column builder with generic cell renderer types (spike 5 reference code)
- QueryResultPage with view type dispatch (tree, scalar, comparison)
- ScalarDisplay and ComparisonView components
- Filter chip registry driven by IR metadata
- Migration: CategoryReportPage and InvestmentReportPage become saved query configs rendered by QueryResultPage
- viewId / UI state management for query results

**End state:** Two existing report pages replaced by one generic page. Scalar and comparison views working.
New queries get result views automatically from IR metadata.

**Reference worktree:** `spike-query-result-view`

### Plan D: Investment-specific views

Defined in `docs/brainstorms/2026-03-03-investment-analysis-brainstorm.md`. Time series view + capital gains view +
tax lot detail. Depends on both Plan B (generic page infrastructure) and Plan C (position data).

### Not planned yet

- **Claude integration** (formulate, summarize, suggest) — deferred per settled decisions
- **Charting** — independent spike/plan when needed
- **Parameterization** — can be added to Plan A's parser or as a follow-up

## Settled Decisions

- **Query language is the core artifact** — not Claude's output format, not JSON blobs. A real language with syntax and
  a parser.
- **Claude has three narrow roles** — formulate, summarize, suggest follow-ups. All text-in/text-out.
- **Chat interface is deferred** — query language + parser + execution first. Paste queries for now.
- **Redux first** — query against in-memory Redux state. Selectors are the execution layer.
- **Flexible result views** — DataTable with tree drill-down is the primary view, but scalar results, comparisons, and
  charts need their own components. IR computation type determines which view renders.
- **Schema as vocabulary** — SQLite schema defines the nouns/filters. Selector catalog defines the computations. Grammar
  is stable; new computations = new registry entries, not grammar changes.

## Spike Status

Spikes 1-3 validated Plan A (now implemented). Spike 5 validated Plan B.

| Spike | Question                                                                                 | Answer                                         |
|-------|------------------------------------------------------------------------------------------|------------------------------------------------|
| 1     | Do existing selectors cover the target questions?                                        | Yes — implemented in Plan A                    |
| 2     | Can we design a parseable surface syntax? Can Claude produce valid queries?              | Yes — implemented in Plan A                    |
| 3     | Can we validate queries against user data with useful error messages?                    | Yes — implemented in Plan A                    |
| 5     | Can a generic page replace both report pages?                                            | Yes — spike 5 findings above, Plan B reference |
| 6     | Position enrichment: do realized gains, dividends, IRR compute correctly from real data? | PENDING — see investment analysis brainstorm   |

## Knowledge Destination

| Destination                                                   | Content                                                           | Status |
|---------------------------------------------------------------|-------------------------------------------------------------------|--------|
| `architecture:` docs/architecture/financial-query-language.md | Query language architecture, layer separation, execution model    | DONE   |
| `decisions:` append                                           | Claude's role scoped to three narrow interfaces; chat UI deferred | DONE   |
