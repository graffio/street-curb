---
date: 2026-02-27
topic: claude-financial-assistant
---

# Financial Query Language & Claude Assistant

## What We're Building

A query language for financial data analysis, with a mechanical parser and execution engine that runs against the app's Redux state. The query language is the core artifact — human-readable, machine-parseable, saveable, shareable.

Claude plays three narrow, well-defined roles with clean interfaces (text in, text out):

1. **Formulate queries** — conversational on-ramp where Claude helps users express what they want as a query
2. **Summarize results** — natural language interpretation of query output ("Your dining is up 40% QoQ, driven by three new restaurants")
3. **Suggest follow-ups** — after seeing results, propose 2-3 related queries

The chat interface is **deferred**. Phase 1 is the query language + parser + execution engine. Users can formulate queries in a separate Claude session and paste them into the app. The in-app chat comes later when we add summarization and follow-up suggestions.

## Why This Approach

Instead of building dozens of specialized report screens, we build one generic results view and a query language that drives it. Users get the full analytical power of the app through queries rather than through complex pre-built UIs.

The query language (not Claude) is the center of gravity. Claude is one producer of queries. Power users can write them directly. Communities can share them.

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

Pattern: **writes, glances, workflows, and known-item lookups** need pre-built UI. **Exploration and analysis** fit the query paradigm.

## Why Claude's Role Is Narrow

The natural instinct is to make Claude do more — interpret results, notice patterns, explain anomalies proactively, act as a financial advisor. We explored this and rejected it for Phase 1.

The problem: **how does it *know*?** Proactive insights ("your dining is up 40% and here's why") require broad context Claude doesn't have — the user's full financial history, what's "normal" for them, seasonal patterns. There's no clean trigger mechanism for "notice something interesting." It would require feeding Claude large amounts of data speculatively, and the output quality would be unpredictable.

More fundamentally, the richer Claude's role, the more tightly coupled it becomes with the app's internals. Each new capability is an idiosyncratic integration point that's hard to standardize and hard to test. The three narrow roles (formulate, summarize, suggest) all have the same interface shape: text in, text out. That's testable, replaceable, and doesn't require deep app coupling.

Proactive interpretation and financial advisory features may be worth building eventually, but they're a different product with a much bigger integration surface. Don't conflate them with the query language system.

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

A textual language with real syntax and a real parser. Queries are the artifact that gets saved, shared, edited, and replayed.

**Vocabulary comes from two sources:**
- **Nouns/filters** — from the SQLite schema (`schema.sql`). Accounts, transactions, categories, securities, date ranges, account types, investment actions. The schema is already a formal, precise description of what data exists, including CHECK constraints that enumerate valid values.
- **Computations/outputs** — from the selector catalog. Balance, market value, group-by-category, group-by-month, tree aggregates, comparisons, ratios, etc.

**Key design constraint:** The grammar must be stable when the computation catalog grows. Like SQL: adding a new table doesn't change the grammar, and adding a new function (`MEDIAN()`, `PERCENTILE()`) doesn't either — because the grammar has generic function-call syntax and a registry of valid function names. Similarly, this language should have generic computation syntax and a registry. New selectors = new registry entries, not grammar changes.

### 2. IR (Internal Representation)

The IR is a **declarative data structure** — an AST-like object that describes what to compute, not the computation itself. Based on the spike, its shape is roughly:

- A set of **named queries**, each targeting a domain (transactions, holdings, accounts) with filters
- A **computation** that combines query results (identity, compare, ratio, expression, statistical, etc.)
- **Output hints** (labels, formatting, grouping)

The IR is not "a series of selector calls" — it's what gets *interpreted into* selector calls by the execution engine. This separation matters: the IR can be validated, serialized, and inspected before anything executes.

### 3. Parser + Execution Engine

- **Parser** — mechanical, deterministic, good error messages ("Unknown category 'Dining' — did you mean 'Food:Dining'?"). Compiles surface syntax → IR.
- **Execution** — interprets IR into selector calls against Redux state. The spike validated that existing selectors (TransactionFilter, CategoryTree, HoldingsTree, HoldingsModule, EnrichedAccount) cover the target question set.

### 4. Result Viewing

The spike didn't produce any real UI — this is a significant gap. Query results need flexible React components:

- **DataTable with tree drill-down** — exists for transactions and holdings. Needs to work with arbitrary query output.
- **Filter chips** — existing filter-chips components (DateFilterChip, CategoryFilterChip, AccountFilterChip, etc.) let users refine results interactively. Query results should be refineable the same way.
- **Scalar displays** — some queries produce a single number ("savings rate: 82.2%"), not a table.
- **Comparison views** — side-by-side or diff-style display for "this quarter vs last."
- **Graphing/charting** — time series (monthly spending trend), bar charts (category comparison), pie charts (portfolio breakdown). Needed even if this brainstorm is never implemented — the app needs charting regardless.

The output format isn't always "one tree/table." The IR's computation type should determine which view components render the result. This is an open design problem.

### 5. Claude Integration (deferred)

