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

### TabGroup — Mixed paradigms (mostly resolved)

- **Close active tab** → Direct action. **Done** — `tab:close` bound to `w`.
- **Move tab** → Direct action + Cycling. **Done** — `tab:move-left`/`tab:move-right` (ctrl+shift+h/l). Flat-list
  movement handles within-group reorder, cross-group move, and edge group creation. Context menu provides Move
  Left/Right/New Group/Close for mouse users.
- **Switch tab** → Picker + Cycling. **Done** — `tab:picker` (Shift+T) for jump-by-name, `tab:cycle-left`/`tab:cycle-right`
  (ctrl+h/l) for sequential navigation.
- **Split** → Subsumed by move-to-edge. `tab:split` removed. Empty groups auto-close. No `tab:delete` needed.
- **Set active group** → Implicit via tab cycling/movement. No separate action needed.
- **Remaining:** Per-tab onClick (switch tab, set active group) still has no ActionRegistry equivalent — these are
  per-item actions that would need per-element registration. COMPLEXITY-TODO deferred.

### Group 3 — Navigation + contextual (toggle-expand on focused row)

DataTable has `navigate:down`/`navigate:up` with a focused row concept, but report pages don't pass `highlightedId` to
DataTable. Once reports opt in to row highlighting, expand/collapse on the focused row is a `select` or `Space` action.

**Unblocking plan (2026-02-26):**

1. **Rename `key` → `id`** in CategoryTreeNode and HoldingsTreeNode type definitions. Both tree node types use a `key`
   field that serves as grouping key, display name, and identity simultaneously. Rename to `id` so DataTable's
   `toRowId` (`row.id ?? row.transaction?.id`) picks it up automatically.

2. **Fix holdings leaf identity** — `toHoldingNode` currently sets `id` (was `key`) to `securityName`, which isn't
   unique (same security in multiple accounts). Change to composite `accountId|securityId`. Display name is derived
   separately by cell renderers from `holding.securityName`.

3. **Add `row:toggle-expand` action in DataTable** — alongside existing `navigate:up`/`navigate:down`. DataTable owns
   it because it already has the highlighted row index, the flat row list, and the TanStack table instance. Action
   calls `rows[highlightedIndex].toggleExpanded()`.

4. **Wire report pages** — CategoryReportPage and InvestmentReportPage pass `highlightedId`, `actionContext` (viewId),
   and `onHighlightChange` to DataTable. Same pattern as TransactionRegisterPage.

### Group 4 — Mixed

- **FileOpenDialog**: Ephemeral dialog, Radix Buttons handle Enter/Space. Permanent exemption candidate.
- **KeymapDrawer**: Close button redundant with Escape/dismiss. Permanent exemption candidate.
- **SearchChip**: Prev/Next/Clear + hardcoded Escape/Enter. Wire existing callbacks through ActionRegistry as direct
  actions. High-value, no new infrastructure needed.

## Settled Approach

- **Completed:** Group 1 (SearchFilterChip, DataTable), RootLayout, SearchChip, ReportsList, FileOpenDialog,
  KeymapDrawer, AccountList, TabGroup (tab:close, tab:cycle-left/right, tab:move-left/right, tab:picker, context menu).
- **Architecture:** Keyboard interaction paradigms are defined in
  `docs/architecture/keyboard-interaction.md (root)`. Each remaining file maps to a paradigm; future work should
  be planned per-paradigm, not per-file-group.
- **Paradigm mapping for remaining files:**
    - Group 3 tree toggles → **Navigation + contextual** (needs focused row in reports)
- **Group 3 unblocking** — Rename `key` → `id` in tree node types so `toRowId` works. Fix holdings leaf ID to
  composite `accountId|securityId`. DataTable owns `row:toggle-expand` action. Report pages wire `highlightedId`,
  `actionContext`, `onHighlightChange`.
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
7. ~~**Tab split semantics**~~ — RESOLVED: `tab:split` removed. Flat-list movement (`tab:move-left`/`tab:move-right`)
   creates new groups on demand at the edge (up to MAX_GROUPS=4). Context menu "Move to New Group" provides direct
   split-to-new-group for mouse users. Empty groups auto-close. No `tab:delete` needed.
8. ~~**Move tab between groups**~~ — RESOLVED: `tab:move-left`/`tab:move-right` (ctrl+shift+h/l) move tabs one position
   in the flat list — within-group reorder, cross-group move, or edge group creation. Context menu provides the same
   actions targeted at the right-clicked tab. Drag-and-drop still works but has no ActionRegistry equivalent (blind spot
   remains).

## Remaining Work Tracker

This brainstorm covers all 12 files. Do not delete at wrap-up until every file below is either migrated or permanently
exempted.

- [x] SearchFilterChip.jsx (Group 1) — hardcoded Escape replaced with ActionRegistry dismiss pattern
- [x] DataTable.jsx (Group 1) — direction values renamed to 'next'/'previous'
- [x] RootLayout.jsx (Group 2) — file:open action registered, bound to 'o'
- [x] ReportsList.jsx — Picker paradigm. report:open registered, bound to 'r', opens QuickPicker
- [x] TabGroup.jsx — Direct actions: tab:close (w), tab:cycle-left/right (ctrl+h/l), tab:move-left/right (ctrl+shift+h/l). Picker: tab:picker (Shift+T). Context menu: Move Left/Right/New Group/Close. tab:split removed. COMPLEXITY-TODO remains (expires 2026-04-01) for per-tab onClick sites (switch tab, set active group) that need per-item ActionRegistry — deferred, low value.
- [x] AccountList.jsx — Picker paradigm. account:picker registered, bound to Shift+A, opens QuickPicker
- [ ] CategoryReportColumns.jsx — Navigation+contextual. Unblocked: rename `key`→`id`, wire highlight, `row:toggle-expand`
- [ ] CellRenderers.jsx — Navigation+contextual. Unblocked: same as CategoryReportColumns
- [ ] InvestmentReportColumns.jsx — Navigation+contextual. Unblocked: fix holdings leaf ID, wire highlight, `row:toggle-expand`
- [x] SearchChip.jsx — search:next/prev/clear registered via ActionRegistry, self-selecting SearchNavControls
- [x] FileOpenDialog.jsx — file:open-new and file:reopen-last registered via ActionRegistry
- [x] KeymapDrawer.jsx — keymap:dismiss registered via ActionRegistry
