---
date: 2026-02-27
topic: claude-financial-assistant
---

# In-App Claude Financial Assistant

## What We're Building

A chat interface inside quicken-web-app where users ask financial questions in natural language. Claude converses to understand the question, formulates a query against the app's data, confirms its interpretation, then runs the query and presents results in a standard tree/table report view.

The key insight: Claude is the **query formulator**, not a UI generator. The output format is always the same — a DataTable with expandable tree drill-down (like InvestmentReportPage / CategoryReportPage). Claude's job is understanding the question and producing the right query spec.

## Why This Approach

Instead of building dozens of specialized report screens (the traditional Quicken approach), we build one generic results view and let Claude be the report builder. Users get the full analytical power of the app through conversation rather than through complex pre-built UIs.

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

Pattern: **writes, glances, workflows, and known-item lookups** need pre-built UI. **Exploration and analysis** fit the ask paradigm.

## Core Loop

1. User asks a question in the chat panel
2. Claude converses to clarify (what accounts? what time period? what categories?)
3. Claude states its interpretation — "I understood this as: dining spend Q1 2026 vs Q4 2025 across all accounts"
4. User confirms or corrects
5. Query runs against Redux state → results displayed in tree/table view
6. User can drill down (expand tree nodes to see supporting transactions)
7. User can continue conversation to tweak ("also include Bar & Alcohol")

## Query Spec: Two Levels

Claude produces both:

- **Concrete** — runs right now (specific dates, account IDs, category IDs)
- **Parameterized** — the reusable version with relative dates, semantic category references, named account groups

The concrete spec executes immediately. The parameterized spec is what gets saved.

## Trust / Correctness

- **Show the interpretation** before running — user confirms Claude understood correctly
- **Tree drill-down = audit trail** — top level shows aggregates, expand to see actual transactions
- **Show inclusion/exclusion** — "47 transactions across 3 accounts, categories: Restaurants, Fast Food, Coffee Shops"
- **Conversational tweaking** — "Also include Bar & Alcohol" → re-run

## Saved Queries

Users can save a query and replay it later without Claude:

- Saved as a **human-readable text file** (format TBD — start declarative, see where walls are)
- **Shareable** — send to another user, pull from a community repository
- **Portable** — no hardcoded IDs; references are semantic (category names, relative dates, account groups)
- **Eventually editable** by power users (not a priority initially)

Flywheel: first time → conversation → query → save. After that → one click, no Claude needed. Need changes → re-open conversation, tweak, re-save.

## Key Decisions

- **Redux first** — query against in-memory Redux state, not SQLite. Simpler, no async boundary, no security surface. SQLite can come later for richer queries.
- **One report format** — always a tree/table DataTable view. Keeps the problem tractable.
- **Confirm before running** — Claude states interpretation, user approves. Prevents silent wrong answers.
- **Declarative query spec** — start with a declarative format, not a DSL. Add expressiveness when we hit walls.

## Open Questions

- Exact query spec format (declarative YAML-like? JSON? custom DSL?)
- How Claude "knows" what's in Redux (do we describe the schema? pass selector signatures?)
- Chat UI placement (sidebar? modal? drawer? dedicated page?)
- How parameterization works for complex queries (relative dates are easy; "all dining categories" is harder)
- Community sharing mechanism (git repo? in-app marketplace? URL import?)

## Next Steps

- Spike: narrowest possible slice — hardcoded chat panel, Claude generates a filter/group config, existing selectors run it, results in DataTable
- Evaluate whether Redux-query approach handles the target question set
- Identify where declarative spec hits its limits
