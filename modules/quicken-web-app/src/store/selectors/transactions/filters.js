// ABOUTME: Transaction filtering functions for various criteria
// ABOUTME: Pure functions with no Redux dependency - can be used anywhere

import { anyFieldContains, containsIgnoreCase } from '@graffio/functional'

/*
 * Resolve a transaction's categoryId to category name
 * @sig getCategoryName :: (Transaction, LookupTable<Category>) -> String?
 */
const getCategoryName = (transaction, categories) => {
    if (!transaction.categoryId || !categories) return null
    const cat = categories.get(transaction.categoryId)
    return cat ? cat.name : null
}

/*
 * Check if a transaction matches a search query (for highlighting and navigation)
 *
 * @sig transactionMatchesSearch :: (Transaction, String, LookupTable<Category>?) -> Boolean
 */
const transactionMatchesSearch = (transaction, searchQuery, categories) => {
    if (!searchQuery.trim()) return false

    const matchesFields = anyFieldContains(['payee', 'memo', 'address', 'number'])(searchQuery)
    const matchesText = containsIgnoreCase(searchQuery)

    if (matchesFields(transaction)) return true
    if (matchesText(String(transaction.amount))) return true
    if (matchesText(getCategoryName(transaction, categories))) return true
    return false
}

/*
 * Filter transactions by text content
 * Checks both bank fields (payee, memo, description) and investment fields (action, security)
 *
 * @sig filterByText :: ([Transaction], String, LookupTable<Category>?, LookupTable<Security>?) -> [Transaction]
 */
const filterByText = (transactions, query, categories, securities) => {
    // @sig getSecurityName :: (Transaction, LookupTable<Security>) -> String?
    const getSecurityName = (transaction, secs) => {
        if (!transaction.securityId || !secs) return null
        const security = secs.get(transaction.securityId)
        return security ? security.symbol || security.name : null
    }

    // @sig matchesTextQuery :: Transaction -> Boolean
    const matchesTextQuery = transaction => {
        if (matchesFields(transaction)) return true
        if (matchesText(getCategoryName(transaction, categories))) return true
        if (matchesText(getSecurityName(transaction, securities))) return true
        return false
    }

    if (!query.trim()) return transactions

    const matchesFields = anyFieldContains(['description', 'memo', 'payee', 'investmentAction'])(query)
    const matchesText = containsIgnoreCase(query)

    return transactions.filter(matchesTextQuery)
}

/*
 * Filter transactions by date range
 * Uses string comparison for ISO dates (lexicographic order = chronological order)
 *
 * @sig filterByDateRange :: ([Transaction], DateRange) -> [Transaction]
 *     DateRange = { start: Date?, end: Date? }
 */
const filterByDateRange = (transactions, dateRange) => {
    // @sig isInDateRange :: Transaction -> Boolean
    const isInDateRange = transaction => {
        const dateStr = transaction.date // Already ISO string like "2024-06-15"
        if (startStr && dateStr < startStr) return false
        if (endStr && dateStr > endStr) return false
        return true
    }

    const { end, start } = dateRange
    if (!start && !end) return transactions

    // Convert Date bounds to ISO strings once (avoids Date parsing per row)
    const startStr = start?.toISOString().slice(0, 10)
    const endStr = end?.toISOString().slice(0, 10)

    return transactions.filter(isInDateRange)
}

/*
 * Check if a transaction's category matches any of the selected category filters
 *
 * @sig categoryMatches :: (Transaction, [String], LookupTable<Category>) -> Boolean
 */
const categoryMatches = (transaction, selectedCategories, categories) => {
    if (!selectedCategories.length) return true

    const categoryName = getCategoryName(transaction, categories)
    if (!categoryName) return false

    // Check if category name matches or starts with any selected category (for hierarchy)
    return selectedCategories.some(selected => categoryName === selected || categoryName.startsWith(selected + ':'))
}

/*
 * Filter transactions by selected categories
 *
 * @sig filterByCategories :: ([Transaction], [String], LookupTable<Category>) -> [Transaction]
 */
const filterByCategories = (transactions, selectedCategories, categories) => {
    if (!selectedCategories.length) return transactions

    return transactions.filter(transaction => categoryMatches(transaction, selectedCategories, categories))
}

/*
 * Get the earliest transaction date for default start date
 *
 * @sig getEarliestTransactionDate :: [Transaction] -> Date?
 */
const getEarliestTransactionDate = transactions => {
    // Compare two dates and return the earlier one
    // @sig findEarlier :: (Date, Transaction) -> Date
    const findEarlier = (earliest, transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate < earliest ? transactionDate : earliest
    }

    if (!transactions || transactions.length === 0) return null
    return transactions.reduce(findEarlier, new Date(transactions[0].date))
}

/*
 * Filter transactions by account ID
 *
 * @sig filterByAccount :: ([Transaction], String) -> [Transaction]
 */
const filterByAccount = (transactions, accountId) => {
    if (!accountId) return transactions
    return transactions.filter(t => t.accountId === accountId)
}

/*
 * Filter transactions by multiple account IDs
 *
 * @sig filterByAccounts :: ([Transaction], [String]) -> [Transaction]
 */
const filterByAccounts = (transactions, accountIds) => {
    if (!accountIds || accountIds.length === 0) return transactions
    return transactions.filter(t => accountIds.includes(t.accountId))
}

/*
 * Filter transactions by security IDs (for investment transactions)
 *
 * @sig filterBySecurities :: ([Transaction], [String]) -> [Transaction]
 */
const filterBySecurities = (transactions, securityIds) => {
    if (!securityIds || securityIds.length === 0) return transactions
    return transactions.filter(t => securityIds.includes(t.securityId))
}

/*
 * Filter transactions by investment action types
 *
 * @sig filterByInvestmentActions :: ([Transaction], [String]) -> [Transaction]
 */
const filterByInvestmentActions = (transactions, actions) => {
    if (!actions || actions.length === 0) return transactions
    return transactions.filter(t => actions.includes(t.investmentAction))
}

export {
    categoryMatches,
    filterByAccount,
    filterByAccounts,
    filterByCategories,
    filterByDateRange,
    filterByInvestmentActions,
    filterBySecurities,
    filterByText,
    getCategoryName,
    getEarliestTransactionDate,
    transactionMatchesSearch,
}