Three roles, each with a clean text-in/text-out interface:
- **Formulate** — user describes intent → Claude produces query text. Requires Claude to know the schema and computation catalog.
- **Summarize** — query results → Claude produces natural language interpretation. Trigger: always after execution.
- **Suggest** — query results → Claude suggests 2-3 follow-up queries in the query language. Trigger: always after execution.

## Format vs. Correctness

A key insight from discussion: **JSON (or any format) is a container, not a language.** Syntactically valid JSON with wrong category names, nonsensical date ranges, or meaningless field combinations is still valid JSON. The spike's JSON specs were "accurate" only in the trivial sense of being parseable.

"Accurate" has three levels:
1. **Syntactically valid** — parseable. Trivial for JSON. Any format can achieve this.
2. **Structurally correct** — right fields, right types, valid combinations. JSON Schema or a typed grammar can enforce this.
3. **Semantically correct** — references real categories in the user's data, date ranges that make sense, computations that answer the question asked. No format or schema can guarantee this.

Level 3 is the hard problem, and it's **independent of format choice**. Whether the query is JSON, SQL, or a custom DSL, the question is the same: does the query author (human or Claude) know enough about the data to write a correct query? This is why the schema/context mechanism matters more than the syntax choice.

This also means the format question ("JSON? SQL? custom DSL?") shouldn't be agonized over as if correctness depends on it. Pick the format that's most readable/writable for its audience. Correctness comes from the validation layer, not the serialization format.

## Surface Syntax Layers (Compilation Model)

By analogy with programming languages: the query system may have multiple representation levels, like source code → bytecode → execution.

- **IR (internal representation)** — the "bytecode." Close to the execution engine, maps directly to selector calls. The spike's JSON query spec is a rough sketch of this level. Doesn't need to be human-friendly — it's what the execution engine consumes.
- **Surface syntax(es)** — the "source code." Human-facing formats that **compile down** to IR. Could have multiple surface syntaxes geared toward different audiences (power users, Claude, shared repos). Each surface syntax has its own parser that emits IR.
- **Natural language** — not a format, just a process. Claude converts natural language to a surface syntax.

Benefits of this layering:
- Execution engine only knows about IR — insulated from syntax changes
- Each surface syntax has an independent parser
- Adding a new surface syntax doesn't touch execution
- Validation can happen at IR level regardless of source
- The "which format?" question becomes less fraught — you can have multiple, and the IR is just an implementation detail

## What Syntax Would Claude Prefer to Write?

Claude (as a query producer) is most accurate with syntax that's **declarative and domain-specific** rather than SQL-ish. Financial queries aren't SQL-shaped — no JOINs, no FROM, the "tables" are domains. Something like:

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

This maps closely to how Claude would *describe* the query in English, which is why it's accurate. SQL would also work but forces financial concepts into relational semantics that don't quite fit. A novel DSL is fine as long as Claude has 5-10 examples in context.

The syntax should probably be human-friendly regardless — it's the saved/shared artifact, and power users need to read and edit it. Claude and humans wanting the same thing (readable, domain-flavored) is a good sign.

## The Three Core Design Problems

Regardless of syntax choice, three problems must be solved:

1. **Query language semantics** — what can you express, precisely? The spike's 7 computation types set a floor. The vocabulary (nouns from schema, computations from selectors) is known. But how do you compose them? What are the boundaries of expressiveness? The computation catalog grows over time as new selectors are added — the grammar must accommodate this without changes.

2. **Schema/context mechanism** — how does a query author (human or Claude) know what's available to query? The SQLite schema is a formal answer — it defines entities, relationships, valid values (CHECK constraints). But the schema alone doesn't tell you about derived computations (selector catalog), sign conventions (expenses are negative), or what categories/accounts actually exist in a given user's data. Some combination of schema + computation registry + live data summary is needed.

3. **Validation** — how does the system reject or correct bad queries before execution? Syntax validation is the parser's job. Structural validation (valid field combinations, known computation types) can be checked against the grammar and computation registry. Semantic validation (does category "Dining" exist in this user's data?) requires access to live data. Good error messages matter — "Unknown category 'Dining' — did you mean 'Food:Dining'?" is the goal.

## Trust / Correctness

- **Tree drill-down = audit trail** — top level shows aggregates, expand to see actual transactions
- **Show inclusion/exclusion** — "47 transactions across 3 accounts, categories: Restaurants, Fast Food, Coffee Shops"
- **Validation before execution** — parser rejects or corrects bad queries (see "Three Core Design Problems" above)
- **Schema as contract** — the SQLite schema defines what's queryable; CHECK constraints enumerate valid values; this is the ground truth for both the parser and Claude

## Saved / Shared Queries

- Saved as **human-readable text files** in the query language
- **Shareable** — send to another user, pull from a community repository
- **Portable** — semantic references (category names, relative dates), no hardcoded IDs
- **Editable** by power users who learn the syntax

Flywheel: first time → Claude conversation → query → save. After that → one click, no Claude needed. Need changes → edit directly or re-open conversation.

## Spike 1 Findings

