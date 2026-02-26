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

| File                 | Violation             | Detail                                                        |
|----------------------|-----------------------|---------------------------------------------------------------|
| SearchFilterChip.jsx | Hardcoded `Escape`    | `dismiss` action already registered — likely leftover         |
| DataTable.jsx        | Hardcoded `ArrowDown` | Focuses first row on mount — init behavior, not a user action |

### Group 2: Navigation/action onClick without ActionRegistry (4 files)

| File            | onClick sites | What they do                                          | Status                              |
|-----------------|---------------|-------------------------------------------------------|-------------------------------------|
| RootLayout.jsx  | 1             | Open file                                             | **Done** — `file:open` bound to `o` |
| AccountList.jsx | 2             | Open account view, toggle section                     | See UX direction below              |
| ReportsList.jsx | 1             | Open report view                                      | See UX direction below              |
| TabGroup.jsx    | 4             | Switch tab, close tab, create group, set active group | See UX direction below              |

### Group 3: Tree-expand toggles in table columns (3 files)

| File                        | onClick | Detail                 |
|-----------------------------|---------|------------------------|
| CategoryReportColumns.jsx   | 1       | `row.toggleExpanded()` |
| CellRenderers.jsx           | 1       | `row.toggleExpanded()` |
| InvestmentReportColumns.jsx | 1       | `row.toggleExpanded()` |

### Group 4: Radix Button clicks (3 files)

| File               | onClick sites      | Detail                                                |
|--------------------|--------------------|-------------------------------------------------------|
| FileOpenDialog.jsx | 2                  | "Open New" / "Reopen Last" — ephemeral startup dialog |
| KeymapDrawer.jsx   | 1                  | Close button                                          |
| SearchChip.jsx     | 3 + hardcoded keys | Prev/Next/Clear + Escape/Enter                        |

## UX Directions for Remaining Files

The original grouping treated these as a mechanical migration problem — wire onClick into ActionRegistry. On closer
analysis, most files need real UX features, not mechanical wiring. Each has a different keyboard interaction model.

### AccountList — Picker

A key opens the QuickPicker populated with accounts. The AccountList UI will change in the future, but a picker
interaction will likely survive the redesign in some form. The section-collapse toggle (`SectionHeader` onClick) is
low-value — likely permanent exemption.

### ReportsList — Picker

A key (e.g. `r`) opens the QuickPicker populated with reports. Only 2 items — simplest possible first test of the
picker infrastructure. Proves the full vertical: key binding → action → picker modal → select → execute.

### TabGroup — Mixed paradigms

The onClick sites decompose into multiple paradigms:

