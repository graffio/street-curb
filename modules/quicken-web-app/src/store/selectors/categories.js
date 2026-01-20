// ABOUTME: Category selectors for Redux state
// ABOUTME: Memoized derived selectors for category data

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import pluck from '@graffio/functional/src/ramda-like/pluck.js'

// Generate all parent categories for a hierarchical category
// e.g., "food:restaurant:lunch" -> ["food", "food:restaurant", "food:restaurant:lunch"]
// @sig generateParentCategories :: String -> [String]
const generateParentCategories = category => {
    const parts = category.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}

// Base accessor (defined here to avoid circular deps)
// @sig categoriesAccessor :: ReduxState -> LookupTable<Category>
const categoriesAccessor = state => state.categories

// Computes all category names including generated parent categories
// @sig computeAllCategoryNames :: ReduxState -> [String]
const computeAllCategoryNames = state => {
    const cats = categoriesAccessor(state)
    if (!cats || cats.length === 0) return []

    const names = pluck('name', cats)
    const withParents = names.flatMap(generateParentCategories)
    return Array.from(new Set(withParents)).sort()
}

// All category names including generated parent categories
// @sig allNames :: ReduxState -> [String]
const allNames = memoizeReduxState(['categories'], computeAllCategoryNames)

const Categories = { allNames }

export { Categories }
