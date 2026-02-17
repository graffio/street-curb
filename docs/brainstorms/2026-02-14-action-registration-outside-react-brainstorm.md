# Move ActionRegistry Registration Out of React

**Date:** 2026-02-14

## What We're Building

Move keyboard action registration from `useEffect` in React components to a non-React mechanism. This also determines where filter chip actions live — currently centralized in FilterChipRow (a layout shell that shouldn't have behavior).

## Why This Matters

Two problems converge here:

1. **FilterChipRow owns actions it shouldn't.** It's a layout shell that registers keyboard actions for its children via `filterConfig` prop. Each chip should register its own action. The comment already acknowledges `filterConfig` is "temporary."

2. **Registration uses `useEffect`.** The COMPLEXITY comment (`react-redux-separation — ActionRegistry useEffect lifecycle awaiting non-React mechanism`) flags this. Registration is a side effect that doesn't belong in React's render cycle.

Solving #2 likely solves #1 — if registration isn't in React, there's no reason to centralize it in FilterChipRow.

## Current State

- `FilterChipRow.jsx` — registers all filter-focus actions in one `useEffect` batch based on `filterConfig` prop
- Individual chips (DateFilterChip, AsOfDateChip) already register their own popover-specific actions via separate `useEffect` calls
- `ActionRegistry.register()` appends (doesn't replace) and returns a cleanup function — no technical barrier to per-chip registration

## Open Questions

- What non-React mechanism was originally envisioned? (Context lost)
- Could registration be declarative/data-driven instead of imperative? (e.g., action manifest per view)
- If we solve per-chip registration first (within React), does that block or help the eventual move out of React?
- Does the keymap module need changes, or just how we call it?

## Related

- `less-react` brainstorm — parent strategy (this is a subset)
- `require-action-registry-rule` brainstorm — validator enforcement for ActionRegistry usage
