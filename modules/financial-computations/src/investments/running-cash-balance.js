// ABOUTME: Sequential running cash balance calculation for sorted investment transactions
// ABOUTME: Returns RegisterRow pairing each transaction with its cash balance

import { mapAccum } from '@graffio/functional'
import { RegisterRow } from '../types/index.js'

/*
 * Calculates running cash balance for pre-sorted investment transactions
 * Cash balance = cumulative sum of amount field (already signed correctly on import)
 * Must already be sorted in display order (typically by date ascending)
 *
 * @sig calculateRunningCashBalances :: ([Transaction.Investment], Number) -> [RegisterRow]
 */
const calculateRunningCashBalances = (sortedTransactions, startingBalance = 0) => {
    // Accumulates cash balance and wraps transaction with running balance
    // @sig accumulateCashBalance :: (Number, Transaction.Investment) -> [Number, RegisterRow]
    const accumulateCashBalance = (balance, txn) => {
        const newBalance = balance + (txn.amount || 0)
        return [newBalance, RegisterRow(txn, newBalance)]
    }

    const [, rows] = mapAccum(accumulateCashBalance, startingBalance, sortedTransactions)
    return rows
}

export { calculateRunningCashBalances }
