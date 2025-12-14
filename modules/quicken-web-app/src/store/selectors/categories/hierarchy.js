// ABOUTME: Category hierarchy functions for hierarchical category strings
// ABOUTME: Uses colon separators (e.g., "food:restaurant:lunch")

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
