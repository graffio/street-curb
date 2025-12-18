# Financial Computations: Module Setup

## Goal

Create `modules/financial-computations/` as a standalone module for pure financial computation functions. Establishes structure and patterns for subsequent phases.

## Context

- Builds on patterns from `quicken-web-app/src/utils/sort-transactions.js` and `table-layout.js`
- Pure functions, no React/Redux dependencies
- Uses `@graffio/functional` for FP helpers and Tagged types

## Module Structure

```
modules/financial-computations/
├── package.json
├── src/
│   ├── index.js              # Public exports
│   ├── banking/
│   │   ├── index.js
│   │   ├── running-balance.js
│   │   └── balance-queries.js
│   ├── reporting/
│   │   ├── index.js
│   │   ├── category-aggregation.js
│   │   └── period-grouping.js
│   └── investments/          # Future: Phase 03
│       └── index.js
├── test/
│   ├── banking/
│   │   ├── running-balance.tap.js
│   │   └── balance-queries.tap.js
│   └── reporting/
│       ├── category-aggregation.tap.js
│       └── period-grouping.tap.js
└── type-definitions/         # If needed for Tagged types
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
    "./banking": "./src/banking/index.js",
    "./reporting": "./src/reporting/index.js"
  },
  "dependencies": {
    "@graffio/functional": "*"
  },
  "devDependencies": {
    "tap": "*"
  },
  "scripts": {
    "tap": "tap test/**/*.tap.js --no-coverage",
    "tap:file": "tap --no-coverage"
  }
}
```

## Export Pattern

```javascript
// src/index.js
export * from './banking/index.js'
export * from './reporting/index.js'

// src/banking/index.js
export { calculateRunningBalances } from './running-balance.js'
export { currentBalance, balanceAsOf, balanceBreakdown } from './balance-queries.js'

// src/reporting/index.js
export { sumByCategory, expandCategoryHierarchy } from './category-aggregation.js'
export { groupByPeriod, toPeriodKey } from './period-grouping.js'
```

## Implementation Steps

1. Create `modules/financial-computations/` directory
2. Create `package.json`
3. Create `src/index.js` with placeholder exports
4. Create `src/banking/index.js` (empty, populated in 01-banking)
5. Create `src/reporting/index.js` (empty, populated in 02-reporting)
6. Run `yarn install` from monorepo root to link package
7. git add and commit: "Create financial-computations module structure"

## Verification

- [ ] `yarn install` succeeds from monorepo root
- [ ] Can import `@graffio/financial-computations` from quicken-web-app
- [ ] Module structure matches spec
