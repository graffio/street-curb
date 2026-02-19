---
title: Tab group divider drag causes lag from IndexedDB writes and selector cache busting
category: performance
tags:
  - redux
  - memoization
  - indexeddb
  - drag
  - tab-layout
module:
  - post.js (quicken-web-app)
  - selectors.js (quicken-web-app)
symptoms:
  - Dragging tab group divider is visibly laggy with 4 groups open
  - Frame drops during tab group resize
severity: high
date_resolved: '2026-02-19'
status: resolved
related:
  - docs/solutions/architecture/transaction-filter-memoization-invalidation.md
---

# Tab group divider drag causes lag from IndexedDB writes and selector cache busting

## Solution

Two independent fixes, each targeting a different bottleneck:

1. **Debounce IndexedDB writes during drag** (`post.js`): `SetTabGroupWidth` was calling
   `persistTabLayout()` synchronously on every dispatch — two writes per mousemove at 60-120Hz.
   Added `debouncedPersistTabLayout` (500ms, same pattern as table layouts). Only `SetTabGroupWidth`
   uses the debounced path; other tab actions keep immediate persistence.

2. **Fix activeViewPageTitle memoization** (`selectors.js`): Selector was memoized on
   `['tabLayout', 'accounts', 'transactionFilters']`. Since `tabLayout` ref changes on every width
   dispatch, the cache busted every frame. Replaced with hand-rolled memoization tracking 5 stable
   sub-fields: `activeTabGroupId`, `activeViewId`, `views` (structurally shared LookupTable),
   `accounts`, `transactionFilters`.

Also added `tabGroupById` and `tabGroupIsActive` selectors for future use by narrow per-group
component selectors.

## Prevention

When memoizing selectors keyed on a top-level state slice, check whether the slice changes at a
higher frequency than the derived computation warrants. If it does, memoize on the specific
sub-fields the computation actually reads.

Pattern: `memoizeReduxState` only supports top-level key tracking. When a key like `tabLayout`
contains both high-frequency fields (widths during drag) and low-frequency fields (active view,
group structure), hand-roll the memoization on the low-frequency sub-fields.

## Key Decisions

- 500ms debounce matches existing table layout pattern — consistent UX for "settle then persist"
- Hand-rolled memoization instead of extending `memoizeReduxState` with sub-key support. The
  comment notes this can collapse back if the utility gains that capability.
- `views` LookupTable inside a group is structurally shared and stable when only width changes,
  unlike the group object itself — this is the key insight for the cache key selection.

## Problem

Dragging the tab group divider with 4 groups open causes visible lag. Every `mousemove` triggers
120-240 IndexedDB writes/second plus unnecessary recomputation of the page title selector.

## Root Cause

Two compounding issues:

1. **IndexedDB write storm**: `post.js` routed `SetTabGroupWidth` through `handleTabLayoutAction`,
   which calls `persistTabLayout()` immediately. At 60-120Hz mouse events, this creates 120-240
   synchronous writes/second, blocking the main thread.

2. **Selector cache invalidation**: `activeViewPageTitle` was memoized via
   `memoizeReduxState(['tabLayout', ...])`. Every `SetTabGroupWidth` dispatch creates a new
   `tabLayout` ref (new group widths), busting the cache and recomputing title derivation every
   frame — even though the title inputs (active view, accounts) haven't changed.
