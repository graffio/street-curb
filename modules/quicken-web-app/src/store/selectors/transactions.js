// ABOUTME: Memoized derived selectors for transaction data
// ABOUTME: Combines UI state with transaction filtering

import { memoizeOnceWithIdenticalParams, memoizeReduxStatePerKey } from '@graffio/functional'
import { buildTransactionTree } from '../../utils/category-tree.js'
import { Filters } from './transactions/filters.js'
import { UI } from './ui.js'

const { dateRange, filterQuery, searchQuery, selectedAccounts, selectedCategories } = UI

const T = {
    // Enriches a transaction with category and account names from lookups
    // @sig toEnriched :: (Transaction, LookupTable<Category>, LookupTable<Account>) -> EnrichedTransaction
    toEnriched: (txn, categories, accounts) => ({
        ...txn,
        categoryName: categories?.get(txn.categoryId)?.name || 'Uncategorized',
        accountName: accounts?.get(txn.accountId)?.name || '',
    }),

    // Build transaction tree from groupBy dimension and transactions array
    // @sig toTransactionTree :: (String?, [EnrichedTransaction]) -> [TreeNode]
    toTransactionTree: memoizeOnceWithIdenticalParams((groupBy, transactions) =>
        buildTransactionTree(groupBy || 'category', transactions),
    ),
}

const A = {
    // Applies all transaction filters in sequence: text -> date -> category -> account
    // @sig collectFiltered :: (ReduxState, String) -> [Transaction]
    // prettier-ignore
    collectFiltered: (state, viewId) => {
        const { categories, securities, transactions } = state
        return Filters.applyFilters(transactions, filterQuery(state, viewId), dateRange(state, viewId),
            selectedCategories(state, viewId), selectedAccounts(state, viewId), categories, securities)
    },

    // Computes IDs of transactions matching the current search query for a specific view
    // @sig collectSearchMatches :: (ReduxState, String) -> [TransactionId]
    collectSearchMatches: (state, viewId) =>
        Filters.collectSearchMatchIds(filtered(state, viewId), searchQuery(state, viewId), state.categories),

    // Computes enriched transactions with category and account names for a specific view
    // @sig collectEnriched: (ReduxState, String) -> [EnrichedTransaction]
    collectEnriched: (state, viewId) => {
        const { accounts, categories } = state
        const txns = filtered(state, viewId)
        if (!txns || !categories || !accounts) return []
        return txns.map(txn => T.toEnriched(txn, categories, accounts))
    },
}

// Transactions filtered by text query, date range, and selected categories for a specific view
// @sig filtered :: (ReduxState, String) -> [Transaction]
const filtered = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'securities'],
    'transactionFilters',
    A.collectFiltered,
)

// IDs of filtered transactions matching the search query for a specific view
// @sig searchMatches :: (ReduxState, String) -> [TransactionId]
const searchMatches = memoizeReduxStatePerKey(
    ['transactions', 'categories'],
    'transactionFilters',
    A.collectSearchMatches,
)

// Transactions enriched with category and account names for a specific view
// @sig enriched :: (ReduxState, String) -> [EnrichedTransaction]
const enriched = memoizeReduxStatePerKey(
    ['transactions', 'categories', 'accounts'],
    'transactionFilters',
    A.collectEnriched,
)

// Collects transaction tree for a view (memoized on groupBy + enriched transactions reference)
// @sig collectTree :: (ReduxState, String) -> [TreeNode]
const collectTree = (state, viewId) => {
    const transactions = enriched(state, viewId)
    const groupBy = UI.groupBy(state, viewId)
    return T.toTransactionTree(groupBy, transactions)
}

const Transactions = { collectTree, enriched, filtered, searchMatches }

export { Transactions }
