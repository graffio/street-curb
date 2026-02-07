# Selector Style Card

Selectors handle **Redux mechanics and simple derivation**. Complex business logic belongs in business modules.

## Layer Boundary

- Selectors read state and compose other selectors
- Simple transformations (map, filter, lookup) are fine here
- Complex domain logic (scoring, matching, tree-building) → delegate to a business module or type.js file
- Cross-type transformations → use `Type.from{InputType}()` methods, not inline logic
- When simplifying a selector, consider: does this logic belong as a method on the Tagged type? If so, add it to the type's `.type.js` file (never the generated `.js` file)

## createSelector

Use `createSelector` from `@graffio/functional` when a selector needs both curried and uncurried usage:

```javascript
const selectItem = createSelector((state, id) => state.items[id])
selectItem(state, 'foo')        // uncurried — in selectors, tests, business logic
useSelector(selectItem('foo'))  // curried — in components
```

Only wrap selectors that actually need curried usage. Simple state-only selectors don't need it (YAGNI).

## Composition Over Chaining

Prefer composing selectors over long method chains:

```javascript
// Prefer: compose small selectors
const visible = createSelector((state, viewId) => {
    const txns = selectTransactions(state)
    const filter = selectFilter(state, viewId)
    return Filter.apply(txns, filter)  // business module does the work
})
```

## Fail-Fast

Use `.get(id)` on LookupTables — never `?.` on internal data. If an ID should exist, let it throw.

For LookupTable operations, see `api-cheatsheets/lookup-table.md`.
