---
date: 2026-02-27
topic: financial-query-language
revised: 2026-03-05
---

# Financial Query Language & Analysis

## What We're Building

A query language for financial data analysis. The execution engine takes Query IR, runs it against Redux state, and
produces typed results that drive views directly. Users get analytical power through queries — not through dozens of
specialized report screens.

The query language (not Claude) is the center of gravity. Claude is one producer of queries. Power users can write them
directly. Communities can share them.

## Architecture

```
Natural Language ────→ Claude: Formulate ──→╮
                                            │
Power User ──────────────────────────→  Query IR
                                            │
Saved Query ─────────────────────────→  Query IR
                                            ↓
                                     ┌──────────────┐
                                     │  Validator   │
                                     └──────┬───────┘
                                            ↓
                                   ┌──────────────────┐
                                   │ Execution Engine │
                                   └────────┬─────────┘
                                            ↓
                                      QueryResult
                                            ↓
                                  .match() → View component
                                            ↓
                              Claude: Summarize / Suggest
```

The execution engine is the data pipeline — not selectors, not Redux filter state. The engine takes IR + raw Redux
state, does its own filtering/grouping/aggregation, and returns typed QueryResult variants.

**DSL parser removed** (2026-03-03). No consumer for text DSL — Claude produces IR Tagged values directly from natural
language. Pipeline accepts Query IR directly: validate → execute.

## Plan Status

```
Plan A (DONE) → Plan C (DONE) → Plan B (ACTIVE) → Plan D (FUTURE)
  query engine    positions        engine drives      investment views
                  + metrics        views              (time series,
                                                       capital gains)
```

### Plan A: Query Engine — COMPLETE

Parser + validator + expression evaluator + execution engine + pipeline. 13 Tagged/TaggedSum types, 604 tests.
See `docs/architecture/financial-query-language.md`.

**Key types:** Query, IRSource, IRFilter (TaggedSum), IRDomain (Transactions|Positions|Accounts), IRComputation
(Identity|Compare|Expression|FilterEntities|TimeSeries), IRExpression, IRDateRange, QueryResult, QueryResultTree.

### Plan C: Positions & Metrics — COMPLETE

Merged as `4db428a2`. Defined originally in `2026-03-03-investment-analysis-brainstorm.md` (now absorbed here).

- Holding → Position rename throughout (types, computations, selectors, components)
- Position enrichment: realized gains, dividends, performance metrics (in-memory, memoized)
- Metric registry: total return, IRR, benchmark comparison, alpha
- Query language extensions: `from positions`, `order by`, `limit`, `metrics`, `time series`
- Benchmark is per-position inception-matched using existing price lookup

**Key decisions from Plan C:**

| Decision                                | Rationale                                                                                     |
|-----------------------------------------|-----------------------------------------------------------------------------------------------|
| Position replaces Holding               | One entity, one name. Position covers open + closed + lifecycle.                              |
| Capital gains are position fields       | Realized gains from lot allocations for same (account, security). No domain proliferation.    |
| Metric registry pattern                 | Extensible without grammar changes. `MetricDefinition` Tagged type in LookupTable.            |
| In-memory computation, no schema change | Source data already in Redux. Memoized selectors. Add SQLite cache only if profiling demands. |
| FIFO is the only cost basis method      | Hardcoded in import. Schema ready for LIFO + overrides.                                       |
| `proceedsAllocated` on LotAllocation    | Computed during import alongside `costBasisAllocated`.                                        |

**Spike 6 findings (position enrichment):** All computation paths work on real-shaped fixture data (68 tests). IRR
converges in ~5 iterations. ReinvDiv does NOT double-count — dividend is in `dividendIncome`, new lot's cost basis
offsets in `unrealizedGainLoss`. The 365-day short/long-term boundary is strict (`> 365`, not `>=`).

### Plan B: Engine Drives Views — ACTIVE

