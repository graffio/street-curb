---
summary: "Query engine architecture — FinancialQuery IR with 6 query variants, 6 result variants, pivot/snapshot/running balance, page-per-type views, D3 charting, position enrichment, metric registry"
keywords: [ "query", "IR", "execution", "expression", "financial", "position", "metric", "pivot", "snapshot", "FinancialQuery" ]
module: quicken-web-app
last_updated: "2026-03-07"
---

# Financial Query Engine

Query engine that takes FinancialQuery IR, executes against Redux state, and produces typed QueryResult variants that
drive page-per-type views. Claude constructs IR Tagged values from natural language — no DSL parser.

## Architecture

```
Claude → FinancialQuery IR → Execution Engine → QueryResult → Page Component
                                    ↑                              ↓
                               Redux state              .match() → view dispatch
```

| Module               | File                                | Input → Output                     |
|----------------------|-------------------------------------|------------------------------------|
| Execution engine     | `run-financial-query.js`            | `(ir, state)` → QueryResult        |
| Description          | `to-financial-query-description.js` | `(ir)` → human-readable string     |
| Filter compiler      | `build-filter-predicate.js`         | `(IRFilter)` → `entity => Boolean` |
| Expression evaluator | `resolve-expression.js`             | `(ast, boundValues)` → number      |

## FinancialQuery IR

Domain-specific TaggedSum — each variant carries only its domain-relevant fields.

### 6 Variants

| Variant             | Fields                                                                         | → QueryResult     |
|---------------------|--------------------------------------------------------------------------------|-------------------|
| TransactionQuery    | name, description?, filter?, dateRange?, grouping?, computed?                  | Identity or Pivot |
| PositionQuery       | name, description?, filter?, dateRange?, grouping?, metrics?, orderBy?, limit? | Identity          |
| AccountQuery        | name, description?, filter?                                                    | FilteredEntities  |
| ExpressionQuery     | name, description?, left, right, expression                                    | Scalar            |
| SnapshotQuery       | name, description?, domain, filter?, dateRange, interval                       | TimeSeries        |
| RunningBalanceQuery | name, description?, filter?, dateRange?                                        | RunningBalance    |

### Supporting Types

- **IRGrouping(rows, columns?, only?)** — shared by TransactionQuery/PositionQuery. Single dimension = flat tree.
  Two dimensions = pivot table. `only` restricts which column values appear.
- **ComputedRow(name, expression)** — per-column expressions on pivot queries. Uses PivotExpression AST.
- **PivotExpression**: RowRef(name), Literal(value), Binary(op, left, right) — evaluated per column bucket.
- **IRDateRange**: Year, Quarter, Month, Relative, Range — resolved to ISO date strings at execution time.
- **IRExpression**: Literal, Binary, Call, Reference — recursive AST for cross-query arithmetic.

### IRFilter (9-variant boolean tree)

**Leaf variants:** Equals, In, GreaterThan, LessThan, Between, Matches
**Combinators:** And, Or, Not (recursive)

Pre-compiled evaluator (`build-filter-predicate.js`): takes an IRFilter tree, returns `entity => Boolean`. Compilation
converts In values to Set (O(1) lookup), compiles Matches pattern to RegExp once, captures numeric thresholds. Guards:
empty And/Or rejected, depth > 20 rejected, invalid regex throws with clear message.

## Execution Engine

`run-financial-query.js` dispatches via `FinancialQuery.match()` to domain-specific collectors:

- **TransactionQuery**: enrich → filter → group. With `columns` in IRGrouping → pivot (rows × columns grid,
  ComputedRow expressions evaluated per column).
- **PositionQuery**: computePositions → filter → group. Uses `toFilterablePosition` for field mapping.
- **AccountQuery**: filter accounts by predicate → FilteredEntities result.
- **ExpressionQuery**: recursive dispatch on left/right sub-queries (depth limit 10) → evaluate IRExpression.
- **SnapshotQuery**: generate date points at interval, compute cumulative balances or positions at each → TimeSeries.
- **RunningBalanceQuery**: filter + sort transactions, accumulate running balance per entry.

**Enrich-then-filter:** The engine enriches all entities first (adding `categoryName`, `accountName`, etc.), then
applies the compiled filter predicate. This allows filters to reference enriched fields.

Shared helpers: `toResolvedFilter` (category prefix expansion — `Equals('category', 'Food')` becomes
`Matches('category', '^Food(:|$)')` to match subcategories), `buildFilterPredicate` (IRFilter → entity predicate),
`toFilterableTransaction`/`toFilterablePosition` (field mapping for predicate evaluation).

