---
title: memoizeReduxStatePerKey cache poisoning via ignored rest args
category: architecture
tags:
  - redux
  - memoization
  - selectors
  - cache-poisoning
module:
  - memoize-redux-state.js (functional)
  - selectors.js (quicken-web-app)
  - GroupByFilterChip.jsx (quicken-web-app)
  - AccountFilterChip.jsx (quicken-web-app)
symptoms:
  - GroupBy filter chip popover never opens despite onOpenChange dispatching correctly
  - useSelector returns stale CLOSED_POPOVER constant despite state update
  - One component's selector call returns another component's cached result
severity: high
date_resolved: '2026-02-18'
status: resolved
related:
  - docs/solutions/architecture/transaction-filter-memoization-invalidation.md
---

# memoizeReduxStatePerKey cache poisoning via ignored rest args

## Solution

Added lazy rest-arg disambiguation to `memoizeReduxStatePerKey`:

```javascript
const cached = cacheByKey.get(key)
const { keyedValue: cachedKeyed, restStringified: cachedRest, value: cachedValue } = cached || {}
const cheapHit = cached && cachedKeyed === keyedValue
const restMatch = cheapHit && (rest.length > 0 ? JSON.stringify(rest) : '') === cachedRest
if (restMatch) return cachedValue
```

Key performance decision: `JSON.stringify(rest)` only runs when `cachedKeyed === keyedValue` (the cheap reference check passes). This avoids expensive serialization on every selector call — rest args are only compared when the cheaper checks can't distinguish callers.

## Additional fix: popover key isolation

Discovered during investigation: global keyboard shortcuts (e.g. `s` → `search:open`, `g` → `filter:group-by`) fired inside open popovers because keydown events bubbled up to the window listener. Fixed by adding `e.stopPropagation()` on `Popover.Content`'s `onKeyDown` handler, with ActionRegistry routing for navigation keys within the popover.

## Prevention

- When a memoized selector accepts optional args beyond `(state, key)`, those args MUST participate in cache invalidation. The memoizer now handles this automatically.
- When two components share a memoized selector instance with different arg signatures, the memoizer must distinguish their cache entries — not just by key, but by the full call signature.
- Sentinel constants (like `CLOSED_POPOVER`) as return values make cache bugs harder to diagnose because `===` always passes.

## Problem

GroupBy filter chip popover never opened. Clicking the trigger dispatched `SetFilterPopoverOpen` correctly and the reducer updated state, but `useSelector` returned a stale `CLOSED_POPOVER` constant — React never re-rendered.

## Investigation

1. Verified button exists, is clickable, and `onOpenChange` fires.
2. Confirmed the Redux action dispatches and reducer produces new state.
3. Found that `useSelector`'s `===` check saw no change — the selector returned the same object reference before and after the state update.
4. Traced to `filterPopoverData` selector, which is memoized via `memoizeReduxStatePerKey`.
5. Key insight: AccountFilterChip calls `filterPopoverData(state, viewId)` (2 args). GroupByFilterChip calls `filterPopoverData(state, viewId, resolvedItems)` (3 args). Both share the same memoized selector instance and the same `viewId` key.

## Root Cause

`memoizeReduxStatePerKey` cached results by `(key, keyedValue)` but ignored `...rest` args entirely. Cache poisoning sequence:

1. AccountFilterChip's selector runs first: `filterPopoverData(state, viewId)` — no `items` arg
2. Selector computes result with `items = undefined` → returns `CLOSED_POPOVER` constant
3. Memoizer caches `{ keyedValue, value: CLOSED_POPOVER }` under key `viewId`
4. GroupByFilterChip's selector runs: `filterPopoverData(state, viewId, resolvedItems)` — with `items` arg
5. Memoizer finds cache hit: same `viewId`, same `keyedValue` reference → returns `CLOSED_POPOVER`
6. GroupByFilterChip gets wrong result; `useSelector` sees same reference → no re-render

The `CLOSED_POPOVER` sentinel being a shared constant reference made this particularly insidious — the `===` check in `useSelector` always passed, so the component never updated regardless of state changes.
