/*
 * Category hierarchy functions for working with hierarchical category structures
 *
 * Pure functions for hierarchical category strings using colon separators
 * (e.g., "food:restaurant:lunch"). Not transaction-specific.
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