## Chip Merge & Selector Integration

`merge-chip-filters.js` converts UI chip state into IR patches and applies them variant-agnostically via
`constructor.from({ ...ir, ...patch })`. Variants without a given field (e.g. ExpressionQuery has no `filter`)
silently ignore patch keys through `_from` destructuring.

```
Redux state.queryIR[viewId] → applyChipFilters → runFinancialQuery → QueryResult
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

## Page-Per-Type View Layer

Separate page component per QueryResult variant, dispatched via `metadata.page` in report-metadata.js:

| QueryResult      | Page Component             | Rendering                              |
|------------------|----------------------------|----------------------------------------|
| Identity         | QueryResultPage            | DataTable with tree columns            |
| Scalar           | (inline)                   | Single computed value                  |
| Pivot            | PivotResultPage            | DataTable with dynamic year columns    |
| TimeSeries       | TimeSeriesResultPage       | D3 line chart + snapshot table         |
| RunningBalance   | RunningBalanceResultPage   | Flat DataTable with cumulative balance |
| FilteredEntities | FilteredEntitiesResultPage | Flat DataTable (accounts)              |

**Charting:** D3 scales (`d3-scale`) for math, React for SVG rendering. `TimeSeriesChart.jsx` uses `scaleUtc` +
`scaleLinear`. No high-level chart library.

**FilterChipRow:** Extracted shared component used by all page types for consistent chip rendering.

**Seed queries:** `SEED_QUERIES` in report-metadata.js defines 9 pre-configured queries. `SEED_QUERY_METADATA` maps
each to its page component and filter chip configuration. `picker-config.js` wires them into the sidebar.

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

| File                                                   | Purpose                                      |
|--------------------------------------------------------|----------------------------------------------|
| `src/query-language/run-financial-query.js`            | FinancialQuery IR → QueryResult (6 variants) |
| `src/query-language/to-financial-query-description.js` | IR → human-readable description              |
| `src/query-language/build-filter-predicate.js`         | IRFilter tree → compiled predicate           |
| `src/query-language/resolve-expression.js`             | Expression evaluator (replaces eval)         |
| `src/query-language/merge-chip-filters.js`             | Variant-agnostic chip state → IR merge       |
| `src/store/selectors.js`                               | Memoized query execution per viewId          |
| `src/pages/report-metadata.js`                         | Seed queries + page/filter metadata          |
| `src/pages/PivotResultPage.jsx`                        | Pivot table with dynamic columns             |
| `src/pages/TimeSeriesResultPage.jsx`                   | D3 chart + snapshot table                    |
| `src/pages/RunningBalanceResultPage.jsx`               | Register-style running balance               |
| `src/pages/FilteredEntitiesResultPage.jsx`             | Filtered entity list (accounts)              |
| `src/pages/QueryResultPage.jsx`                        | Tree-based report page                       |
| `src/components/TimeSeriesChart.jsx`                   | D3 scales + React SVG line chart             |
| `src/components/FilterChipRow.jsx`                     | Shared filter chip row for all page types    |
| `src/financial-computations/metric-registry.js`        | MetricDefinition LookupTable (7 metrics)     |
| `src/financial-computations/compute-positions.js`      | Lot aggregation + price → Position           |
| `type-definitions/ir/financial-query.type.js`          | FinancialQuery TaggedSum                     |
| `type-definitions/ir/ir-grouping.type.js`              | IRGrouping Tagged type                       |
| `type-definitions/ir/computed-row.type.js`             | ComputedRow Tagged type                      |
| `type-definitions/ir/pivot-expression.type.js`         | PivotExpression TaggedSum                    |

## Design Decisions

- **Claude constructs IR directly** — no DSL parser; Claude produces Tagged IR values from natural language
- **Domain-specific query types** — FinancialQuery variants carry only domain-relevant fields, dispatched via `.match()`
- **Executor calls business modules, not selectors** — avoids viewId dependency; memoization at selector level
- **Enrich-then-filter** — engine enriches all entities before filtering so predicates can reference computed fields
- **Query IR as single source of truth** — `state.queryIR[viewId]` is authoritative; chip filters merge at selector
  level
- **Page-per-type dispatch** — each QueryResult variant gets its own page component via `metadata.page` reference
- **Variant-agnostic chip merge** — `constructor.from({ ...ir, ...patch })` avoids per-variant reconstruction
- **D3 for math, React for rendering** — `d3-scale` for scales, React for SVG elements, no chart library wrapper
