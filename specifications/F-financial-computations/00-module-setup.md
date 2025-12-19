# Financial Computations: Module Setup

## Goal

Create `modules/financial-computations/` as a standalone module for pure financial computation functions. Provides SQL-like query primitives, aggregations, window functions, and domain-specific computations.

## Architecture

```
Query Pipeline:

LookupTable<Transaction>
    ↓
SQL-like primitives (filter, sort, group, limit)
    → preserves Transaction type
    ↓
Window functions (running balance, cumulative)
    → returns ViewRow (pairs Transaction with computed values)
    ↓
ViewRow.Detail or ViewRow.Summary
```

**Key insight:** SQL-like operations preserve the input type. Window functions and grouping produce ViewRow, which explicitly separates domain data from view-specific computed values.

## ViewRow Tagged Sum

Different row types for tables and reports:

```javascript
const ViewRow = TaggedSum('ViewRow', {
    Detail: { transaction: 'Transaction', computed: 'DetailComputed' },
    Summary: { groupKey: 'String', aggregates: 'Aggregates', depth: 'Number' },
})

// DetailComputed varies by context:
// - In transaction register: { runningBalance: Number }
// - In reports: { percentOfTotal: Number } etc.

// Aggregates for summary rows:
// { total: Number, count: Number, ... }
```

**Why Tagged Sum:**
- Transaction registers show Detail rows with running balance
- Category reports show Summary rows (totals) mixed with Detail rows
- Explicit types prevent mixing concerns
- Extends cleanly for new row types

## Module Structure

```
modules/financial-computations/
├── package.json
├── src/
│   ├── index.js
│   ├── types/
│   │   └── view-row.js           # ViewRow Tagged Sum
│   ├── query/                    # SQL-like primitives
│   │   ├── index.js
│   │   ├── filter.js             # Predicates + composition
│   │   ├── sort.js               # Multi-column stable sort
│   │   ├── group.js              # Group by field/function
│   │   └── limit.js              # Take, skip, paginate
│   ├── aggregations/
│   │   └── index.js              # sum, count, average, min, max
│   ├── window/
│   │   └── running-balance.js    # → ViewRow.Detail
│   ├── banking/
│   │   ├── index.js
│   │   └── balance-queries.js    # currentBalance, balanceAsOf, etc.
│   └── reporting/
│       ├── index.js
│       ├── category-aggregation.js  # → ViewRow.Summary
│       └── period-grouping.js
├── test/
│   ├── types/
│   ├── query/
│   ├── aggregations/
│   ├── window/
│   ├── banking/
│   └── reporting/
└── type-definitions/
    └── view-row.type.js
```

## Package.json

```json
{
  "name": "@graffio/financial-computations",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./types": "./src/types/index.js",
    "./query": "./src/query/index.js",
    "./aggregations": "./src/aggregations/index.js",
    "./window": "./src/window/index.js",
    "./banking": "./src/banking/index.js",
    "./reporting": "./src/reporting/index.js"
  },
  "dependencies": {
    "@graffio/functional": "*"
  }
}
```

## Implementation Order

1. **Types** - ViewRow Tagged Sum (foundation for everything)
2. **Query primitives** - filter, sort, group, limit (SQL-like operations)
3. **Aggregations** - sum, count, etc.
4. **Window functions** - running balance (returns ViewRow.Detail)
5. **Banking** - balance queries (already exists, may need ViewRow integration)
6. **Reporting** - category aggregation (returns ViewRow.Summary)

## Manual Grouping Rationale

Like we chose `manualSorting: true` for TanStack Table, we'll do manual grouping:

1. Category hierarchy (colon-separated names) is domain-specific
2. Need control over rollup logic (parent categories)
3. ViewRow.Summary is explicit about what grouped rows contain
4. TanStack's built-in grouping may fight our data model

## Verification

- [ ] ViewRow type defined and tested
- [ ] Query primitives work on LookupTable and Array
- [ ] Window functions return ViewRow.Detail
- [ ] Grouping produces ViewRow.Summary rows
- [ ] All existing banking tests still pass
