// ABOUTME: Sequential running balance calculation for sorted transactions
// ABOUTME: Returns new array with runningBalance property added to each transaction

// Calculates running balance for pre-sorted transactions
// Transactions must already be sorted in display order
// @sig calculateRunningBalances :: ([Transaction], Number) -> [TransactionWithBalance]
const calculateRunningBalances = (sortedTransactions, startingBalance = 0) => {
    const addRunningBalance = txn => {
        balance += txn.amount
        return { ...txn, runningBalance: balance }
    }

    let balance = startingBalance
    return sortedTransactions.map(addRunningBalance)
}

export { calculateRunningBalances }
