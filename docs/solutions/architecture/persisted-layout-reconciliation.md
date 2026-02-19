---
tags: [table-layout, persistence, reconciliation, tagged-type]
category: architecture
module: quicken-web-app
symptoms:
  - New columns don't appear in existing table layouts
  - Column resize/reorder doesn't work for newly added columns
  - EnsureTableLayout silently ignores missing columns
---

# Persisted Layout Reconciliation

## Solution

Add `TableLayout.reconcile(existingLayout, currentColumns)` as a method on the Tagged type. It:

1. Filters `currentColumns` to find any whose `id` is missing from `existingLayout.columnDescriptors`
2. If none missing, returns the same object (reference equality = no Redux update)
3. If missing, appends new `ColumnDescriptor` entries with default width and no sort direction

The reducer's `EnsureTableLayout` handler now calls `reconcile` for existing layouts instead of returning early:

```js
const existing = state.tableLayouts[tableLayoutId]
if (!existing) { /* create from scratch */ }
const reconciled = TableLayout.reconcile(existing, columns)
if (reconciled === existing) return state  // no-op if nothing missing
return { ...state, tableLayouts: state.tableLayouts.addItemWithId(reconciled) }
```

## Prevention

- When adding columns to a register, always verify they appear in existing (persisted) layouts, not just fresh ones
- Put layout transformation functions on the Tagged type — they operate on and return `TableLayout` instances
- Reference equality check (`reconciled === existing`) prevents unnecessary Redux updates on every render

## Problem

When a table gains new columns (e.g., adding payee to the investment register), users with existing persisted `TableLayout` records never see the new column. The `EnsureTableLayout` reducer action was idempotent — if a layout already existed for that ID, it bailed out entirely.

New columns were invisible to those users: no display, no resize handle, no drag-and-drop reorder.

## Root Cause

`EnsureTableLayout` treated "layout exists" as "layout is complete." It only created layouts from scratch; it never checked whether the existing layout was missing descriptors for newly-added columns.
