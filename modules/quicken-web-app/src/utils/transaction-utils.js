/*
 * Transaction utility functions for shared logic across components
 *
 * This module provides common transaction-related utilities that are used
 * by multiple components in the application, particularly for search and
 * filtering operations.
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

export { transactionMatchesSearch }