**Commits:** `1e7072c2`, `136245b1`, `84195c7e` (branch removed; findings preserved here)

### What we tested

- JSON query spec format with named queries (transactions/holdings/accounts domains) + computation type + output hints
- Execution harness that hydrates SQLite → LookupTables, runs specs through existing selectors
- 8 specs covering all 6 target question types
- v2 iteration adding `accountType` filter and `abs()` in expressions

### What the spike proved

- **Existing selectors cover the target question set.** TransactionFilter, CategoryTree, HoldingsTree, HoldingsModule, EnrichedAccount map almost 1:1 to query spec fields.
- **Category prefix matching already works.** `selectedCategories: ["Food"]` matches `Food:Dining`, `Food:Groceries` via `Transaction.matchesCategories`.
- **The spec format is composable.** "Run N queries, combine with computation" handles all target question types.
- **7 of 7 computation types work** — identity, compare, ratio, filter_entities, statistical, aggregate_sum, expression.

### What the spike didn't prove

- **Can Claude produce valid queries?** All 8 specs were hand-written.
- **Query language design.** The spike used ad hoc JSON, not a designed language with syntax and parser.
- **Schema as context.** No schema description was given to Claude; no test of whether schema knowledge enables accurate query generation.
- **Conversation UX.** The clarify → confirm → run loop wasn't tested.
- **Parameterization / relative dates.** Not explored.

### Issues found and resolved

| Issue | Resolution |
|---|---|
| Sign convention (expenses are negative) | `abs()` in expressions |
| Account type double-counting (net worth) | `accountType` filter |
| Category matching fragility | Already worked via prefix matching |
| Holdings vs transaction aggregate shape | `treeTotal` handles both |

### Production gaps (5 items, no new architectural layers)

1. **Account type filter selector** — memoized `Accounts.filterByType(types)`
2. **Safe expression evaluator** — replace spike's `eval()` with math parser (`+`, `-`, `*`, `/`, `abs`, parens)
3. **Relative date resolver** — `"last_quarter"` → `{start, end}`
4. **Sign-aware ratio** — normalize signs for cross-domain ratios
5. **Unified metric extraction** — domain-typed extractors instead of fallback chains

## Settled Decisions

- **Query language is the core artifact** — not Claude's output format, not JSON blobs. A real language with syntax and a parser.
- **Claude has three narrow roles** — formulate, summarize, suggest follow-ups. All text-in/text-out.
- **Chat interface is deferred** — query language + parser + execution first. Paste queries for now.
- **Redux first** — query against in-memory Redux state. Selectors are the execution layer.
- **Flexible result views** — DataTable with tree drill-down is the primary view, but scalar results, comparisons, and charts need their own components. IR computation type determines which view renders.
- **Schema as vocabulary** — SQLite schema defines the nouns/filters. Selector catalog defines the computations. Grammar is stable; new computations = new registry entries, not grammar changes.

## Open Questions

- **Surface syntax design** — what does the human-facing query language actually look like? SQL-ish? Report-flavored? Multiple surface syntaxes?
- **IR design** — refine the spike's JSON spec into a proper internal representation
- **How Claude learns the language** — give it the schema + computation catalog + grammar? Few-shot examples?
- **Semantic validation** — parser can check syntax, but how do you validate that referenced categories/accounts exist in the user's data?
- **Parameterization syntax** — how do relative dates, "all dining categories", account groups work in the surface syntax?
- **Expression language scope** — just arithmetic (`+`, `-`, `*`, `/`, `abs`)? Or richer (aggregation functions, conditionals)?
- **Community sharing mechanism** — git repo? in-app marketplace? URL import?

## Knowledge Destination

| Destination | Content |
|---|---|
| `architecture:` docs/architecture/financial-query-language.md | Query language architecture, layer separation, execution model |
| `decisions:` append | Claude's role scoped to three narrow interfaces; chat UI deferred |

## Next Steps

### Spike 2: Surface syntax + parser

Design a minimal surface syntax for 3-4 of the target questions. Build a parser that emits IR. Test whether the syntax is writable by humans and producible by Claude (give Claude schema + computation catalog + examples, see if it generates valid queries).

### Potential further spikes

- **Spike 3: Expression parser** — build the safe math expression evaluator (replaces spike's `eval()`). Needed regardless of query language decisions.
- **Spike 4: Semantic validation** — given live user data, can the system validate that categories/accounts referenced in a query actually exist? Test fuzzy matching and "did you mean?" suggestions.
- **Spike 5: Result view components** — what React components are needed beyond DataTable? Test scalar displays, comparison views, time series charts. Likely useful for the app independent of this feature.
- **Spike 6: Claude formulation end-to-end** — full loop: natural language → Claude → surface syntax → parse → execute → results. How much schema context does Claude need? What's the error rate?
- **Spike 7: Parameterization** — relative dates (`last_quarter`, `trailing_12_months`), semantic category groups (`all dining`), saved query portability across users with different category structures.
- **Spike 8: Charting** — chart component for time series and comparisons. Needed for the app regardless — not specific to this feature.
