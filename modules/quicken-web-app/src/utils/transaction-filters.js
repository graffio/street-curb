/*
 * Transaction filtering functions for filtering and searching transaction data
 *
 * This module provides pure functions for filtering transactions by various criteria.
 * All functions are transaction-specific and operate on transaction objects/arrays.
 */

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
 * Check if a transaction matches a search query (for highlighting and filtering purposes)
 *
 * @sig transactionMatchesSearch :: (Transaction, String, LookupTable<Category>?) -> Boolean
 */
const transactionMatchesSearch = (transaction, searchQuery, categories) => {
    if (!searchQuery.trim()) return false

    const queryLower = searchQuery.toLowerCase()
    const categoryName = getCategoryName(transaction, categories) || ''
    const searchFields = [
        transaction.payee || '',
        transaction.memo || '',
        categoryName,
        transaction.address || '',
        transaction.number || '',
        transaction.amount.toString(),
    ]

    return searchFields.some(field => field.toLowerCase().includes(queryLower))
}

/*
 * Filter transactions by text content
 *
 * @sig filterByText :: ([Transaction], String, LookupTable<Category>?) -> [Transaction]
 */
const filterByText = (transactions, query, categories) => {
    if (!query.trim()) return transactions

    return transactions.filter(transaction => {
        const categoryName = getCategoryName(transaction, categories) || ''
        const searchableText = [transaction.description, transaction.memo, transaction.payee, categoryName]
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
 * Check if a transaction's category matches any of the selected category filters
 * Selected categories are names; we resolve transaction.categoryId to name for comparison
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
    categoryMatches,
    getCategoryName,
    getEarliestTransactionDate,
}
