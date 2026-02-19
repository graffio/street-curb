---
tags: [search, display-text, data-mismatch, cell-renderers]
category: architecture
module: quicken-web-app
symptoms:
  - Search highlights text but shows 0 matches
  - Search counter shows impossible values (e.g., "485 of 62")
  - Searching for visible text finds nothing
---

# Search Must Match Display Text, Not Raw Data

## Solution

**Principle: search checks what the user sees, not what the database stores.**

```js
// Before: checks raw data
Transaction.matchesAnyText(query, ['payee', 'memo', ...], ...)

// After: checks display values
matches(payee || 'Unknown Payee')
matches(Transaction.ACTION_LABELS[investmentAction] || '')
```

Key changes:
- `matchesAllVisibleFields` checks display values with fallbacks
- ACTION_LABELS moved from CellRenderers (presentation) to Transaction type (domain) —
  single source of truth
- Module-level `_prevSearchQuery` resets match index on query change

## Prevention

When adding a cell renderer that transforms raw data into display text, check that
`matchesAllVisibleFields` also uses the same transform. The two must stay in sync:
what the cell shows = what search matches.

## Problem

Cell renderers transform raw data into display text (e.g., null payee → "Unknown Payee",
action code "Div" → "Dividend"). Search logic checked raw field values, creating mismatches:
users saw text they couldn't find by searching.

## Investigation

Three symptoms led to the root cause:

1. **Stale counter** — Module-level `_lastMatchIdx` never reset between queries, showing
   values from previous search (e.g., position 485 from a 500-match query, displayed as
   "485 of 62" for a new 62-match query).

2. **False highlight** — CellRenderers rendered `payee || 'Unknown Payee'` with search
   highlighting, but `matchesAllVisibleFields` checked raw `payee` (null). The highlight
   appeared on "Unknown Payee" but the match count didn't include it.

3. **Action label mismatch** — CellRenderers showed "Dividend" (from ACTION_LABELS mapping)
   but search checked raw code "Div". Searching "Dividend" found nothing.

## Root Cause

`matchesAllVisibleFields` checked raw transaction fields instead of the display values that
cell renderers show to users. Any transform between raw data and display text created a
search blind spot.
