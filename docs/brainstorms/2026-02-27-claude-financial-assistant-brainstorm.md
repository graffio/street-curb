---
date: 2026-02-27
topic: claude-financial-assistant
---

# Financial Query Language & Claude Assistant

## What We're Building

A query language for financial data analysis, with a mechanical parser and execution engine that runs against the app's
Redux state. The query language is the core artifact — human-readable, machine-parseable, saveable, shareable.

Claude plays three narrow, well-defined roles with clean interfaces (text in, text out):

1. **Formulate queries** — conversational on-ramp where Claude helps users express what they want as a query
2. **Summarize results** — natural language interpretation of query output ("Your dining is up 40% QoQ, driven by three
   new restaurants")
3. **Suggest follow-ups** — after seeing results, propose 2-3 related queries

The chat interface is **deferred**. Phase 1 is the query language + parser + execution engine. Users can formulate
queries in a separate Claude session and paste them into the app. The in-app chat comes later when we add summarization
and follow-up suggestions.

## Why This Approach

Instead of building dozens of specialized report screens, we build one generic results view and a query language that
drives it. Users get the full analytical power of the app through queries rather than through complex pre-built UIs.

The query language (not Claude) is the center of gravity. Claude is one producer of queries. Power users can write them
directly. Communities can share them.

## Target Questions

Questions that go beyond what filter/group/sort UI can answer:

- **Comparisons across time** — "How much more did I spend on dining this quarter vs last?"
- **Cross-category reasoning** — "What percentage of my income goes to subscriptions?"
- **Negative/absence queries** — "Which accounts haven't had activity in 90 days?"
- **Anomalies** — "Any unusually large transactions this month?"
- **Multi-domain** — "Net worth trend across cash + investments?"
- **Derived/computed** — "What's my effective savings rate?"

## What Doesn't Fit This Paradigm

- **Data entry** — categorizing, splits, reconciliation (doing, not asking)
- **Daily glance dashboards** — net worth, balances, budget status (need to be *there*)
- **Procedural workflows** — reconciliation steps, bill scheduling
- **Quick lookups** — "find that Amazon charge from Tuesday" (search box beats conversation)

Pattern: **writes, glances, workflows, and known-item lookups** need pre-built UI. **Exploration and analysis** fit the
query paradigm.

## Why Claude's Role Is Narrow

The natural instinct is to make Claude do more — interpret results, notice patterns, explain anomalies proactively, act
as a financial advisor. We explored this and rejected it for Phase 1.

The problem: **how does it *know*?** Proactive insights ("your dining is up 40% and here's why") require broad context
Claude doesn't have — the user's full financial history, what's "normal" for them, seasonal patterns. There's no clean
trigger mechanism for "notice something interesting." It would require feeding Claude large amounts of data
speculatively, and the output quality would be unpredictable.

More fundamentally, the richer Claude's role, the more tightly coupled it becomes with the app's internals. Each new
capability is an idiosyncratic integration point that's hard to standardize and hard to test. The three narrow roles (
formulate, summarize, suggest) all have the same interface shape: text in, text out. That's testable, replaceable, and
doesn't require deep app coupling.

Proactive interpretation and financial advisory features may be worth building eventually, but they're a different
product with a much bigger integration surface. Don't conflate them with the query language system.

## Architecture: Three Layers

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

