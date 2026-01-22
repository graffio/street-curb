import { currentBalance } from '@graffio/financial-computations/banking'

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
    if (!transactions || transactions.length === 0) return 0
    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.amount != null)
    return currentBalance(accountTransactions)
}

// Creates EnrichedAccount from Account with computed balance
// @sig fromAccount :: (Account, [Holding], [Transaction]) -> EnrichedAccount
EnrichedAccount.fromAccount = (account, holdings, transactions) => {
    const { id } = account
    if (EnrichedAccount.HOLDINGS_BALANCE_TYPES.includes(account.type)) {
        const { balance, dayChange, dayChangePct } = EnrichedAccount.sumHoldingsForAccount(holdings, id)
        return EnrichedAccount(id, account, balance, dayChange, dayChangePct)
    }
    return EnrichedAccount(id, account, EnrichedAccount.sumBankBalance(transactions, id), 0, null)
}

// Enriches all accounts with computed balances
// @sig enrichAll :: (LookupTable<Account>, [Holding], [Transaction]) -> [EnrichedAccount]
EnrichedAccount.enrichAll = (accounts, holdings, transactions) =>
    accounts.map(account => EnrichedAccount.fromAccount(account, holdings, transactions))
