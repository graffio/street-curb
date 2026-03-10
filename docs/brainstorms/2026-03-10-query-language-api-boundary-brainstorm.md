# Query Language API Boundary

**Date:** 2026-03-10
**Status:** Brainstorm
**Continues:** `2026-02-27-financial-query-language-brainstorm.md` (Plans A-C done, extraction done)
**Preceded by:** `2026-03-09-query-language-module-extraction-brainstorm.md` (complete)

## What We're Building

Tighten the `@graffio/query-language` module boundary so IR types don't escape to consumers. Four
deliverables:

1. **Rename FinancialQuery → IRFinancialQuery** for naming consistency with IRFilter, IRGrouping, etc.
2. **Generator-emitted `fromJSON`** on TaggedSum types — recursive reviver that walks nested Tagged
   fields using `@@tagName`. Runtime helper in `runtime-for-generated-types.js`, generated code does
   the wiring. This is the foundation for persisting/loading user queries without IR type imports.
3. **New `AccountQuery` variant** on IRFinancialQuery — returns enriched accounts with position
   summaries. Replaces `computePositions` barrel export; engine owns position computation internally.
   `_organizedAccounts` selector becomes a `runFinancialQuery(AccountQuery(...), state)` call.
4. **Fix 6 pre-existing integration test failures** — date filter count mismatches and historical
   position value assertions. Root-cause and fix.

## Why This Matters

After the module extraction, `report-metadata.js` imports 6 IR types just to construct seed queries.
That's half the barrel. The module boundary is technically enforced but conceptually leaky — consumers
build IR trees directly. With `fromJSON`, consumers can work with plain JSON; with `AccountQuery`,
`computePositions` stops being a special-case export.

The integration test failures have been carried since the query engine landed. They need to be
investigated before more work builds on top.

## Settled Decisions

- **Rename:** `FinancialQuery` → `IRFinancialQuery` everywhere (type definition, generated code,
  all consumers). Mechanical.
- **Reviver location:** `cli-type-generator` emits a `fromJSON` static method per TaggedSum type.
  `runtime-for-generated-types.js` provides a `parseTaggedValue` helper. No global type registry —
  each generated file imports the types it references, the generator knows the type graph.
- **Seed queries stay in consumer for now.** They're temporary — will be replaced by stored user
  queries. Don't move them into the module; they'll use `fromJSON` once it exists.
- **Account list as a query:** New `IRFinancialQuery.AccountQuery` variant. Engine runs position
  computation and enrichment internally, returns `[EnrichedAccount]` — different return shape from
  other variants (which return tree nodes for QueryResultPage). AccountQuery result feeds the sidebar
  AccountList, not a report. `computePositions` becomes module-internal. `_organizedAccounts` calls
  `runFinancialQuery(AccountQuery(...), state)`, then applies `toAccountSections` for presentation.
- **EnrichedAccount stays separate from Account.** EnrichedAccount wraps Account + computed balance
  fields (balance, dayChange, dayChangePct). The distinction between stored entity and derived data
  is intentional. Merging would make it ambiguous whether an Account has been enriched.
- **Integration test failures:** Investigate root cause and fix as part of this work.

## Knowledge Destination

- `architecture:` docs/architecture/financial-query-language.md (update) — new AccountQuery variant,
  fromJSON capability, barrel surface changes
- `decisions:` append — IRFinancialQuery rename rationale, reviver design choice

## Resolved Questions

1. **AccountQuery fields:** `name`, `description`, `filter` (IRFilter), `dateRange` (IRDateRange, single-day
   Range for as-of), `metrics` ([String], optional — which position metrics to include). No `grouping` (always
   by account), no `orderBy`/`limit`. Simpler than PositionQuery. `filter` replaces `selectedAccountIds` +
   `filterQuery`; `dateRange` replaces `asOfDate`.

2. **fromJSON validation:** Permissive (ignore unknown fields). Matches existing `_from` behavior. Strict
   validation adds complexity for no benefit — data comes from our own serialization.

3. **Integration test failures — root causes identified:**
   - **Date filter mismatch (3 tests):** `bank-register-filters`, `category-report`,
     `investment-register-filters` all hardcode February 2024 but fixture data is March 2024.
     Fix: change test dates to March.
   - **Historical position values (2 tests):** `positions-report` and `engine-reports` as-of-date tests
     have stale value assertions. Fix: update assertions to match current fixture data.
   - **Floating-point drift (1 test):** `engine-reports` SnapshotQuery Jan/Sep assertions skipped due to
     1-cent JS float accumulation vs SQL SUM. This is a known fundamental issue (documented in main
     brainstorm Open Questions). Fix: add numeric tolerance or accept the skip.
   - **Scope impact:** None — all are assertion/fixture fixes, no engine changes needed.

## Open Questions

None.
