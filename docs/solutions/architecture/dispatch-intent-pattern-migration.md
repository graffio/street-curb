---
title: Migrate React Hooks to Dispatch-Intent Pattern
date: 2026-02-12
category: architecture
tags:
  - dispatch-intent
  - useCallback-elimination
  - useRef-elimination
  - command-functions
  - react-hooks
  - style-validator
module: quicken-web-app
component: RegisterPageView, register-page service
symptoms:
  - useCallback closing over Redux state (stale closures)
  - useRef workarounds for stable references (dataRef, searchHandlersRef)
  - Component has 15+ hooks making it hard to reason about
  - Style validator rejects useCallback/useRef in strict-react mode
---

## Problem

RegisterPageView.jsx had 26 hooks (7 useCallback, 4 useEffect, 3 useRef, 12 useSelector). The useCallbacks
closed over Redux state, requiring useRef workarounds to avoid stale closures. The component was 149 lines
of hook management with business logic scattered across closures.

## Investigation

Cataloged all 26 hooks and classified each:
- 12 useSelector: **keep** (allowed by rule)
- 7 useCallback: **eliminate** via dispatch-intent command functions
- 3 useRef: **eliminate** via module-level ref object
- 4 useEffect: **defer** (genuine lifecycle concerns needing infrastructure)

## Root Cause

The fundamental issue: React's closure model forces you to capture Redux state in callbacks, then the state
goes stale, then you add useRef to work around stale closures, then you add useCallback to memoize, creating
a cascade of hooks that exist only to manage other hooks.

## Solution

### Pattern 1: Dispatch-Intent Command Functions

**Before** (closes over Redux state, needs useCallback + deps):
```js
const handleSortingChange = useCallback(
    updater => post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting)))),
    [tableLayout, sorting],
)
```

**After** (reads state at call time, no closure over Redux state):
```js
// In register-page.js service
const updateSorting = (tableLayoutId, updater) => {
    const tableLayout = currentStore().getState().tableLayouts.get(tableLayoutId)
    if (!tableLayout) return
    const { sorting } = TableLayout.toDataTableProps(tableLayout)
    post(Action.SetTableLayout(TableLayout.applySortingChange(tableLayout, updater(sorting))))
}

// In JSX — inline, no useCallback needed
onSortingChange={updater => RegisterPage.updateSorting(tableLayoutId, updater)}
```

Key insight: command functions close over **stable config-derived values** (tableLayoutId, viewId), not Redux
state. They read fresh state from `currentStore()` at call time.

### When to Inline vs Extract

**Inline** when the handler body is a single `post(Action.X(...))` expression:
```jsx
onClick={() => post(Action.OpenView(View.Register(`reg_${account.id}`, account.id, account.name)))}
onToggle={sectionId => post(Action.ToggleSectionCollapsed(sectionId))}
onChange={value => post(Action.SetAccountListSortMode(SortMode[value]()))}
```

The Action variant name IS the intent documentation. Wrapping `post(Action.ToggleSectionCollapsed(id))` in
`E.toggleSection(id)` creates a lossy alias — you lose the Action name and gain nothing.

**Extract to E group** when the handler does more than dispatch:
- Branching: `if (selected) post(Action.Remove(...)) else post(Action.Add(...))`
- Multiple steps: `setLocalQuery(''); post(Action.SetTransactionFilter(...))`
- State reads: `const layout = currentStore().getState()...` before dispatch
- Timing: `debounce(300, (viewId, query) => post(...))`

Countable rule: count expressions in the handler body. If 1 and it's `post(Action.X(...))`, inline it.

### Pattern 2: RegisterCtx Object

When multiple command functions need the same 6 stable values, group them:
```js
const ctx = { sortSelector, highlightSelector, viewId, accountId, tableLayoutId, columns }
// Pass to command functions:
onSearchNext={() => RegisterPage.navigateSearchMatch(ctx, 1)}
```

This avoids 6-7 positional parameters. The ctx is constructed once per render from props/config (all stable).

### Pattern 3: Module-Level Ref Object

**Before** (useRef inside component):
```js
const searchInputRef = useRef(null)
```

**After** (plain JS object at module level):
```js
// Module-level — only one register page is active at a time
const searchInputRef = { current: null }
```

Works because: (1) only one instance active at a time, (2) SearchChip needs `.current?.blur()` so ref
callbacks won't work — it must be an object with `.current`.

### Pattern 4: Selector-with-Defaults

`tableLayoutOrDefault` returns a default TableLayout when none exists in Redux, eliminating the
`if (!tableLayout) return null` guard and the need for an init effect (for display purposes).

## Gotchas

### Style Validator: function-declaration-ordering

If you define handler variables (`const searchNav = ...`) inside a component body, the validator requires
all function declarations before any non-function statements. But handlers reference `ctx` (a non-function
statement). **Fix:** inline the calls directly in JSX instead of extracting handler variables. With the ctx
pattern, calls are short enough to stay on one line (under 120 chars).

### Style Validator: react-redux-separation + COMPLEXITY

The `--strict-react` pre-commit hook bans ALL useEffect in `.jsx` files. For lifecycle effects that can't
be eliminated yet, add a file-level COMPLEXITY comment:
```
// COMPLEXITY: react-redux-separation — 4 useEffect lifecycle dispatches need infrastructure to eliminate
```
The `FS.withExemptions` wrapper in the validator reads this and skips the rule for the entire file.
**Must get Jeff's approval before adding COMPLEXITY comments** (CLAUDE.md hard rule).

### What CAN'T be a selector

Effects that **dispatch actions** (side effects) cannot become selectors:
- `ensureTableLayoutEffect` — creates Redux state for command functions
- `searchActionsEffect` — registers with ActionRegistry (mount/unmount lifecycle)
- `SetPageTitle` — dispatches page title action
- `initDateRange` — dispatches initial date range filter

These need separate infrastructure (event-driven dispatch, tab-system titles, etc.).

## Prevention

- Read `.claude/style-cards/react-component.md` before writing React components
- The dispatch-intent pattern is now documented in the style card
- Style validator `--strict-react` catches violations at commit time
- When tempted to add useCallback: ask "can this read state from currentStore() instead?"
