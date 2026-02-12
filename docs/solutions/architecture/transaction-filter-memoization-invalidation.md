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
status: resolved
related:
  - docs/solutions/architecture/filter-chip-selector-extraction.md
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

Extracted 8 ephemeral UI fields into a `ViewUiState` slice (`state.viewUiState`). Implementation:

1. **Type split**: Removed 8 fields from `TransactionFilter` (13 fields remain). Created `ViewUiState` type with the ephemeral fields.
2. **Reducer**: New `view-ui-state.js` reducer handles `SetViewUiState`, `SetFilterPopoverOpen`, `SetFilterPopoverSearch`. Root reducer routes these actions and chains `ResetTransactionFilters` to reset both slices.
3. **Action simplification**: Collapsed 3 trivial single-field actions (`SetTreeExpanded`, `SetColumnSizing`, `SetColumnOrder`) into generic `SetViewUiState`. Kept `SetFilterPopoverOpen`/`SetFilterPopoverSearch` for their multi-field reset semantics.
4. **Selectors**: Added `viewUi` accessor. Switched 8 ephemeral selectors to read from `viewUi`. Changed `filterPopoverData` memoization key to `'viewUiState'`. Added `'viewUiState'` to `globalKeys` for `highlightedId`/`highlightedIdForBank` (cheap lookups only).
5. **Components**: All dispatch sites in FilterChips, TransactionRegisterPage, InvestmentRegisterPage, report pages switched from `SetTransactionFilter` to `SetViewUiState` for ephemeral fields.

Key design decision: `searchQuery` stays in `TransactionFilter` because it drives `_searchMatches` which filters actual transaction data — that's filter state, not UI state. `currentSearchIndex` (which search match is highlighted) moved to `ViewUiState`.

## Prevention

When adding fields to a memoization-keyed type, consider whether the field's change frequency matches the other fields. High-frequency ephemeral state should not share a memoization boundary with expensive derived computations.

Rule of thumb: if a field changes on every keystroke/arrow press but doesn't affect the data pipeline, it belongs in a separate state slice.
