// ABOUTME: Type definition for EnrichedAccount with balance computation logic
// ABOUTME: Handles position-based (investment) and transaction-based (bank) balance strategies
import { sumCompensated } from '@graffio/functional'
import { Transaction } from './transaction.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const EnrichedAccount = {
    name: 'EnrichedAccount',
    kind: 'tagged',
    fields: {
        id          : 'String',
        account     : 'Account',
        balance     : 'Number',
        dayChange   : 'Number',
        dayChangePct: 'Number?'
    },
}

// Account types that compute balance from positions (shares × price)
EnrichedAccount.POSITION_BALANCE_TYPES = ['Investment', '401(k)/403(b)']

// Sums marketValue and dayGainLoss for positions belonging to an account
// @sig sumPositionsForAccount :: ([Position], String) -> { balance: Number, dayChange: Number, dayChangePct: Number? }
EnrichedAccount.sumPositionsForAccount = (positions, accountId) => {
    const accountPositions = positions.filter(p => p.accountId === accountId)
    const balance = sumCompensated(accountPositions.map(p => p.marketValue))
    const dayChange = sumCompensated(accountPositions.map(p => p.dayGainLoss))
    const dayChangePct = balance !== 0 ? dayChange / (balance - dayChange) : undefined
    return { balance, dayChange, dayChangePct }
}

// Computes balance for bank/cash/credit accounts from transactions
// @sig sumBankBalance :: ([Transaction], String) -> Number
EnrichedAccount.sumBankBalance = (transactions, accountId) => {
    if (transactions.length === 0) return 0
    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.amount !== undefined)
    return Transaction.currentBalance(accountTransactions)
}

// Gets cash balance from DB-computed running balance (respects CASH_IMPACT_ACTIONS)
// @sig cashBalanceFromRunning :: ([Transaction], String) -> Number
EnrichedAccount.cashBalanceFromRunning = (transactions, accountId) => {
    const accountTxns = transactions.filter(t => t.accountId === accountId)
    if (accountTxns.length === 0) return 0
    return accountTxns[accountTxns.length - 1].runningBalance ?? 0
}

// Creates EnrichedAccount from Account with computed balance
// @sig fromAccount :: (Account, [Position], [Transaction]) -> EnrichedAccount
EnrichedAccount.fromAccount = (account, positions, transactions) => {
    const { id } = account
    const isPositionType = EnrichedAccount.POSITION_BALANCE_TYPES.includes(account.type)
    if (!isPositionType)
        return EnrichedAccount(id, account, EnrichedAccount.sumBankBalance(transactions, id), 0, undefined)
    const { balance, dayChange, dayChangePct } = EnrichedAccount.sumPositionsForAccount(positions, id)
    if (balance !== 0 || dayChange !== 0) return EnrichedAccount(id, account, balance, dayChange, dayChangePct)
    return EnrichedAccount(id, account, EnrichedAccount.cashBalanceFromRunning(transactions, id), 0, undefined)
}

// Enriches all accounts with computed balances
// @sig enrichAll :: (LookupTable<Account>, [Position], [Transaction]) -> [EnrichedAccount]
EnrichedAccount.enrichAll = (accounts, positions, transactions) =>
    accounts.map(account => EnrichedAccount.fromAccount(account, positions, transactions))
