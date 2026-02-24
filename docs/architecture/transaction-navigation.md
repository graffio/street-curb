---
summary: "Cross-account transfer navigation via clickable links and Ctrl+Shift+X, with confirm dialog for filtered-out targets"
keywords: [ "transfer", "navigation", "cross-account", "CategoryCell", "ActionCell", "confirm-dialog", "matchingTransfer" ]
module: quicken-web-app
last_updated: "2026-02-24"
---

# Transaction Navigation

Cross-account transfer navigation: click a transfer indicator or press Ctrl+Shift+X to jump to the matching transaction
in the other account.

## The Problem

Transfers appear as two independent transactions in separate accounts. No way to jump between them — users had to
manually find the other account, open it, and scroll to the matching transaction.

## Architecture

```
CellRenderers.jsx       - clickable transfer indicator (CategoryCell, ActionCell)
        ↓ onTransferClick(transaction)
Page E namespace        - navigateToTransfer → checks filter → direct nav or show dialog
        ↓
selectors.js            - matchingTransfer(state, transaction) → heuristic lookup
        ↓
post.js                 - OpenView + SetViewUiState(highlightRow) + SetTransferNavPending
```

### Matching Heuristic

`Transactions.matchingTransfer(state, sourceTransaction)` finds the counterpart by:

1. `t.accountId === source.transferAccountId` (target account)
2. `t.transferAccountId === source.accountId` (points back)
3. `t.amount === -source.amount` (negated)
4. `t.date === source.date` (same day)

Throws if no match found (data integrity error). Returns first match when ambiguous (rare: same accounts, same day,
same amount).

### Navigation Flow

1. User clicks transfer link or presses Ctrl+Shift+X
2. `E.navigateToTransfer(transaction)` reads state, finds match
3. Checks target view's date filter — if match date is excluded, shows confirm dialog
4. Direct path: `OpenView` + `SetViewUiState({ highlightRow })` — tab opens/focuses, row highlighted and scrolled to center
5. Filtered path: `SetTransferNavPending(pending)` → dialog renders → OK expands filter + navigates, Cancel clears pending

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Navigation logic in page E namespace, not operations/ | Avoids circular dependency — page already imports post.js |
| Check filter BEFORE tab switch | Dialog must render while source page is still mounted |
| `SetTransferNavPending` in Redux (not local state) | Dialog component is self-selecting — reads pending via useSelector |
| `align: 'center'` for scroll target | `'auto'` placed targets at viewport edge — disorienting for cross-account jumps |
| Duplicated E functions across both page files | Each page uses different selectors (bank vs investment); structural duplication |

### Where Transfer Links Appear

| Register type | Column | Cell renderer | Link target |
|---------------|--------|---------------|-------------|
| Bank | Category | `CategoryCell` | `[AccountName]` text |
| Investment | Action | `ActionCell` | Account name subtitle |

Both use `table.options.meta.onTransferClick` passed from the page's DataTable context.

### Keyboard

- Action ID: `transfer:navigate`
- Default binding: `Ctrl+Shift+X` (matches Quicken)
- Registered in page-level actions array, reads highlighted row from module-level pageState
- No-op if highlighted row is not a transfer
