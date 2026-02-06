---
title: Filter Chip Selector Extraction and Polish
category: architecture
tags:
  - selectors
  - redux
  - memoization
  - react-components
  - keyboard-accessibility
  - filter-chips
component:
  - FilterChipRow (quicken-web-app)
  - SelectableListPopover (design-system)
  - selectors.js (quicken-web-app)
symptoms:
  - FilterChipRow computed chip data inline instead of using selectors
  - FilterChipPopover naming was overly specific
  - Focus rings visible on highlighted popover rows
  - Popover positioning sometimes hid the triggering chip
  - keymapEffect defined inline inside component
severity: medium
date_resolved: '2026-02-06'
related:
  - docs/solutions/architecture/migrate-component-state-to-redux.md
  - docs/solutions/code-quality/keymap-factory-boilerplate-reduction.md
  - specifications/keyboard-accessibility/component-owned-keymaps.md
---

# Filter Chip Selector Extraction and Polish

## Problem

FilterChipRow was doing significant computation inline:
- Computing `isActive` flags for each chip type
- Building detail arrays (category names, account names, security symbols)
- Truncating lists with "+N more" logic
- Calculating filter counts and `isFiltering` state

This violated the React/Redux separation principle: components should be pure wiring between selectors and actions.

Additional issues:
- `FilterChipPopover` name was too specific for a general-purpose component
- Focus rings appeared on highlighted rows (visual noise)
- Popover positioning could hide the chip being filtered

## Solution

### 1. Extracted Per-Chip Selectors

Created seven selectors with consistent `{ isActive, details }` interface:

```javascript
// Each selector returns { isActive: Boolean, details: [String] }
const _dateChipData = (state, viewId) => {
    const { dateRange, dateRangeKey } = filter(state, viewId)
    const label = dateRange ? formatDateRange(dateRange.start, dateRange.end) : null
    return { isActive: dateRangeKey !== 'all', details: label ? [label] : [] }
}

const _categoryChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedCategories
    return { isActive: selected.length > 0, details: toTruncatedDetails(selected) }
}

const _accountChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedAccounts
    const names = selected.map(id => accounts(state).get(id)?.name || id)
    return { isActive: selected.length > 0, details: toTruncatedDetails(names) }
}

// ... similar for security, action, search, filterCounts

// Wrapped with memoization
UI.dateChipData = memoizeReduxStatePerKey([], 'transactionFilters', _dateChipData)
UI.categoryChipData = memoizeReduxStatePerKey([], 'transactionFilters', _categoryChipData)
UI.accountChipData = memoizeReduxStatePerKey(['accounts'], 'transactionFilters', _accountChipData)
```

**Usage in component:**
```javascript
// Before: inline computation
const dateLabel = dateRange ? formatDateRange(dateRange.start, dateRange.end) : null
const isDateActive = dateRangeKey !== 'all'

// After: single memoized selector
const { isActive: isDateActive, details: dateDetails } = useSelector(state => S.UI.dateChipData(state, viewId))
```

### 2. Renamed FilterChipPopover → SelectableListPopover

The component is general-purpose (selectable list in a popover), not filter-specific. Renamed to reflect its actual capability.

### 3. Moved keymapEffect to E Group

```javascript
// Module level - testable, follows cohesion pattern
const E = {
    // @sig keymapEffect :: (String, FilterConfig) -> (() -> void)
    keymapEffect: (viewId, config) => {
        const openPopover = popoverId => post(Action.SetFilterPopoverOpen(viewId, popoverId))
        const keymap = F.createFilterShortcutsKeymap(viewId, config, openPopover)
        post(Action.RegisterKeymap(keymap))
        return () => post(Action.UnregisterKeymap(`${viewId}_filters`))
    },
}

// Component - just wires the effect
useEffect(() => E.keymapEffect(viewId, keymapConfig), [viewId, ...deps])
```

### 4. Fixed Visual Polish

- Added `outline: 'none'` to highlighted rows (background highlight is sufficient)
- Set popover positioning: `side="right" align="start" sideOffset={4}`

## Prevention

### Inline Computation Anti-patterns

Watch for these signals that logic belongs in selectors:
- Selector calls followed by `.filter()`, `.map()` in the component
- Building objects with multiple derived properties
- Same computation needed in multiple components
- Conditional logic combining multiple selector values

### Naming Anti-patterns

- Names mentioning specific features (FilterChip*) for general components
- Ask: "Would this name make sense in a different context?"

### Style Validator Workflow

Run style validator during development, not just at commit:
```bash
node modules/cli-style-validator/src/cli.js path/to/file.jsx
```

Common issues:
- Function ordering: Define P/T/F/V/A/E groups before functions that use them
- Destructuring: Collapse to one line if under 120 chars
- Chain extraction: Extract `state.x` to variable if accessed 3+ times

## Impact

- **Memoization:** Chip data only recomputes when relevant state changes
- **Testability:** Selector logic can be unit tested independently
- **Reusability:** Same selectors available to other components
- **Organization:** Effect logic in E group, following conventions
