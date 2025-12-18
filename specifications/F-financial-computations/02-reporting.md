# Financial Computations: Reporting

## Goal

Add reporting computations for category aggregation with hierarchy rollup and flexible period grouping. Enables spending reports, budget comparison, and trend analysis on banking transactions.

## Prerequisites

- Module structure from 00-module-setup.md
- Banking functions from 01-banking.md (optional, but establishes patterns)

## Functions

### category-aggregation.js

```javascript
// ABOUTME: Category aggregation with hierarchy rollup
// ABOUTME: Handles colon-separated category names (e.g., "food:restaurant:lunch")

// Generates all parent categories from a colon-separated name
// @sig expandCategoryHierarchy :: String -> [String]
// "food:restaurant:lunch" -> ["food", "food:restaurant", "food:restaurant:lunch"]
const expandCategoryHierarchy = categoryName => {
    if (!categoryName) return []
    const parts = categoryName.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}

// Sums transaction amounts by category
// Does NOT roll up hierarchy (use sumByCategoryWithRollup for that)
// @sig sumByCategory :: [Transaction] -> { [categoryName]: Number }
const sumByCategory = transactions => {
    const result = {}
    transactions.forEach(txn => {
        const cat = txn.categoryName || 'Uncategorized'
        result[cat] = (result[cat] || 0) + txn.amount
    })
    return result
}

// Sums amounts by category WITH hierarchy rollup
// Each transaction contributes to its category AND all parent categories
// @sig sumByCategoryWithRollup :: [Transaction] -> { [categoryName]: Number }
const sumByCategoryWithRollup = transactions => {
    const result = {}
    transactions.forEach(txn => {
        const categories = expandCategoryHierarchy(txn.categoryName || 'Uncategorized')
        categories.forEach(cat => {
            result[cat] = (result[cat] || 0) + txn.amount
        })
    })
    return result
}

// Groups transactions by category (returns arrays, not sums)
// @sig groupByCategory :: [Transaction] -> { [categoryName]: [Transaction] }
const groupByCategory = transactions => {
    const result = {}
    transactions.forEach(txn => {
        const cat = txn.categoryName || 'Uncategorized'
        if (!result[cat]) result[cat] = []
        result[cat].push(txn)
    })
    return result
}
```

### period-grouping.js

```javascript
// ABOUTME: Time period grouping for transactions
// ABOUTME: Supports week, month, quarter, year groupings

// Formats date to period key
// @sig toPeriodKey :: (PeriodType, String) -> String
// PeriodType = 'week' | 'month' | 'quarter' | 'year'
const toPeriodKey = (periodType, isoDate) => {
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = date.getMonth() // 0-indexed

    if (periodType === 'year') return `${year}`
    if (periodType === 'quarter') return `${year}-Q${Math.floor(month / 3) + 1}`
    if (periodType === 'month') return `${year}-${String(month + 1).padStart(2, '0')}`
    if (periodType === 'week') {
        // ISO week number calculation
        const jan1 = new Date(year, 0, 1)
        const days = Math.floor((date - jan1) / (24 * 60 * 60 * 1000))
        const week = Math.ceil((days + jan1.getDay() + 1) / 7)
        return `${year}-W${String(week).padStart(2, '0')}`
    }
    throw new Error(`Unknown period type: ${periodType}`)
}

// Groups transactions by time period
// @sig groupByPeriod :: (PeriodType, [Transaction]) -> { [periodKey]: [Transaction] }
const groupByPeriod = (periodType, transactions) => {
    const result = {}
    transactions.forEach(txn => {
        const key = toPeriodKey(periodType, txn.date)
        if (!result[key]) result[key] = []
        result[key].push(txn)
    })
    return result
}

// Sums transaction amounts by period
// @sig sumByPeriod :: (PeriodType, [Transaction]) -> { [periodKey]: Number }
const sumByPeriod = (periodType, transactions) => {
    const groups = groupByPeriod(periodType, transactions)
    const result = {}
    Object.entries(groups).forEach(([key, txns]) => {
        result[key] = txns.reduce((sum, txn) => sum + txn.amount, 0)
    })
    return result
}

// Gets sorted period keys for a grouping (chronological order)
// @sig sortedPeriodKeys :: Object -> [String]
const sortedPeriodKeys = groupedData =>
    Object.keys(groupedData).sort()
```

## Combining Functions

Common patterns for reports:

```javascript
// Spending by category for a month
const marchTransactions = transactions.filter(t => t.date.startsWith('2024-03'))
const spendingByCategory = sumByCategoryWithRollup(marchTransactions)

// Monthly spending trend for a category
const foodTransactions = transactions.filter(t => t.categoryName?.startsWith('food'))
const monthlyFood = sumByPeriod('month', foodTransactions)

// Category breakdown by quarter
const grouped = groupByPeriod('quarter', transactions)
const quarterlyByCategory = Object.fromEntries(
    Object.entries(grouped).map(([quarter, txns]) => [quarter, sumByCategory(txns)])
)
```

## Implementation Steps

1. Create `src/reporting/category-aggregation.js`
2. Create `src/reporting/period-grouping.js`
3. Create `src/reporting/index.js` exporting all functions
4. Update `src/index.js` to re-export reporting
5. Write `test/reporting/category-aggregation.tap.js`
6. Write `test/reporting/period-grouping.tap.js`
7. git add and commit: "Add reporting computation functions"

## Test Cases

### category-aggregation.tap.js

```javascript
// Given "food:restaurant:lunch"
// When expandCategoryHierarchy is called
// Then it returns ["food", "food:restaurant", "food:restaurant:lunch"]

// Given empty string
// When expandCategoryHierarchy is called
// Then it returns []

// Given transactions with categories ["food", "food", "transport"]
// When sumByCategory is called
// Then food and transport have separate totals

// Given transaction with category "food:restaurant" amount -50
// When sumByCategoryWithRollup is called
// Then both "food" and "food:restaurant" include -50

// Given transaction with no categoryName
// When sumByCategory is called
// Then it goes into "Uncategorized"
```

### period-grouping.tap.js

```javascript
// Given date "2024-03-15"
// When toPeriodKey('month', date) is called
// Then it returns "2024-03"

// Given date "2024-03-15"
// When toPeriodKey('quarter', date) is called
// Then it returns "2024-Q1"

// Given date "2024-03-15"
// When toPeriodKey('year', date) is called
// Then it returns "2024"

// Given transactions spanning Jan-Mar 2024
// When groupByPeriod('month', transactions) is called
// Then it returns { '2024-01': [...], '2024-02': [...], '2024-03': [...] }

// Given grouped data with keys ['2024-03', '2024-01', '2024-02']
// When sortedPeriodKeys is called
// Then it returns ['2024-01', '2024-02', '2024-03']
```

## Verification

- [ ] All tests pass
- [ ] Category hierarchy rollup works correctly
- [ ] Period grouping handles all period types
- [ ] Can combine functions for common report patterns
