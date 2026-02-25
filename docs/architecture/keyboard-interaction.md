# Keyboard Interaction Architecture

## Overview

The app provides keyboard-driven interaction for power users. Every user-visible action should be reachable via keyboard
— Tab+Enter on focusable elements is a fallback, not the goal.

The keyboard system has three layers:

```
┌──────────────────────────────────────────────────────────────┐
│ Key Bindings          keymap-config.js DEFAULT_BINDINGS      │
│                       maps physical keys → action IDs        │
├──────────────────────────────────────────────────────────────┤
│ Action Registry       @graffio/keymap ActionRegistry         │
│                       maps action IDs → execute functions    │
│                       scoped by viewId (or undefined=global) │
├──────────────────────────────────────────────────────────────┤
│ Key Routing           keymap-routing.js handleKeydown        │
│                       captures keydown → normalizeKey →      │
│                       lookup binding → resolve action →      │
│                       execute                                │
└──────────────────────────────────────────────────────────────┘
```

Components register actions via ref callbacks. Key bindings are declarative. The two are independent — you can register
an action without a binding (mouse-only) or bind a key to an action that's not yet registered (no-op until a component
mounts).

## Interaction Paradigms

### 1. Direct Action

One key → one action, no parameters.

**When to use:** Singleton actions where the target is unambiguous. Open file, toggle shortcuts, dismiss popover.

**Examples:** `o` → `file:open`, `?` → `toggle-shortcuts`, `Escape` → `dismiss`

**Pattern:** Ref callback on the element registers the action. Module-level cleanup variable. Execute closure calls
`post(Action.X())` directly.

**Reference:** `RootLayout.jsx` (file:open), `main.jsx` (toggle-shortcuts)

### 2. Picker

Key opens a search modal, user picks from a filtered list, selection executes an action.

**When to use:** Choosing one item from a set where the user knows the item by name, not position. Reports, accounts,
open tabs, any named-entity list.

**Examples:** `r` → report picker, `p` → tab picker (pick from open tabs)

**Pattern:** A generic `QuickPicker` component (Dialog-based, centered overlay). Caller registers an action whose
execute posts `Action.OpenPicker(pickerId)`. A selector maps the pickerId to an item list. The picker handles search
filtering, highlight navigation (arrow keys), selection (Enter), and dismissal (Escape) internally. On select, the
picker posts the item's pre-defined action.

**State:** Redux stores `openPickerId`, picker search text, and highlight index. Each picker ID has a selector that
returns `[{ id, label, execute }]`.

**Reference (closest existing):** `FilterChipPopover.jsx` — search input + highlight navigation + keyboard routing.
The picker generalizes this pattern into a standalone modal.

**Not yet built.** First implementation: reports picker (2 static items).

### 3. Navigation + Contextual Action

Arrow keys move a highlight through a list. Enter/Space acts on the highlighted item.

**When to use:** Focused traversal of visible items — table rows, filter chip options, tree nodes. The user is looking
at the list and stepping through it.

**Examples:** DataTable row navigation (`j`/`k`), FilterChipPopover item selection, tree expand/collapse on focused row.

**Pattern:** A highlight index in Redux (or module-level state), updated by `navigate:down`/`navigate:up` actions.
`select` action reads the highlighted item and acts on it. Component scrolls the highlighted item into view.

**Reference:** `FilterChipPopover.jsx` (highlight + select), `DataTable.jsx` (row navigation)

### 4. Cycling

Key cycles through a fixed sequence. Each press advances to the next item.

**When to use:** Ordered traversal where the user wants "next" and "previous" without choosing a specific item. Tab
switching, group switching.

**Examples:** Next tab / previous tab (left-to-right across all groups, ignoring group boundaries).

**Pattern:** Action reads current position from state, computes next/previous, dispatches the change. Single action
registration, no UI — just state mutation.

**Not yet built.** First implementation: next-tab / prev-tab.

## Accessibility

### WCAG 2.1.4 — Character Key Shortcuts

Single-character shortcuts (letters, numbers, punctuation) violate WCAG 2.1.4 **unless** at least one of:

- Users can **turn them off**
- Users can **remap** them to include a modifier
- They only activate when a specific component is focused

