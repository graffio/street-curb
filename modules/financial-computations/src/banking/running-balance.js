// ABOUTME: Sequential running balance calculation for sorted transactions
// ABOUTME: Returns RegisterRow pairing each transaction with its running balance

import { mapAccum } from '@graffio/functional'
import { RegisterRow } from '../types/index.js'

// Calculates running balance for pre-sorted transactions -- must already be sorted in display order
// @sig calculateRunningBalances :: ([Transaction], Number) -> [RegisterRow]
const calculateRunningBalances = (sortedTransactions, startingBalance = 0) => {
    // Accumulates balance and wraps transaction with running balance
    // @sig accumulateBalance :: (Number, Transaction) -> [Number, RegisterRow]
    const accumulateBalance = (balance, txn) => {
        const newBalance = balance + txn.amount
        return [newBalance, RegisterRow(txn, newBalance)]
    }

    const [, rows] = mapAccum(accumulateBalance, startingBalance, sortedTransactions)
    return rows
}

export { calculateRunningBalances }
