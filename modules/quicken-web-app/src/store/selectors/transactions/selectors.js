/*
 * Transaction selectors
 *
 * Memoized derived selectors for transaction data.
 */

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import { dateRange, filterQuery, searchQuery, selectedCategories } from '../ui.js'
import {
    filterByCategories,
    filterByDateRange,
    filterByText,
    getEarliestTransactionDate,
    transactionMatchesSearch,
} from './filters.js'

/*
 * Earliest transaction date for date picker default
 *
 * @sig defaultStartDate :: ReduxState -> Date
 */
const defaultStartDate = memoizeReduxState(['transactions'], state => {
    const transactions = state.transactions
    return transactions ? getEarliestTransactionDate(transactions) : new Date()
})

/*
 * Today's date for date picker default (captured once at module load)
 *
 * @sig defaultEndDate :: ReduxState -> Date
 */
const _defaultEndDate = new Date()
const defaultEndDate = () => _defaultEndDate

/*
 * Transactions filtered by text query, date range, and selected categories
 * Applies filters from UI state in sequence: text -> date -> category
 *
 * @sig filteredTransactions :: ReduxState -> [Transaction]
 */
const filteredTransactions = memoizeReduxState(['transactions', 'transactionFilters', 'categories'], state => {
    const textFiltered = filterByText(state.transactions, filterQuery(state), state.categories)
    const dateFiltered = filterByDateRange(textFiltered, dateRange(state) || {})
    return filterByCategories(dateFiltered, selectedCategories(state), state.categories)
})

/*
 * Indices of filtered transactions matching the search query
 * Used for search navigation (previous/next) and highlighting
 *
 * @sig searchMatches :: ReduxState -> [Number]
 */
const searchMatches = memoizeReduxState(['transactions', 'transactionFilters', 'categories'], state => {
    const query = searchQuery(state)
    return filteredTransactions(state)
        .map((transaction, index) => ({ transaction, index }))
        .filter(({ transaction }) => transactionMatchesSearch(transaction, query, state.categories))
        .map(({ index }) => index)
})

export { defaultStartDate, defaultEndDate, filteredTransactions, searchMatches }
