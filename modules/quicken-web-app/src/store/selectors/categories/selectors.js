// ABOUTME: Category selectors for Redux state
// ABOUTME: Memoized derived selectors for category data

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import pluck from '@graffio/functional/src/ramda-like/pluck.js'
import { generateParentCategories } from './hierarchy.js'

// Base accessor (defined here to avoid circular deps)
// @sig categories :: ReduxState -> LookupTable<Category>
const categories = state => state.categories

// Computes all category names including generated parent categories
// @sig computeAllCategoryNames :: ReduxState -> [String]
const computeAllCategoryNames = state => {
    const cats = categories(state)
    if (!cats || cats.length === 0) return []

    const names = pluck('name', cats)
    const withParents = names.flatMap(generateParentCategories)
    return Array.from(new Set(withParents)).sort()
}

// All category names including generated parent categories
// @sig allCategoryNames :: ReduxState -> [String]
const allCategoryNames = memoizeReduxState(['categories'], computeAllCategoryNames)

export { allCategoryNames }
