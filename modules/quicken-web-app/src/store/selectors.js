// ABOUTME: Redux state selectors
// ABOUTME: Provides access to state slices and derived data

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import { generateParentCategories } from '../utils/category-hierarchy.js'
import {
    extractCategories,
    filterByCategories,
    filterByDateRange,
    filterByText,
    getEarliestTransactionDate,
    transactionMatchesSearch,
} from '../utils/transaction-filters.js'

// Base selectors
const initialized = state => state.initialized
const transactions = state => state.transactions
const transactionFilters = state => state.transactionFilters

// Filter state selectors
const dateRange = state => state.transactionFilters.dateRange
const dateRangeKey = state => state.transactionFilters.dateRangeKey
const filterQuery = state => state.transactionFilters.filterQuery
const searchQuery = state => state.transactionFilters.searchQuery
const selectedCategories = state => state.transactionFilters.selectedCategories
const currentSearchIndex = state => state.transactionFilters.currentSearchIndex
const currentRowIndex = state => state.transactionFilters.currentRowIndex
const customStartDate = state => state.transactionFilters.customStartDate
const customEndDate = state => state.transactionFilters.customEndDate

// Derived selectors (memoized to prevent unnecessary rerenders)
const allCategories = memoizeReduxState(['transactions'], state => {
    const txns = transactions(state)
    if (!txns) return []
    return extractCategories(txns, generateParentCategories)
})

const defaultStartDate = memoizeReduxState(['transactions'], state => {
    const txns = transactions(state)
    if (!txns) return new Date()
    return getEarliestTransactionDate(txns)
})

const _defaultEndDate = new Date()
const defaultEndDate = () => _defaultEndDate

const filteredTransactions = memoizeReduxState(['transactions', 'transactionFilters'], state => {
    const txns = transactions(state)
    const textFiltered = filterByText(txns, filterQuery(state))
    const dateFiltered = filterByDateRange(textFiltered, dateRange(state) || {})
    return filterByCategories(dateFiltered, selectedCategories(state))
})

const searchMatches = memoizeReduxState(['transactions', 'transactionFilters'], state => {
    const filtered = filteredTransactions(state)
    const query = searchQuery(state)
    return filtered
        .map((transaction, index) => ({ transaction, index }))
        .filter(({ transaction }) => transactionMatchesSearch(transaction, query))
        .map(({ index }) => index)
})

export {
    initialized,
    transactions,
    transactionFilters,
    dateRange,
    dateRangeKey,
    filterQuery,
    searchQuery,
    selectedCategories,
    currentSearchIndex,
    currentRowIndex,
    customStartDate,
    customEndDate,
    allCategories,
    defaultStartDate,
    defaultEndDate,
    filteredTransactions,
    searchMatches,
}
