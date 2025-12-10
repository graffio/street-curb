/*
 * Category selectors
 *
 * Memoized derived selectors for category data.
 */

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import pluck from '@graffio/functional/src/ramda-like/pluck.js'
import { generateParentCategories } from './hierarchy.js'

// Base accessor (defined here to avoid circular deps)
const categories = state => state.categories

/*
 * All category names including generated parent categories
 * e.g., if "Food:Groceries" exists, also includes "Food"
 *
 * @sig allCategoryNames :: ReduxState -> [String]
 */
const allCategoryNames = memoizeReduxState(['categories'], state => {
    const cats = categories(state)
    if (!cats || cats.length === 0) return []

    // Get all category names and generate hierarchy (parent categories)
    const names = pluck('name', cats)
    const withParents = names.flatMap(generateParentCategories)
    return Array.from(new Set(withParents)).sort()
})

export { allCategoryNames }
