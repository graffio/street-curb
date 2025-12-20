# Banking Computations

Location: `@graffio/financial-computations`

## Current Exports

```javascript
export {
    calculateRunningBalances,
    currentBalance,
    balanceAsOf,
    balanceBreakdown,
    reconciliationDifference,
} from './banking/index.js'

export { RegisterRow } from './types/index.js'
```

---

## Functions

### calculateRunningBalances

Window function that computes running balance for each transaction.

```javascript
// @sig calculateRunningBalances :: ([Transaction], Number?) -> [RegisterRow]
const calculateRunningBalances = (transactions, startingBalance = 0) => ...
```

**Precondition**: Input must be sorted by date.

**Returns**: Array of `RegisterRow(transaction, runningBalance)` Tagged type.

### Balance Queries

Aggregations operating on transaction arrays:

```javascript
// @sig currentBalance :: [Transaction] -> Number
const currentBalance = transactions => ...

// @sig balanceAsOf :: (String, [Transaction]) -> Number
const balanceAsOf = (isoDate, transactions) => ...

// @sig balanceBreakdown :: [Transaction] -> { cleared, uncleared, total }
const balanceBreakdown = transactions => ...

// @sig reconciliationDifference :: (Number, [Transaction]) -> Number
const reconciliationDifference = (statementBalance, transactions) => ...
```

---

## RegisterRow Type

For chronological transaction lists with running balance:

```javascript
RegisterRow = Tagged('RegisterRow', {
    transaction: 'Transaction',
    runningBalance: 'Number',
})
```

Usage in UI:
```jsx
const DateCell = ({ row }) => formatDate(row.transaction.date)
const BalanceCell = ({ row }) => formatCurrency(row.runningBalance)
```

---

## Verification

- [x] calculateRunningBalances implemented
- [x] Balance queries implemented
- [x] RegisterRow type defined
- [x] Tests passing
