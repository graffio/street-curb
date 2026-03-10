---
summary: "Query engine architecture — FinancialQuery IR with 3 query variants producing tree nodes directly, unified page component, 2D column grouping, D3 charting, position enrichment, metric registry"
keywords: [ "query", "IR", "execution", "financial", "position", "metric", "tree", "snapshot", "FinancialQuery", "CategoryTreeNode" ]
module: quicken-web-app
last_updated: "2026-03-09"
---

# Financial Query Engine

Query engine that takes FinancialQuery IR, executes against Redux state, and returns tree nodes directly to a single
unified page component. Claude constructs IR Tagged values from natural language — no DSL parser.

## Architecture

```
Claude → FinancialQuery IR → Execution Engine → {nodes, source, columns?, computed?} → QueryResultPage
                                    ↑
                               Redux state
```

| Module           | File                                | Input → Output                         |
|------------------|-------------------------------------|----------------------------------------|
| Execution engine | `run-financial-query.js`            | `(ir, state)` → plain result object    |
| Description      | `to-financial-query-description.js` | `(ir)` → human-readable string         |
| Filter compiler  | `build-filter-predicate.js`         | `(IRFilter)` → `entity => Boolean`     |
| Tree builder     | `category-tree.js`                  | transactions → CategoryTreeNode tree   |

## FinancialQuery IR

Domain-specific TaggedSum — each variant carries only its domain-relevant fields.

### 3 Variants

| Variant          | Fields                                                                         | Output shape                              |
|------------------|--------------------------------------------------------------------------------|-------------------------------------------|
| TransactionQuery | name, description?, filter?, dateRange?, grouping, computed?                   | `{nodes, source, columns?, computed?}`    |
| PositionQuery    | name, description?, filter?, dateRange?, grouping?, metrics?, orderBy?, limit? | `{nodes, source}` or `{snapshots}`        |
| SnapshotQuery    | name, description?, domain, filter?, grouping?, dateRange, interval            | `{nodes, source, columns}` (tree output)  |

**Key change from prior architecture:** TransactionQuery.grouping is required (registers handle ungrouped views).
SnapshotQuery accepts optional grouping for per-category breakdowns. AccountQuery, ExpressionQuery, and
RunningBalanceQuery were removed — they served no real use case.

### Engine Output Shapes

- **1D grouping** (TransactionQuery/PositionQuery without columns): `{nodes, source}` — CategoryTreeNode tree where
  each node has `{total, count}` aggregate
- **2D grouping** (TransactionQuery with columns): `{nodes, source, columns, computed?}` — same tree but each node
  has `{total, count, columns: {'2024': N, '2025': N}}`. IRComputedRow expressions evaluated per column.
- **Snapshot ungrouped**: single CategoryTreeNode Group with `columns = {date: cumulativeTotal}` per date point
- **Snapshot grouped**: CategoryTreeNode tree where each node has per-date-point cumulative columns
- **Position snapshot** (SnapshotQuery with domain='positions'): `{snapshots}` — flat date/value array

### Supporting Types

- **IRGrouping(rows, columns?, only?)** — shared by TransactionQuery/PositionQuery/SnapshotQuery. Single dimension =
  flat tree. Two dimensions = 2D tree with per-column aggregation. `only` restricts column values.
- **IRComputedRow(name, expression)** — per-column expressions on 2D queries. Uses IRPivotExpression AST.
- **IRPivotExpression**: RowRef(name), Literal(value), Binary(op, left, right) — evaluated per column against flat
  lookup extracted from top-level tree node aggregates.
- **IRDateRange**: Year, Quarter, Month, Relative, Range — resolved to ISO date strings at execution time.

### IRFilter (9-variant boolean tree)

**Leaf variants:** Equals, In, GreaterThan, LessThan, Between, Matches
**Combinators:** And, Or, Not (recursive)

Pre-compiled evaluator (`build-filter-predicate.js`): takes an IRFilter tree, returns `entity => Boolean`. Compilation
converts In values to Set (O(1) lookup), compiles Matches pattern to RegExp once, captures numeric thresholds. Guards:
empty And/Or rejected, depth > 20 rejected, invalid regex throws with clear message.

## Execution Engine

`run-financial-query.js` dispatches via `FinancialQuery.match()` to domain-specific collectors:

- **TransactionQuery**: enrich → filter → group. Without `columns` → 1D tree. With `columns` → 2D tree via
  `buildColumnGroupedTree` (hierarchical, drillable). IRComputedRow expressions extracted from top-level node aggregates
  and evaluated per column.
- **PositionQuery**: computePositions → filter → group → position tree.
- **SnapshotQuery**: generate date points at interval. Balances domain: without grouping → single summary node with
  cumulative columns; with grouping → per-category tree with cumulative date-point columns via
  `makeSnapshotAggregator`. Positions domain: flat `{snapshots}`.

**2D tree building:** `category-tree.js` provides `buildColumnGroupedTree(rowDim, colDim, transactions)` which uses
`makeColumnAggregator(getColumnKey)` to produce hierarchical trees where each node aggregates per-column values from
children. Column key extractors: `year`, `quarter`, `month`. Rows are hierarchical (category tree), columns are always
flat.

**Enrich-then-filter:** The engine enriches all entities first (adding `categoryName`, `accountName`, etc.), then
applies the compiled filter predicate. This allows filters to reference enriched fields.

Shared helpers: `toResolvedFilter` (category prefix expansion — `Equals('category', 'Food')` becomes
`Matches('category', '^Food(:|$)')` to match subcategories), `buildFilterPredicate` (IRFilter → entity predicate),
`toFilterableTransaction`/`toFilterablePosition` (field mapping for predicate evaluation).

## Chip Merge & Selector Integration

