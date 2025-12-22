// ABOUTME: Memoized derived selectors for transaction data
// ABOUTME: Combines UI state with transaction filtering

import memoizeReduxState, { memoizeReduxStatePerKey } from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import { dateRange, filterQuery, searchQuery, selectedAccounts, selectedCategories } from '../ui.js'
import {
    filterByAccounts,
    filterByCategories,
    filterByDateRange,
    filterByText,
    getEarliestTransactionDate,
    transactionMatchesSearch,
} from './filters.js'

// Compute earliest transaction date or fallback to today
// @sig computeDefaultStartDate :: ReduxState -> Date
const computeDefaultStartDate = state => {
    const { transactions } = state
    return transactions ? getEarliestTransactionDate(transactions) : new Date()
}

/*
 * Earliest transaction date for date picker default
 *
 * @sig defaultStartDate :: ReduxState -> Date
 */
const defaultStartDate = memoizeReduxState(['transactions'], computeDefaultStartDate)

/*
 * Today's date for date picker default (captured once at module load)
 *
 * @sig defaultEndDate :: () -> Date
 */
const _defaultEndDate = new Date()

// @sig defaultEndDate :: () -> Date
const defaultEndDate = () => _defaultEndDate

// Apply all transaction filters in sequence: text -> date -> category -> account
// @sig computeFilteredTransactions :: (ReduxState, String) -> [Transaction]
const computeFilteredTransactions = (state, viewId) => {
    const { categories, transactions } = state
    const textFiltered = filterByText(transactions, filterQuery(state, viewId), categories)
    const dateFiltered = filterByDateRange(textFiltered, dateRange(state, viewId) || {})
    const categoryFiltered = filterByCategories(dateFiltered, selectedCategories(state, viewId), categories)
    return filterByAccounts(categoryFiltered, selectedAccounts(state, viewId))
}

/*
 * Transactions filtered by text query, date range, and selected categories for a specific view
 * Applies filters from UI state in sequence: text -> date -> category
 *
 * @sig filteredTransactions :: (ReduxState, String) -> [Transaction]
 */
const filteredTransactions = memoizeReduxStatePerKey(
    ['transactions', 'categories'],
    'transactionFilters',
    computeFilteredTransactions,
)

// Compute IDs of transactions matching the current search query for a specific view
// @sig computeSearchMatches :: (ReduxState, String) -> [TransactionId]
const computeSearchMatches = (state, viewId) => {
    const { categories } = state
    const query = searchQuery(state, viewId)
    return filteredTransactions(state, viewId)
        .filter(txn => transactionMatchesSearch(txn, query, categories))
        .map(txn => txn.id)
}

/*
 * IDs of filtered transactions matching the search query for a specific view
 * Used for search navigation (previous/next) and highlighting
 *
 * @sig searchMatches :: (ReduxState, String) -> [TransactionId]
 */
const searchMatches = memoizeReduxStatePerKey(
    ['transactions', 'categories'],
    'transactionFilters',
    computeSearchMatches,
)

export { defaultEndDate, defaultStartDate, filteredTransactions, searchMatches }
