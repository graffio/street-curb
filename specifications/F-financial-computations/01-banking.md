# Financial Computations: Banking

## Goal

Banking computations for transaction registers and account management. Running balance is a window function that returns ViewRow.Detail. Balance queries are aggregations.

## Prerequisites

- Module structure from 00-module-setup.md
- ViewRow type defined

## Current State

We have:
- `src/banking/running-balance.js` - returns POJOs (needs refactor to ViewRow.Detail)
- `src/banking/balance-queries.js` - aggregation functions (correct location)

## Refactoring Needed

### Move running-balance.js → window/

Running balance is a window function, not a banking-specific operation. It should:
1. Move to `src/window/running-balance.js`
2. Return `ViewRow.Detail` instead of spreading transaction into POJO

```javascript
// BEFORE (current, broken):
return { ...txn, runningBalance: balance }

// AFTER:
return ViewRow.Detail({ transaction: txn, computed: { runningBalance: balance } })
```

### Update TransactionRegisterPage

After refactoring, TransactionRegisterPage needs to:
1. Import from `@graffio/financial-computations/window`
2. Handle ViewRow.Detail in cell renderers

```javascript
// Cell renderer receives ViewRow.Detail
const DateCell = ({ row }) => {
    const { transaction, computed } = row
    return formatDate(transaction.date)
}

const BalanceCell = ({ row }) => {
    const { computed } = row
    return formatCurrency(computed.runningBalance)
}
```

## Balance Queries (Already Correct)

These are aggregations operating on transaction arrays. Keep in `src/banking/`:

```javascript
// @sig currentBalance :: [Transaction] -> Number
const currentBalance = transactions =>
    transactions.reduce((sum, txn) => sum + txn.amount, 0)

// @sig balanceAsOf :: (String, [Transaction]) -> Number
const balanceAsOf = (isoDate, transactions) => ...

// @sig balanceBreakdown :: [Transaction] -> { cleared, uncleared, total }
const balanceBreakdown = transactions => ...

// @sig reconciliationDifference :: (Number, [Transaction]) -> Number
const reconciliationDifference = (statementBalance, transactions) => ...
```

## Implementation Steps

1. Create `src/types/view-row.js` with ViewRow TaggedSum
2. Create `src/types/index.js` exporting ViewRow
3. Move `src/banking/running-balance.js` → `src/window/running-balance.js`
4. Refactor to return ViewRow.Detail
5. Create `src/window/index.js`
6. Update `src/banking/index.js` (remove running-balance export)
7. Update tests for new return type
8. Update TransactionRegisterPage to handle ViewRow.Detail
9. Commit: "Refactor running balance to return ViewRow.Detail"

## Test Changes

```javascript
// BEFORE:
t.equal(result[0].runningBalance, 100, ...)

// AFTER:
t.ok(ViewRow.Detail.is(result[0]), 'Then result is ViewRow.Detail')
t.equal(result[0].computed.runningBalance, 100, ...)
t.ok(Transaction.is(result[0].transaction), 'Then transaction is preserved')
```

## Verification

- [ ] ViewRow.Detail preserves Transaction type
- [ ] running-balance moved to window/
- [ ] All tests pass with new return type
- [ ] TransactionRegisterPage works with ViewRow.Detail
- [ ] balance-queries unchanged (still return Numbers)
