// ABOUTME: Transaction filtering functions for various criteria
// ABOUTME: Pure functions with no Redux dependency - can be used anywhere

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

    const { address, amount, memo, number, payee } = transaction
    const queryLower = searchQuery.toLowerCase()

    // Short-circuit: check each field individually, no array allocation
    if (payee?.toLowerCase().includes(queryLower)) return true
    if (memo?.toLowerCase().includes(queryLower)) return true
    if (address?.toLowerCase().includes(queryLower)) return true
    if (number?.toLowerCase().includes(queryLower)) return true
    if (String(amount).includes(queryLower)) return true
    const categoryName = getCategoryName(transaction, categories)
    if (categoryName?.toLowerCase().includes(queryLower)) return true
    return false
}

/*
 * Check if a transaction matches a text query in any searchable field
 *
 * @sig matchesTextQuery :: (Transaction, String, LookupTable<Category>?) -> Boolean
 */
const matchesTextQuery = (transaction, queryLower, categories) => {
    const { description, memo, payee } = transaction

    // Short-circuit: check each field individually, no array/string allocation
    if (description?.toLowerCase().includes(queryLower)) return true
    if (memo?.toLowerCase().includes(queryLower)) return true
    if (payee?.toLowerCase().includes(queryLower)) return true
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
    return transactions.filter(t => matchesTextQuery(t, queryLower, categories))
}

// Check if a transaction date is within the given range bounds
// @sig isInDateRange :: (Transaction, String?, String?) -> Boolean
const isInDateRange = (transaction, startStr, endStr) => {
    const dateStr = transaction.date // Already ISO string like "2024-06-15"
    if (startStr && dateStr < startStr) return false
    if (endStr && dateStr > endStr) return false
    return true
}

/*
 * Filter transactions by date range
 * Uses string comparison for ISO dates (lexicographic order = chronological order)
 *
 * @sig filterByDateRange :: ([Transaction], DateRange) -> [Transaction]
 *     DateRange = { start: Date?, end: Date? }
 */
const filterByDateRange = (transactions, dateRange) => {
    const { end, start } = dateRange
    if (!start && !end) return transactions

    // Convert Date bounds to ISO strings once (avoids Date parsing per row)
    const startStr = start?.toISOString().slice(0, 10)
    const endStr = end?.toISOString().slice(0, 10)

    return transactions.filter(t => isInDateRange(t, startStr, endStr))
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

// Compare two dates and return the earlier one
// @sig findEarlier :: (Date, Transaction) -> Date
const findEarlier = (earliest, transaction) => {
    const transactionDate = new Date(transaction.date)
    return transactionDate < earliest ? transactionDate : earliest
}

/*
 * Get the earliest transaction date for default start date
 *
 * @sig getEarliestTransactionDate :: [Transaction] -> Date?
 */
const getEarliestTransactionDate = transactions => {
    if (!transactions || transactions.length === 0) return null
    return transactions.reduce(findEarlier, new Date(transactions[0].date))
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