`merge-chip-filters.js` converts UI chip state into IR patches and applies them variant-agnostically via
`constructor.from({ ...ir, ...patch })`. Unused patch keys silently ignored through `_from` destructuring.

```
Redux state.queryIR[viewId] → applyChipFilters → runFinancialQuery → result object
                                      ↑
                              transactionFilters[viewId] (chip state)
```

Chip → IR mapping:

- Category chips → `IRFilter.Or([Equals('category', x), ...])`
- Account chips → `IRFilter.In('account', [names])`
- GroupBy chip → overrides `IRGrouping.rows`
- Search chip → `IRFilter.Or([Matches('payee', q), Matches('category', q), Matches('memo', q), ...])`
- Date chip → patch `dateRange`
- AsOfDate chip → patch `dateRange` (takes priority; only set explicitly, never defaulted)

Memoized with `memoizeReduxStatePerKey` — 8 entity state keys as global invalidation, `queryIR` as per-key state.
FallbackIR from metadata must be referentially stable (module-level constant).

## Unified Page Component

`QueryResultPage.jsx` renders all query results. Detects result shape by property presence:

- `result.snapshots` → chart + snapshot table (positions domain)
- `result.nodes && result.columns` → 2D tree table with dynamic value columns + optional chart
- `result.nodes` → 1D tree table with total/count columns

**Charting:** D3 scales (`d3-scale`) for math, React for SVG rendering. `TimeSeriesChart.jsx` uses `scaleUtc` +
`scaleLinear`. Chart opt-in via `metadata.chart` flag. No high-level chart library.

**FilterChipRow:** Extracted shared component for consistent chip rendering.

**Seed queries:** `SEED_QUERIES` in report-metadata.js defines 8 pre-configured queries. `SEED_QUERY_METADATA` maps
each to filter chip configuration. `picker-config.js` wires them into the sidebar.

## Position Enrichment & Metric Registry

Position enrichment computes realized gains, dividend income, IRR, benchmark return, total return, and alpha from lots,
allocations, transactions, and prices already in Redux state. Each metric is a `MetricDefinition` in a `LookupTable`
registry (`financial-computations/metric-registry.js`). Compute signature: `(position, context) => Number`.

Decomposed into single-function modules in `financial-computations/`:

| File                          | What                                                    |
|-------------------------------|---------------------------------------------------------|
| `compute-positions.js`        | Lot aggregation + price enrichment → Position           |
| `compute-realized-gains.js`   | Realized gain from lot allocations (short/long term)    |
| `compute-dividend-income.js`  | Dividend income from investment transactions            |
| `compute-irr.js`              | Internal rate of return via Newton's method             |
| `compute-benchmark-return.js` | SPY return inception-matched per position               |
| `compute-total-return.js`     | unrealized + realized + dividends (dollars and percent) |
| `metric-registry.js`          | LookupTable of 7 MetricDefinitions                      |
| `build-positions-tree.js`     | Group positions into PositionTreeNode tree              |

## Key Files

| File                                                   | Purpose                                         |
|--------------------------------------------------------|-------------------------------------------------|
| `src/query-language/run-financial-query.js`            | FinancialQuery IR → result object (3 variants)  |
| `src/query-language/to-financial-query-description.js` | IR → human-readable description                 |
| `src/query-language/build-filter-predicate.js`         | IRFilter tree → compiled predicate              |
| `src/query-language/merge-chip-filters.js`             | Variant-agnostic chip state → IR merge          |
| `src/query-language/category-tree.js`                  | 1D and 2D tree building with column aggregation |
| `src/store/selectors.js`                               | Memoized query execution per viewId             |
| `src/pages/report-metadata.js`                         | Seed queries + filter metadata                  |
| `src/pages/QueryResultPage.jsx`                        | Unified page for all query results              |
| `src/components/TimeSeriesChart.jsx`                   | D3 scales + React SVG line chart                |
| `src/components/FilterChipRow.jsx`                     | Shared filter chip row                          |
| `src/financial-computations/metric-registry.js`        | MetricDefinition LookupTable (7 metrics)        |
| `src/financial-computations/compute-positions.js`      | Lot aggregation + price → Position              |
| `type-definitions/ir/financial-query.type.js`          | FinancialQuery TaggedSum (3 variants)            |
| `type-definitions/ir/ir-grouping.type.js`              | IRGrouping Tagged type                          |
| `type-definitions/ir/ir-computed-row.type.js`          | IRComputedRow Tagged type                       |
| `type-definitions/ir/ir-pivot-expression.type.js`      | IRPivotExpression TaggedSum                     |

## Design Decisions

- **Claude constructs IR directly** — no DSL parser; Claude produces Tagged IR values from natural language
- **3 domain-specific query types** — each variant carries only domain-relevant fields, dispatched via `.match()`
- **No result type indirection** — engine returns plain objects; QueryResult/QueryResultTree removed
- **Unified page component** — QueryResultPage detects result shape by property presence, not type dispatch
- **Trees for everything** — 1D grouping, 2D grouping, and snapshots all produce CategoryTreeNode trees
- **2D = tree with columns** — rows are hierarchical (drillable), columns are always flat (year/quarter/month/date)
- **Executor calls business modules, not selectors** — avoids viewId dependency; memoization at selector level
- **Enrich-then-filter** — engine enriches all entities before filtering so predicates can reference computed fields
- **Query IR as single source of truth** — `state.queryIR[viewId]` is authoritative; chip filters merge at selector level
- **Variant-agnostic chip merge** — `constructor.from({ ...ir, ...patch })` avoids per-variant reconstruction
- **D3 for math, React for rendering** — `d3-scale` for scales, React for SVG elements, no chart library wrapper