**Our status:** DEFAULT_BINDINGS is a declarative map. The infrastructure for user remapping (editing bindings) does not
yet exist, but the architecture supports it — the binding map is separate from the action definitions. A future settings
UI could let users modify DEFAULT_BINDINGS. This is a gap that should be closed before shipping to users who rely on
assistive technology.

### Screen Reader Conflicts

In browse mode, JAWS/NVDA intercept single letters for quick navigation (H = next heading, T = next table, etc.). Our
single-key shortcuts will not fire for screen reader users in browse mode. This is a known limitation.

**Mitigation:** All actions triggered by single-key shortcuts must also be reachable through focusable UI elements
(buttons, links). The keyboard shortcuts are a power-user acceleration layer, not the only path.

### ARIA Roles and Expected Keyboard Patterns

Using ARIA composite widget roles creates keyboard behavior contracts:

| Role | Expected Keys |
|------|--------------|
| `listbox` | Up/Down arrows, type-ahead, Home/End |
| `tree` | Up/Down/Left/Right, Enter to activate |
| `tablist` | Left/Right between tabs, Tab to exit to panel |
| `dialog` | Focus trap (Tab cycles within), Escape to close |
| `combobox` | Typing in input, arrows in popup list |

**Rule:** If you use a composite widget role, implement its full keyboard pattern. A role with missing keyboard support
is worse than no role at all.

### Focus Management

Use **roving tabindex** for composite widgets (listbox, tree, tablist): active item gets `tabindex="0"`, others get
`tabindex="-1"`. Reserve `aria-activedescendant` for combobox inputs only (where focus must stay on the text field).

## The require-action-registry Rule

The style validator rule `require-action-registry` enforces that files with `onClick` also have
`ActionRegistry.register`. This ensures every click-based interaction has a named action, enabling:

- Keyboard shortcut assignment (now or later)
- Discoverability in KeymapDrawer
- A complete catalog of user-facing actions

**Permanent exemptions** are appropriate for:
- onClick on elements that already have keyboard access through ARIA patterns (e.g., Radix Dialog buttons inside a
  focus-trapped dialog where Enter/Space already works and no shortcut would make sense)

**COMPLEXITY-TODO** (deferred migration) is appropriate for:
- Per-item actions that need a picker or navigation infrastructure that doesn't exist yet

## Current State and Gaps

### What exists

| Piece | Status |
|-------|--------|
| Key binding map (DEFAULT_BINDINGS) | Working |
| ActionRegistry (register/resolve) | Working |
| Key routing (single key + modifiers) | Working |
| KeymapDrawer (discoverability) | Working |
| Direct actions (paradigm 1) | Working — file:open, dismiss, navigate, filters |
| Navigation + contextual (paradigm 3) | Working — FilterChipPopover, DataTable rows |

### What's missing

| Piece | Needed for |
|-------|-----------|
| QuickPicker component | Paradigm 2 — reports, tabs, accounts, any named-entity selection |
| Chord/sequence key detection | Future enhancement — `g t`, `g r` prefix keys. Not blocking; single keys work for now |
| Next/prev tab cycling | Paradigm 4 — tab navigation across groups |
| Binding remapping UI | WCAG 2.1.4 compliance for assistive technology users |
| Focused row in report DataTables | Paradigm 3 — tree expand/collapse in report tables |
| Fuzzy matching | Future enhancement — substring search is sufficient for small lists |

## Paradigm Selection Guide

When adding keyboard interaction to a component, pick the paradigm based on the action shape:

| Action shape | Paradigm | Example |
|-------------|----------|---------|
| One target, always unambiguous | Direct action | Open file, close active tab, toggle shortcuts |
| Choose one from a named set | Picker | Open a report, switch to a tab by name, open an account |
| Step through an ordered sequence | Cycling | Next/prev tab, next/prev group |
| Act on the currently focused item in a visible list | Navigation + contextual | Expand/collapse a table row, select a filter option |

**Permanent exemptions** are appropriate when the element is inside a focus-trapped dialog or overlay where standard
HTML keyboard semantics (Enter/Space on buttons, Escape to dismiss) already provide full access.
