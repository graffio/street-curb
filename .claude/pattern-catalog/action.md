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

## post as Effect Coordinator

`post(action)` is the single place where all side effects for an Action live:
- Dispatches to Redux (`dispatch(action)`)
- Persists to IndexedDB (table layouts, tab layout, account prefs, file handles)
- Future: SQLite writes, rollback

Components never perform side effects directly — they call `post(Action.X(...))`.

Some Actions are **effect-only** (reducer returns state unchanged, but post performs a side effect like `Storage.setRaw`). Both `post.js` and `reducer.js` must handle every Action variant via exhaustive `.match()`.

**Reference:** `modules/quicken-web-app/src/types/action.js`
