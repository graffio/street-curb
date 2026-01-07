// ABOUTME: Account-related selectors for balance computation and enrichment
// ABOUTME: Thin layer that wires Redux state to business logic

import { currentBalance } from '@graffio/financial-computations/banking'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { memoizeReduxState } from '@graffio/functional'
import { EnrichedAccount } from '../../types/enriched-account.js'
import { accountOrganization } from '../../services/account-organization.js'
import { enrichedHoldingsAsOf } from './holdings-selectors.js'

// State keys that affect account organization
const ORGANIZATION_STATE_KEYS = [
    'accounts',
    'transactions',
    'lots',
    'lotAllocations',
    'prices',
    'securities',
    'accountListSortMode',
]

// Account types that compute balance from holdings (shares × price)
const HOLDINGS_BALANCE_TYPES = ['Investment', '401(k)/403(b)']

const P = {
    // Checks if account uses holdings-based balance computation
    // @sig usesHoldingsBalance :: Account -> Boolean
    usesHoldingsBalance: account => HOLDINGS_BALANCE_TYPES.includes(account.type),
}

const T = {
    // Computes balance for bank/cash/credit accounts from transactions
    // @sig toBankBalance :: (State, String) -> Number
    toBankBalance: (state, accountId) => {
        const { transactions } = state
        if (!transactions || transactions.length === 0) return 0
        const accountTransactions = transactions.filter(t => t.accountId === accountId && t.amount != null)
        return currentBalance(accountTransactions)
    },

    // Computes balance for investment accounts from holdings market value
    // @sig toHoldingsBalance :: (State, String) -> { balance: Number, dayChange: Number }
    toHoldingsBalance: (state, accountId) => {
        const holdings = enrichedHoldingsAsOf(state, 'account-list') || []
        const accountHoldings = holdings.filter(h => h.accountId === accountId)
        if (accountHoldings.length === 0) return { balance: 0, dayChange: 0 }

        const balance = accountHoldings.reduce((sum, h) => sum + h.marketValue, 0)
        const dayChange = accountHoldings.reduce((sum, h) => sum + h.dayGainLoss, 0)
        return { balance, dayChange }
    },

    // Enriches a single account with balance and day change
    // @sig toEnriched :: (State, Account) -> EnrichedAccount
    toEnriched: (state, account) => {
        const { id } = account
        if (P.usesHoldingsBalance(account)) {
            const { balance, dayChange } = T.toHoldingsBalance(state, id)
            const dayChangePct = balance !== 0 ? dayChange / (balance - dayChange) : null
            return EnrichedAccount(id, account, balance, dayChange, dayChangePct)
        }

        const balance = T.toBankBalance(state, id)
        return EnrichedAccount(id, account, balance, 0, null)
    },
}

// Enriches all accounts with computed balance and day change values (unmemoized)
// @sig _collectEnriched :: State -> LookupTable<EnrichedAccount>
const _collectEnriched = state => {
    const { accounts } = state
    const enriched = accounts.map(account => T.toEnriched(state, account))
    return LookupTable(enriched, EnrichedAccount, 'id')
}

// Organizes accounts into sections based on sort mode (unmemoized)
// @sig _collectOrganized :: State -> LookupTable<AccountSection>
const _collectOrganized = state => {
    const { accountListSortMode } = state
    const enriched = _collectEnriched(state)
    return accountOrganization.A.collectSections(enriched, accountListSortMode)
}

const A = {
    collectEnriched: _collectEnriched,
    collectOrganized: memoizeReduxState(ORGANIZATION_STATE_KEYS, _collectOrganized),
}

const accountSelectors = { T, A }

export { accountSelectors }
