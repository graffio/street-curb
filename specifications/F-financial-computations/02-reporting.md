# Financial Computations: Reporting

## Goal

Reporting computations that produce mixed row types: ViewRow.Detail for transactions, ViewRow.Summary for totals. Handles category hierarchy rollup and period grouping.

## Prerequisites

- ViewRow type from 00-module-setup
- Query primitives from 01a-query-primitives
- Aggregation functions

## Key Insight: Mixed Row Types

A category report shows:

```
Food                     -$500.00   ← ViewRow.Summary
  Groceries              -$300.00   ← ViewRow.Summary
    Whole Foods          -$150.00   ← ViewRow.Detail
    Trader Joe's         -$150.00   ← ViewRow.Detail
  Restaurants            -$200.00   ← ViewRow.Summary
Transport                -$100.00   ← ViewRow.Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total                    -$600.00   ← ViewRow.Summary (depth: 0)
```

This requires:
1. Grouping transactions by category hierarchy
2. Computing aggregates per group
3. Flattening into a list of ViewRow (mixed Detail + Summary)
4. Tracking depth for indentation

## ViewRow for Reports

```javascript
const ViewRow = TaggedSum('ViewRow', {
    Detail: {
        transaction: 'Transaction',
        computed: 'Object',  // { percentOfTotal, ... }
    },
    Summary: {
        groupKey: 'String',      // "food:restaurant" or period "2024-03"
        aggregates: 'Object',    // { total, count, average, ... }
        depth: 'Number',         // 0 = grand total, 1 = top category, etc.
    },
})
```

## Functions

### category-report.js

```javascript
// ABOUTME: Category report generation with hierarchy rollup
// ABOUTME: Returns mixed ViewRow.Detail and ViewRow.Summary

// Generates a category report with expandable groups
// @sig categoryReport :: ([Transaction], Options) -> [ViewRow]
const categoryReport = (transactions, options = {}) => {
    const { showTransactions = false, maxDepth = Infinity } = options

    // 1. Group by category hierarchy
    const groups = groupByCategoryHierarchy(transactions)

    // 2. Build tree structure with aggregates
    const tree = buildCategoryTree(groups)

    // 3. Flatten to ViewRow list
    return flattenCategoryTree(tree, { showTransactions, maxDepth })
}

// Build tree from grouped transactions
// @sig buildCategoryTree :: ({ [path]: [Transaction] }) -> CategoryNode
const buildCategoryTree = groups => { ... }

// Flatten tree to ViewRow list (depth-first)
// @sig flattenCategoryTree :: (CategoryNode, Options) -> [ViewRow]
const flattenCategoryTree = (node, options, depth = 0) => {
    const rows = []

    // Add summary row for this node
    rows.push(ViewRow.Summary({
        groupKey: node.path,
        aggregates: { total: node.total, count: node.count },
        depth,
    }))

    // Recurse into children
    node.children.forEach(child => {
        rows.push(...flattenCategoryTree(child, options, depth + 1))
    })

    // Optionally add detail rows
    if (options.showTransactions && depth >= options.maxDepth) {
        node.transactions.forEach(txn => {
            rows.push(ViewRow.Detail({
                transaction: txn,
                computed: { percentOfTotal: txn.amount / node.total },
            }))
        })
    }

    return rows
}
```

### period-report.js

```javascript
// ABOUTME: Period-based reports (monthly, quarterly, yearly)
// ABOUTME: Returns ViewRow.Summary per period

// @sig periodReport :: (PeriodType, [Transaction]) -> [ViewRow.Summary]
const periodReport = (periodType, transactions) => {
    const groups = groupByPeriod(periodType, transactions)
    const sortedKeys = Object.keys(groups).sort()

    return sortedKeys.map(key => ViewRow.Summary({
        groupKey: key,
        aggregates: computeAggregates(groups[key]),
        depth: 0,
    }))
}

// @sig toPeriodKey :: (PeriodType, String) -> String
const toPeriodKey = (periodType, isoDate) => {
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = date.getMonth()

    if (periodType === 'year') return `${year}`
    if (periodType === 'quarter') return `${year}-Q${Math.floor(month / 3) + 1}`
    if (periodType === 'month') return `${year}-${String(month + 1).padStart(2, '0')}`
    if (periodType === 'week') { /* ISO week calculation */ }
}

// @sig groupByPeriod :: (PeriodType, [Transaction]) -> { [periodKey]: [Transaction] }
const groupByPeriod = (periodType, transactions) =>
    groupBy(txn => toPeriodKey(periodType, txn.date), transactions)
```

### aggregations.js

```javascript
// ABOUTME: Aggregation functions for groups
// ABOUTME: Returns aggregate object for ViewRow.Summary

// @sig computeAggregates :: [Transaction] -> Aggregates
const computeAggregates = transactions => ({
    total: sum(transactions, 'amount'),
    count: transactions.length,
    average: average(transactions, 'amount'),
    min: min(transactions, 'amount'),
    max: max(transactions, 'amount'),
})

// Generic aggregation helpers
const sum = (items, field) => items.reduce((acc, item) => acc + (item[field] || 0), 0)
const average = (items, field) => items.length ? sum(items, field) / items.length : 0
const min = (items, field) => Math.min(...items.map(item => item[field]))
const max = (items, field) => Math.max(...items.map(item => item[field]))
```

## TanStack Table Integration

With manual grouping, we pass flat ViewRow array to DataTable:

```javascript
const reportData = categoryReport(transactions, { showTransactions: true })

// Cell renderers handle both types:
const AmountCell = ({ row }) => ViewRow.match(row, {
    Detail: ({ transaction }) => formatCurrency(transaction.amount),
    Summary: ({ aggregates }) => formatCurrency(aggregates.total),
})

const NameCell = ({ row }) => ViewRow.match(row, {
    Detail: ({ transaction }) => transaction.payee,
    Summary: ({ groupKey, depth }) => (
        <span style={{ paddingLeft: depth * 16 }}>{groupKey}</span>
    ),
})
```

## Implementation Steps

1. Create `src/aggregations/index.js` with sum, average, min, max
2. Create `src/reporting/category-report.js`
3. Create `src/reporting/period-report.js`
4. Create `src/reporting/index.js`
5. Write tests with mixed ViewRow types
6. Commit: "Add reporting functions with ViewRow.Summary"

## Verification

- [ ] Category hierarchy rollup correct (parent includes children)
- [ ] ViewRow.Summary has correct depth
- [ ] Period grouping handles all period types
- [ ] Can render mixed ViewRow types in DataTable
- [ ] Grand total row has depth 0
