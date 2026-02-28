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

**Examples:** `r` → report picker, `Shift+A` → account picker, `Shift+T` → tab picker (pick from open tabs)

**Pattern:** `QuickPicker.jsx` — Dialog-based centered overlay. Caller registers an action whose execute posts
`Action.SetPickerOpen(pickerId)`. `picker-config.js` maps each pickerId to a config with `title` and `items` (a
function `state => [{id, label, execute}]`). Each item carries its own `execute` function — the picker doesn't know
what selection does, it just calls `item.execute()`. QuickPicker handles search filtering, highlight navigation (arrow
keys / j/k), selection (Enter), and dismissal (Escape) internally.

**State:** Redux stores `openPickerId`, picker search text, and highlight index.

**Gotcha:** When a picker selects an item that belongs to a different tab group, `SetActiveView` alone is not enough —
it only updates the view within the group, not which group is active. Dispatch `SetActiveTabGroup` first, then
`SetActiveView`.

**Reference:** `QuickPicker.jsx`, `picker-config.js`, `ReportsList.jsx` (report:picker), `AccountList.jsx`
(account:picker), `RootLayout.jsx` (tab:picker)

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
registration, no UI — just state mutation. The reducer owns the flat-list traversal logic (wrapping, cross-group
boundary crossing). The action registration in RootLayout reads the active tab from state at call time (dispatch-intent
pattern, matching `E.closeActiveTab`).

**Reference:** `tab-layout.js` (handleCycleTab — flat-list with wrapping), `RootLayout.jsx` (tab:cycle-left/right
registrations), `keymap-config.js` (ctrl+h/l bindings)

### 5. Context Menu (targeted action)

Right-click on an element shows actions that target *that specific element*, not the globally active one.

**When to use:** The same actions as keyboard shortcuts, but targeted at a clicked element. Provides discoverability
(keyboard shortcut hints) and mouse access to keyboard-first actions.

**Examples:** Tab context menu — Move Left, Move Right, Move to New Group, Close. Each targets the right-clicked tab,
which may differ from the active tab.

**Pattern:** Radix `ContextMenu` wrapping the element. Menu items call `post(Action.X(elementId, containerId))` with
IDs captured at render time. Disabled states computed via selectors. Keyboard shortcut hints shown with `<Kbd>`.

**Gotcha:** Radix Tooltip inside ContextMenu.Trigger intercepts the contextmenu event, causing the browser's native
menu to appear instead. Use native `title` attribute for overflow hints, not Tooltip.

**Reference:** `TabGroup.jsx` (Tab component — Move Left/Right/New Group/Close)

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
| Picker (paradigm 2) | Working — report:picker, account:picker, tab:picker via QuickPicker |
| Navigation + contextual (paradigm 3) | Working — FilterChipPopover, DataTable rows |
| Cycling (paradigm 4) | Working — tab cycling with ctrl+h/l, wraps across groups |
| Context menu (paradigm 5) | Working — tab context menu with Move Left/Right/New Group/Close |

### What's missing

| Piece | Needed for |
|-------|-----------|
| Chord/sequence key detection | Future enhancement — `g t`, `g r` prefix keys. Not blocking; single keys work for now |
| Binding remapping UI | WCAG 2.1.4 compliance for assistive technology users |
| Fuzzy matching | Future enhancement — substring search is sufficient for small lists |

## Paradigm Selection Guide

When adding keyboard interaction to a component, pick the paradigm based on the action shape:

| Action shape | Paradigm | Example |
|-------------|----------|---------|
| One target, always unambiguous | Direct action | Open file, close active tab, toggle shortcuts |
| Choose one from a named set | Picker | Open a report, switch to a tab by name, open an account |
| Step through an ordered sequence | Cycling | Next/prev tab, next/prev group |
| Act on the currently focused item in a visible list | Navigation + contextual | Expand/collapse a table row, select a filter option |
| Same actions as keyboard, targeted at a clicked element | Context menu | Move/close a specific tab via right-click |

**Permanent exemptions** are appropriate when the element is inside a focus-trapped dialog or overlay where standard
HTML keyboard semantics (Enter/Space on buttons, Escape to dismiss) already provide full access.
