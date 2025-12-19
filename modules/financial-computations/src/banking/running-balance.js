// ABOUTME: Sequential running balance calculation for sorted transactions
// ABOUTME: Returns ViewRow.Detail pairing each transaction with computed runningBalance

import { ViewRow } from '../types/index.js'

// Calculates running balance for pre-sorted transactions -- must already be sorted in display order
// @sig calculateRunningBalances :: ([Transaction], Number) -> [ViewRow.Detail]
const calculateRunningBalances = (sortedTransactions, startingBalance = 0) => {
    // Wraps transaction with computed running balance
    // @sig wrapWithBalance :: Transaction -> ViewRow.Detail
    const wrapWithBalance = txn => {
        balance += txn.amount
        return ViewRow.Detail(txn, { runningBalance: balance })
    }

    let balance = startingBalance
    return sortedTransactions.map(wrapWithBalance)
}

export { calculateRunningBalances }
