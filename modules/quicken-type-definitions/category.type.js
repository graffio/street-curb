// ABOUTME: Category type definition with hierarchical name support
// ABOUTME: Includes static methods for parent category generation

export const Category = {
    name: 'Category',
    kind: 'tagged',
    fields: {
        id: /^cat_[a-f0-9]{12}$/,
        name: 'String',
        description: 'String?',
        budgetAmount: 'Number?',
        isIncomeCategory: 'Boolean?',
        isTaxRelated: 'Boolean?',
        taxSchedule: 'String?',
    },
}

// Generates all parent categories for a hierarchical category name
// e.g., "food:restaurant:lunch" -> ["food", "food:restaurant", "food:restaurant:lunch"]
// @sig toParentCategories :: String -> [String]
Category.toParentCategories = name => {
    const parts = name.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}

// Collects all unique category names including generated parent categories
// @sig collectAllNames :: LookupTable<Category> -> [String]
Category.collectAllNames = categories => {
    if (!categories || categories.length === 0) return []
    const names = categories.map(c => c.name)
    const withParents = names.flatMap(Category.toParentCategories)
    return Array.from(new Set(withParents)).sort()
}
