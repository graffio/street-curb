// ABOUTME: Memoized derived selectors for transaction data
// ABOUTME: Combines UI state with transaction filtering

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import { dateRange, filterQuery, searchQuery, selectedCategories } from '../ui.js'
import {
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

// Apply all transaction filters in sequence: text -> date -> category
// @sig computeFilteredTransactions :: ReduxState -> [Transaction]
const computeFilteredTransactions = state => {
    const { categories, transactions } = state
    const textFiltered = filterByText(transactions, filterQuery(state), categories)
    const dateFiltered = filterByDateRange(textFiltered, dateRange(state) || {})
    return filterByCategories(dateFiltered, selectedCategories(state), categories)
}

/*
 * Transactions filtered by text query, date range, and selected categories
 * Applies filters from UI state in sequence: text -> date -> category
 *
 * @sig filteredTransactions :: ReduxState -> [Transaction]
 */
const filteredTransactions = memoizeReduxState(
    ['transactions', 'transactionFilters', 'categories'],
    computeFilteredTransactions,
)

// Compute IDs of transactions matching the current search query
// @sig computeSearchMatches :: ReduxState -> [TransactionId]
const computeSearchMatches = state => {
    const { categories } = state
    const query = searchQuery(state)
    return filteredTransactions(state)
        .filter(txn => transactionMatchesSearch(txn, query, categories))
        .map(txn => txn.id)
}

/*
 * IDs of filtered transactions matching the search query
 * Used for search navigation (previous/next) and highlighting
 *
 * @sig searchMatches :: ReduxState -> [TransactionId]
 */
const searchMatches = memoizeReduxState(['transactions', 'transactionFilters', 'categories'], computeSearchMatches)

export { defaultStartDate, defaultEndDate, filteredTransactions, searchMatches }
