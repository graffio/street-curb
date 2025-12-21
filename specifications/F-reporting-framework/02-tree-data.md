# Tree-Based Reports

## TreeNode Type

From `@graffio/functional/tree.js`:

```javascript
TreeNode a = { key: String, value: a, children: [TreeNode a], aggregate?: b }
```

- Before aggregation: `{ key, value, children }`
- After aggregation: `{ key, value, children, aggregate }`

---

## Report Pipeline

```
1. Group source data by leaf key
   groupBy(t => t.category, transactions)
   → { 'Food:Groceries': [txn1, txn2], 'Food:Restaurants': [txn3] }

2. Build tree (auto-creates parents)
   buildTree(getParent, groups)  // getParent: 'Food:Groceries' → 'Food'
   → [{ key: 'Food', value: [], children: [
        { key: 'Food:Groceries', value: [txn1, txn2], children: [] },
        { key: 'Food:Restaurants', value: [txn3], children: [] }
      ]}]

3. Compute aggregates bottom-up
   aggregateTree(computeAggregates, tree)
   → same structure with .aggregate on each node

4. Adapt for display
   Pass tree to TanStack Table with getSubRows: n => n.children
```

---

## Aggregation

Parent aggregates = f(own transactions, child aggregates)

```javascript
// @sig computeAggregates :: ([Transaction], [Aggregate]) -> Aggregate
const computeAggregates = (transactions, childAggregates) => {
    const ownTotal = transactions.reduce((sum, t) => sum + t.amount, 0)
    const childTotal = childAggregates.reduce((sum, a) => sum + a.total, 0)
    const ownCount = transactions.length
    const childCount = childAggregates.reduce((sum, a) => sum + a.count, 0)
    return { total: ownTotal + childTotal, count: ownCount + childCount }
}
```

---

## TanStack Table Integration

TanStack Table handles tree data natively. Key options:

```javascript
const table = useReactTable({
    data: aggregatedTree,
    columns,
    getSubRows: row => row.children,
    getRowId: row => row.key,
    getRowCanExpand: row => row.children?.length > 0,
})
```

If columns need direct access to aggregate fields, spread them at the component level:

```javascript
const rows = aggregatedTree.map(function processNode(node) {
    return { ...node, ...node.aggregate, children: node.children.map(processNode) }
})
```

---

## Hierarchical Dimensions

| Dimension | Hierarchical? | Delimiter | Notes |
|-----------|---------------|-----------|-------|
| Category | Yes | `:` | `food:restaurant:lunch` |
| Asset class | Yes | User-defined | OFX provides 7 fixed values |
| Tags | TBD | `:` if hierarchical | Start flat, add if needed |
| Account | No | — | |
| Payee | No | — | |
| Time period | No | — | Month, quarter, year |

**Key insight**: Category hierarchy is intrinsic (encoded in the string). Other hierarchies require user configuration.

---

## Example: Category Spending Report

```javascript
const categorySpendingReport = (transactions, options = {}) => {
    const { dateRange, accounts } = options

    // Derive parent from colon-delimited category path
    const getParent = key => {
        const idx = key.lastIndexOf(':')
        return idx === -1 ? null : key.slice(0, idx)
    }

    // 1. Filter
    const filtered = transactions
        .filter(byDateRange(dateRange.start, dateRange.end))
        .filter(accounts?.length ? t => accounts.includes(t.accountId) : () => true)

    // 2. Group by category
    const groups = groupBy(t => t.categoryName || 'Uncategorized', filtered)

    // 3. Build tree with aggregates
    const tree = buildTree(getParent, groups)
    return aggregateTree(computeAggregates, tree)
}
```

Usage:
```jsx
const data = categorySpendingReport(transactions, options)
const table = useReactTable({
    data,
    columns: reportColumns,
    getSubRows: row => row.children,
    getRowId: row => row.key,
    getRowCanExpand: row => row.children?.length > 0,
})
```
