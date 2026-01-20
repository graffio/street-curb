// ABOUTME: Holdings selector - thin wrapper around financial computations
// ABOUTME: Extracts Redux state and delegates to computeHoldingsAsOf

import { memoizeReduxStatePerKey } from '@graffio/functional'
import { HoldingsAsOf } from '@graffio/financial-computations/investments'
import { UI } from './ui.js'

const A = {
    // Extracts state and computes holdings as of the view's asOfDate
    // @sig collectHoldingsAsOf :: (ReduxState, String) -> [Holding]
    // prettier-ignore
    collectHoldingsAsOf: (state, viewId) => {
        const { accounts, lotAllocations, lots, prices, securities, transactions } = state
        return HoldingsAsOf.computeHoldingsAsOf({ lots, lotAllocations, prices, accounts, securities, transactions,
            asOfDate: UI.asOfDate(state, viewId), selectedAccountIds: UI.selectedAccounts(state, viewId),
            filterQuery: UI.filterQuery(state, viewId) })
    },
}

const collectAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    A.collectHoldingsAsOf,
)

const Holdings = { collectAsOf }

export { Holdings }