**Previous attempt (reverted):** A bridge mapped Query IR to Redux filter state (`selectedAccounts`,
`selectedCategories`, `groupBy`) for existing selectors. This bypassed the engine entirely — it couldn't express
post-aggregation predicates, boolean filter combinations, or any computation the selectors don't already support.
See `decisions.md`: "Query bridge as Redux initializer is insufficient."

**Current approach:** The execution engine is the sole data pipeline. Query IR lives in Redux as the single source of
truth. The engine re-runs on every IR change (memoized). QueryResult.match() dispatches the view component.

#### Data flow

```
Query IR (Redux, per viewId)
    ↓
Execution engine (memoized on IR)
    ↓
QueryResult (.match() dispatch)
    ↓
View component per variant
```

#### IR filter tree replaces flat filter list

IRFilter becomes a recursive boolean expression:

```
IRFilter (TaggedSum):
  // Leaf predicates
  Equals(field, value)
  In(field, values)           — multi-select (6 accounts out of 30)
  GreaterThan(field, value)
  LessThan(field, value)
  Between(field, low, high)
  Matches(field, pattern)     — regex from Claude conversation
  OlderThan(field, quantity, unit)

  // Combinators
  And(filters)                — [IRFilter]
  Or(filters)                 — [IRFilter]
  Not(filter)                 — IRFilter
```

Users describe complex conditions in natural language. Claude constructs the boolean tree. Users never see the IR.

#### Query universe

**Filtering:** field equality, set membership, negation, numeric comparison, pattern matching, date logic, boolean
combinations (And/Or/Not).

**Aggregation:** single and multi-level grouping, post-aggregation predicates (`where group total > $1000`), order by,
limit.

**Advanced (Phase 2+):** time series, comparison, cross-entity joins, running totals/balances, splits/transfers.

#### QueryResult.match() dispatches the view

- `Identity` → tree view (DataTable) — Phase 1
- `Comparison` → side-by-side trees — Phase 2
- `Scalar` → single value display — Phase 2
- `FilteredEntities` → entity list — Phase 2
- `TimeSeries` → chart or time table — Phase 2

#### Phase 1 scope

- Boolean filter tree (And/Or/Not with leaf predicates)
- IRFilter.In for multi-select
- Multi-level grouping
- Post-aggregation filtering
- Order by / limit
- Engine drives views end-to-end
- Memoized re-execution on IR changes
- Seed queries demonstrating the pipeline

#### Phase 2+ scope (must remain feasible, not contradict Phase 1)

- Time series rendering (IRComputation.TimeSeries already in engine)
- Comparison rendering (IRComputation.Compare already in engine)
- Cross-entity joins (multiple sources, already in Query.sources LookupTable)
- Running balances (new IRComputation variant)
- Splits/transfers (filter predicates on split data)
- Claude NL → IR construction
- Regex generation from conversation
- Filter chip UI for complex predicates

#### Chip UI — implemented via selector merge

Existing chip components (Category, Account, GroupBy) work unchanged. The `QueryResult.fromIR` selector merges chip
filter state into the Query IR before execution — no new chip components needed. Category chips become
`Or([Equals('category', X), ...])`, account chips become `In('account', [names])`, GroupBy overrides `IRSource.groupBy`.
Complex boolean filters from seed queries compose cleanly with chip selections via `And([base, ...chips])`.

#### Generic QueryResultPage (already built)

