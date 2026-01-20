// ABOUTME: Account-related selectors for balance computation and enrichment
// ABOUTME: Thin layer that wires Redux state to business logic

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { memoizeReduxState } from '@graffio/functional'
import { EnrichedAccount } from '../../types/enriched-account.js'
import { accountOrganization } from '../../services/account-organization.js'
import { Holdings } from './holdings.js'

const holdingsAsOf = Holdings.collectAsOf

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

const T = {
    // Enriches a single account with balance and day change
    // @sig toEnriched :: (State, Account) -> EnrichedAccount
    toEnriched: (state, account) => {
        const holdings = holdingsAsOf(state, 'account-list') || []
        return EnrichedAccount.fromAccount(account, holdings, state.transactions)
    },
}

const A = {
    // Enriches all accounts with computed balance and day change values
    // @sig collectEnriched :: State -> LookupTable<EnrichedAccount>
    collectEnriched: state => {
        const { accounts } = state
        const enriched = accounts.map(account => T.toEnriched(state, account))
        return LookupTable(enriched, EnrichedAccount, 'id')
    },

    // Organizes accounts into sections based on sort mode (memoized)
    // @sig collectOrganized :: State -> LookupTable<AccountSection>
    collectOrganized: memoizeReduxState(ORGANIZATION_STATE_KEYS, state =>
        accountOrganization.A.collectSections(A.collectEnriched(state), state.accountListSortMode),
    ),
}

const organized = A.collectOrganized

const Accounts = { organized }

export { Accounts }
