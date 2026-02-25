# DataTable Singleton State Bug

**Date:** 2026-02-24
**Status:** Brainstorm

## What We're Building

Fix the multi-instance DataTable keyboard navigation bug. When two tab groups are open, only the last-mounted DataTable has working j/k navigation because `tableNav` and `navCleanup` are module-level singletons.

## Why This Matters

Any page with DataTable (transaction registers, investment registers) loses keyboard nav when a second tab group is open. This is a pre-existing bug affecting core navigation.

## Settled Approach

**Per-instance Map** (matches `DateFilterChip.jsx` precedent):

- Replace `let tableNav` + `let navCleanup` with `let instances = new Map()` keyed by `actionContext`
- Each entry: `{ nav: { highlightedId, focusableIds, rows, onHighlightChange, onEscape }, cleanup }`
- `E.registerNavActions`: capture `actionContext` in closure → `instances.get(context)?.cleanup?.()` → register → `instances.set(context, { nav, cleanup })`
- `T.toNavigateHandler`: capture `actionContext` in closure at registration time → look up `instances.get(context)` at execute time
- Unmount: `instances.get(context)?.cleanup?.()` → `instances.delete(context)`
- Render: `instances.set(context, { ...instances.get(context), nav: { ... } })` instead of overwriting singleton

**Resolved open questions:**

1. **How does `T.toNavigateHandler` know which instance?** Capture `actionContext` in the closure at registration time. `action.execute()` is zero-arity, so context must be baked into the closure — not passed at call time. The Map lookup happens inside the closure at execute time.
2. **Per-instance or singleton `tableNav`?** Per-instance. "Happens to work" isn't correct — match the DateFilterChip pattern for actual correctness.

**Scope:** `DataTable.jsx` only. No changes to `keymap-routing.js` or `ActionRegistry`.

## Knowledge Destination

| Destination | Rationale |
|---|---|
| `solution:` docs/solutions/ui/datatable-singleton-nav-bug.md | Bug with symptoms (lost keyboard nav), reusable pattern knowledge |

## Open Questions

None — approach is settled.
