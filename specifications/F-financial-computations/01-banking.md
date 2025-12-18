# Financial Computations: Banking

## Goal

Extract and expand banking computations as pure functions. Running balance moves from TransactionRegisterPage to the module. Add as-of-date and reconciliation queries.

## Prerequisites

- Module structure from 00-module-setup.md

## Functions

### running-balance.js

```javascript
// ABOUTME: Sequential running balance calculation for sorted transactions
// ABOUTME: Returns new array with runningBalance property added to each transaction

// Calculates running balance for pre-sorted transactions
// Transactions must already be sorted in display order
// @sig calculateRunningBalances :: ([Transaction], Number) -> [TransactionWithBalance]
const calculateRunningBalances = (sortedTransactions, startingBalance = 0) => {
    let balance = startingBalance
    return sortedTransactions.map(txn => {
        balance += txn.amount
        return { ...txn, runningBalance: balance }
    })
}
```

### balance-queries.js

```javascript
// ABOUTME: Balance query functions for bank/credit accounts
// ABOUTME: All functions are pure and operate on transaction arrays

// Sum of all transaction amounts
// @sig currentBalance :: [Transaction] -> Number
const currentBalance = transactions =>
    transactions.reduce((sum, txn) => sum + txn.amount, 0)

// Sum of transactions on or before date (inclusive)
// Date comparison uses ISO string format (lexicographic = chronological)
// @sig balanceAsOf :: (String, [Transaction]) -> Number
const balanceAsOf = (isoDate, transactions) =>
    transactions
        .filter(txn => txn.date <= isoDate)
        .reduce((sum, txn) => sum + txn.amount, 0)

// Breakdown by cleared status
// @sig balanceBreakdown :: [Transaction] -> { cleared: Number, uncleared: Number, total: Number }
const balanceBreakdown = transactions => {
    const cleared = transactions
        .filter(txn => txn.cleared === 'R' || txn.cleared === 'c')
        .reduce((sum, txn) => sum + txn.amount, 0)
    const total = transactions.reduce((sum, txn) => sum + txn.amount, 0)
    return { cleared, uncleared: total - cleared, total }
}

// Difference between statement balance and cleared transactions
// Positive = statement shows more than we have cleared
// @sig reconciliationDifference :: (Number, [Transaction]) -> Number
const reconciliationDifference = (statementBalance, transactions) => {
    const { cleared } = balanceBreakdown(transactions)
    return statementBalance - cleared
}
```

## Changes to Existing Files

### TransactionRegisterPage.jsx

Replace inline `calculateRunningBalances` with import:

```javascript
import { calculateRunningBalances } from '@graffio/financial-computations/banking'

// Remove the inline calculateRunningBalances function
// Keep the useMemo that calls it
```

## Implementation Steps

1. Create `src/banking/running-balance.js` with `calculateRunningBalances`
2. Create `src/banking/balance-queries.js` with balance functions
3. Create `src/banking/index.js` exporting all functions
4. Update `src/index.js` to re-export banking
5. Write `test/banking/running-balance.tap.js`
6. Write `test/banking/balance-queries.tap.js`
7. git add and commit: "Add banking computation functions"
8. Update TransactionRegisterPage.jsx to import from module
9. Remove inline `calculateRunningBalances` from TransactionRegisterPage
10. git add and commit: "Use @graffio/financial-computations in TransactionRegisterPage"

## Test Cases

### running-balance.tap.js

```javascript
// Given an empty array
// When calculateRunningBalances is called
// Then it returns an empty array

// Given transactions [100, -50, 200] with startingBalance 0
// When calculateRunningBalances is called
// Then runningBalances are [100, 50, 250]

// Given transactions [100, -50] with startingBalance 1000
// When calculateRunningBalances is called
// Then runningBalances are [1100, 1050]

// Given already-sorted transactions
// When calculateRunningBalances is called
// Then order is preserved (function does not sort)
```

### balance-queries.tap.js

```javascript
// Given transactions [100, -50, 200]
// When currentBalance is called
// Then it returns 250

// Given transactions with dates ['2024-01-15', '2024-02-01', '2024-03-01']
// When balanceAsOf('2024-02-01') is called
// Then it includes first two transactions only

// Given transactions with cleared status ['R', '', 'c', '']
// When balanceBreakdown is called
// Then cleared includes 'R' and 'c', uncleared includes others

// Given statement balance 500 and cleared transactions totaling 450
// When reconciliationDifference is called
// Then it returns 50
```

## Verification

- [ ] All tests pass
- [ ] TransactionRegisterPage uses module import
- [ ] Running balance displays correctly in transaction register
- [ ] No inline calculateRunningBalances in TransactionRegisterPage
