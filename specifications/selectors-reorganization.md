# Selectors Reorganization

## Goal

1. Consistent export structure: each file exports one namespace object
2. Clean up unused selectors and dead code
3. Flatten subdirectories into single files

## Target Structure

```
selectors/
├── index.js              # Re-exports namespace objects + base accessors
├── accounts.js           # Accounts = { organized }
├── categories.js         # Categories = { allNames }
├── holdings.js           # Holdings = { collectAsOf, CASH_SECURITY_ID }
├── transactions.js       # Transactions = { ... }
├── ui.js                 # UI = { ... }
├── prefs.js              # Prefs = { sortMode, collapsedSections }
└── filters.js            # Pure helpers (keep as-is for now)
```

## Rules

### Export Structure
- Each file exports ONE namespace object: `export { Accounts }`
- index.js re-exports those objects + base state accessors
- No flattening of functions into index.js

### Dead Code Cleanup
- If selector f has no uses → remove from exports
- If selector f is only used in trivial tap tests → remove tests, remove from exports
- If function is not exported AND not used internally → delete entirely

## Usage Pattern

```javascript
import * as S from '../store/selectors'

S.accounts(state)              // base accessor
S.Accounts.organized(state)    // derived selector
S.UI.dateRange(state, viewId)  // UI state
```

## index.js Structure

```javascript
// Re-export namespace objects
export { Accounts } from './accounts.js'
export { Categories } from './categories.js'
export { Holdings } from './holdings.js'
export { Transactions } from './transactions.js'
export { UI } from './ui.js'
export { Prefs } from './prefs.js'

// Base state accessors (keep for Find Usages + abstraction)
export const accounts = state => state.accounts
export const categories = state => state.categories
export const initialized = state => state.initialized
export const keymaps = state => state.keymaps
export const lots = state => state.lots
export const prices = state => state.prices
export const securities = state => state.securities
export const splits = state => state.splits
export const tabLayout = state => state.tabLayout
export const tableLayouts = state => state.tableLayouts
export const tags = state => state.tags
export const transactions = state => state.transactions

// Entity lookups (if still used after cleanup)
export const accountName = (state, id) => accounts(state)?.get(id)?.name ?? ''
export const accountType = (state, id) => accounts(state)?.get(id)?.type ?? ''
export const categoryName = (state, id) => categories(state)?.get(id)?.name ?? 'Uncategorized'
export const securityName = (state, id) => securities(state)?.get(id)?.name ?? id
export const securitySymbol = (state, id) => securities(state)?.get(id)?.symbol ?? id
```

## Files to Delete After Cleanup

- `categories/index.js`
- `categories/selectors.js` (merged into categories.js)
- `transactions/index.js`
- `transactions/selectors.js` (merged into transactions.js)
- Any tap test files that only test removed selectors

## Verification

1. All imports updated to new pattern
2. No unused exports remain
3. App runs without errors
4. Remaining tests pass
