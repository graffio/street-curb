---
date: 2026-03-03
topic: investment-analysis
depends-on: 2026-02-27-claude-financial-assistant-brainstorm.md
---

# Investment Analysis: Positions, Metrics & Capital Gains

## What We're Building

Extensions to the financial query language (see `2026-02-27-claude-financial-assistant-brainstorm.md`) that support
investment analysis questions:

- "Which stocks performed best last year?"
- "Which stocks have beaten the S&P while I've owned them?"
- "Which capital gains did I have last year?"
- "What would selling this stock trigger?" (forward-looking tax impact per lot)
- "Net worth trend over the last 12 months"

These require four things the query engine doesn't have yet:

1. **Position entity** — enriched replacement for Holding with lifecycle data (realized gains, dividends, performance)
2. **Metric registry** — named computed functions (total return %, IRR, benchmark alpha) extensible without grammar
   changes
3. **Query language extensions** — `order by`, `limit`, time series support
4. **Position enrichment** — in-memory computation of realized gains, dividends, performance from existing data

## Why This Matters

The existing query engine handles spending/budget analysis well but is blind to investment analysis. Quicken Premier's
investing reports (Capital Gains, Performance, Assets) have no equivalent. The lot and allocation infrastructure exists
in the import pipeline and web app — the data is there, but no computation layer derives performance metrics, realized
gains, or benchmark comparisons from it.

Investment analysis also represents the highest-value queries for the target user (Quicken Premier users managing
portfolios). Spending analysis is useful; knowing your portfolio's actual performance vs benchmarks is worth real money.

### Quicken Premier Report Gap Analysis

**Already covered** (existing pages or expressible via query language):

| Report                                   | How                                  |
|------------------------------------------|--------------------------------------|
| Spending by Category/Account/Payee/Month | CategoryReportPage, query language   |
| Investment Assets (Holdings)             | InvestmentReportPage                 |
| Period Comparisons                       | Query language `compare` computation |
| Account Balances                         | Query language `FilterEntities`      |

**Missing — needs new computation infrastructure:**

| Report                 | What's Needed                                                                |
|------------------------|------------------------------------------------------------------------------|
| Capital Gains          | Realized gain computation from lots + allocations (short/long term)          |
| Investment Performance | Total return, IRR, benchmark comparison                                      |
| Net Worth over time    | Time series — position snapshots at multiple dates                           |
| Cash Flow              | Income vs expenses over time (time series on transactions)                   |
| Tax Schedule           | `isTaxRelated` and `taxSchedule` fields exist on categories but not surfaced |
| Tax Overview           | Depends on capital gains + tax schedule                                      |

**Out of scope for now:**

| Report               | Status                                                                                                                             |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Budget reports       | Low priority — no budget infrastructure exists                                                                                     |
| Spending by Tag      | Tags table exists in schema but not imported to web app. High priority but deferred.                                               |
| Tax category mapping | Medium priority — except forward-looking tax classification (short/long term) which comes from lot holding periods and IS in scope |

## The Position Entity

### Why "Position" replaces "Holding"

In finance:

- **Holdings** = what you currently own. Point-in-time, present-tense.
- **Position** = your stake in a security. Can be open or closed. Has lifecycle semantics.

