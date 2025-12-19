// ABOUTME: Sequential running balance calculation for sorted transactions
// ABOUTME: Returns ViewRow.Detail pairing each transaction with computed runningBalance

import { mapAccum } from '@graffio/functional'
import { ViewRow } from '../types/index.js'

// Calculates running balance for pre-sorted transactions -- must already be sorted in display order
// @sig calculateRunningBalances :: ([Transaction], Number) -> [ViewRow.Detail]
const calculateRunningBalances = (sortedTransactions, startingBalance = 0) => {
    // Accumulates balance and wraps transaction with computed running balance
    // @sig accumulateBalance :: (Number, Transaction) -> [Number, ViewRow.Detail]
    const accumulateBalance = (balance, txn) => {
        const newBalance = balance + txn.amount
        return [newBalance, ViewRow.Detail(txn, { runningBalance: newBalance })]
    }

    const [, viewRows] = mapAccum(accumulateBalance, startingBalance, sortedTransactions)
    return viewRows
}

export { calculateRunningBalances }
