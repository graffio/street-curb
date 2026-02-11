---
title: Keyboard system redesign — Command Pattern with ActionRegistry
date: 2026-02-10
category: architecture
tags:
  - keyboard
  - command-pattern
  - action-registry
  - performance
  - migration
module: modules/keymap, modules/design-system, modules/quicken-web-app
symptoms:
  - 3 Redux dispatches per keystroke in DataTable (register/unregister/re-register)
  - Components contain keybinding knowledge (key names like 'ArrowDown')
  - Priority numbers for conflict resolution (fragile, hard to reason about)
  - 7 keymap props threaded through DataTable consumers
severity: high
---

# Keyboard System: Command Pattern Migration

## Problem

The old keymap system coupled actions and bindings: each component built `Keymap` objects containing both what to do and which keys trigger it, then dispatched to Redux. This caused:

1. **Performance** — DataTable re-registered its keymap on every keystroke (3 Redux dispatches)
2. **Coupling** — Components referenced specific key names (`ArrowDown`, `Escape`)
3. **Complexity** — Priority numbers (0, 10, 20) for conflict resolution; `blocking` flags
4. **Prop threading** — 7 keymap props through every DataTable consumer

## Root Cause

No separation between actions (what to do) and bindings (which key). Components were responsible for both, leading to tangled concerns and unnecessary Redux churn.

## Solution

Command Pattern: separate actions from bindings.

- **ActionRegistry** — module-level singleton (~30 LOC). Components register `{ id, description, execute }` on mount, cleanup on unmount.
- **DEFAULT_BINDINGS** — single constant mapping `{ normalizedKey: actionId }` in keymap-routing.js
- **LIFO resolution** — last registered action wins (modal stacking without priority numbers)
- **Dispatch flow** — `keydown → normalizeKey → DEFAULT_BINDINGS[key] → ActionRegistry.resolve(actionId, activeContext) → action.execute()`

### Key patterns

- `handlersRef` — execute functions read current callbacks via ref for stable identity (zero re-registrations)
- `context: null` — global actions that match any activeContext
- `register()` returns cleanup function — each batch gets unique ID, prevents cross-component removal
- Display-only actions — KeyboardDateInput registers no-op execute for KeymapDrawer visibility

### Migration order (11 commits)

1. ActionRegistry module + tests
2. Dual-mode dispatch (ActionRegistry first, old Keymap fallback)
3. DataTable migration (biggest perf win)
4. SelectableListPopover, KeyboardDateInput, FilterChipRow, FilterChips, tab-layout
5. Remove old system entirely (-673 lines)
6. Documentation

## Key Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Module-level singleton (not Redux) | Actions are transient (mount/unmount), not serializable state |
| 2 | LIFO over priority numbers | Mount/unmount order handles modal stacking naturally |
| 3 | Cleanup function from register() | Batch-scoped cleanup prevents cross-component action removal |
| 4 | `context: null` for global | Reuses existing resolution logic without special cases |
| 5 | No separate Dispatcher module | 3 lines of dispatch in keymap-routing suffice |

## Prevention

**Signal:** If you see a component referencing specific key names, importing KeymapModule for binding purposes, or creating keymap objects — stop. Use ActionRegistry.register() for actions and add bindings to DEFAULT_BINDINGS.

**Style card enforces:** react-component.md prohibits keybinding knowledge in components.

## Related

- `docs/architecture/keymap-system.md` — full architecture reference
- `.claude/api-cheatsheets/action-registry.md` — API quick reference
- `.claude/style-cards/react-component.md` — Actions section