Phase 1 = the middle (Parser → Execute → Results)
Claude bookends (Formulate, Summarize, Suggest) are deferred
```

### 1. Query Language (the artifact)

A textual language with real syntax and a real parser. Queries are the artifact that gets saved, shared, edited, and
replayed.

**Vocabulary comes from two sources:**

- **Nouns/filters** — from the SQLite schema (`schema.sql`). Accounts, transactions, categories, securities, date
  ranges, account types, investment actions. The schema is already a formal, precise description of what data exists,
  including CHECK constraints that enumerate valid values.
- **Computations/outputs** — from the selector catalog. Balance, market value, group-by-category, group-by-month, tree
  aggregates, comparisons, ratios, etc.

**Key design constraint:** The grammar must be stable when the computation catalog grows. Like SQL: adding a new table
doesn't change the grammar, and adding a new function (`MEDIAN()`, `PERCENTILE()`) doesn't either — because the grammar
has generic function-call syntax and a registry of valid function names. Similarly, this language should have generic
computation syntax and a registry. New selectors = new registry entries, not grammar changes.

### 2. IR (Internal Representation)

The IR is a **declarative data structure** — an AST-like object that describes what to compute, not the computation
itself. Based on the spike, its shape is roughly:

- A set of **named queries**, each targeting a domain (transactions, holdings, accounts) with filters
- A **computation** that combines query results (identity, compare, ratio, expression, statistical, etc.)
- **Output hints** (labels, formatting, grouping)

The IR is not "a series of selector calls" — it's what gets *interpreted into* selector calls by the execution engine.
This separation matters: the IR can be validated, serialized, and inspected before anything executes.

### 3. Parser + Execution Engine

- **Parser** — mechanical, deterministic, good error messages ("Unknown category 'Dining' — did you mean 'Food:
  Dining'?"). Compiles surface syntax → IR.
- **Execution** — interprets IR into selector calls against Redux state. The spike validated that existing selectors (
  TransactionFilter, CategoryTree, HoldingsTree, HoldingsModule, EnrichedAccount) cover the target question set.

### 4. Result Viewing

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

### 5. Claude Integration (deferred)

Three roles, each with a clean text-in/text-out interface:

- **Formulate** — user describes intent → Claude produces query text. Requires Claude to know the schema and computation
  catalog.
- **Summarize** — query results → Claude produces natural language interpretation. Trigger: always after execution.
- **Suggest** — query results → Claude suggests 2-3 follow-up queries in the query language. Trigger: always after
  execution.

## Format vs. Correctness

A key insight from discussion: **JSON (or any format) is a container, not a language.** Syntactically valid JSON with
wrong category names, nonsensical date ranges, or meaningless field combinations is still valid JSON. The spike's JSON
specs were "accurate" only in the trivial sense of being parseable.

"Accurate" has three levels:

1. **Syntactically valid** — parseable. Trivial for JSON. Any format can achieve this.
2. **Structurally correct** — right fields, right types, valid combinations. JSON Schema or a typed grammar can enforce
   this.
3. **Semantically correct** — references real categories in the user's data, date ranges that make sense, computations
   that answer the question asked. No format or schema can guarantee this.

Level 3 is the hard problem, and it's **independent of format choice**. Whether the query is JSON, SQL, or a custom DSL,
the question is the same: does the query author (human or Claude) know enough about the data to write a correct query?
This is why the schema/context mechanism matters more than the syntax choice.

This also means the format question ("JSON? SQL? custom DSL?") shouldn't be agonized over as if correctness depends on
it. Pick the format that's most readable/writable for its audience. Correctness comes from the validation layer, not the
serialization format.

## Surface Syntax Layers (Compilation Model)

By analogy with programming languages: the query system may have multiple representation levels, like source code →
bytecode → execution.

- **IR (internal representation)** — the "bytecode." Close to the execution engine, maps directly to selector calls. The
  spike's JSON query spec is a rough sketch of this level. Doesn't need to be human-friendly — it's what the execution
  engine consumes.
- **Surface syntax(es)** — the "source code." Human-facing formats that **compile down** to IR. Could have multiple
  surface syntaxes geared toward different audiences (power users, Claude, shared repos). Each surface syntax has its
  own parser that emits IR.
- **Natural language** — not a format, just a process. Claude converts natural language to a surface syntax.

Benefits of this layering:

- Execution engine only knows about IR — insulated from syntax changes
- Each surface syntax has an independent parser
- Adding a new surface syntax doesn't touch execution
- Validation can happen at IR level regardless of source
- The "which format?" question becomes less fraught — you can have multiple, and the IR is just an implementation detail

## What Syntax Would Claude Prefer to Write?

Claude (as a query producer) is most accurate with syntax that's **declarative and domain-specific** rather than
SQL-ish. Financial queries aren't SQL-shaped — no JOINs, no FROM, the "tables" are domains. Something like:

```
query dining_trend {
  transactions
  where category starts with "Food"
  date range: last 6 months
  group by month
}

