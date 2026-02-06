---
title: Migrate SelectableListPopover State from React useState to Redux
date: 2026-02-03
category: architecture
tags:
  - redux-state
  - controlled-components
  - selector-pattern
  - keyboard-navigation
  - useEffect-deps
module: design-system, quicken-web-app
component: SelectableListPopover, AccountFilterChip
symptoms:
  - Component state invisible to Redux devtools
  - Navigation logic untestable via selectors
  - Component mixes presentation with state management
---

# Migrate Component State to Redux

## Problem

SelectableListPopover managed popover open/close, search text, and highlighted index via React `useState`. This made the state opaque to Redux devtools and untestable through selectors. The component violated the convention that components should be pure wiring between selectors (reads) and actions (writes).

## Root Cause

The original architecture placed popover state inside the design-system component. The component owned its own lifecycle rather than being fully controlled by the consumer.

## Solution

### 1. Add fields to the domain type

Added 3 fields to `TransactionFilter`:
- `filterPopoverId: 'String?'` — which popover is open (null = none)
- `filterPopoverSearch: 'String'` — search text
- `filterPopoverHighlight: 'Number'` — highlighted index

### 2. Add action variants

- `SetFilterPopoverOpen { viewId, popoverId }` — opens/closes popover, resets search and highlight
- `SetFilterPopoverSearch { viewId, searchText }` — updates search, resets highlight to 0

### 3. Composite memoized selector

`UI.filterPopoverData` returns all derived state:

```javascript
{ popoverId, searchText, highlightedIndex, nextHighlightIndex,
  prevHighlightIndex, highlightedItemId, filteredItems }
```

Wrapped indices (next/prev) computed here so handlers are simple `post()` calls.

### 4. Fully controlled component

SelectableListPopover becomes zero-useState. Only `useRef` (DOM) and `useEffect` (scroll/focus) remain.

### 5. Pure wiring in consumer

AccountFilterChip uses only `useSelector` + `post(Action.X())`. Keymap lifecycle via `useEffect` with deps.

## Gotchas

### Handler ordering and closures

Style validator requires handlers defined before hooks/constants. Handlers reference selector values declared later — this works because JavaScript closures capture bindings, not values. The variables are initialized before the function is *called*.

```javascript
const AccountFilterChip = ({ viewId }) => {
    // Handlers first — reference variables declared below via closures
    const handleMoveDown = () =>
        post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    // Constants and hooks after
    const KEYMAP_ID = `${viewId}_accounts`
    const { nextHighlightIndex } = useSelector(state => S.UI.filterPopoverData(state, viewId))
}
```

### useEffect deps for keymap lifecycle

Without deps, keymap re-registers every render. With `[isOpen]` only, handler closures go stale. Include navigation state values so the effect re-runs when handlers would produce different results:

```javascript
useEffect(keymapLifecycleEffect, [isOpen, KEYMAP_ID, nextHighlightIndex, prevHighlightIndex, highlightedItemId])
```

### strict-react catches derived state

`.map()` in component body flagged by pre-commit hook. Move to selector:

```javascript
// BAD — derived state in component
const selectedIds = badges.map(b => b.id)

// GOOD — selector returns it
const { badges, selectedIds } = useSelector(state => S.UI.accountFilterData(state, viewId))
```

### Barrel file naming collision

When a JSX component and a logic module share the same name, alias in the barrel file:

```javascript
import { SelectableListPopover as FilterChipPopoverLogic } from './components/filter-chip-popover.js'
```

## Checklist: Migrating Component State to Redux

1. Identify all `useState` calls that should move
2. Add fields to the appropriate type definition (with defaults)
3. Add action variants for state mutations
4. Run `yarn types:generate-all`
5. Add reducer handlers (remember to reset dependent fields — e.g., resetting highlight when search changes)
6. Wire actions in `reducer.js` and `post.js`
7. Create composite selector for derived state (filtered items, wrapped indices, etc.)
8. Rewrite component as fully controlled (zero useState)
9. Rewrite consumer with `useSelector` + `post()` only
10. Move any `.map()` / derived state from component to selector
11. Verify with `--strict-react` validator

## Files Modified

- `type-definitions/transaction-filter.type.js` — 3 new fields
- `type-definitions/action.type.js` — 2 new variants
- `store/reducers/transaction-filters.js` — 2 handlers + updated defaults
- `store/reducer.js` — wire 2 actions
- `commands/post.js` — wire 2 actions
- `store/selectors.js` — composite selector
- `design-system/src/components/SelectableListPopover.jsx` — fully controlled
- `quicken-web-app/src/components/FilterChips.jsx` — pure wiring
