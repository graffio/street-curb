// ABOUTME: Redux state selectors
// ABOUTME: Provides access to state slices and derived data

import pluck from '@graffio/functional/src/ramda-like/pluck.js'
import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import { generateParentCategories } from '../utils/category-hierarchy.js'
import {
    filterByCategories,
    filterByDateRange,
    filterByText,
    getEarliestTransactionDate,
    transactionMatchesSearch,
} from '../utils/transaction-filters.js'

// Base selectors
const initialized = state => state.initialized
const accounts = state => state.accounts
const categories = state => state.categories
const securities = state => state.securities
const tags = state => state.tags
const splits = state => state.splits
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
const allCategories = memoizeReduxState(['categories'], state => {
    const cats = categories(state)
    if (!cats || cats.length === 0) return []

    // Get all category names and generate hierarchy (parent categories)
    const names = pluck('name', cats)
    const withParents = names.flatMap(generateParentCategories)
    return Array.from(new Set(withParents)).sort()
})

const defaultStartDate = memoizeReduxState(['transactions'], state => {
    const txns = transactions(state)
    if (!txns) return new Date()
    return getEarliestTransactionDate(txns)
})

const _defaultEndDate = new Date()
const defaultEndDate = () => _defaultEndDate

const filteredTransactions = memoizeReduxState(['transactions', 'transactionFilters', 'categories'], state => {
    const txns = transactions(state)
    const cats = categories(state)
    const textFiltered = filterByText(txns, filterQuery(state), cats)
    const dateFiltered = filterByDateRange(textFiltered, dateRange(state) || {})
    return filterByCategories(dateFiltered, selectedCategories(state), cats)
})

const searchMatches = memoizeReduxState(['transactions', 'transactionFilters', 'categories'], state => {
    const filtered = filteredTransactions(state)
    const cats = categories(state)
    const query = searchQuery(state)
    return filtered
        .map((transaction, index) => ({ transaction, index }))
        .filter(({ transaction }) => transactionMatchesSearch(transaction, query, cats))
        .map(({ index }) => index)
})

export {
    initialized,
    accounts,
    categories,
    securities,
    tags,
    splits,
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
