/*
 * Category hierarchy functions for working with hierarchical category structures
 *
 * This module provides functions for working with hierarchical category strings
 * that use colon separators (e.g., "food:restaurant:lunch"). These functions
 * are not transaction-specific and can be used for any hierarchical category system.
 */

/*
 * Generate all parent categories for a hierarchical category
 * e.g., "food:restaurant:lunch" -> ["food", "food:restaurant", "food:restaurant:lunch"]
 *
 * @sig generateParentCategories :: String -> [String]
 */
const generateParentCategories = category => {
    const parts = category.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}

export { generateParentCategories }
