t Report UI Fixes

**Date:** 2026-03-13
**Status:** Brainstorm

## What We're Building

A batch of bug fixes and polish for the report UI — query result pages, DataTable, and the snapshot graph.

## Why This Matters

Several reports show wrong counts, broken interactive state, and questionable data. Users can't trust the numbers.

## Issues

### Bug: Result count shows transaction count, not result count

Every report shows "N (filtered from 1019)" where 1019 is the total transaction count regardless of query type.
Position queries show "32 positions (filtered from 1019)". Snapshot queries show "141 transactions". The count
source needs to match the query type.

**Affected:** All report types (positions, snapshots, spending).

### Bug: Disclosure triangles don't reflect expanded/collapsed state

Triangle points down (▼) on a collapsed row, or vice versa. The visual indicator is stale after toggle.

**Affected:** Spending by Category, any grouped tree report.

### Bug: Expanded row state persists across groupBy changes

Switching "Group by: Type" to "Group by: Security" keeps the same row indices expanded. Row 0 and 1 were open
before → row 0 and 1 are open after, even though they're different groups. Expanded state should reset when
grouping changes.

**Affected:** Investment Positions, any report with groupBy selector.

### Bug: Chase Sapphire shows positive net worth

A credit card account shows ~$57K-66K positive balance in Net Worth Over Time. This should be negative (liability).
Either the sign is flipped or payments are being summed instead of balances.

**Affected:** Net Worth Over Time snapshot report.

### Bug: Position count wrong when filtering to non-investment account

Filtering Investment Positions to Chase Sapphire shows "400 positions (filtered from 1019)" with an empty table.
A credit card has no positions — the count should be 0.

**Affected:** Investment Positions with account filter.

### Bug: Uncategorized row appears in "trans" filter results

Category by Year filtered by "trans" shows Transportation (correct) and Uncategorized with -$10K (unclear why).
Also shows "Food % of Income" row with all dashes. Need to investigate what the filter is matching on.

**Affected:** Category by Year report.

### Polish: Avg Cost decimal precision

Currently shows full precision (e.g., $178.1431). Should limit display — but BTC and other fractional-share
securities need more precision than 2 decimals.

**Open question:** 2 decimals with fallback to more for fractional shares? Significant digits? Match QIF import precision?

### Polish: Net Worth graph styling

- Fonts too large on axis labels
- No Y-axis or X-axis lines
- Room for more date labels on X-axis
- Column headers in table use raw ISO dates (2025-04-30) instead of friendly format (Apr 2025)

### Polish: No drilldown on snapshot totals

Net Worth graph shows a single line with no way to see which accounts contribute to each date point.
Need some way to expand or drill into the composition.

### Design: Payee column missing when grouping by Payee

Spending Over $500 allows "Group by: Payee" but no payee column is shown. Either add the column automatically
or remove payee from grouping options for reports that don't show it.

### Design: Expanding a single-row security group

Investment Positions grouped by Security shows a triangle on each security. Expanding shows one identical row.
Options:
1. Suppress triangle when group has only one row
2. Expand shows lots (if lot data exists)
3. Don't offer "by Security" grouping (it's 1:1)

## Settled Decisions

- Bugs with clear answers only — polish and design questions deferred
- Data correctness (counts, Chase Sapphire sign) highest priority
- Expanded row state resets when grouping changes

## In Scope

- Result count bug (all report types)
- Disclosure triangle stale render
- Expanded state persists across groupBy changes
- Chase Sapphire positive net worth
- Position count wrong for non-investment accounts
- Uncategorized in "trans" filter (investigate)
- Net Worth graph: ISO date headers → friendly format

## Deferred

- Avg cost precision (needs decision on rule)
- Net Worth graph styling (fonts, axes, date density)
- Snapshot drilldown
- Payee column when grouping by Payee
- Expanding single-row security groups
- Filter match drilldown: when text filter matches on a non-visible field (e.g., "trans" matches payee "Transfer to Savings" but the row shows as "Uncategorized" with no visible reason), user needs a way to see WHY the row matched. Tricky UI considerations — needs brainstorm.
- Spending Over Time: column headers slightly larger than data columns (sizing mismatch)
- Spending Over Time: table doesn't scroll independently; whole page scrolls instead
- Spending Over Time: columns reorderable but time ordering should be fixed
- Subcategory triangles not indented when grouped by payee

## Knowledge Destination

none — fixes live in the code.

## Open Questions

None for in-scope items.
