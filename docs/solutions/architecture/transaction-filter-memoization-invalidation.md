---
title: TransactionFilter ephemeral state invalidates expensive selector caches
category: architecture
tags:
  - redux
  - memoization
  - performance
  - selectors
  - transaction-filter
module:
  - selectors.js (quicken-web-app)
  - memoize-redux-state.js (functional)
  - transaction-filter.type.js (quicken-web-app)
symptoms:
  - Arrow key navigation in filter popovers is extremely laggy (5+ second delay)
  - Register row navigation with ArrowDown/ArrowUp is laggy
  - Holding arrow keys causes UI freeze then position jump
  - Any rapid SetTransactionFilter dispatches cause cascading recomputation
severity: high
date_resolved: '2026-02-10'
status: root-cause-identified
related:
  - docs/solutions/architecture/filter-chip-selector-extraction.md
  - specifications/keyboard-accessibility/keymap-system-issues.md
---

# TransactionFilter ephemeral state invalidates expensive selector caches

## Problem

Arrow key navigation in filter chip popovers and the transaction register is extremely laggy. Holding a key for 2 seconds causes a 5+ second freeze, then the selection jumps to a seemingly random position.

## Investigation

1. Initial hypothesis (wrong): register keymaps interfering with popover keymaps. Research agent found `j`/`k` bindings in `tab-layout.js` and concluded register doesn't bind ArrowDown. True, but missed that `j` dispatches a synthetic ArrowDown event via `keymap-routing.js:35-38`.

2. Throttling dispatches to one per render cycle had no effect — confirming the problem is render cost, not dispatch count.

3. Traced the dispatch path: `SetTransactionFilter` → reducer creates new `TransactionFilter` via `TransactionFilter.from({ ...existing, ...changes })` → new object reference → `memoizeReduxStatePerKey` cache miss on ALL selectors keyed on `'transactionFilters'`.

## Root Cause

`memoizeReduxStatePerKey` (line 97) uses `===` reference equality on the per-key value:

```javascript
if (cached && cached.keyedValue === keyedValue) return cached.value
```

`TransactionFilter.from()` always creates a new object, so ANY field change — even ephemeral UI state like `filterPopoverHighlight` — invalidates caches for every selector that depends on `'transactionFilters'`. This includes the entire transaction pipeline:

- `Transactions.enriched`
- `Transactions.filtered`
- `Transactions.sortedForDisplay`
- `Transactions.sortedForBankDisplay`
- `Transactions.searchMatches`
- `Transactions.highlightedId`

8 of 21 TransactionFilter fields are ephemeral UI state that change frequently but don't affect transaction computation:

| Field | Changes on |
|-------|-----------|
| `filterPopoverId` | Popover open/close |
| `filterPopoverSearch` | Typing in popover search |
| `filterPopoverHighlight` | Every arrow key in popover |
| `currentRowIndex` | Every arrow key in register |
| `currentSearchIndex` | Search navigation |
| `treeExpansion` | Expanding/collapsing tree nodes |
| `columnSizing` | Resizing columns |
| `columnOrder` | Reordering columns |

## Solution

Extract the 8 ephemeral UI fields into a separate state slice (e.g., `viewUiState`). The expensive transaction selectors depend on `'transactionFilters'` which would then only change when actual filter criteria change. Ephemeral UI changes only touch the new slice, which the transaction selectors don't watch.

## Prevention

When adding fields to a memoization-keyed type, consider whether the field's change frequency matches the other fields. High-frequency ephemeral state should not share a memoization boundary with expensive derived computations.
