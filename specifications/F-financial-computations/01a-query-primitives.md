# Financial Computations: Query Primitives

## Goal

SQL-like query operations that preserve input types. These are the foundation for all higher-level computations.

## Prerequisites

- Module structure from 00-module-setup.md

## Principles

1. **Type preservation** - Input LookupTable → output LookupTable. Input Array → output Array.
2. **Composable** - Each operation returns same shape, can chain
3. **Pure** - No mutations, no side effects
4. **Generic** - Work on any object with the relevant fields

## Operations

### filter.js

```javascript
// ABOUTME: Filter predicates and composition for transaction queries
// ABOUTME: All predicates return functions suitable for Array.filter

// Compose multiple predicates with AND
// @sig and :: (...Predicates) -> Predicate
const and = (...predicates) => item => predicates.every(p => p(item))

// Compose multiple predicates with OR
// @sig or :: (...Predicates) -> Predicate
const or = (...predicates) => item => predicates.some(p => p(item))

// Negate a predicate
// @sig not :: Predicate -> Predicate
const not = predicate => item => !predicate(item)

// --- Domain predicates ---

// @sig byDateRange :: (String, String) -> Predicate
const byDateRange = (startDate, endDate) => txn =>
    txn.date >= startDate && txn.date <= endDate

// @sig byAccount :: String -> Predicate
const byAccount = accountId => txn => txn.accountId === accountId

// @sig byCategory :: String -> Predicate  (exact match)
const byCategory = categoryName => txn => txn.categoryName === categoryName

// @sig byCategoryPrefix :: String -> Predicate  (hierarchy match)
const byCategoryPrefix = prefix => txn =>
    txn.categoryName === prefix || txn.categoryName?.startsWith(prefix + ':')

// @sig byText :: String -> Predicate  (searches payee, memo, etc.)
const byText = query => {
    const lower = query.toLowerCase()
    return txn => {
        const searchable = [txn.payee, txn.memo, txn.description, txn.categoryName]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
        return searchable.includes(lower)
    }
}

// @sig byCleared :: String -> Predicate
const byCleared = status => txn => txn.cleared === status

// @sig byAmountRange :: (Number, Number) -> Predicate
const byAmountRange = (min, max) => txn => txn.amount >= min && txn.amount <= max

// Apply filter to array/LookupTable, preserving type
// @sig applyFilter :: (Predicate, [a]) -> [a]
const applyFilter = (predicate, items) => items.filter(predicate)
```

### sort.js

```javascript
// ABOUTME: Multi-column stable sort for transactions
// ABOUTME: Works with TanStack Table sorting state format

// Already exists in quicken-web-app/src/utils/sort-transactions.js
// Move here and generalize

// @sig compareValues :: (Any, Any) -> Number
const compareValues = (a, b) => { ... }

// @sig sortBy :: ([SortSpec], [Column]?) -> (a, b) -> Number
const sortBy = (sorting, columns = []) => { ... }

// @sig applySort :: ([SortSpec], [a], [Column]?) -> [a]
const applySort = (sorting, items, columns) =>
    [...items].sort(sortBy(sorting, columns))
```

### group.js

```javascript
// ABOUTME: Group transactions by field or function
// ABOUTME: Returns object with group keys mapping to arrays

// Group by field value
// @sig groupBy :: (String | Function, [a]) -> { [key]: [a] }
const groupBy = (keyFn, items) => {
    const getKey = typeof keyFn === 'string' ? item => item[keyFn] : keyFn
    const result = {}
    items.forEach(item => {
        const key = getKey(item) ?? 'undefined'
        if (!result[key]) result[key] = []
        result[key].push(item)
    })
    return result
}

// Group by category with hierarchy expansion
// Transaction in "food:restaurant" appears in groups for both "food" and "food:restaurant"
// @sig groupByCategoryHierarchy :: [Transaction] -> { [categoryPath]: [Transaction] }
const groupByCategoryHierarchy = transactions => {
    const result = {}
    transactions.forEach(txn => {
        const paths = expandCategoryHierarchy(txn.categoryName || 'Uncategorized')
        paths.forEach(path => {
            if (!result[path]) result[path] = []
            result[path].push(txn)
        })
    })
    return result
}

// Expand "food:restaurant:lunch" → ["food", "food:restaurant", "food:restaurant:lunch"]
// @sig expandCategoryHierarchy :: String -> [String]
const expandCategoryHierarchy = categoryName => {
    if (!categoryName) return []
    const parts = categoryName.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}
```

### limit.js

```javascript
// ABOUTME: Pagination and limiting operations
// ABOUTME: Take, skip, and paginate

// Take first n items
// @sig take :: (Number, [a]) -> [a]
const take = (n, items) => items.slice(0, n)

// Skip first n items
// @sig skip :: (Number, [a]) -> [a]
const skip = (n, items) => items.slice(n)

// Paginate: skip + take
// @sig paginate :: (Number, Number, [a]) -> [a]
const paginate = (page, pageSize, items) => items.slice(page * pageSize, (page + 1) * pageSize)
```

## Migration from Selectors

Current location → New location:
- `store/selectors/transactions/filters.js` → `query/filter.js`
- `src/utils/sort-transactions.js` → `query/sort.js`
- (new) → `query/group.js`
- (new) → `query/limit.js`

## Implementation Steps

1. Create `src/query/filter.js` with predicates
2. Move `sort-transactions.js` to `src/query/sort.js`
3. Create `src/query/group.js` with groupBy functions
4. Create `src/query/limit.js` with pagination
5. Create `src/query/index.js` exporting all
6. Update package.json exports
7. Write tests for each
8. Update imports in quicken-web-app selectors
9. Commit: "Add query primitives to financial-computations"

## Verification

- [ ] All predicates composable with and/or/not
- [ ] Sort preserves stability
- [ ] GroupBy handles hierarchy correctly
- [ ] LookupTable type preserved through operations
- [ ] Existing selector tests still pass after migration
