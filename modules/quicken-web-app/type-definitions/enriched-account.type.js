// ABOUTME: Type definition for EnrichedAccount with balance computation logic
// ABOUTME: Handles holdings-based (investment) and transaction-based (bank) balance strategies
import { Transaction } from './transaction.js'

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

// Account types that compute balance from holdings (shares × price)
EnrichedAccount.HOLDINGS_BALANCE_TYPES = ['Investment', '401(k)/403(b)']

// Sums marketValue and dayGainLoss for holdings belonging to an account
// @sig sumHoldingsForAccount :: ([Holding], String) -> { balance: Number, dayChange: Number, dayChangePct: Number? }
EnrichedAccount.sumHoldingsForAccount = (holdings, accountId) => {
    const accountHoldings = holdings.filter(h => h.accountId === accountId)
    const balance = accountHoldings.reduce((sum, h) => sum + h.marketValue, 0)
    const dayChange = accountHoldings.reduce((sum, h) => sum + h.dayGainLoss, 0)
    const dayChangePct = balance !== 0 ? dayChange / (balance - dayChange) : null
    return { balance, dayChange, dayChangePct }
}

// Computes balance for bank/cash/credit accounts from transactions
// @sig sumBankBalance :: ([Transaction], String) -> Number
EnrichedAccount.sumBankBalance = (transactions, accountId) => {
    if (transactions.length === 0) return 0
    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.amount != null)
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
// @sig fromAccount :: (Account, [Holding], [Transaction]) -> EnrichedAccount
EnrichedAccount.fromAccount = (account, holdings, transactions) => {
    const { id } = account
    const isHoldingsType = EnrichedAccount.HOLDINGS_BALANCE_TYPES.includes(account.type)
    if (!isHoldingsType) return EnrichedAccount(id, account, EnrichedAccount.sumBankBalance(transactions, id), 0, null)
    const { balance, dayChange, dayChangePct } = EnrichedAccount.sumHoldingsForAccount(holdings, id)
    if (balance !== 0 || dayChange !== 0) return EnrichedAccount(id, account, balance, dayChange, dayChangePct)
    return EnrichedAccount(id, account, EnrichedAccount.cashBalanceFromRunning(transactions, id), 0, null)
}

// Enriches all accounts with computed balances
// @sig enrichAll :: (LookupTable<Account>, [Holding], [Transaction]) -> [EnrichedAccount]
EnrichedAccount.enrichAll = (accounts, holdings, transactions) =>
    accounts.map(account => EnrichedAccount.fromAccount(account, holdings, transactions))
