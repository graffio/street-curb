# Selector Composition

**When:** Complex derived state from Redux store.

**Where:** `store/selectors.js`

**Instead of:**

```js
const getVisibleTransactions = state => {
    const transactions = state.transactions
    const filters = state.ui.filters
    const accounts = state.accounts
    // 50 lines of filtering logic
}
```

**Use:**

```js
// Pure function — business logic lives here
const _filtered = (state, viewId) => {
    const { categories, securities, transactions } = state
    return TransactionFilter.apply(filter(state, viewId), transactions, categories, securities)
}

// Memoized — only recomputes when watched state slices change
const filtered = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],
    'transactionFilters',
    _filtered,
)
```

**Key rules:**
- Compose small selectors rather than chaining operations
- Delegate complex logic to business module functions
- Memoize with `memoizeReduxState` or `memoizeReduxStatePerKey`
