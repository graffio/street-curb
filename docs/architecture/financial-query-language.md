---
summary: "Query engine architecture — validator, expression evaluator, execution engine, pipeline, position enrichment, metric registry"
keywords: [ "query", "IR", "validator", "execution", "expression", "financial", "position", "metric", "time series" ]
module: quicken-web-app
last_updated: "2026-03-04"
---

# Financial Query Engine

Query engine that takes IR (constructed by Claude from natural language), validates against user data, and executes
against Redux state.

## Architecture

```
Claude → Query IR → Validator → Execution Engine → IRResult
                       ↑              ↑
                   DataSummary    Redux state
```

Four modules, each with a single responsibility:

| Module               | File                        | Input → Output                             |
|----------------------|-----------------------------|--------------------------------------------|
| Validator            | `query-validator.js`        | `(ir, dataSummary)` → `{valid, errors}`    |
| Expression evaluator | `resolve-expression.js`     | `(ast, boundValues)` → number              |
| Execution engine     | `query-execution-engine.js` | `(ir, state)` → IRResult                   |
| Pipeline             | `query-pipeline.js`         | `(ir, dataSummary, state)` → phased result |

## Type System

13 Tagged/TaggedSum types in `type-definitions/`. All IR nodes are Tagged — no plain `{type}` objects anywhere in the
pipeline. All domain dispatch uses `.match()`.

**Core TaggedSums (exhaustive dispatch):**

- `IRComputation`: Identity, Compare, Expression, FilterEntities, TimeSeries
- `IRResult`: Identity, Comparison, Scalar, FilteredEntities, TimeSeries
- `IRDomain`: Transactions, Positions, Accounts
- `IRExpression`: Literal, Binary, Call, Reference
- `IRDateRange`: Year, Quarter, Month, Relative, Range, Named
- `IRFilter`: Equals, OlderThan
- `IRResultTree`: Category, Positions

**Data types (Tagged with field validation):**

- Query (sources as `LookupTable<IRSource>`), IRSource, IROutput, AccountSummary, DataSummary, MetricDefinition

**FieldTypes:** `sourceName` (`/^[a-z_][a-z0-9_]*$/`), `groupDimension` (`/^(month|quarter|...)$/`), `arithmeticOp` (
`/^[/+*-]$/`), `timeUnit` (`/^(months|days|weeks|years)$/`), `namedPeriod`, `accountType`

**Cross-type references:** IRComputation.Expression.expression → IRExpression, Query.sources → LookupTable of IRSource,
DataSummary.accounts → [AccountSummary], IRResult.Identity.tree → IRResultTree

## Position Enrichment & Metric Registry

Position enrichment computes realized gains, dividend income, IRR, benchmark return, total return, and alpha from lots,
allocations, transactions, and prices already in Redux state. Each metric is a `MetricDefinition` in a `LookupTable`
registry (`financial-computations/metric-registry.js`). Compute signature: `(position, context) => Number`.

Decomposed into single-function modules in `financial-computations/`:

| File                       | What                                                    |
|----------------------------|---------------------------------------------------------|
| `compute-positions.js`     | Lot aggregation + price enrichment → Position           |
| `compute-realized-gains.js`| Realized gain from lot allocations (short/long term)    |
| `compute-dividend-income.js`| Dividend income from investment transactions           |
| `compute-irr.js`           | Internal rate of return via Newton's method             |
| `compute-benchmark-return.js`| SPY return inception-matched per position             |
| `compute-total-return.js`  | unrealized + realized + dividends (dollars and percent) |
| `metric-registry.js`       | LookupTable of 7 MetricDefinitions                     |
| `build-positions-tree.js`  | Group positions into PositionTreeNode tree              |

## Query Language Extensions (Plan C)

| Clause        | IR location    | Purpose                                       |
|---------------|----------------|-----------------------------------------------|
| `order by`    | IROutput       | Sort results by metric or position field       |
| `limit`       | IROutput       | Return top/bottom N (flat results only)        |
| `metrics`     | IRSource       | Request specific computed metrics per position |
| `time series` | IRComputation  | Position snapshots at interval dates           |

Validator checks: metric names against registry, orderBy against position fields + registry, limit > 0 and not combined
with groupBy, timeSeries date points <= 100.

Execution engine: metrics resolved via MetricRegistry.get(). TimeSeries generates date points and calls
computePositions at each. orderBy/limit applied as post-processing on IRResultTree.Positions.

## Validator

Checks entity references (categories, accounts, payees, accountTypes) against DataSummary. Four matching strategies in
priority order:

1. **Prefix** — "Food" matches when "Food:Dining" exists (mirrors execution engine)
2. **Hierarchical** — "Dining" suggests "Food:Dining" (split on `:`)
3. **Substring**
4. **Levenshtein** — distance <= 3, pre-filtered by length proximity

Max 3 suggestions per error. Validates computation source refs via `.match()`.

## Expression Evaluator

Recursive AST walker with `.match()` dispatch on IRExpression variants. Fail-fast on: unknown
source/field/operator/function, division by zero, depth limit (100).

## Execution Engine

Resolves IRDateRange via `.match()` (6 variants), applies source filters, dispatches via IRDomain.match() to
domain-specific collectors. Calls business modules directly (TransactionFilter, CategoryTree, computePositions) — not
selectors — to avoid viewId dependency. Imports MetricRegistry from financial-computations/ for metric resolution.

## DataSummary Selector

`_dataSummary` in `selectors.js` — memoized with `memoizeReduxState(['categories', 'accounts', 'transactions'])`.
Extracts category names, account name/type pairs, unique accountTypes, unique payees.

## Key Files

| File                                           | Purpose                                   |
|------------------------------------------------|-------------------------------------------|
| `src/query-language/query-validator.js`        | Semantic validation with fuzzy matching   |
| `src/query-language/resolve-expression.js`     | Safe expression evaluator (replaces eval) |
| `src/query-language/query-execution-engine.js` | IR → business module calls → IRResult     |
| `src/query-language/query-pipeline.js`         | validate → execute pipeline               |
| `src/store/selectors.js`                       | `_dataSummary` selector                   |
| `src/financial-computations/metric-registry.js`| MetricDefinition LookupTable (7 metrics) |
| `src/financial-computations/compute-positions.js`| Lot aggregation + price → Position      |
| `type-definitions/ir-computation.type.js`      | IRComputation TaggedSum                   |
| `type-definitions/ir-result.type.js`           | IRResult TaggedSum                        |
| `type-definitions/query.type.js`               | Query Tagged type                         |

## Design Decisions

- **Claude constructs IR directly** — no DSL parser; Claude produces Tagged IR values from natural language, pipeline
  accepts Query IR
- **Executor calls business modules, not selectors** — avoids viewId dependency; caller (Plan B) decides memoization
  strategy
- **Category prefix matching replicated in validator** — "Food" valid when "Food:Dining" exists, matching execution
  semantics
- **IR prefix convention** — all query engine types use `IR` prefix (IRSource, IRFilter, etc.) except the root `Query`
  type and non-IR data types (DataSummary, AccountSummary)
