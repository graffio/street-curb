---
summary: "Query engine architecture — validator, expression evaluator, execution engine, pipeline"
keywords: [ "query", "IR", "validator", "execution", "expression", "financial" ]
module: quicken-web-app
last_updated: "2026-03-03"
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

- `IRComputation`: Identity, Compare, Expression, FilterEntities
- `IRResult`: Identity, Comparison, Scalar, FilteredEntities
- `IRDomain`: Transactions, Holdings, Accounts
- `IRExpression`: Literal, Binary, Call, Reference
- `IRDateRange`: Year, Quarter, Month, Relative, Range, Named
- `IRFilter`: Equals, OlderThan
- `IRResultTree`: Category, Holdings

**Data types (Tagged with field validation):**

- Query (sources as `LookupTable<IRSource>`), IRSource, IROutput, AccountSummary, DataSummary

**FieldTypes:** `sourceName` (`/^[a-z_][a-z0-9_]*$/`), `groupDimension` (`/^(month|quarter|...)$/`), `arithmeticOp` (
`/^[/+*-]$/`), `timeUnit` (`/^(months|days|weeks|years)$/`), `namedPeriod`, `accountType`

**Cross-type references:** IRComputation.Expression.expression → IRExpression, Query.sources → LookupTable of IRSource,
DataSummary.accounts → [AccountSummary], IRResult.Identity.tree → IRResultTree

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
domain-specific collectors. Calls business modules directly (TransactionFilter, CategoryTree, HoldingsModule) — not
selectors — to avoid viewId dependency.

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