QueryResultPage and report-metadata.js exist from the generic result views work. These stay — the engine's output feeds
into QueryResultPage instead of selectors. The metadata shape may need a second mode ("here's data directly" vs "here's
a selector to call").

### Plan D: Investment Views — FUTURE

Depends on Plan B (engine drives views) + Plan C (position data).

- Time series result type and view component (charts)
- Capital gains report view (positions grouped by tax classification, lot drill-down)
- Tax lot detail view (per-lot breakdown with holding period and hypothetical gain)
- Lot-level tree drill-down (purchase date, cost basis, unrealized gain, tax classification)

### Not Planned Yet

- LIFO cost basis method and user-configurable default lot strategy + per-sale overrides
- Tag import and investment tagging (high priority — tags table exists in schema)
- Tax schedule/overview reports
- Charting (independent of investment analysis)
- Strategy entity for multi-leg options and managed position lifecycle
- Claude integration (formulate, summarize, suggest) — three narrow text-in/text-out roles
- Parameterization syntax (relative dates, account groups)
- Community sharing mechanism

## Settled Decisions

Merged from all phases. Grouped by topic.

### Query language & IR

| Decision                                  | Rationale                                                                               |
|-------------------------------------------|-----------------------------------------------------------------------------------------|
| Query language is the core artifact       | Not Claude's output format, not JSON. A real language with syntax.                      |
| DSL parser removed — Claude constructs IR | No consumer for text DSL. Claude produces IR Tagged values directly.                    |
| IR prefix naming convention               | All query engine types use IR prefix (IRSource, IRFilter, etc.) except root Query.      |
| Query engine types fully Tagged           | All IR nodes Tagged/TaggedSum with .match(). Sources as LookupTable.                    |
| IR filter tree, not flat list             | Flat list can't express And/Or/Not. Users need complex conditions via natural language. |
| IRFilter.In for multi-select              | Users select 6 accounts out of 30, 9 categories out of 200.                             |
| Post-aggregation predicates in engine     | Capability gap that killed the bridge approach. Engine must filter after grouping.      |

### Data flow & state

| Decision                                   | Rationale                                                                            |
|--------------------------------------------|--------------------------------------------------------------------------------------|
| Engine is the data pipeline, not selectors | Previous bridge bypassed engine. Engine does its own filtering/grouping/aggregation. |
| Query IR is the Redux state                | IR-as-state keeps the engine in the loop. No parallel filter state.                  |
| Engine re-runs on IR changes (memoized)    | Fast enough for interactive refinement. Memoization on IR identity.                  |
| QueryResult.match() dispatches view        | Extensible to Phase 2 variants without changing Phase 1 code.                        |

### Claude integration

| Decision                           | Rationale                                                                        |
|------------------------------------|----------------------------------------------------------------------------------|
| Claude has three narrow roles      | Formulate, summarize, suggest follow-ups. All text-in/text-out.                  |
| Claude scoped to narrow interfaces | No proactive insights, no broad context. Three roles share same interface shape. |
| Chat interface deferred            | Query language + engine first. Paste queries for now.                            |

### Investment analysis

| Decision                                            | Rationale                                                                                  |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------|
| Position replaces Holding                           | One entity, one name. Covers open + closed + lifecycle.                                    |
| Capital gains are position fields                   | From lot allocations for same (account, security). No domain proliferation.                |
| Metric registry pattern                             | Extensible without grammar changes. New metrics = new entries.                             |
| Benchmark is per-position inception-matched         | Only accurate comparison. Uses existing price lookup.                                      |
| In-memory computation                               | Source data in Redux. Memoized. SQLite cache only if profiling demands.                    |
| `date` = snapshot + scoped enrichment for positions | `date: 2025` = as-of 2025-12-31, enrichment scoped to 2025. No date = lifetime.            |
| One `where` keyword, implicit routing               | Entity fields pre-computation, metric names post-computation. Engine routes by field name. |

## Spike Findings Summary

| Spike | Question                                                          | Answer                      |
|-------|-------------------------------------------------------------------|-----------------------------|
| 1     | Do existing selectors cover target questions?                     | Yes — implemented in Plan A |
| 2     | Can we design parseable syntax? Can Claude produce valid queries? | Yes — implemented in Plan A |
| 3     | Can we validate queries with useful errors?                       | Yes — implemented in Plan A |
| 5     | Can a generic page replace both report pages?                     | Yes — QueryResultPage built |
| 6     | Position enrichment: do gains, dividends, IRR compute correctly?  | Yes — implemented in Plan C |

**Spike 5 key findings (generic result views):**

- Accessor functions (not path strings) handle nested access and TaggedSum extraction
- Five metadata primitives suffice for both transaction and position domains
- Filter chips are registry-driven — metadata specifies which chips appear
- `cell` escape hatch per column handles the 1-of-16 custom rendering case
- UI state scoping works unchanged via viewId-scoped Redux state

## Open Questions

- **Parameterization syntax** — how do relative dates, "all dining categories", account groups work?
- **Community sharing mechanism** — git repo? in-app marketplace? URL import?
- **Time series performance** — deferred to profiling. Build it, measure, add SQLite cache only if needed.
- **Short sales** — deferred. Edge case handled during implementation if data exists.

## Spike Findings (7): Engine-to-DataTable parity

**Date:** 2026-03-05
**What we tested:**
- IRFilter compound types (In, GreaterThan, And, Or, Not) added to type system
- ir-filter-evaluator: pre-compiles filter trees into entity => Boolean predicates (In uses Set)
- Engine handles compound filters via enrich-then-filter path (vs existing filter-then-enrich for Equals)
- Unfiltered engine output compared with CategoryTree.buildTransactionTree directly
- Compound filter query (And/In/GreaterThan) compared with selector-path equivalent
- Memoized engine selector using memoizeReduxStatePerKey on entity slices + queryIR
- QueryResultPage wiring: metadata.defaultQueryIR dispatches SetQueryIR on mount

**Results:**
- Unfiltered parity: engine produces **identical** trees to direct CategoryTree.buildTransactionTree (same ids, same aggregates, same transaction ids — recursive deep comparison passes)
- Compound filter: engine produces correct CategoryTreeNode.Group/Transaction tree shapes that DataTable expects — same .children, .aggregate, .id structure
- Compound filters enable queries selectors cannot express (e.g., amount > threshold)
- Or/Not composition works correctly (tested: Or of two categories, Not of a category)
- Memoization holds: same reference (===) when unrelated state changes, new reference on IR or entity changes, independent per-view caches
- Generated type files are read-only (EACCES from prettier in pre-commit) — must exclude formatting-only regeneration changes from commits

**Key learnings:**
- Compound filter path **enriches first, then filters** (vs existing simple path that filters first, then enriches). This enables filtering on enriched fields like categoryName. Trade-off: enriches all transactions before filtering, not just matching ones. For large datasets, consider evaluating on raw fields and mapping field names.
- Equals variant's field regex (/^(category|account|payee|accountType)$/) prevents using it with enriched field names. New compound filter types (In, GreaterThan) use String for field, which is more flexible but less validated.
- memoizeReduxStatePerKey works with plain objects (not just LookupTables) for the keyed state — line 97 has `keyedState?.get ? keyedState.get(key) : keyedState?.[key]`. This means queryIR can be a plain `{}` instead of a LookupTable.
- The metadata-driven QueryResultPage architecture cleanly supports engine mode — ENGINE_TRANSACTION_TREE_METADATA is just `...TRANSACTION_TREE_METADATA` with the selector swapped.

**Revised assumptions:**
- Compound filter field validation: initially planned to constrain fields via regex. Decided String is better for spike flexibility — tighten validation when filter schema stabilizes.
- queryIR state shape: planned LookupTable, used plain object — simpler and works with memoizeReduxStatePerKey.

**Validator violations suppressed:** None (spike branch skips style validation)

## Knowledge Destination

| Destination                                                            | Content                                                               | Status            |
|------------------------------------------------------------------------|-----------------------------------------------------------------------|-------------------|
| `architecture:` docs/architecture/financial-query-language.md          | Query engine architecture, position entity, metric registry           | DONE (Plans A, C) |
| `architecture:` docs/architecture/financial-query-language.md (update) | IR filter tree, engine-drives-views data flow, IR-as-Redux-state      | Plan B            |
| `decisions:` append                                                    | IR filter tree replaces flat list; query IR as single source of truth | Plan B            |
| `decisions:` append                                                    | Claude's role scoped to three narrow interfaces; chat UI deferred     | DONE              |
| `decisions:` append                                                    | Position replaces Holding; capital gains are position fields          | DONE              |
| `decisions:` append                                                    | Query bridge as Redux initializer reverted                            | DONE              |
