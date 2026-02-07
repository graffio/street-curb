# Selector Composition

**When:** Complex derived state from Redux store.

**Where:** `store/selectors/` directory.

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
const transactions = state => state.transactions
const filters = state => state.ui.filters
const accounts = state => state.accounts

const visibleTransactions = createSelector(
    [transactions, filters, accounts],
    (txns, filters, accts) => applyFilters(txns, filters, accts)
)
```

**Key rules:**
- Compose small selectors rather than chaining operations
- Delegate complex logic to business module functions
- Use `createSelector` from `@graffio/functional` when curried usage is needed

**Reference:** `modules/quicken-web-app/src/store/selectors/`