query savings_rate {
  compare abs(total Income) vs abs(total Food, Housing, Transportation)
  date range: 2025
  compute: (income - expenses) / income * 100
  label: "Savings Rate %"
}
```

This maps closely to how Claude would *describe* the query in English, which is why it's accurate. SQL would also work
but forces financial concepts into relational semantics that don't quite fit. A novel DSL is fine as long as Claude has
5-10 examples in context.

The syntax should probably be human-friendly regardless — it's the saved/shared artifact, and power users need to read
and edit it. Claude and humans wanting the same thing (readable, domain-flavored) is a good sign.

## The Three Core Design Problems

Regardless of syntax choice, three problems must be solved:

1. **Query language semantics** — what can you express, precisely? The spike's 7 computation types set a floor. The
   vocabulary (nouns from schema, computations from selectors) is known. But how do you compose them? What are the
   boundaries of expressiveness? The computation catalog grows over time as new selectors are added — the grammar must
   accommodate this without changes.

2. **Schema/context mechanism** — how does a query author (human or Claude) know what's available to query? The SQLite
   schema is a formal answer — it defines entities, relationships, valid values (CHECK constraints). But the schema
   alone doesn't tell you about derived computations (selector catalog), sign conventions (expenses are negative), or
   what categories/accounts actually exist in a given user's data. Some combination of schema + computation registry +
   live data summary is needed.

3. **Validation** — how does the system reject or correct bad queries before execution? Syntax validation is the
   parser's job. Structural validation (valid field combinations, known computation types) can be checked against the
   grammar and computation registry. Semantic validation (does category "Dining" exist in this user's data?) requires
   access to live data. Good error messages matter — "Unknown category 'Dining' — did you mean 'Food:Dining'?" is the
   goal.

## Trust / Correctness

- **Tree drill-down = audit trail** — top level shows aggregates, expand to see actual transactions
- **Show inclusion/exclusion** — "47 transactions across 3 accounts, categories: Restaurants, Fast Food, Coffee Shops"
- **Validation before execution** — parser rejects or corrects bad queries (see "Three Core Design Problems" above)
- **Schema as contract** — the SQLite schema defines what's queryable; CHECK constraints enumerate valid values; this is
  the ground truth for both the parser and Claude

## Saved / Shared Queries

- Saved as **human-readable text files** in the query language
- **Shareable** — send to another user, pull from a community repository
- **Portable** — semantic references (category names, relative dates), no hardcoded IDs
- **Editable** by power users who learn the syntax

Flywheel: first time → Claude conversation → query → save. After that → one click, no Claude needed. Need changes → edit
directly or re-open conversation.

## Spike 1 Findings

**Commits:** `1e7072c2`, `136245b1`, `84195c7e` (branch removed; findings preserved here)

### What we tested

- JSON query spec format with named queries (transactions/holdings/accounts domains) + computation type + output hints
- Execution harness that hydrates SQLite → LookupTables, runs specs through existing selectors
- 8 specs covering all 6 target question types
- v2 iteration adding `accountType` filter and `abs()` in expressions

### What the spike proved

- **Existing selectors cover the target question set.** TransactionFilter, CategoryTree, HoldingsTree, HoldingsModule,
  EnrichedAccount map almost 1:1 to query spec fields.
- **Category prefix matching already works.** `selectedCategories: ["Food"]` matches `Food:Dining`, `Food:Groceries` via
  `Transaction.matchesCategories`.
- **The spec format is composable.** "Run N queries, combine with computation" handles all target question types.
- **7 of 7 computation types work** — identity, compare, ratio, filter_entities, statistical, aggregate_sum, expression.

### What the spike didn't prove

- **Can Claude produce valid queries?** All 8 specs were hand-written.
- **Query language design.** The spike used ad hoc JSON, not a designed language with syntax and parser.
- **Schema as context.** No schema description was given to Claude; no test of whether schema knowledge enables accurate
  query generation.
- **Conversation UX.** The clarify → confirm → run loop wasn't tested.
- **Parameterization / relative dates.** Not explored.

### Issues found and resolved

| Issue                                    | Resolution                         |
|------------------------------------------|------------------------------------|
| Sign convention (expenses are negative)  | `abs()` in expressions             |
| Account type double-counting (net worth) | `accountType` filter               |
| Category matching fragility              | Already worked via prefix matching |
| Holdings vs transaction aggregate shape  | `treeTotal` handles both           |

### Production gaps (5 items, no new architectural layers)

1. **Account type filter selector** — memoized `Accounts.filterByType(types)`
2. **Safe expression evaluator** — replace spike's `eval()` with math parser (`+`, `-`, `*`, `/`, `abs`, parens)
3. **Relative date resolver** — `"last_quarter"` → `{start, end}`
4. **Sign-aware ratio** — normalize signs for cross-domain ratios
5. **Unified metric extraction** — domain-typed extractors instead of fallback chains

## Spike 2 Findings

**Commits:** `1665fe50`, `779dbcf1` (branch `worktree-spike-query-language`)

### What we tested

- Designed a keyword-driven surface syntax (named query blocks with `from`, `where`, `date`, `group by`, `show`,
  `compare`, `compute`, `format` clauses)
- Hand-written recursive descent parser (~280 lines) emitting IR
- 46 parser tests: 4 example queries, date/filter variants, expression precedence, 8 error cases
- Claude generation test: Haiku subagents (fresh context, no prior knowledge) given a ~180-line prompt with schema +
  syntax reference + 4 examples, then asked 4 NEW questions

### What the spike proved

- **Claude can produce valid queries from examples alone.** 4/4 new questions parsed correctly with correct semantics.
  Haiku (cheapest model) was sufficient — no need for Sonnet/Opus.
- **Semantic disambiguation works.** "Compare quarter by quarter" correctly became `group by quarter` (trend), not a
  `compare` clause (two-period diff). Claude understood intent, not just keyword matching.
- **Convention adherence without explicit instruction.** Claude used `abs()` for ratio queries after seeing it in
  examples — picked up the sign convention implicitly.
- **Filter composition is correct.** Multiple `where` clauses on the same source stacked correctly (AND semantics).
- **Hand-written parser is tractable.** Recursive descent with clause dispatch covers all 4 computation types.
  Expression parser handles standard precedence. Good error messages with line/col positions.
- **4 computation types suffice.** Spike 1's 7 types collapsed to 4 (identity, compare, expression, filter_entities) —
  ratio and aggregate_sum fold into expression.

### What the spike didn't prove

- **Execution.** No queries were actually run against data. Parser → IR is validated; IR → results is not.
- **Semantic validation.** Queries reference categories like "Entertainment" that may not exist in user data. Parser
  can't check this.
- **Adversarial/ambiguous questions.** Only 4 well-formed questions tested. No out-of-scope, unanswerable, or
  deliberately tricky inputs.
- **Multi-turn clarification.** No "what do you mean by housing?" dialogue tested.
- **Scale.** A production evaluation needs 20-50 queries covering edge cases.

### Design observation

The surface syntax and the IR are structurally close — both are declarative, both use similar vocabulary (sources,
filters, date ranges, computations). This is fine for a spike, but worth exploring whether a more distinct surface
syntax (more natural-language-flavored, or more terse/symbolic) would serve different audiences better. The compilation
model (surface → IR) supports multiple surface syntaxes by design.

### Open questions answered

| Question                       | Answer                                                                                                          |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Surface syntax design          | Keyword-driven blocks work. Grammar is stable when computation catalog grows (new functions, not new keywords). |
| IR design                      | QueryIR with named sources, 4 computation types, expression AST. Clean separation from surface syntax.          |
| How Claude learns the language | ~180 lines of schema + syntax reference + 4 examples is enough. Few-shot examples are the key ingredient.       |
| Expression language scope      | Arithmetic (`+`, `-`, `*`, `/`) + `abs()` + `source.field` references. Sufficient for all target questions.     |

### Open questions remaining

- ~~Semantic validation (categories/accounts exist in user data)~~ — answered by spike 3
- Parameterization (relative dates beyond what's built in, semantic category groups)
- ~~Result view components (tables, scalars, comparisons, charts)~~ — answered by spike 5
- Community sharing mechanism
- Whether a second, more distinct surface syntax is worth building

## Spike 3 Findings

**Commits:** `04775177` (branch `worktree-spike-semantic-validation`)

### What we tested

- QueryValidator: takes QueryIR + DataSummary and returns validation results with suggestions
- Four matching strategies: Levenshtein distance (typos), prefix matching, substring matching, hierarchical category
  path matching ("Dining" → "Food:Dining")
- 21 tests: unit tests for Levenshtein/suggestions, integration tests parsing queries through parser → validator
- 8 demo queries against realistic data (57 categories, 11 accounts, 22 payees)
- Error types: misspelled categories, bare subcategory names, nonexistent accounts, wrong account types, misspelled
  payees, multiple errors per query

### What the spike proved

- **Semantic validation is tractable.** ~150 LOC for the validator (excluding Levenshtein). The DataSummary extraction
  is trivial — just category names, account name/type pairs, and unique payees.
- **Hierarchical category matching is the key insight.** Users (and Claude) naturally write "Dining" when they mean "
  Food:Dining". Splitting category paths on `:` and matching against segments catches this reliably.
- **Multiple matching strategies complement each other.** Prefix catches partial names ("Food" → "Food:Dining"),
  Levenshtein catches typos ("Fod" → "Food"), hierarchical catches bare subcategories ("Dining" → "Food:Dining"),
  substring catches partial matches.
- **Error messages are actionable.** "Unknown category 'Dining' in source '_default'. Did you mean: 'Food:Dining'?" —
  users/Claude can fix this immediately.
- **Multi-error reporting works.** Validator collects all errors across all sources before returning, so users see
  everything wrong at once rather than fix-one-rerun loops.
- **Computation source refs validate cleanly.** Expression AST refs, compare left/right, and identity/filter_entities
  source names are checked against defined sources.
- **Category prefix matching (existing behavior) needs explicit validation.** The parser accepts
  `where category = "Food"` and the execution engine matches it against `Food:Dining`, `Food:Groceries` etc. The
  validator must replicate this logic — checking both exact match AND prefix match.

### What the spike didn't prove

- **Real SQLite data.** Tested against hand-built realistic summaries, not actual hydrated Redux state from a QIF
  import. The DataSummary shape is designed for this, but the extraction path (`dataSummaryFromEntities`) hasn't been
  tested against live LookupTables.
- **Suggestion ranking quality at scale.** With 57 categories, suggestions are reasonable. With 200+ categories (real
  Quicken data), Levenshtein may return too many candidates. May need scoring/ranking rather than simple distance
  threshold.
- **Payee matching at scale.** Real Quicken data has hundreds of payees. Fuzzy matching may need tighter thresholds or
  smarter ranking.
- **Validation integrated into parser pipeline.** Currently parser and validator are separate steps. Production should
  chain them: parse → validate → execute.

### Design decisions

| Decision                                          | Rationale                                                                                                |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| DataSummary is a plain object, not Redux state    | Decouples validation from store structure. Selector extracts summary; validator doesn't touch state.     |
| Multiple matching strategies, priority-ordered    | No single strategy handles all error types. Priority: prefix → hierarchical → substring → Levenshtein.   |
| Levenshtein max distance = 3                      | Catches 1-3 character typos without producing nonsense suggestions.                                      |
| Max 3 suggestions                                 | More than 3 is overwhelming. Ordered by match quality (prefix > hierarchical > substring > Levenshtein). |
| Category prefix matching mirrors execution engine | "Food" is valid if any category starts with "Food:" — same semantics as `Transaction.matchesCategories`. |

### Production considerations

1. **Selector for DataSummary** — memoized selector that extracts `{categories, accounts, accountTypes, payees}` from
   Redux state. Cheap to compute, cache-friendly.
2. **Suggestion ranking** — current approach returns first N matches by strategy priority. At scale, may need to score
   by (strategy weight × Levenshtein distance) and sort.
3. **Payee deduplication** — real payee data is messy ("COSTCO #123", "COSTCO WHOLESALE"). May need payee normalization
   before matching.
4. **Integration point** — validator should run between parser and execution engine. Invalid queries should show errors
   in the UI before any selectors fire.
5. **Claude feedback loop** — when Claude generates a query that fails validation, the error messages + suggestions
   should feed back to Claude for self-correction. This is a natural fit for the "formulate" role.

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

## Spike 5 Findings

**Commit:** `019671da` (branch `worktree-spike-query-result-view`)

### What we tested

- Generic `QueryResultPage` component that dispatches on `viewType` (tree, scalar, comparison)
- Generic `buildTreeColumns` that builds column definitions from metadata arrays, replacing domain-specific column
  files (CategoryReportColumns, InvestmentReportColumns)
- 9 renderer types: expandable, expandableAll, currency, percentage, text, date, count, quantity, price
- Metadata configs replicating both CategoryReportPage (7 columns, 5 filters) and InvestmentReportPage (9 columns,
  4 filters)
- Scalar display (single formatted value) and comparison view (two periods + diff indicator)

### What the spike proved

- **Generic cell renderers work.** The `leafAccessor`/`groupAccessor` pair replaces all TaggedSum-specific cell dispatch
  logic. Investment report: 9/9 columns fully expressible. Category report: 6/7 columns fully expressible (action
  column needs custom `cell` override for ACTION_LABELS — the escape hatch handles it).
- **Five metadata primitives suffice for both domains:**
    - `showAggregate.onlyWhenGroupBy` — restricts group-row values to a specific groupBy dimension (e.g., price/symbol
      only show when grouped by security)
    - `firstChildFallback` — peeks at first child leaf for group rows sharing a property (security symbol, quote price)
    - `staleFn` — extracts stale-price indicator per row (italic + asterisk)
    - `truncatePath` — strips parent path for category display ("Food:Groceries" → "Groceries")
    - `emptyForLeaf`/`emptyForGroup` — conditional visibility per row type
- **Filter chips are registry-driven.** `FILTER_COMPONENTS` maps filter IDs to React components. Metadata specifies
  `filters: ['date', 'category', 'account', 'groupBy', 'search']` — the page renders exactly those chips.
- **View type dispatch is trivial.** `VIEW_COMPONENTS` registry maps viewType → component. Adding new view types (e.g.,
  chart) requires one new component + one registry entry.
- **UI state scoping works unchanged.** Tree expansion, column sizing, column order, highlighted row — all driven by
  `viewId`-scoped Redux state via existing `S.UI.*` selectors and `Action.SetViewUiState`. No new infrastructure
  needed.

### What the spike didn't prove

- **No rendering test.** Components are prototyped but not mounted in the app or tested against real data. The metadata
  configs are structurally correct (matching existing column shapes) but haven't been visually verified.
- **Execution engine integration.** Scalar and comparison values are hardcoded placeholders. The path from IR →
  execution → view props is not wired.
- **Routing.** How queries navigate to QueryResultPage is not explored. Existing report pages are route-driven; query
  results may need a different navigation model.
- **Column sorting.** Generic columns use `accessorKey: 'id'` as a stable placeholder — actual sort functions need
  accessor-based comparison, not yet implemented.
- **GroupBy switching.** Metadata specifies `groupByItems` and `hiddenColumnsByGroup`, but the runtime behavior
  (re-running selector with new groupBy, toggling column visibility) wasn't tested end-to-end.

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

### Design decisions

| Decision | Rationale |
|----------|-----------|
| Accessor functions, not path strings | Functions handle nested access, TaggedSum extraction, computed values. Path strings would need a DSL for the same expressiveness. |
| `cell` escape hatch per column | 1 of 16 columns (category action) needs fully custom rendering. Escape hatch avoids over-generalizing the renderer registry. |
| Renderer factory pattern | Each renderer type is `(colMeta, isLeaf) -> CellComponent`. Factories close over metadata; components receive TanStack Row props. Clean separation. |
| Filter registry, not inline config | Filter components are complex (date pickers, category trees, search). Registry maps IDs to existing components rather than trying to parameterize them. |
| Hardcoded domain knowledge in metadata | `isLeaf`, `staleFn`, accessors reference `CategoryTreeNode`, `HoldingsTreeNode` directly. The *metadata* is domain-specific; the *page and column builder* are generic. |

### Production considerations

1. **Metadata generation from IR.** Current metadata configs are hand-written. Production path: IR execution engine
   produces metadata + data. The IR's column/filter/groupBy declarations compile into the metadata shape above.
2. **Sorting.** Generic columns need sort comparators that use the same accessor functions. TanStack supports custom
   `sortingFn` per column — wire it to `leafAccessor`/`groupAccessor`.
3. **Column sorting by accessor.** `accessorKey: 'id'` is a placeholder. Production needs `accessorFn` that calls the
   appropriate accessor, or custom sort functions.
4. **Existing report pages.** If this approach ships, CategoryReportPage and InvestmentReportPage become thin wrappers
   that pass metadata to QueryResultPage — or disappear entirely if routing changes.
5. **Chart view type.** The `VIEW_COMPONENTS` registry makes adding charts straightforward. Chart component would
   receive the same metadata + data shape.

## Open Questions

- ~~**Surface syntax design**~~ — answered by spike 2. Keyword-driven blocks. May explore a second, more distinct
  syntax.
- ~~**IR design**~~ — answered by spike 2. QueryIR with named sources, 4 computation types, expression AST.
- ~~**How Claude learns the language**~~ — answered by spike 2. Schema + syntax reference + 4 examples (~180 lines).
  Haiku sufficient.
- ~~**Semantic validation**~~ — answered by spike 3. Levenshtein + prefix + hierarchical matching against DataSummary. ~
  150 LOC validator with actionable error messages.
- **Parameterization syntax** — how do relative dates, "all dining categories", account groups work in the surface
  syntax?
- ~~**Expression language scope**~~ — answered by spike 2. Arithmetic + `abs()` + `source.field` references.
- ~~**Result view components**~~ — answered by spike 5. Generic QueryResultPage with metadata-driven columns, filter
  registry, and view type dispatch (tree, scalar, comparison). 9 renderer types cover both domains.
- **Community sharing mechanism** — git repo? in-app marketplace? URL import?
- **Alternative surface syntax** — the current DSL is structurally close to the IR. Worth exploring a more distinct
  format for different audiences?

## Knowledge Destination

| Destination                                                   | Content                                                           |
|---------------------------------------------------------------|-------------------------------------------------------------------|
| `architecture:` docs/architecture/financial-query-language.md | Query language architecture, layer separation, execution model    |
| `decisions:` append                                           | Claude's role scoped to three narrow interfaces; chat UI deferred |

## Spike Status

All validation spikes are complete. The spike phase answered its core questions:

| Spike | Question | Answer |
|-------|----------|--------|
| 1 | Do existing selectors cover the target questions? | Yes — TransactionFilter, CategoryTree, HoldingsTree, etc. map 1:1 |
| 2 | Can we design a parseable surface syntax? Can Claude produce valid queries? | Yes — keyword-driven blocks, recursive descent parser, Haiku 4/4 |
| 3 | Can we validate queries against user data with useful error messages? | Yes — Levenshtein + prefix + hierarchical matching, ~150 LOC |
| 5 | Can a generic page replace both report pages? | Yes — 9 renderer types, 15/16 columns generic, scalar/comparison views |

### Absorbed into implementation

These were listed as potential spikes but don't need separate validation — they're implementation tasks:

- **Expression parser** (was spike 3) — safe math evaluator replacing `eval()`. Known requirement, no design risk.
- **Claude formulation end-to-end** (was spike 6) — spike 2 already proved Claude produces valid queries. Full loop testing happens during implementation.
- **Parameterization** (was spike 7) — relative dates, category groups, portability. Design work, not a validation question.

### Future (independent of query language)

- **Charting** (was spike 8) — chart components for time series and comparisons. Needed for the app regardless. Not blocked on the query language — can be spiked/built independently.

## Plan Sequence

Two plans, sequenced by dependency. Each is independently shippable.

### Plan A: Query engine (no UI changes)

Parser + execution engine + validation + expression evaluator. Everything needed to take a query string, parse it,
validate it against user data, and execute it against Redux state — returning structured results.

**Scope:**

- Surface syntax parser (recursive descent, spike 2 reference code)
- QueryIR data structure
- Semantic validator with fuzzy matching (spike 3 reference code)
- Safe expression evaluator (replaces spike 1's `eval()`)
- Execution engine: IR → selector calls → results
- DataSummary selector for live validation data
- Tests for all of the above

**End state:** `parse(queryString) → validate(ir, dataSummary) → execute(ir, state) → results`. No UI, no pages,
no components. Testable entirely from tap tests.

**Reference worktrees:** `spike-semantic-validation` (parser + validator), `spike-query-result-view` (IR shape)

### Plan B: Generic result views (replaces report pages)

Generic QueryResultPage that replaces CategoryReportPage and InvestmentReportPage. Depends on Plan A's execution
engine for data.

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

### Not planned yet

- **Claude integration** (formulate, summarize, suggest) — deferred per settled decisions
- **Charting** — independent spike/plan when needed
- **Parameterization** — can be added to Plan A's parser or as a follow-up
