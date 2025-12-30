# Pattern Catalog

Framework for managing code complexity through pattern application.

## Three Layers

| Layer                | Question                            | Examples                                |
|----------------------|-------------------------------------|-----------------------------------------|
| **Cohesion type**    | What *kind* of code is this?        | Predicates, Transformers, Configuration |
| **Design pattern**   | What *structural solution* applies? | Strategy, Command, Module               |
| **Tactical pattern** | What's *our implementation*?        | LookupTable, TaggedSum, Action          |

## Cohesion Types → Patterns

| Cohesion Signal                        | Design Pattern      | Tactical Pattern               |
|----------------------------------------|---------------------|--------------------------------|
| Many functions with same signature     | Strategy            | Rule factory, handler registry |
| Related predicates scattered           | Module              | Namespace object               |
| Finite set of state changes            | Command             | `Action` TaggedSum             |
| Collection needing iteration + lookup  | Indexed Collection  | `LookupTable`                  |
| Value with mutually exclusive variants | Discriminated Union | `TaggedSum`                    |
| Complex object construction            | Factory             | `Type.from()`                  |
| if/else chain on type field            | Visitor             | `.match()` on TaggedSum        |
| Repeated style objects in components   | Extract             | design-system or module-level  |
| Derived state from Redux               | Selector            | Composable memoized selectors  |

## Context-Specific Budgets

| Context         | Max Lines | Max Style Objects | Max Functions |
|-----------------|-----------|-------------------|---------------|
| CLI tool        | 150       | 0                 | 10            |
| React page      | 200       | 5                 | 8             |
| React component | 100       | 3                 | 5             |
| Selector        | 80        | 0                 | 5             |
| Utility module  | 150       | 0                 | 10            |

---

## Tactical Patterns (This Codebase)

### LookupTable

**When:** Collection of items with unique IDs needing both iteration and O(1) lookup.

**Where:** Redux state, selector returns, any domain collection.

**Instead of:**

```js
const accounts = [{ id: 'a1', name: 'Checking' }, { id: 'a2', name: 'Savings' }]
const found = accounts.find(a => a.id === 'a1')  // O(n)
```

**Use:**

```
const accounts = LookupTable([...], Account, 'id')
const found = accounts['a1']  // O(1)
accounts.map(a =>...)        // Still iterable
```

**Reference:** `modules/functional/src/lookup-table.js`

---

### TaggedSum (Discriminated Union)

**When:** Value that can be one of several mutually exclusive variants.

**Where:** Domain types with variants, result types, actions.

**Instead of:**

```
const result = { type: 'success', value: data }
// or
const result = { type: 'failure', error: err }

if (result.type === 'success') { ... } 
else if (result.type === 'failure') { ... }
```

**Use:**

```js
const result = Result.Success(data)
// or
const result = Result.Failure(err)

result.match({
    Success: ({ value }) => handleSuccess(value),
    Failure: ({ error }) => handleFailure(error),
})
```

**Reference:** `modules/cli-type-generator/tagged-types.md`

---

### Action (Command Pattern)

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

**Reference:** `modules/quicken-web-app/src/types/action.js`

---

### Namespace Object (Module Pattern)

**When:** Organizing functions by cohesion type (mandatory for all files).

**Where:** All JS files—CLI tools, utility modules, validators, etc.

**Instead of:**

```js
const isPascalCase = name => /^[A-Z]/.test(name)
const isKebabCase = name => /^[a-z]/.test(name)
const getBaseName = path => path.split('/').pop()
const checkNaming = (ast, src, path) => { /* ... */ }
```

**Use:**

```js
const P = {
    isPascalCase: name => /^[A-Z]/.test(name),
    isKebabCase: name => /^[a-z]/.test(name),
}

const T = {
    getBaseName: path => path.split('/').pop(),
}

const V = {
    checkNaming: (ast, src, path) => { /* ... */ },
}
```

**Letters:** P (Predicates), T (Transformers), F (Factories), V (Validators), A (Aggregators)

**Benefit:** Forces categorization of every function, consistent across all files, brevity (`P.isPascalCase`).

**Reference:** See `conventions.md` → File Structure for full specification.

---

### Selector Composition

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

**Reference:** `modules/quicken-web-app/src/store/selectors/`

---

### Design System Extraction

**When:** Style objects or UI patterns repeated across components.

**Where:** `modules/design-system/`

**Signal:** Same style object in 2+ files, or same component structure (FilterChipRow + DataTable + container).

**Process:**

1. Identify repeated pattern
2. Create component in design-system with appropriate props
3. Replace usages with import from `@graffio/design-system`

**Reference:** `modules/design-system/src/`

---

## Adding New Patterns

When you identify a new tactical pattern:

1. Name it (noun, not verb)
2. Document: When, Where, Instead of, Use
3. Add file reference
4. Update cohesion table if new mapping
