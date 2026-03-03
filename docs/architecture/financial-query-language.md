---
summary: "Query language architecture — parser, validator, expression evaluator, execution engine, pipeline"
keywords: [ "query", "parser", "validator", "execution", "expression", "financial", "DSL" ]
module: quicken-web-app
last_updated: "2026-03-03"
---

# Financial Query Language

Query engine that takes a DSL string, parses it to IR, validates against user data, and executes against Redux state.

## Architecture

```
query string → Parser → QueryIR → Validator → Execution Engine → QueryResult
                                      ↑              ↑
                                  DataSummary    Redux state
```

Five modules, each with a single responsibility:

| Module | File | Input → Output |
|--------|------|----------------|
| Parser | `query-parser.js` | string → `{success, ir}` or `{success, errors}` |
| Validator | `query-validator.js` | `(ir, dataSummary)` → `{valid, errors}` |
| Expression evaluator | `resolve-expression.js` | `(ast, boundValues)` → number |
| Execution engine | `query-execution-engine.js` | `(ir, state)` → QueryResult |
| Pipeline | `query-pipeline.js` | `(string, dataSummary, state)` → phased result |

## Type System

13 Tagged/TaggedSum types in `type-definitions/`. All IR nodes are Tagged — no plain `{type}` objects anywhere in the pipeline. All domain dispatch uses `.match()`.

**Core TaggedSums (exhaustive dispatch):**
- `Computation`: Identity, Compare, Expression, FilterEntities
- `QueryResult`: Identity, Comparison, Scalar, FilteredEntities
- `Domain`: Transactions, Holdings, Accounts
- `ExpressionNode`: Literal, Binary, Call, Reference
- `DateRange`: Year, Quarter, Month, Relative, Range, Named
- `QueryFilter`: Equals, OlderThan
- `ResultTree`: Category, Holdings

**Data types (Tagged with field validation):**
- QueryIR (sources as `LookupTable<QuerySource>`), QuerySource, QueryOutput, AccountSummary, DataSummary

**FieldTypes:** `sourceName` (`/^[a-z_][a-z0-9_]*$/`), `groupDimension` (`/^(month|quarter|...)$/`)

**Cross-type references:** Computation.Expression.expression → ExpressionNode, QueryIR.sources → LookupTable of QuerySource, DataSummary.accounts → [AccountSummary], QueryResult.Identity.tree → [CategoryTreeNode]

## Parser

Recursive descent with tokenizer + clause dispatch + expression parser. All iteration via recursion (no for/while). Produces Tagged type constructors throughout — Domain, DateRange, QueryFilter, ExpressionNode, Computation.

Actionable error messages with line/col positions.

## Validator

Checks entity references (categories, accounts, payees, accountTypes) against DataSummary. Four matching strategies in priority order:
1. **Prefix** — "Food" matches when "Food:Dining" exists (mirrors execution engine)
2. **Hierarchical** — "Dining" suggests "Food:Dining" (split on `:`)
3. **Substring**
4. **Levenshtein** — distance <= 3, pre-filtered by length proximity

Max 3 suggestions per error. Validates computation source refs via `.match()`.

## Expression Evaluator

Recursive AST walker with `.match()` dispatch on ExpressionNode variants. Fail-fast on: unknown source/field/operator/function, division by zero, depth limit (100).

## Execution Engine

Resolves DateRange via `.match()` (6 variants), applies source filters, dispatches via Domain.match() to domain-specific collectors. Calls business modules directly (TransactionFilter, CategoryTree, HoldingsModule) — not selectors — to avoid viewId dependency.

## DataSummary Selector

`_dataSummary` in `selectors.js` — memoized with `memoizeReduxState(['categories', 'accounts', 'transactions'])`. Extracts category names, account name/type pairs, unique accountTypes, unique payees.

## Key Files

| File | Purpose |
|------|---------|
| `src/query-language/query-parser.js` | Tokenizer + recursive descent parser |
| `src/query-language/query-validator.js` | Semantic validation with fuzzy matching |
| `src/query-language/resolve-expression.js` | Safe expression evaluator (replaces eval) |
| `src/query-language/query-execution-engine.js` | IR → selector calls → QueryResult |
| `src/query-language/query-pipeline.js` | parse → validate → execute pipeline |
| `src/store/selectors.js` | `_dataSummary` selector |
| `type-definitions/computation.type.js` | Computation TaggedSum |
| `type-definitions/query-result.type.js` | QueryResult TaggedSum |
| `type-definitions/query-ir.type.js` | QueryIR Tagged type |

## Design Decisions

- **Executor calls business modules, not selectors** — avoids viewId dependency; caller (Plan B) decides memoization strategy
- **Parser exports a function, not a namespace** — `queryParser(string)` per validator naming constraints
- **100KB input limit** — pipeline rejects oversized queries before parsing
- **Category prefix matching replicated in validator** — "Food" valid when "Food:Dining" exists, matching execution semantics
