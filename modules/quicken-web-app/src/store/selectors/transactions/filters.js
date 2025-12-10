/*
 * Transaction filtering functions
 *
 * Pure functions for filtering transactions by various criteria.
 * No Redux dependency - can be used anywhere.
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
 * Check if a transaction matches a search query (for highlighting and navigation)
 *
 * @sig transactionMatchesSearch :: (Transaction, String, LookupTable<Category>?) -> Boolean
 */
const transactionMatchesSearch = (transaction, searchQuery, categories) => {
    if (!searchQuery.trim()) return false

    const queryLower = searchQuery.toLowerCase()

    // Short-circuit: check each field individually, no array allocation
    if (transaction.payee?.toLowerCase().includes(queryLower)) return true
    if (transaction.memo?.toLowerCase().includes(queryLower)) return true
    if (transaction.address?.toLowerCase().includes(queryLower)) return true
    if (transaction.number?.toLowerCase().includes(queryLower)) return true
    if (String(transaction.amount).includes(queryLower)) return true
    const categoryName = getCategoryName(transaction, categories)
    if (categoryName?.toLowerCase().includes(queryLower)) return true
    return false
}

/*
 * Filter transactions by text content
 *
 * @sig filterByText :: ([Transaction], String, LookupTable<Category>?) -> [Transaction]
 */
const filterByText = (transactions, query, categories) => {
    if (!query.trim()) return transactions

    const queryLower = query.toLowerCase()

    return transactions.filter(transaction => {
        // Short-circuit: check each field individually, no array/string allocation
        if (transaction.description?.toLowerCase().includes(queryLower)) return true
        if (transaction.memo?.toLowerCase().includes(queryLower)) return true
        if (transaction.payee?.toLowerCase().includes(queryLower)) return true
        const categoryName = getCategoryName(transaction, categories)
        if (categoryName?.toLowerCase().includes(queryLower)) return true
        return false
    })
}

/*
 * Filter transactions by date range
 * Uses string comparison for ISO dates (lexicographic order = chronological order)
 *
 * @sig filterByDateRange :: ([Transaction], DateRange) -> [Transaction]
 *     DateRange = { start: Date?, end: Date? }
 */
const filterByDateRange = (transactions, dateRange) => {
    if (!dateRange.start && !dateRange.end) return transactions

    // Convert Date bounds to ISO strings once (avoids Date parsing per row)
    const startStr = dateRange.start?.toISOString().slice(0, 10)
    const endStr = dateRange.end?.toISOString().slice(0, 10)

    return transactions.filter(transaction => {
        const dateStr = transaction.date // Already ISO string like "2024-06-15"
        if (startStr && dateStr < startStr) return false
        if (endStr && dateStr > endStr) return false
        return true
    })
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
