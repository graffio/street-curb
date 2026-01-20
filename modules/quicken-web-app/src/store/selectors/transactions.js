// ABOUTME: Memoized derived selectors for transaction data
// ABOUTME: Combines UI state with transaction filtering

import { memoizeReduxStatePerKey } from '@graffio/functional'
import { UI } from './ui.js'
import {
    filterByAccounts,
    filterByCategories,
    filterByDateRange,
    filterByText,
    transactionMatchesSearch,
} from './transactions/filters.js'

const { dateRange, filterQuery, searchQuery, selectedAccounts, selectedCategories } = UI

const T = {
    // Enriches a transaction with category and account names from lookups
    // @sig toEnriched :: (Transaction, LookupTable<Category>, LookupTable<Account>) -> EnrichedTransaction
    toEnriched: (txn, categories, accounts) => ({
        ...txn,
        categoryName: categories?.get(txn.categoryId)?.name || 'Uncategorized',
        accountName: accounts?.get(txn.accountId)?.name || '',
    }),
}

const A = {
    // Applies all transaction filters in sequence: text -> date -> category -> account
    // @sig collectFiltered :: (ReduxState, String) -> [Transaction]
    collectFiltered: (state, viewId) => {
        const { categories, securities, transactions } = state
        const textFiltered = filterByText(transactions, filterQuery(state, viewId), categories, securities)
        const dateFiltered = filterByDateRange(textFiltered, dateRange(state, viewId) || {})
        const categoryFiltered = filterByCategories(dateFiltered, selectedCategories(state, viewId), categories)
        return filterByAccounts(categoryFiltered, selectedAccounts(state, viewId))
    },

    // Computes IDs of transactions matching the current search query for a specific view
    // @sig collectSearchMatches :: (ReduxState, String) -> [TransactionId]
    collectSearchMatches: (state, viewId) => {
        const { categories } = state
        const query = searchQuery(state, viewId)
        return filtered(state, viewId)
            .filter(txn => transactionMatchesSearch(txn, query, categories))
            .map(txn => txn.id)
    },

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

const Transactions = { filtered, enriched, searchMatches }

export { Transactions }
