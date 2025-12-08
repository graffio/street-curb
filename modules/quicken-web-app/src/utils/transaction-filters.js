/*
 * Transaction filtering functions for filtering and searching transaction data
 *
 * This module provides pure functions for filtering transactions by various criteria.
 * All functions are transaction-specific and operate on transaction objects/arrays.
 */

/*
 * Check if a transaction matches a search query (for highlighting and filtering purposes)
 *
 * @sig transactionMatchesSearch :: (Transaction, String) -> Boolean
 */
const transactionMatchesSearch = (transaction, searchQuery) => {
    if (!searchQuery.trim()) return false

    const queryLower = searchQuery.toLowerCase()
    const searchFields = [
        transaction.payee || '',
        transaction.memo || '',
        transaction.category || '',
        transaction.address || '',
        transaction.number || '',
        transaction.amount.toString(),
    ]

    return searchFields.some(field => field.toLowerCase().includes(queryLower))
}

/*
 * Filter transactions by text content
 *
 * @sig filterByText :: ([Transaction], String) -> [Transaction]
 */
const filterByText = (transactions, query) => {
    if (!query.trim()) return transactions

    return transactions.filter(transaction => {
        const searchableText = [transaction.description, transaction.memo, transaction.payee, transaction.category]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        return searchableText.includes(query.toLowerCase())
    })
}

/*
 * Filter transactions by date range
 *
 * @sig filterByDateRange :: ([Transaction], DateRange) -> [Transaction]
 *     DateRange = { start: Date?, end: Date? }
 */
const filterByDateRange = (transactions, dateRange) => {
    if (!dateRange.start && !dateRange.end) return transactions

    return transactions.filter(transaction => {
        // Parse ISO date string correctly (transaction.date is like "2024-06-15")
        // Add explicit time to avoid timezone issues
        const transactionDate = new Date(transaction.date + 'T00:00:00')

        if (dateRange.start && transactionDate < dateRange.start) return false
        if (dateRange.end && transactionDate > dateRange.end) return false

        return true
    })
}

/*
 * Check if a transaction category matches any of the selected category filters
 *
 * @sig categoryMatches :: (String?, [String]) -> Boolean
 */
const categoryMatches = (transactionCategory, selectedCategories) => {
    if (!selectedCategories.length) return true
    if (!transactionCategory) return false

    return selectedCategories.some(selectedCategory => transactionCategory === selectedCategory)
}

/*
 * Filter transactions by selected categories
 *
 * @sig filterByCategories :: ([Transaction], [String]) -> [Transaction]
 */
const filterByCategories = (transactions, selectedCategories) => {
    if (!selectedCategories.length) return transactions

    return transactions.filter(transaction => categoryMatches(transaction.category, selectedCategories))
}

/*
 * Extract all unique categories from transactions, including parent categories
 *
 * @sig extractCategories :: ([Transaction], (String -> [String])) -> [String]
 */
const extractCategories = (transactions, generateParentCategories) => {
    const allCategories = transactions
        .filter(transaction => transaction.category && transaction.category.trim())
        .map(transaction => generateParentCategories(transaction.category.trim()))
        .flat()

    return Array.from(new Set(allCategories)).sort()
}

/*
 * Get the earliest transaction date for default start date
 *
 * @sig getEarliestTransactionDate :: [Transaction] -> Date?
 */
const getEarliestTransactionDate = transactions => {
    if (!transactions || transactions.length === 0) return null

    return transactions.reduce((earliest, transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate < earliest ? transactionDate : earliest
    }, new Date(transactions[0].date))
}

export {
    transactionMatchesSearch,
    filterByText,
    filterByDateRange,
    filterByCategories,
    extractCategories,
    categoryMatches,
    getEarliestTransactionDate,
}
