# Selectors Architecture

## Principle: Selectors Are Thin Wiring

Selectors in `quicken-web-app/src/store/selectors.js` should be 1-2 lines that either:
- Access a state field directly (`state => state.accounts`)
- Memoize a derivation (`memoizeReduxState(keys, fn)`)
- Delegate to a type method (`View.toReportTitle(...)`)

Domain logic (layout maps, title derivation, default construction) belongs on Tagged types in `type-definitions/`.
Computation logic (holdings, enrichment) belongs in `financial-computations/` or `utils/`.

## Memoization Strategy

| Pattern | When to use | Example |
|---------|-------------|---------|
| `memoizeReduxState(keys, fn)` | Global derived state | `Categories.allNames` |
| `memoizeReduxStatePerKey(keys, filterKey, fn)` | Per-view derived state | `UI.accountFilterData` |
| `memoizeOnce(cacheKeyF, fn)` | Derived state needing sub-field tracking | `activeViewPageTitle` |

`memoizeOnce` accepts array cache keys — element-wise reference comparison. Use when the cache key
involves sub-fields of state (e.g., `[activeTabGroupId, viewId, views, accounts]`).

## Domain Namespaces

Selectors use domain namespaces (`UI`, `Transactions`, `Holdings`, `Accounts`, `Categories`) instead
of the standard P/T/F/V/A/E cohesion groups. This is intentional — selector grouping follows data
concerns, not function roles.

## Forward Reference Constraint

Selector factories that take memoized selectors as arguments (e.g., `_makeHighlightSelector(sortedFn)`)
must be defined in sequenced `const` declarations, not in a single object literal. Object literal
properties evaluate eagerly left-to-right — a property cannot reference a sibling defined later.
