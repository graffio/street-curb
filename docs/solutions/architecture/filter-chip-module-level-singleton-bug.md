---
title: Filter Chip Module-Level Singleton Bug
category: architecture
tags:
  - filter-chips
  - react-components
  - module-scope
  - multi-instance
  - tab-groups
summary: Module-level mutable state in filter chips breaks when multiple component instances exist (e.g., split tab groups)
keywords: chipState, singleton, module-level, Map, per-viewId, tab group
module: quicken-web-app
---

# Filter Chip Module-Level Singleton Bug

## Solution

Convert module-level `let chipState` singletons to **per-viewId Maps**. E functions take explicit `viewId` parameter
instead of reading `chipState.viewId`.

```js
// BEFORE (broken with multiple instances)
let chipState = { viewId: null, ... }
let triggerCleanup = null

// AFTER (works with any number of instances)
const chipStates = new Map()
const triggerCleanups = new Map()
```

Component render: `chipStates.set(viewId, { ... })` instead of `chipState = { ... }`.

E functions: `const chip = chipStates.get(viewId) || {}` with viewId passed explicitly from call site.

Cleanup functions: `triggerCleanups.get(viewId)?.()` then `triggerCleanups.set(viewId, newCleanup)`.

## Prevention

Any module-level mutable variable (`let` or `const obj = { current: null }`) in a component file is a potential
singleton bug. The pattern is safe only when the component is guaranteed to have exactly one instance. With tab groups,
filter chips can have 2+ instances.

**Rule of thumb:** If a component receives `viewId`, its module-level state must be keyed by viewId.

## Key Decisions

- Per-viewId Map over useRef: keeps state management in module scope (consistent with E/P/T cohesion pattern), avoids
  React hooks, and supports the ActionRegistry cleanup pattern that runs outside React lifecycle.
- Cleanup Maps use same key: `triggerCleanups.get(viewId)?.()` before `triggerCleanups.set(viewId, newCleanup)`.

## Problem

With two tab groups open, filter chip dispatches targeted the wrong view. Example: selecting "Custom dates" on a bank
register opened the custom date form on the Spending by Category report instead, because `chipState.viewId` pointed to
whichever Chip rendered last.

Symptoms: integration tests pass with single tab group, fail with two. Date filter tests showed correct popover content
but typed dates had no effect (dispatched to wrong viewId).

## Root Cause

Module-level `let chipState = { viewId: null }` is shared across ALL React instances of the component. With two tab
groups, both instances write to the same object during render. The last instance to render wins, so all E function
dispatches use that viewId regardless of which chip the user interacted with.

## Remaining Instances (latent)

Three more files have the same pattern (not yet fixed — no test failures yet):

| File | Variables | Lines |
|------|-----------|-------|
| `SearchFilterChip.jsx` | `chipState`, `triggerCleanup` | 81-82 |
| `FilterChipPopover.jsx` | `contentCleanup`, `chipState` | 311-320 |
| `AsOfDateChip.jsx` | `chipState`, `triggerCleanup`, `contentCleanup` | 99-101 |

These will manifest when integration tests exercise their functionality with two tab groups open.