- **Close active tab** → Direct action. Active tab is known state. No identity problem. **Done** — `tab:close` bound to `w`.
- **Split (create tab group)** → Direct action. **Done** — `tab:split` bound to `\`. But see open question below about
  whether this should be "move active tab to new split" instead of "create empty group."
- **Delete tab group** → Direct action. Removing the last tab auto-removes the group, but `tab:split` creates an empty
  group — so we need an explicit `tab:delete` or `tab:merge` to undo a split without closing all tabs individually.
- **Move tab between groups** → No keyboard equivalent for drag-and-drop (`onDragStart`/`onDrop` → `Action.MoveView`).
  Could be: direct action on focused tab (`tab:move-left`, `tab:move-right`), or a picker showing available groups.
- **Switch tab** → Picker (key opens QuickPicker with open tab names) or Cycling (next/prev tab left-to-right across
  all groups, ignoring group boundaries). Both are useful; cycling for quick flipping, picker for jumping by name.
- **Set active group** → Cycling (next/prev group).

### Group 3 — Navigation + contextual (toggle-expand on focused row)

DataTable has `navigate:down`/`navigate:up` with a focused row concept, but report pages don't pass `highlightedId` to
DataTable. Once reports opt in to row highlighting, expand/collapse on the focused row is a `select` or `Space` action.
Dependency: wire `highlightedId` from report page state into DataTable.

### Group 4 — Mixed

- **FileOpenDialog**: Ephemeral dialog, Radix Buttons handle Enter/Space. Permanent exemption candidate.
- **KeymapDrawer**: Close button redundant with Escape/dismiss. Permanent exemption candidate.
- **SearchChip**: Prev/Next/Clear + hardcoded Escape/Enter. Wire existing callbacks through ActionRegistry as direct
  actions. High-value, no new infrastructure needed.

## Settled Approach

- **Completed:** Group 1 (SearchFilterChip, DataTable), RootLayout, SearchChip, ReportsList, FileOpenDialog,
  KeymapDrawer. TabGroup direct actions (tab:close, tab:split) done.
- **Architecture:** Keyboard interaction paradigms are defined in
  `docs/architecture/keyboard-interaction.md (root)`. Each remaining file maps to a paradigm; future work should
  be planned per-paradigm, not per-file-group.
- **Paradigm mapping for remaining files:**
    - AccountList, TabGroup (switch) → **Picker** (QuickPicker built, needs wiring)
    - TabGroup (delete/merge group) → **Direct action** (needs design — see open question 7)
    - TabGroup (move tab between groups) → **Direct action or Picker** (needs design — see open question 8)
    - TabGroup (cycle group), next/prev tab → **Cycling** (not yet built)
    - Group 3 tree toggles → **Navigation + contextual** (needs focused row in reports)
- **AccountList** — UI will change, but the picker pattern will survive the redesign. Include in next picker pass.
- **Chords** — Not needed yet. Single keys are sufficient; chord system is a future enhancement.
- **Fuzzy search** — Substring matching (containsIgnoreCase) is sufficient for small lists. Fuzzy later if needed.
- **Accessibility** — Single-key shortcuts need a remapping UI for WCAG 2.1.4 compliance. Architecture supports
  it (bindings are declarative) but the UI doesn't exist yet. See architecture doc.

## Knowledge Destination

architecture: docs/architecture/keyboard-interaction.md (root) (new)

## Open Questions

1. ~~**RootLayout.jsx onClick**~~ — RESOLVED: Done.
2. ~~**DataTable ArrowDown**~~ — RESOLVED: Done.
3. ~~**Chord bindings**~~ — RESOLVED: Not needed yet. Single keys work. Chords are a future enhancement.
4. ~~**AccountList**~~ — RESOLVED: Include in first picker pass despite upcoming UI changes.
5. ~~**FileOpenDialog / KeymapDrawer**~~ — RESOLVED: Not exempt. Every UI needs keyboard equivalent. Low priority — last wave.
6. ~~**Binding remapping UI**~~ — RESOLVED: Deferred. UI for user-customizable bindings is out of scope for this migration.
7. **Tab split semantics** — `tab:split` currently creates an empty group. Should it instead be "move active tab to new
   split"? An empty group needs an explicit delete/merge action to undo; moving the tab is self-contained and matches
   editor behavior (VS Code split moves the active file). If we change the semantics, `tab:delete` may not be needed.
8. **Move tab between groups** — Drag-and-drop (`onDragStart`/`onDrop` → `Action.MoveView`) has no keyboard equivalent.
   Options: `tab:move-left`/`tab:move-right` (directional, needs concept of group ordering), or a picker showing target
   groups. The style validator (`require-action-registry`) does not inspect drag-and-drop handlers — this is a blind spot.

## Remaining Work Tracker

This brainstorm covers all 12 files. Do not delete at wrap-up until every file below is either migrated or permanently
exempted.

- [x] SearchFilterChip.jsx (Group 1) — hardcoded Escape replaced with ActionRegistry dismiss pattern
- [x] DataTable.jsx (Group 1) — direction values renamed to 'next'/'previous'
- [x] RootLayout.jsx (Group 2) — file:open action registered, bound to 'o'
- [x] ReportsList.jsx — Picker paradigm. report:open registered, bound to 'r', opens QuickPicker
- [~] TabGroup.jsx — Direct actions done (tab:close, tab:split). Picker done (tab:picker, Shift+T). Remaining: delete/merge group (Q7), move tab (Q8), Cycling (cycle group)
- [x] AccountList.jsx — Picker paradigm. account:picker registered, bound to Shift+A, opens QuickPicker
- [ ] CategoryReportColumns.jsx — Navigation+contextual. Blocked on: focused row in reports.
- [ ] CellRenderers.jsx — Navigation+contextual. Blocked on: focused row in reports.
- [ ] InvestmentReportColumns.jsx — Navigation+contextual. Blocked on: focused row in reports.
- [x] SearchChip.jsx — search:next/prev/clear registered via ActionRegistry, self-selecting SearchNavControls
- [x] FileOpenDialog.jsx — file:open-new and file:reopen-last registered via ActionRegistry
- [x] KeymapDrawer.jsx — keymap:dismiss registered via ActionRegistry