Both work for "what do I own as of a date?" But only Position naturally extends to realized gains ("closed
positions"), capital gains, and performance over time. "Realized gains on my holdings" is semantically wrong — you
realized gains on positions you no longer hold.

Keeping both terms creates unnecessary ambiguity about which to use when. **Rename Holding to Position throughout.**

### What Position contains

References (replaces flattened field duplication):

- `account: Account` — was `accountId` + `accountName`
- `security: Security` — was `securityId` + `securityName` + `securitySymbol` + `securityType` + `securityGoal`

Core position data (from lot aggregation + prices):

- `quantity, costBasis, averageCostPerShare`
- `quotePrice, marketValue, isStale`
- `unrealizedGainLoss, unrealizedGainLossPercent`
- `dayGainLoss, dayGainLossPercent`

New fields from enrichment:

- `realizedGain` — sum of (sale proceeds - costBasisAllocated) from lot allocations for this (account, security)
- `dividendIncome` — sum of Div/DivX/ReinvDiv/etc. transactions for this security
- `totalReturnDollars` — unrealizedGainLoss + realizedGain + dividendIncome
- `totalReturnPct` — totalReturnDollars / total cost basis invested
- `benchmarkReturnPct` — benchmark (e.g. S&P) return from earliest purchase date to asOfDate
- Additional metrics from the metric registry (IRR, alpha, etc.)

### Position relationships

Two kinds of connections between positions:

**Structural (instrument-level):** Options, warrants, and convertible bonds have an inherent relationship to an
underlying security. This is a property of the Security, not the Position:

- `Security.underlyingSecurityId: SecurityId?` — new field
- The UI can aggregate options under their underlying in tree views (a groupBy dimension)
- Parseable from security names in some cases ("AAPL Jan 26 200 Call"), but stored explicitly for reliability

**User-defined (arbitrary groupings):** Strategy tags handle everything else — "covered call on AAPL" applied to
both the shares and the call option groups them. "Dividend growth", "tech sector bet", "inherited portfolio" are
all tags. Tags are deferred but the design accommodates them (see Settled Decisions).

No richer relationship types (bidirectional links, named relationship types) are needed. The structural field +
tags covers all identified use cases.

### Why references, not flattened fields

The current Holding type duplicates 5 Security fields and 1 Account field. Position references the actual objects
instead. Benefits: Security is the single source of truth (when Security gains fields like tags, Position has
access automatically). Tradeoff: nested access in columns (`position.security.name` instead of
`position.securityName`) — minor ergonomic cost, worth it for the cleaner model.

### Rename map

| Current                                    | New                                |
|--------------------------------------------|------------------------------------|
| `Holding` type                             | `Position`                         |
| `HoldingsTree`                             | `PositionTree`                     |
| `HoldingsTreeNode`                         | `PositionTreeNode`                 |
| `HoldingsAggregate`                        | `PositionAggregate`                |
| `Holdings.computeHoldingsAsOf`             | `Positions.computePositionsAsOf`   |
| `S.Holdings.asOf`                          | `S.Positions.asOf`                 |
| `S.Holdings.tree`                          | `S.Positions.tree`                 |
| `InvestmentReportPage` holdings references | positions references               |
| `InvestmentReportColumns`                  | Update accessors for new type name |

### Tree drill-down

Positions use the same tree pattern as today:

- **Group level** — by account, security, type, goal (existing dimensions), or tax classification (new)
- **Position level** — one row per (account, security) with aggregate metrics
- **Lot level** (new) — individual lots with purchase date, cost basis, unrealized gain, holding period, tax
  classification (short/long term)

Lot-level drill-down enables:

- Tax lot detail for capital gains reports
- Forward-looking "what would selling trigger" per lot
- Specific lot identification for override assignment

## Metric Registry

Performance metrics are named computed functions registered in a catalog. New metrics = new registry entries, not
grammar changes. Follows the same "stable grammar" principle as the computation catalog.

### Initial metrics

| Metric                 | Computation                                                 | Level        |
|------------------------|-------------------------------------------------------------|--------------|
| `total_return_pct`     | (unrealized + realized + dividends) / total cost basis      | Per position |
| `total_return_dollars` | unrealized + realized + dividends                           | Per position |
| `irr`                  | Internal rate of return from transaction cash flows         | Per position |
| `benchmark_return_pct` | Benchmark price return from position inception to asOfDate  | Per position |
| `alpha`                | total_return_pct - benchmark_return_pct                     | Per position |
| `realized_gain`        | Sum of (proceeds - costBasisAllocated) from lot allocations | Per position |
| `dividend_income`      | Sum of dividend transactions                                | Per position |

### Future metrics (not in scope, but registry must accommodate)

- Volatility (standard deviation of returns)
- Sharpe ratio (return vs volatility)
- Risk-adjusted metrics (Sortino, etc.)
- Sector/allocation percentages

### Benchmark comparison

Benchmark is a security in the prices table (e.g. S&P 500 index). Comparison is **per-position inception-matched**:
for each position, look up benchmark price on the earliest lot's purchase date and compute benchmark return over the
same window. This is the only accurate comparison — period-based comparison ignores when you actually bought.

Uses the existing `findPriceAsOf(priceIndex, benchmarkSecurityId, date)` infrastructure.

## Capital Gains

Capital gains are **realized gains on positions**, not a separate domain. They come from lot allocations — each
allocation records shares sold from a specific lot with the cost basis allocated.

### Realized gain computation

For each lot allocation:

- `realizedGain = saleProceeds - costBasisAllocated`
- `holdingPeriodDays = allocationDate - lot.purchaseDate`
- `taxClassification = holdingPeriodDays > 365 ? 'long-term' : 'short-term'`

Sale proceeds come from `proceedsAllocated` — a **new field on LotAllocation**, computed during import alongside
`costBasisAllocated`. When a sell transaction spans multiple lots, proceeds are prorated:
`proceedsAllocated = (sharesAllocated / transaction.quantity) * (transaction.price * transaction.quantity - commission)`.
This matches the existing pattern for `costBasisAllocated` — compute once during import, not at runtime.

Aggregated per position: sum of all allocations' realized gains, grouped by tax classification.

### Forward-looking tax impact

"What would selling AAPL trigger?" — per open lot analysis:

- For each open lot: current market value - remaining cost basis = hypothetical gain/loss
- Holding period from purchaseDate to today → short-term or long-term classification
- Uses the default cost basis method (FIFO currently, LIFO designed but not implemented) to determine
  which lots would be sold first

### Cost basis method

Lot allocations are computed during QIF import using **hardcoded FIFO**. The schema has infrastructure for
alternatives:

- `userPreferences` table — intended for default strategy (FIFO/LIFO), currently unused
- `lotAssignmentOverrides` table — per-sell-transaction overrides, currently unused

For this brainstorm: FIFO is the only implemented strategy. Forward-looking analysis uses FIFO ordering of open lots.
LIFO support and user-configurable strategy are future work but the schema is ready.

## Time Series

Many investment queries need values at multiple points in time: net worth trend, performance over time, position
value history.

### Approach

Time series = run `computePositionsAsOf(date)` at N dates. The function already accepts any `asOfDate`. For a
12-month monthly series, that's 12 invocations. If this proves too slow for large portfolios, a SQLite cache of
periodic snapshots can be added later without changing the query language or result shape.

### Intervals

Flexible: daily, weekly, monthly, quarterly, yearly. The query specifies the interval and date range. The execution
engine generates date points and computes snapshots at each.

### Result shape

Time series produces an array of `{ date, values }` points — a different result shape than tree or scalar. Needs a
new `QueryResult` variant (e.g. `TimeSeries`) and a corresponding view component (chart or table with date columns).

### Query language syntax

```
query net_worth_trend {
  from positions
  date: last 12 months
  time series: monthly
}

query aapl_performance {
  from positions
  where security = "AAPL"
  date: last 2 years
  time series: quarterly
  metrics: total_return_pct, benchmark_return_pct
}
```

`time series: INTERVAL` is a modifier on any position query. It changes the result shape from tree/scalar to series.

## Query Language Extensions

### Date semantics for positions

For transactions, `date: 2025` means "transactions within 2025" (range filter). For positions, `date` has dual
meaning that matches natural user intent:

- **Snapshot**: position computed as of the end of the period (2025-12-31)
- **Enrichment scope**: realized gains and dividends counted only within the period (2025-01-01 to 2025-12-31)

This means "my capital gains in 2025" naturally becomes `from positions, date: 2025, where has realized_gains` —
one clause, no need for separate "as of" and "period" syntax.

**No date clause = lifetime.** `from positions` without a date clause means positions as of today, with cumulative
lifetime metrics (all realized gains, all dividends, total return since inception). This is the natural default for
"which stocks have beaten the S&P?" — each position's benchmark comparison uses its own inception date.

### Order by and limit behavior

- `order by` without `group by` → **flat ranked list** (not a tree)
- `order by` with `group by` → **sorted within each group** (tree preserved)
- `limit N` → only on flat results (no `group by`). Truncates after sorting.

"Top 10 performers" produces a flat list. "Holdings by account, sorted by return" produces a grouped tree.
`limit` with `group by` (top N per group) is deferred.

### Metric-based filtering

`where` filters are implicitly routed based on field name:

- **Entity fields** (security, account, accountType, securityType, goal) → pre-computation filters, applied
  before position enrichment
- **Metric names** (alpha, total_return_pct, realized_gain) → post-computation filters, applied after metrics
  are computed

One `where` keyword for both. The execution engine checks the field name against the entity field registry vs the
metric registry and routes accordingly. No overlap between entity fields and metric names in practice.

### New clauses

| Clause        | Syntax                        | Purpose                             |
|---------------|-------------------------------|-------------------------------------|
| `order by`    | `order by METRIC [asc\|desc]` | Sort results by a metric or field   |
| `limit`       | `limit N`                     | Return top/bottom N results         |
| `time series` | `time series: INTERVAL`       | Produce snapshots at multiple dates |
| `metrics`     | `metrics: metric1, metric2`   | Request specific computed metrics   |

### `from positions` domain

Positions replaces holdings as a domain in the query language. No backward-compatible alias — one entity, one name.
The `Domain` TaggedSum variant is renamed from `Holdings` to `Positions`.

Positions support:

- All existing holdings filters (account, security, securityType, goal, search, asOfDate)
- New filters: `where has realized_gains`, `where tax_classification = "long-term"`
- `group by` existing dimensions plus `tax_classification`
- `order by` any metric
- `metrics` clause to request computed values
- `time series` modifier

### Example queries

```
query best_performers {
  from positions
  date: 2025
  metrics: total_return_pct, total_return_dollars
  order by total_return_pct desc
  limit 10
}

query beat_the_sp {
  from positions
  metrics: total_return_pct, benchmark_return_pct, alpha
  where alpha > 0
  order by alpha desc
}
// No date clause = lifetime cumulative metrics.
// Benchmark is inception-matched per position automatically.

query capital_gains_2025 {
  from positions
  date: 2025
  where has realized_gains
  group by tax_classification
}

query what_if_sell_aapl {
  from positions
  where security = "AAPL"
  show: lots
  metrics: hypothetical_gain, tax_classification, holding_period_days
}

query net_worth_monthly {
  from positions
  date: last 12 months
  time series: monthly
  metrics: market_value
}
```

## Computation Strategy

### In-memory, not schema

Position enrichment (realized gains, dividends, performance metrics) is computed at runtime from data already loaded
into Redux — lots, lot allocations, investment transactions, and prices. No new SQLite tables.

**Why in-memory is sufficient:** A typical personal portfolio has 20-50 positions, a few hundred lots/allocations,
and a few thousand investment transactions. Computing realized gains (one pass through allocations) and dividends
(one pass through transactions, filtered by action type) is milliseconds. Memoized selectors cache the results.

**If profiling shows it's too slow** (large portfolios, time series with many snapshots), add a SQLite cache table
computed during import. But start without it — avoid import pipeline complexity until proven necessary.

### What's computed and when

| Computation                               | When                         | Source data                                          |
|-------------------------------------------|------------------------------|------------------------------------------------------|
| Lot aggregation (shares, cost basis)      | On demand (existing)         | Open lots filtered by asOfDate                       |
| Price enrichment (market value, day gain) | On demand (existing)         | Price index lookups                                  |
| Realized gains per position               | On demand (new, memoized)    | Lot allocations + sell transactions                  |
| Dividend income per position              | On demand (new, memoized)    | Investment transactions filtered by dividend actions |
| Performance metrics                       | On demand (new, memoized)    | Derived from above fields                            |
| IRR                                       | On demand per position (new) | Ordered cash flow history from transactions          |
| Benchmark return                          | On demand (new)              | Price index lookups for benchmark security           |

### Schema changes (minimal)

- `LotAllocation.proceedsAllocated` — new field, computed during import. Prorated sale proceeds per allocation.
- `Security.underlyingSecurityId` — new field for options/warrants/convertibles.

### Existing schema assets (no further changes needed)

- `lots` and `lotAllocations` tables — full purchase/sale history
- `prices` table — historical quotes, including benchmark securities
- `lotAssignmentOverrides` — future cost basis method overrides
- `userPreferences` — future default lot strategy
- `tags` table — exists in schema, not yet imported. Ready for investment tagging when needed.
- `categories.isTaxRelated`, `categories.taxSchedule` — tax classification infrastructure
- `categories.isIncomeCategory` — income/expense classification for cash flow

## Settled Decisions

| Decision                                                    | Rationale                                                                                                                                                                                                              |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Position replaces Holding                                   | One entity, one name. Position naturally covers open + closed + lifecycle. Holding is a point-in-time view that Position subsumes.                                                                                     |
| Metric registry pattern                                     | Extensible without grammar changes. New metrics = new entries. Matches the query language's "stable grammar" principle.                                                                                                |
| Benchmark is per-position inception-matched                 | Only accurate comparison. Period-based ignores purchase timing. Uses existing price lookup infrastructure.                                                                                                             |
| Capital gains are fields on Position, not a separate domain | Realized gains come from lot allocations for the same (account, security). No domain proliferation.                                                                                                                    |
| Order by + limit in query language AND view-layer sorting   | Query captures intent for saved/shared queries. View allows interactive re-sorting. Not mutually exclusive.                                                                                                            |
| Time series = flexible intervals                            | Daily through yearly. Computed by running position snapshots at N dates.                                                                                                                                               |
| In-memory computation, no schema change                     | Source data (lots, allocations, transactions, prices) already in Redux. Memoized selectors suffice. Add SQLite cache only if profiling demands it.                                                                     |
| Dividends: computed from transactions + drill-down          | One pass through investment transactions, memoized. Transaction-level detail for drill-down.                                                                                                                           |
| FIFO is the only cost basis method for now                  | Hardcoded in import pipeline. Schema ready for LIFO + overrides.                                                                                                                                                       |
| Tags high priority (not deferred)                           | Needed for strategy grouping and managed position tracking, not just categorization. Tags table exists in schema. Would be a groupBy dimension + filter on positions — no structural changes to query language needed. |
| Tax category mapping out of scope                           | Except forward-looking short/long term classification which comes from lot holding periods (in scope).                                                                                                                 |
| `proceedsAllocated` on LotAllocation                        | Computed during import alongside `costBasisAllocated`. Avoids runtime proration math for realized gain computation.                                                                                                    |
| `date` = snapshot + scoped enrichment for positions         | `date: 2025` means as-of 2025-12-31 with enrichment scoped to 2025. No date clause = lifetime. Matches natural user intent.                                                                                            |
| `order by` + `limit` flattens; `group by` preserves tree    | Flat ranked list for "top N" queries. Sorted within groups for grouped views. `limit` only on flat results.                                                                                                            |
| One `where` keyword, implicit routing                       | Entity fields filter pre-computation, metric names filter post-computation. Execution engine routes by field name. No `having`.                                                                                        |
| `Security.underlyingSecurityId` for options/warrants        | Structural instrument relationship. UI aggregates options under underlying. Tags handle all user-defined groupings.                                                                                                    |

## Spike: Position Enrichment End-to-End

**Needed before Plan C.** The brainstorm's open questions (IRR, reinvested dividends, short sales) are "does the math
work on real data?" — classic spike territory.

### What to test

- Realized gain computation from lot allocations against actual imported QIF data
- Dividend income extraction — verify ReinvDiv doesn't double-count (open question)
- IRR computation — cash flow extraction for a given (account, security), Newton's method convergence
- Short sale handling — positions with negative quantity, sign-aware total_return_pct
- `proceedsAllocated` proration math against real sell transactions spanning multiple lots

### What doesn't need spiking

- Holding → Position rename — mechanical, no design risk
- Metric registry pattern — design decision, not validation question
- Benchmark comparison — uses existing `findPriceAsOf` infrastructure
- Query language extensions (order by, limit, metrics) — parser changes are mechanical
- Time series performance — defer to profiling during implementation; add SQLite cache if needed

## Implementation Sequence

Four plans total. Plan A (query engine) is complete. See
`docs/brainstorms/2026-02-27-claude-financial-assistant-brainstorm.md` for the full sequence and Plans A/B.

```
Plan A (DONE) → Plan C → Plan B → Plan D
  query engine    positions     result views    investment views
                  + metrics     (generic)       (time series,
                                                 capital gains)
```

**Why C before B:** Plan C renames Holding → Position throughout (types, selectors, components, columns). Plan B builds
generic result views referencing those types. Doing C first means B builds against the final names — no rename churn.

### Plan C: Position entity + metric computations (no UI changes)

Depends on: Plan A (complete).

- Rename Holding → Position throughout (types, computations, selectors, components)
- Enrich position computation with realized gains, dividends, performance metrics (in-memory, memoized selectors)
- Metric registry with initial metrics (total return, IRR, benchmark, alpha)
- Benchmark comparison computation
- Forward-looking tax lot analysis
- Query language extensions: `from positions`, `order by`, `limit`, `metrics`, `time series`
- Tests for all of the above

### Plan B: Generic result views (replaces report pages)

Depends on: Plan C (for stable Position types). Defined in the main brainstorm.

### Plan D: Investment-specific views

Depends on: Plan B (generic page infrastructure) + Plan C (position data).

- Time series result type and view component (charts)
- Capital gains report view (positions grouped by tax classification, lot drill-down)
- Tax lot detail view (per-lot breakdown with holding period and hypothetical gain)
- Integration with generic QueryResultPage from Plan B

### Not planned yet

- LIFO cost basis method
- User-configurable default lot strategy + per-sale overrides
- Tag import and investment tagging — high priority, next after Plans C/D. Needed for strategy grouping, not just
  categorization. Tags table already exists in schema.
- Tax schedule/overview reports
- Charting (independent of investment analysis)
- **Strategy entity** — first-class managed position lifecycle tracking (Strategy + StrategyAssignment entities)
  for multi-leg options, rolls, and evolving positions over time. Requires tags first. Includes heuristic inference
  for detecting rolls/multi-leg opens from transaction patterns on the same underlying. Design exploration captured
  in this brainstorm discussion; revisit when tags ship.

## Open Questions

- **IRR computation** — requires ordered cash flow history per position. How to efficiently extract
  buy/sell/dividend transactions in order for a given (account, security)?
- **Benchmark security identification** — how does the user specify which security is "the S&P"? Global
  setting? Per-query parameter? Assumed from a well-known symbol?
- **Time series performance** — 12 monthly snapshots means 12 calls to `computePositionsAsOf`. Profile
  with real data. If too slow, add a SQLite cache table for periodic snapshots.
- **Reinvested dividends** — ReinvDiv creates new lots AND is dividend income. Does the dividend income
  metric double-count (once as dividend, once as increased cost basis)?
- **Short sales** — positions with negative quantity (short positions). Do metrics like total_return_pct
  need sign-aware logic?

## Knowledge Destination

| Destination                                                            | Content                                                                             |
|------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `architecture:` docs/architecture/financial-query-language.md (update) | Position entity, metric registry, query language extensions for investment analysis |
| `decisions:` append                                                    | Position replaces Holding; capital gains are position fields not a separate domain  |
