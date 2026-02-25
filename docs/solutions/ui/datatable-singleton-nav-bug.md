---
title: DataTable Singleton Nav Bug
category: ui
tags:
  - datatable
  - keyboard-navigation
  - module-scope
  - multi-instance
  - tab-groups
summary: Module-level singleton nav state in DataTable breaks keyboard navigation when multiple tab groups are open
keywords: tableNav, navCleanup, singleton, Map, per-actionContext, tab group, keyboard nav
module: quicken-web-app
---

# DataTable Singleton Nav Bug

## Solution

Replace module-level `let tableNav` and `let navCleanup` singletons with per-instance Maps keyed by `actionContext`:

```js
const navStates = new Map()   // actionContext -> { highlightedId, focusableIds, rows, onHighlightChange, onEscape }
const navCleanups = new Map() // actionContext -> cleanup fn
```

Component render: `navStates.set(actionContext, { ... })` after `table.getRowModel()` (single call, not two-step).

Ref callback: `el => E.registerNavActions(actionContext, el)` — passes context to the effect function.

Execute closures: capture `context` at registration time, read `navStates.get(context)` at execute time.

See also: `docs/solutions/architecture/filter-chip-module-level-singleton-bug.md` — same pattern.

## Prevention

**Rule:** If a component receives `actionContext`/`viewId`, its module-level mutable state must be keyed by that value.

**Gotcha — unstable ref callbacks:** Inline arrow refs (`el => fn(context, el)`) create a new function each render.
React fires the old ref with `null` then the new ref with the element on every render. Do NOT delete state Maps in the
`null` branch — the data is just cached props, harmless if stale, overwritten on next render. Only clean up action
registrations (navCleanups).

## Key Decisions

- Separate Maps (`navStates`, `navCleanups`) over single Map with nested object — matches DateFilterChip precedent.
- Navigate logic moved from `T.toNavigateHandler` to inline closures in `E.registerNavActions` — T functions must not
  read mutable module state.
- `navStates.delete()` removed from unmount branch — unstable ref callback fires cleanup on every render, which would
  delete state before execute functions can read it.

## Problem

With two tab groups open, only the last-mounted DataTable had working j/k keyboard navigation. The other tab group's
register had no keyboard nav at all.

## Root Cause

Module-level `let tableNav` and `let navCleanup` were shared across all DataTable instances. The second DataTable's
mount called `navCleanup?.()` which deleted the first table's keyboard actions from ActionRegistry, then overwrote
`tableNav` with its own state. Only the last-mounted table's actions survived.
