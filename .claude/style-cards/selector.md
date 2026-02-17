# Selector Style Card

Selectors handle **Redux mechanics and simple derivation**. Complex business logic belongs in business modules.

## Layer Boundary

- Selectors read state and compose other selectors
- Simple transformations (map, filter, lookup) are fine here
- Complex domain logic (scoring, matching, tree-building) → delegate to a business module or type.js file
- Cross-type transformations → use `Type.from{InputType}()` methods, not inline logic
- When simplifying a selector, consider: does this logic belong as a method on the Tagged type? If so, add it to the type's `.type.js` file (never the generated `.js` file)

## Memoization

Use `memoizeReduxState` (single key) or `memoizeReduxStatePerKey` (keyed by viewId/accountId) from the store module. These track which Redux state slices a selector depends on and only recompute when those slices change.

```javascript
const _filtered = (state, viewId) => {
    const { categories, securities, transactions } = state
    return TransactionFilter.apply(filter(state, viewId), transactions, categories, securities)
}

const filtered = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],  // state slices to watch
    'transactionFilters',                           // filter state key
    _filtered,
)
```

## Composition Over Chaining

Prefer composing selectors over long method chains. Delegate complex logic to business modules:

```javascript
const _visible = (state, viewId) => {
    const txns = selectTransactions(state)
    const f = filter(state, viewId)
    return TransactionFilter.apply(f, txns, state.categories, state.securities)
}
```

## Fail-Fast

Use `.get(id)` on LookupTables — never `?.` on internal data. If an ID should exist, let it throw.

For LookupTable operations, see `api-cheatsheets/lookup-table.md`.
