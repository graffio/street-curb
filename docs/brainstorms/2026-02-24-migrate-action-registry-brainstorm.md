# Migrate Existing Components to ActionRegistry

**Date:** 2026-02-24
**Status:** Brainstorm

## What We're Building

Migrate 12 JSX files that currently have COMPLEXITY-TODO exemptions (expiring 2026-04-01) for the
`require-action-registry` rule. Each file either has `onClick` without `ActionRegistry.register`, hardcoded key name
literals, or both.

## Why This Matters

The require-action-registry rule enforces keyboard accessibility mechanically. The exemptions are technical debt from
enabling the rule on an existing codebase. Each migrated file gains remappable keyboard shortcuts and discoverability in
the keymap drawer.

## File Inventory

All 12 files must be addressed before the COMPLEXITY-TODOs expire on 2026-04-01. Files will be migrated, permanently
exempted, or re-evaluated group by group.

### Group 1: Hardcoded keys in files that already have ActionRegistry (2 files)

Already wired into ActionRegistry — just need to remove hardcoded key references.

| File | Violation | Detail |
|------|-----------|--------|
| SearchFilterChip.jsx | Hardcoded `Escape` | `dismiss` action already registered — likely leftover |
| DataTable.jsx | Hardcoded `ArrowDown` | Focuses first row on mount — init behavior, not a user action |

### Group 2: Navigation/action onClick without ActionRegistry (4 files)

Real user actions that benefit from keyboard shortcuts and keymap discoverability.

| File | onClick sites | What they do |
|------|---------------|-------------|
| AccountList.jsx | 2 | Open account view |
| ReportsList.jsx | 1 | Open report view |
| TabGroup.jsx | 3 | Close tab, switch tab, close-other-tabs |
| RootLayout.jsx | 1 | Needs investigation |

### Group 3: Tree-expand toggles in table columns (3 files) — deferred

TanStack Table cell-level interactions. Action context is per-row, not per-component. May not make sense to migrate.

| File | onClick | Detail |
|------|---------|--------|
| CategoryReportColumns.jsx | 1 | `row.toggleExpanded()` |
| CellRenderers.jsx | 1 | `row.toggleExpanded()` |
| InvestmentReportColumns.jsx | 1 | `row.toggleExpanded()` |

**Decision:** Keep as COMPLEXITY-TODO. Revisit after Groups 1+2 are done.

### Group 4: Simple Radix Button clicks (3 files) — deferred

Radix Buttons are already keyboard-accessible (Enter/Space). Question is whether actions should be discoverable in
keymap drawer.

| File | onClick sites | Detail |
|------|---------------|--------|
| FileOpenDialog.jsx | 2 | "Open New" / "Reopen Last" — ephemeral startup dialog |
| KeymapDrawer.jsx | 1 | Close button |
| SearchChip.jsx | 3 + hardcoded keys | Prev/Next/Clear + Escape/Enter |

**Decision:** Deferred. Tackle after Groups 1+2.

## Settled Approach

- **First implementation pass:** Groups 1 + 2 (6 files)
- **Groups 3 + 4:** Deferred — separate planning pass after first batch ships
- **Per-file strategy:** Each file gets its own plan step. Remove COMPLEXITY-TODO on successful migration.
- **Pattern:** Follow existing ref-callback + ActionRegistry.register pattern (see FilterChipPopover.jsx, DateFilterChip.jsx)
- **DEFAULT_BINDINGS:** New actions need key bindings added to `keymap-config.js`

## Knowledge Destination

none — knowledge lives in the code and the ActionRegistry pattern is already documented in the react-component style
card.

## Open Questions

1. ~~**RootLayout.jsx onClick**~~ — RESOLVED: `post(Action.OpenFile())` "Open File" button in sidebar. Real user action.
2. ~~**DataTable ArrowDown**~~ — RESOLVED: `'ArrowDown'` at line 68 is a direction enum value in `toNextIndex`, not a
   keyboard key comparison. Fix: rename to `'down'`/`'up'` to avoid key-name collision with the validator.
3. **SearchChip** — Currently in Group 4 (deferred), but its hardcoded Escape/Enter are high-value migration candidates.
   Reconsider for first pass?
4. **Group 3 final disposition** — After first pass, decide: permanent exempt or design a cell-level ActionRegistry
   pattern.

## Remaining Work Tracker

This brainstorm covers all 12 files. Do not delete at wrap-up until every file below is either migrated or permanently
exempted.

- [ ] SearchFilterChip.jsx (Group 1)
- [ ] DataTable.jsx (Group 1)
- [ ] AccountList.jsx (Group 2)
- [ ] ReportsList.jsx (Group 2)
- [ ] TabGroup.jsx (Group 2)
- [ ] RootLayout.jsx (Group 2)
- [ ] CategoryReportColumns.jsx (Group 3)
- [ ] CellRenderers.jsx (Group 3)
- [ ] InvestmentReportColumns.jsx (Group 3)
- [ ] FileOpenDialog.jsx (Group 4)
- [ ] KeymapDrawer.jsx (Group 4)
- [ ] SearchChip.jsx (Group 4)
