# Action (Command Pattern)

**When:** Finite set of user-initiated state changes.

**Where:** Redux actions exclusively.

**Instead of:**

```js
dispatch({ type: 'SET_FILTER', viewId, changes })
// Stringly-typed, no validation, easy to typo
```

**Use:**

```js
dispatch(Action.SetTransactionFilter(viewId, changes))
// Type-safe construction, validated fields, exhaustive matching in reducer
```

**Key rules:**
- Actions carry data only — never pass functions as action fields
- Components call `post(Action.X(...))` — never construct raw dispatch objects
- Reducers use `.match()` for exhaustive handling

**Reference:** `modules/quicken-web-app/src/types/action.js`
