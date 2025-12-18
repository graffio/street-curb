// ABOUTME: Balance query functions for bank/credit accounts
// ABOUTME: All functions are pure and operate on transaction arrays

// Sum of all transaction amounts
// @sig currentBalance :: [Transaction] -> Number
const currentBalance = transactions => transactions.reduce((sum, txn) => sum + txn.amount, 0)

// Sum of transactions on or before date (inclusive)
// Date comparison uses ISO string format (lexicographic = chronological)
// @sig balanceAsOf :: (String, [Transaction]) -> Number
const balanceAsOf = (isoDate, transactions) =>
    transactions.filter(txn => txn.date <= isoDate).reduce((sum, txn) => sum + txn.amount, 0)

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

export { balanceAsOf, balanceBreakdown, currentBalance, reconciliationDifference }
