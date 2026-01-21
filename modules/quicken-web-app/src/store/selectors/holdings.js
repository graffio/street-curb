// ABOUTME: Holdings selector - thin wrapper around financial computations
// ABOUTME: Extracts Redux state and delegates to computeHoldingsAsOf

import { memoizeOnceWithIdenticalParams, memoizeReduxState, memoizeReduxStatePerKey } from '@graffio/functional'
import { HoldingsAsOf } from '@graffio/financial-computations/investments'
import { HoldingsTree } from '../../utils/holdings-tree.js'
import { UI } from './ui.js'

const { buildAllocationIndex, buildPriceIndex, buildTransactionIndex } = HoldingsAsOf
const { buildHoldingsTree } = HoldingsTree

const T = {
    // Build holdings tree from groupBy dimension and holdings array
    // @sig toHoldingsTree :: (String?, [Holding]) -> [HoldingsTreeNode]
    toHoldingsTree: memoizeOnceWithIdenticalParams((groupBy, holdings) =>
        buildHoldingsTree(groupBy || 'account', holdings),
    ),
}

// Builds price index from Redux state, memoized on prices slice
// @sig priceIndex :: State -> Map<String, LookupTable<Price, 'date'>>
const priceIndex = memoizeReduxState(['prices'], state => buildPriceIndex(state.prices))

// Builds allocation index from Redux state, memoized on lotAllocations slice
// @sig allocationIndex :: State -> Map<String, [LotAllocation]>
const allocationIndex = memoizeReduxState(['lotAllocations'], state => buildAllocationIndex(state.lotAllocations))

// Builds transaction index from Redux state, memoized on transactions slice
// @sig transactionIndex :: State -> Map<String, [Transaction]>
const transactionIndex = memoizeReduxState(['transactions'], state => buildTransactionIndex(state.transactions))

const A = {
    // Extracts state and computes holdings as of the view's asOfDate
    // @sig collectHoldingsAsOf :: (ReduxState, String) -> [Holding]
    // prettier-ignore
    collectHoldingsAsOf: (state, viewId) => {
        const { accounts, lotAllocations, lots, prices, securities, transactions } = state
        return HoldingsAsOf.computeHoldingsAsOf({ lots, lotAllocations, prices, accounts, securities, transactions,
            asOfDate: UI.asOfDate(state, viewId), selectedAccountIds: UI.selectedAccounts(state, viewId),
            filterQuery: UI.filterQuery(state, viewId),

            // Pass pre-built indexes to avoid rebuilding on every asOfDate change
            allocationIndex: allocationIndex(state), priceIndex: priceIndex(state), transactionIndex: transactionIndex(state) })
    },
}

const collectAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    A.collectHoldingsAsOf,
)

// Collects holdings tree for a view (memoized on groupBy + holdings reference)
// @sig collectTree :: (ReduxState, String) -> [HoldingsTreeNode]
const collectTree = (state, viewId) => {
    const holdings = collectAsOf(state, viewId)
    const groupBy = UI.groupBy(state, viewId)
    return T.toHoldingsTree(groupBy, holdings)
}

const Holdings = { collectAsOf, collectTree }

export { Holdings }
